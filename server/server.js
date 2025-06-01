// server.js

// Required modules
const { spawn } = require('child_process');
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");
const privateKey = fs.readFileSync("certs/selfsigned.key", "utf8");
const certificate = fs.readFileSync("certs/selfsigned.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };

const {
  createChatWSS,
  createStreamWSS,
  setupWebSocketHandlers
} = require('./websocket/socketManager');

const { setupChatWebSocket } = require('./controllers/chatController');
const { setupStreaming } = require('./controllers/socketController');

// Import routes

// Authentication and user management
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const avatarRoutes = require('./routes/avatarRoutes');

// Course and class management
const classRoutes = require('./routes/classRoutes');
const courseRoutes = require('./routes/courseRoutes');
const progressRoutes = require('./routes/progressTracking');

// Content management
const documentRoutes = require('./routes/documentRoutes');
const videoRoutes = require('./routes/videoRoutes');
const recordingRoutes = require('./routes/recordingRoutes');

// Communication and interaction
const forumRoutes = require('./routes/forumRoutes');
const messageRoutes = require('./routes/messageRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Live and streaming
const liveRoutes = require('./routes/liveRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Miscellaneous
const codeRoutes = require('./routes/codeRoutes');

// Initialize environment variables
dotenv.config();
const PORT = process.env.PORT || 443;
const HTTP_PORT = process.env.HTTP_PORT || 80;

// Create an Express app
const app = express();
app.enable("trust proxy");

app.use((request, response, next) => {
  if (request.secure) {
    next();
  } else {
    var secure_host = request.headers.host.replace(/:\d+/, ":" + PORT);
    response.redirect("https://" + secure_host + request.url);
  }
});

const DEFAULTS = {
  imageName: 'quarantine-image',
  containerName: 'quarantine_container',
  dockerfile: 'Quarantine.Dockerfile',
  buildTimeoutMs: 5 * 60 * 1000,   // 5 minutes
  runTimeoutMs: 30 * 1000,         // 30 seconds
};

app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ limit: '300mb', extended: true }));

// CORS configuration
// Allowed origins for CORS
// En développement, attention à autoriser le certificat auto-signé
// En production, il faut ajouter le nom de domaine de l'application
// const allowedOrigins = ["https://your-production-domain.com"];

const allowedOrigins = ["https://localhost", "https://172.20.10.3",
  "https://172.20.10.5", "https://172.16.84.14"];

