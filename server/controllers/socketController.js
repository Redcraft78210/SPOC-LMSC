const dgram = require('dgram');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { Lives } = require('../models');
const SECRET = process.env.JWT_SECRET

function setupStreaming(server) {
  const wss = new WebSocket.Server({ server });

  // Serveur WebSocket pour le streaming video
  wss.on('connection', async (ws, req) => {
    // 1) Récupération du token depuis l'URL : wss://localhost:8443/?token=xxx
    let token;
    try {
      const fullUrl = new URL(req.url, `https://${req.headers.host}`);
      token = fullUrl.searchParams.get('token');
      if (!token) {
        throw new ws.WSClientError(4001, 'Token manquant');
      }
    } catch (e) {
      // URL parsing failed or token missing
      const code = e.code || 4001;
      const msg = e.message || 'Mauvaise requête';
      return ws.close(code, msg);
    }

    // 2) Vérification du token
    let payload;
    try {
      payload = jwt.verify(token, SECRET);
      ws.user = payload;  // Optionnel : attacher l'utilisateur à l'objet ws
      console.log('Token vérifié pour :', payload.role);
    } catch (err) {
      // JWT errors
      const isJwtErr = err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError';
      console.error('Erreur de vérification du token JWT :', err.message);
      return ws.close(isJwtErr ? 4002 : 4003, isJwtErr ? 'Token invalide' : 'Erreur serveur');
    }

    // 3) Contrôle d’accès pour les étudiants
    if (payload.role === 'Etudiant') {
      console.log('Étudiant connecté, vérification du live en cours');
      try {
        const live = await Lives.findOne();
        if (!live) {
          throw new Error('Aucun live en cours');
        }
        console.log('Étudiant autorisé pour le live en cours :', live.id);
      } catch (err) {
        const code = err.message === 'Aucun live en cours' ? 4004 : 4003;
        console.error('Erreur de vérification du live :', err.message);
        return ws.close(code, err.message);
      }
    }

    console.log('Client WebSocket authentifié et connecté');

    // 4) Événements WebSocket
    ws.on('message', (message) => {
      console.log(`← Message du client : ${message}`);
      // … traiter ou répondre au message ici …
    });

    ws.on('close', (code, reason) => {
      console.log(`Client déconnecté (code ${code} : ${reason})`);
    });

    ws.on('error', (error) => {
      console.error('Erreur WebSocket :', error);
    });
  });


  const videoSocket = dgram.createSocket('udp4');
  const audioSocket = dgram.createSocket('udp4');
  // Buffer pour chaque client WebSocket
  const wsVideoBuffers = new Map();

  // Buffer global pour accumuler les données vidéo entre les paquets UDP
  let videoBuffer = Buffer.alloc(0);

  function findStartCode(buffer, fromIndex) {
    for (let i = fromIndex; i <= buffer.length - 4; i++) {
      if (buffer[i] === 0x00 &&
        buffer[i + 1] === 0x00 &&
        buffer[i + 2] === 0x00 &&
        buffer[i + 3] === 0x01) {
        return i;
      }
    }
    return -1;
  }

  function isAccessUnitDelimiter(nal) {
    return nal.length > 4 && (nal[4] & 0x1F) === 0x09;
  }

  function isNewPicture(nal) {
    if (nal.length > 4) {
      const type = nal[4] & 0x1F;
      return type === 5 || type === 1;
    }
    return false;
  }

  // Configuration des sockets UDP
  videoSocket.bind(8082);
  audioSocket.bind(8083);
  // Gestion des paquets vidéo
  videoSocket.on('message', (msg) => {
    videoBuffer = Buffer.concat([videoBuffer, msg]);
    let startPos = 0;

    while (true) {
      const nextStart = findStartCode(videoBuffer, startPos > 0 ? startPos : 0);

      if (nextStart === -1) break;

      if (startPos !== nextStart) {
        const nal = videoBuffer.subarray(startPos, nextStart);
        processNalUnit(nal);
      }

      startPos = nextStart + 4; // Passer le start code
    }

    videoBuffer = videoBuffer.subarray(startPos);
  });

  function processNalUnit(nal) {
    const fullNal = Buffer.concat([Buffer.from([0x00, 0x00, 0x00, 0x01]), nal]);

    wsVideoBuffers.forEach((bufferList, ws) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      bufferList.push(fullNal);

      if (isAccessUnitDelimiter(fullNal) || isNewPicture(fullNal)) {
        if (bufferList.length > 1) {
          const toSend = Buffer.concat(bufferList.slice(0, -1));

          if (ws.bufferedAmount < 1048576) { // Backpressure check (1MB)
            ws.send(toSend, (err) => {
              if (err) {
                console.error('Erreur envoi:', err);
                ws.terminate();
              }
            });
          } else {
            console.warn('Buffer client plein, fermeture');
            ws.terminate();
          }
        }
        wsVideoBuffers.set(ws, [fullNal]); // Garder le dernier NAL
      }
    });
  }

  // Gestion des paquets audio
  audioSocket.on('message', (msg) => {
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        const data = Buffer.concat([Buffer.from([1]), msg]);
        ws.send(data, (err) => {
          if (err) {
            console.error('Erreur envoi audio:', err);
            ws.terminate();
          }
        });
      }
    });
  });

  // Gestion de la déconnexion des clients WebSocket
  wss.on('connection', (ws) => {
    wsVideoBuffers.set(ws, []);

    ws.on('close', () => {
      wsVideoBuffers.delete(ws);
      console.log('Client déconnecté');
    });
  });

  console.log('Serveur de streaming démarré');
}

module.exports = { setupStreaming };
