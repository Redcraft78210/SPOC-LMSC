/**
 * @fileoverview Serveur principal de l'application SPOC-LMSC
 * 
 * Ce fichier configure et initialise le serveur Express, met en place les routes API,
 * configure les WebSockets pour le chat et le streaming, et gère la redirection HTTP vers HTTPS.
 * Il initialise également un conteneur Docker en quarantaine pour stocker les fichiers 
 * uploadés qui ont été marqués comme infectés.
 */

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

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const classRoutes = require('./routes/classRoutes');
const courseRoutes = require('./routes/courseRoutes');
const progressRoutes = require('./routes/progressTracking');
const documentRoutes = require('./routes/documentRoutes');
const videoRoutes = require('./routes/videoRoutes');
const recordingRoutes = require('./routes/recordingRoutes');
const forumRoutes = require('./routes/forumRoutes');
const messageRoutes = require('./routes/messageRoutes');
const liveRoutes = require('./routes/liveRoutes');
const chatRoutes = require('./routes/chatRoutes');
const codeRoutes = require('./routes/codeRoutes');
const moderationRoutes = require('./routes/moderationRoutes');

dotenv.config();
const PORT = process.env.PORT || 443;
const HTTP_PORT = process.env.HTTP_PORT || 80;

const app = express();
app.enable("trust proxy");

/**
 * @description Middleware qui redirige les requêtes HTTP vers HTTPS
 * @param {Object} request - Objet requête Express
 * @param {Object} response - Objet réponse Express
 * @param {Function} next - Fonction middleware suivante
 */
app.use((request, response, next) => {
  if (request.secure) {
    next();
  } else {
    var secure_host = request.headers.host.replace(/:\d+/, ":" + PORT);
    response.redirect("https://" + secure_host + request.url);
  }
});

/**
 * @const {Object} DEFAULTS
 * @description Paramètres par défaut pour la création du conteneur Docker en quarantaine
 * @property {string} imageName - Nom de l'image Docker à utiliser
 * @property {string} containerName - Nom du conteneur Docker à créer
 * @property {string} dockerfile - Nom du fichier Dockerfile à utiliser
 * @property {number} buildTimeoutMs - Délai d'expiration pour la construction de l'image (en ms)
 * @property {number} runTimeoutMs - Délai d'expiration pour l'exécution du conteneur (en ms)
 */
const DEFAULTS = {
  imageName: 'quarantine-image',
  containerName: 'quarantine_container',
  dockerfile: 'Quarantine.Dockerfile',
  buildTimeoutMs: 5 * 60 * 1000,   // 5 minutes
  runTimeoutMs: 30 * 1000,         // 30 seconds
};

app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ limit: '300mb', extended: true }));

/**
 * @const {string[]} allowedOrigins
 * @description Liste des origines autorisées pour les requêtes CORS
 */
const allowedOrigins = ["https://localhost", "https://spoc.lmsc"];

/**
 * @description Configuration du middleware CORS avec les paramètres de sécurité appropriés
 */
