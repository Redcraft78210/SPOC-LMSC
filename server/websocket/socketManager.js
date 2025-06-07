/**
 * @fileoverview Gestionnaire de WebSockets pour les communications de chat et de streaming
 * Ce module crée et configure des serveurs WebSocket distincts pour les fonctionnalités
 * de chat et de streaming, et gère le routage des connexions entrantes.
 * @module socketManager
 */

const WebSocket = require('ws');

/**
 * Ensemble des sockets qui ont été mis à niveau vers des connexions WebSocket
 * Utilisé pour éviter les doubles mises à niveau et assurer le nettoyage approprié
 * @type {Set<Socket>}
 */
const upgradedSockets = new Set();

/**
 * Crée un nouveau serveur WebSocket pour la fonctionnalité de chat
 * @returns {WebSocket.Server} Un serveur WebSocket configuré en mode noServer
 */
const createChatWSS = () => new WebSocket.Server({ noServer: true });

/**
 * Crée un nouveau serveur WebSocket pour la fonctionnalité de streaming
 * @returns {WebSocket.Server} Un serveur WebSocket configuré en mode noServer
 */
const createStreamWSS = () => new WebSocket.Server({ noServer: true });

/**
 * Configure les gestionnaires WebSocket sur un serveur HTTP
 * Cette fonction définit le comportement lors des demandes de mise à niveau WebSocket
 * et route les connexions vers le serveur WebSocket approprié en fonction du chemin
 * 
 * @param {Server} server - Le serveur HTTP sur lequel configurer les WebSockets
 * @param {WebSocket.Server} chatWSS - Le serveur WebSocket pour les communications de chat
 * @param {WebSocket.Server} streamWSS - Le serveur WebSocket pour les communications de streaming
 * @throws {Error} Si la création de l'URL à partir des en-têtes de la requête échoue
 * 
 * @example
 * const http = require('http');
 * const server = http.createServer();
 * const chatWSS = createChatWSS();
 * const streamWSS = createStreamWSS();
 * setupWebSocketHandlers(server, chatWSS, streamWSS);
 */
const setupWebSocketHandlers = (server, chatWSS, streamWSS) => {
  server.on('upgrade', (request, socket, head) => {

    if (upgradedSockets.has(socket)) {
      socket.destroy();
      return;
    }

    try {
      const pathname = new URL(request.url, `https://${request.headers.host}`).pathname;
      
      upgradedSockets.add(socket);
      
      socket.on('close', () => {
        upgradedSockets.delete(socket);
      });

      if (pathname === '/chat') {
        chatWSS.handleUpgrade(request, socket, head, (ws) => {
          chatWSS.emit('connection', ws, request);
        });
      } else if (pathname === '/stream') {
        streamWSS.handleUpgrade(request, socket, head, (ws) => {
          streamWSS.emit('connection', ws, request);
        });
      } else {
        upgradedSockets.delete(socket);
        socket.destroy();
      }
    } catch (err) {
      console.error('WebSocket upgrade error:', err);
      upgradedSockets.delete(socket);
      socket.destroy();
    }
  });
};

module.exports = {
  createChatWSS,
  createStreamWSS,
  setupWebSocketHandlers
};
