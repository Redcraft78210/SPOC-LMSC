// server.js

// Required modules
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
const authRoutes = require('./routes/authRoutes').default;
const classRoutes = require('./routes/classRoutes').default;
const codeRoutes = require('./routes/codeRoutes').default;
const courseRoutes = require('./routes/courseRoutes').default;
const documentRoutes = require('./routes/documentRoutes').default;
const forumRoutes = require('./routes/forumRoutes').default;
const liveRoutes = require('./routes/liveRoutes').default;
const userRoutes = require('./routes/userRoutes').default;
const videoRoutes = require('./routes/videoRoutes').default;
const recordingRoutes = require('./routes/recordingRoutes').default;
const chatRoutes = require('./routes/chatRoutes');
const progressRoutes = require('./routes/progressTracking');
const avatarRoutes = require('./routes/avatarRoutes');


// Initialize environment variables
dotenv.config();
const PORT = process.env.PORT || 8443;
const HTTP_PORT = process.env.HTTP_PORT || 5000;

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

// CORS configuration
// Allowed origins for CORS
// En développement, attention à autoriser le certificat auto-signé
// En production, il faut ajouter le nom de domaine de l'application
// const allowedOrigins = ["https://localhost:5173", "https://localhost:8443", "https://your-production-domain.com"];

const allowedOrigins = ["https://localhost:5173", "https://localhost:8443"];

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
app.use('/api/auth', authRoutes); // Authentication routes (login, register)
app.use('/api/classes', classRoutes); // Courses-related routes
app.use('/api/codes', codeRoutes); // Codes-related routes
app.use('/api/courses', courseRoutes); // Courses-related routes
app.use('/api/documents', documentRoutes); // Document-related routes
app.use('/api/forum', forumRoutes); // Forums-related routes
app.use('/api/lives', liveRoutes); // Courses-related routes
app.use('/api/users', userRoutes); // Courses-related routes
app.use('/api/videos', videoRoutes); // Video-related routes
app.use('/api/recordings', recordingRoutes); // Recording-related routes
app.use('/api/streams', chatRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/avatars', avatarRoutes); // Avatar-related routes

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