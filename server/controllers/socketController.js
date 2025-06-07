/**
 * @fileoverview Contrôleur de gestion du streaming vidéo et audio via WebSockets et UDP.
 * Ce module reçoit des flux vidéo et audio sur des sockets UDP et les transmet
 * aux clients connectés via WebSockets. Il inclut l'authentification par JWT
 * et le traitement des unités NAL pour le streaming vidéo H.264.
 */

const dgram = require('dgram');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { Lives } = require('../models');
const SECRET = process.env.JWT_SECRET

/**
 * Configure et initialise le serveur de streaming vidéo et audio.
 * 
 * @param {WebSocket.Server} wss - Serveur WebSocket où les clients se connecteront
 */
function setupStreaming(wss) {
  const videoSocket = dgram.createSocket('udp4');
  const audioSocket = dgram.createSocket('udp4');

  const wsVideoBuffers = new Map();

  /**
   * Gestionnaire de connexion WebSocket - authentifie les clients et configure la session.
   * 
   * @param {WebSocket} ws - L'instance WebSocket du client
   * @param {Object} req - La requête HTTP initiale
   * @throws {Error} Erreurs possibles: token manquant, token invalide, pas de live en cours
   */
  wss.on('connection', async (ws, req) => {

    let token;
    try {
      const fullUrl = new URL(req.url, `https://${req.headers.host}`);
      token = fullUrl.searchParams.get('token');
      if (!token) {
        const error = new Error('Token manquant');
        error.code = 4001;
        throw error;
      }
    } catch (e) {
      const code = e.code || 4001;
      const msg = e.message || 'Mauvaise requête';
      return ws.close(code, msg);
    }

    let payload;
    try {
      payload = jwt.verify(token, SECRET);
      ws.user = payload;  // Optionnel : attacher l'utilisateur à l'objet ws
      console.log('Token vérifié pour :', payload.role);
    } catch (err) {
      const isJwtErr = err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError';
      console.error('Erreur de vérification du token JWT :', err.message);
      return ws.close(isJwtErr ? 4002 : 4003, isJwtErr ? 'Token invalide' : 'Erreur serveur');
    }

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

    ws.on('message', (message) => {
      console.log(`← Message du client : ${message}`);
    });

    ws.on('close', (code, reason) => {
      console.log(`Client déconnecté (code ${code} : ${reason})`);
    });

    ws.on('error', (error) => {
      console.error('Erreur WebSocket :', error);
    });

    wsVideoBuffers.set(ws, []);

    ws.on('close', () => {
      wsVideoBuffers.delete(ws);
      console.log('Client déconnecté');
    });
  });

  let videoBuffer = Buffer.alloc(0);

  /**
   * Recherche un code de début NALU (0x00 0x00 0x00 0x01) dans un buffer.
   * 
   * @param {Buffer} buffer - Buffer dans lequel rechercher
   * @param {number} fromIndex - Index à partir duquel commencer la recherche
   * @returns {number} L'index où le code de début a été trouvé, ou -1 si non trouvé
   */
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

  /**
   * Vérifie si l'unité NAL est un délimiteur d'unité d'accès (type 9).
   * 
   * @param {Buffer} nal - Unité NAL à vérifier
   * @returns {boolean} Vrai si l'unité est un délimiteur d'unité d'accès
   */
  function isAccessUnitDelimiter(nal) {
    return nal.length > 4 && (nal[4] & 0x1F) === 0x09;
  }

  /**
   * Détermine si l'unité NAL représente le début d'une nouvelle image.
   * Vérifie si le type est 5 (IDR, image I) ou 1 (non-IDR, image P).
   * 
   * @param {Buffer} nal - Unité NAL à vérifier
   * @returns {boolean} Vrai si l'unité représente une nouvelle image
   */
  function isNewPicture(nal) {
    if (nal.length > 4) {
      const type = nal[4] & 0x1F;
      return type === 5 || type === 1;
    }
    return false;
  }

  videoSocket.bind(8082);
  audioSocket.bind(8083);

  /**
   * Gestionnaire de réception des données vidéo UDP.
   * Accumule les données et recherche les unités NAL complètes.
   * 
   * @param {Buffer} msg - Le paquet UDP reçu
   */
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

  videoSocket.on('error', (err) => {
    console.error('Erreur sur le socket vidéo UDP :', err);
  });

  audioSocket.on('error', (err) => {
    console.error('Erreur sur le socket audio UDP :', err);
  });

  /**
   * Traite une unité NAL reçue et l'envoie aux clients WebSocket connectés.
   * Gère le regroupement des NAL units en unités d'accès complètes avant l'envoi.
   * 
   * @param {Buffer} nal - Unité NAL à traiter et envoyer
   */
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

  /**
   * Gestionnaire de réception des données audio UDP.
   * Envoie immédiatement les données audio reçues à tous les clients connectés.
   * 
   * @param {Buffer} msg - Le paquet UDP audio reçu
   */
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

  console.log('Serveur de streaming démarré');
}

module.exports = { setupStreaming };