// Middleware
app.use(cors({
  exposedHeaders: [
    'Content-Range',
    'Accept-Ranges',
    'Content-Length',
    'Content-Type'
  ],
  origin: function (origin, callback) {
    console.log(`Checking origin: ${origin}`);
    // Dé-commenter la ligne suivante pour autoriser les requêtes sans origin
    if (!origin || allowedOrigins.includes(origin)) {
      // if (allowedOrigins.includes(origin)) {
      console.log(`Origin allowed: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`Blocked origin: ${origin}`);
      callback(null, false); // retourne "false" au lieu de lancer une erreur
    }
  },
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Accept-Language', 'X-Requested-With'],
  maxAge: 1728000
}));

app.use(morgan("dev")); // Log HTTP requests in the console
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Serve public static files
app.use("/videos", express.static(path.join(__dirname, "public", "videos"))); // retirer dès que possible

// API routes

// Authentication and user management
app.use('/api/auth', authRoutes.route); // Authentication routes (login, register)
app.use('/api/users', userRoutes.route); // User-related routes
app.use('/api/avatars', avatarRoutes.route); // Avatar-related routes

// Course and class management
app.use('/api/classes', classRoutes.route); // Class-related routes
app.use('/api/courses', courseRoutes.route); // Course-related routes
app.use('/api/progress', progressRoutes.route); // Progress tracking routes

// Content management
app.use('/api/documents', documentRoutes.route); // Document-related routes
app.use('/api/videos', videoRoutes.route); // Video-related routes
app.use('/api/recordings', recordingRoutes.route); // Recording-related routes

// Communication and interaction
app.use('/api/forum', forumRoutes.route); // Forum-related routes
app.use('/api/messages', messageRoutes.route); // Message-related routes
app.use('/api/contact', contactRoutes.route); // Contact-related routes

// Live and streaming
app.use('/api/lives', liveRoutes.route); // Live session-related routes
app.use('/api/streams', chatRoutes.route); // Streaming and chat-related routes

// Miscellaneous
app.use('/api/codes', codeRoutes.route); // Code-related routes

// Serve React frontend (if applicable)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // Serve all frontend routes as the index.html page for React Router to handle
  app.get("*path", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
  });
} else {
  // In development mode, fallback to React's development server
  app.get("*path", (req, res) => {
    res.send("API is running");
  });
}

// Create HTTPS server
const server = https.createServer(credentials, app);

// Create WebSocket servers
const chatWSS = createChatWSS();
const streamWSS = createStreamWSS();

// Set up central WebSocket routing
setupWebSocketHandlers(server, chatWSS, streamWSS);

// Initialize WebSocket handlers with their respective WSS instances
setupChatWebSocket(chatWSS);
setupStreaming(streamWSS);

const httpServer = http.createServer((req, res) => {
  req.headers["host"] = req.headers["host"].replace(/:\d+/, ":" + PORT);
  res.writeHead(301, { "Location": "https://" + req.headers["host"] + req.url });
  res.end();
});

const createQuarantineContainer = () => {
  /**
 * Runs a command and collects stdout/stderr.
 * Rejects on non-zero exit or spawn error.
 * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
 */
  function runCommand(cmd, args = [], opts = {}) {
    const { label = '' } = opts;
    return new Promise((resolve, reject) => {
      const proc = spawn(cmd, args);
      let stdout = '', stderr = '';

      proc.stdout.on('data', chunk => {
        const str = chunk.toString();
        stdout += str;
        // Only collect stdout, don't display it immediately
      });

      proc.stderr.on('data', chunk => {
        const str = chunk.toString();
        stderr += str;
        // Only collect stderr, don't display it immediately
      });

      proc.once('error', reject);

      proc.once('close', code => {
        const out = { code, stdout: stdout.trim(), stderr: stderr.trim() };
        if (code !== 0) {
          // Only display logs on error
          process.stdout.write(label + out.stdout + '\n');
          process.stderr.write(label + out.stderr + '\n');
          return reject(new Error(`${label || cmd} exited ${code}\n${out.stderr}`));
        }
        resolve(out);
      });
    });
  }

  async function imageExists(imageName) {
    try {
      await runCommand('docker', ['image', 'inspect', `${imageName}`]);
      return true;  // l'image existe
    } catch (err) {
      return false; // l'image n'existe pas
    }
  }

  async function buildAndRun() {
    try {
      const imageName = DEFAULTS.imageName || 'quarantine-image';
      const containerName = DEFAULTS.containerName || 'quarantine';
      const dockerfile = DEFAULTS.dockerfile || 'Quarantine.Dockerfile';
      console.log('🔨 Building image…');

      // Check if the image already exists
      const exists = await imageExists(imageName);
      if (!exists) {
        console.log(`🖼️  Image "${imageName}" not found. Building...`);
        await runCommand('docker', ['build', '-t', imageName, '-f', dockerfile, '.'], { label: 'DOCKER-BUILD ' });
        console.log('✅ Image built.');
      } else {
        console.log(`🖼️  Image "${imageName}" already exists. Skipping build.`);
      }


      console.log('🔍 Checking for existing container…');
      const { stdout: existing } = await runCommand('docker', [
        'ps', '-a',
        '--filter', `name=^/${containerName}$`,
        '--format', '{{.Names}}'
      ], { label: 'DOCKER-PS ' });

      if (existing === containerName) {
        console.log(`⚠️  “${containerName}” exists—skipping creation.`);
        return;
      }

      console.log('🚀 Running new container…');
      const { stdout: id } = await runCommand('docker', [
        'run', '-d',
        '--name', containerName,
        '--network', 'none',
        imageName
      ], { label: 'DOCKER-RUN ' });

      console.log(`✅ Container started (ID: ${id})`);
    } catch (err) {
      console.error('❌ Error:', err.message);
      process.exit(1);
    }
  }

  buildAndRun();
};

// Create the Quarantine container
createQuarantineContainer();

// Start the HTTPS server
server.listen(PORT, () => {
  console.log(`HTTPS Server is running on port ${PORT}`);
});

// Start the HTTP server (redirects to HTTPS)
httpServer.listen(HTTP_PORT, () => {
  console.log(
    `HTTP Server is running on port ${HTTP_PORT} and redirecting to HTTPS`
  );
});