app.use(cors({
  exposedHeaders: [
    'Content-Range',
    'Accept-Ranges',
    'Content-Length',
    'Content-Type'
  ],
  origin: function (origin, callback) {
    console.log(`Checking origin: ${origin}`);

    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`Origin allowed: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`Blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Accept-Language', 'X-Requested-With'],
  maxAge: 1728000
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/videos", express.static(path.join(__dirname, "public", "videos")));

// Configuration des routes API
app.use('/api/auth', authRoutes.route);
app.use('/api/users', userRoutes.route);
app.use('/api/avatars', avatarRoutes.route);
app.use('/api/classes', classRoutes.route);
app.use('/api/courses', courseRoutes.route);
app.use('/api/progress', progressRoutes.route);
app.use('/api/documents', documentRoutes.route);
app.use('/api/videos', videoRoutes.route);
app.use('/api/recordings', recordingRoutes.route);
app.use('/api/forum', forumRoutes.route);
app.use('/api/messages', messageRoutes.route);
app.use('/api/lives', liveRoutes.route);
app.use('/api/streams', chatRoutes.route);
app.use('/api/codes', codeRoutes.route);
app.use('/api/moderation', moderationRoutes.route);

/**
 * @description Configuration des routes en fonction de l'environnement
 */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*path", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
  });
} else {
  app.get("*path", (req, res) => {
    res.send("API is running");
  });
}

const server = https.createServer(credentials, app);

const chatWSS = createChatWSS();
const streamWSS = createStreamWSS();

setupWebSocketHandlers(server, chatWSS, streamWSS);
setupChatWebSocket(chatWSS);
setupStreaming(streamWSS);

/**
 * @description Serveur HTTP qui redirige vers HTTPS
 */
const httpServer = http.createServer((req, res) => {
  req.headers["host"] = req.headers["host"].replace(/:\d+/, ":" + PORT);
  res.writeHead(301, { "Location": "https://" + req.headers["host"] + req.url });
  res.end();
});

/**
 * @function createQuarantineContainer
 * @description Crée un conteneur Docker isolé pour stocker les fichiers uploadés marqués comme infectés
 */
const createQuarantineContainer = () => {
  /**
   * @function runCommand
   * @description Exécute une commande système et collecte les sorties stdout/stderr
   * @param {string} cmd - La commande à exécuter
   * @param {string[]} [args=[]] - Les arguments de la commande
   * @param {Object} [opts={}] - Options supplémentaires
   * @param {string} [opts.label=''] - Préfixe à ajouter aux messages de log
   * @returns {Promise<{code: number, stdout: string, stderr: string}>} Résultat de l'exécution
   * @throws {Error} Si la commande se termine avec un code de sortie non nul ou si spawn échoue
   */
  function runCommand(cmd, args = [], opts = {}) {
    const { label = '' } = opts;
    return new Promise((resolve, reject) => {
      const proc = spawn(cmd, args);
      let stdout = '', stderr = '';

      proc.stdout.on('data', chunk => {
        const str = chunk.toString();
        stdout += str;
      });

      proc.stderr.on('data', chunk => {
        const str = chunk.toString();
        stderr += str;
      });

      proc.once('error', reject);

      proc.once('close', code => {
        const out = { code, stdout: stdout.trim(), stderr: stderr.trim() };
        if (code !== 0) {
          process.stdout.write(label + out.stdout + '\n');
          process.stderr.write(label + out.stderr + '\n');
          return reject(new Error(`${label || cmd} exited ${code}\n${out.stderr}`));
        }
        resolve(out);
      });
    });
  }

  /**
   * @async
   * @function imageExists
   * @description Vérifie si une image Docker existe localement
   * @param {string} imageName - Nom de l'image Docker à vérifier
   * @returns {Promise<boolean>} true si l'image existe, false sinon
   */
  async function imageExists(imageName) {
    try {
      await runCommand('docker', ['image', 'inspect', `${imageName}`]);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * @async
   * @function buildAndRun
   * @description Construit l'image Docker de quarantaine si nécessaire et lance un conteneur
   *              isolé pour stocker les fichiers uploadés marqués comme infectés
   * @throws {Error} Si la construction ou le lancement du conteneur échoue
   */
  async function buildAndRun() {
    try {
      const imageName = DEFAULTS.imageName || 'quarantine-image';
      const containerName = DEFAULTS.containerName || 'quarantine';
      const dockerfile = DEFAULTS.dockerfile || 'Quarantine.Dockerfile';
      console.log('🔨 Building image…');

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
        console.log(`⚠️  "${containerName}" exists—skipping creation.`);
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

createQuarantineContainer();

// Démarrage des serveurs
server.listen(PORT, () => {
  console.log(`HTTPS Server is running on port ${PORT}`);
});

httpServer.listen(HTTP_PORT, () => {
  console.log(
    `HTTP Server is running on port ${HTTP_PORT} and redirecting to HTTPS`
  );
});
