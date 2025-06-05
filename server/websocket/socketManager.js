const WebSocket = require('ws');

// Shared set to track upgraded sockets
const upgradedSockets = new Set();

// Create WebSocket servers but don't attach them to HTTP server yet
const createChatWSS = () => new WebSocket.Server({ noServer: true });
const createStreamWSS = () => new WebSocket.Server({ noServer: true });

// Central upgrade handler to coordinate all WebSocket connections
const setupWebSocketHandlers = (server, chatWSS, streamWSS) => {
  server.on('upgrade', (request, socket, head) => {
    // Check if socket has already been handled
    if (upgradedSockets.has(socket)) {
      socket.destroy();
      return;
    }

    // Parse URL to determine which WebSocket server should handle this connection
    try {
      const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
      
      // Mark socket as being handled
      upgradedSockets.add(socket);
      
      // Add cleanup to remove from our tracking set
      socket.on('close', () => {
        upgradedSockets.delete(socket);
      });

      // Route to appropriate handler
      if (pathname === '/chat') {
        chatWSS.handleUpgrade(request, socket, head, (ws) => {
          chatWSS.emit('connection', ws, request);
        });
      } else if (pathname === '/stream') {
        streamWSS.handleUpgrade(request, socket, head, (ws) => {
          streamWSS.emit('connection', ws, request);
        });
      } else {
        // No handler for this path
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