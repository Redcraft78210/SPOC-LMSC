// controllers/socketController.js
const mediasoup = require('mediasoup');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let io, worker, router, producer, producerTransport, ffmpeg;
const transports = new Map();
const consumers = new Map();
const producers = new Map();

const initWebSocket = async (httpsServer) => {
  io = new Server(httpsServer, {
    path: '/socket.io',
    cors: {
      origin: ['https://localhost:5173', 'https://localhost:8443'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
  });

  io.engine.on('connection_error', (err) => console.log('Connection error:', err));

  await setupMediasoup();
  setupSocketHandlers();
};

const setupMediasoup = async () => {
  try {
    worker = await mediasoup.createWorker({
      logLevel: 'debug',
      rtcMinPort: 10000,
      rtcMaxPort: 10100
    });

    worker.on('died', () => {
      console.error('mediasoup worker died, exiting in 2 seconds...');
      setTimeout(() => process.exit(1), 2000);
    });

    const mediaCodecs = [
      {
        kind: 'video',
        mimeType: 'video/H264',
        clockRate: 90000,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '42e01f',
          'level-asymmetry-allowed': 1
        }
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000
      }
    ];

    router = await worker.createRouter({ mediaCodecs });

    producerTransport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }], // Utilisation explicite de announcedIp
      enableUdp: true,
      enableTcp: true,
      preferUdp: true
    });

    // Vérification et gestion du chemin de la vidéo
    const videoPath = path.resolve('videos/3f4b538504facde3c881b73844f52f24-1742237522/videoplayback.mp4');
    console.log(`Vérification du fichier vidéo: ${videoPath}`);
    console.log(`Vidéo existe: ${fs.existsSync(videoPath)}`);

    // Si le fichier n'existe pas, essayons de trouver une vidéo de secours
    if (!fs.existsSync(videoPath)) {
      console.error(`ERREUR: Le fichier vidéo ${videoPath} n'existe pas!`);

      // Vérifier si le dossier videos existe, sinon le créer
      if (!fs.existsSync('videos')) {
        fs.mkdirSync('videos', { recursive: true });
        console.log("Dossier 'videos' créé");
      }

      // Utiliser une vidéo de test si disponible (à remplacer par votre propre logique)
      const fallbackPath = path.resolve('videos/test.mp4');
      if (!fs.existsSync(fallbackPath)) {
        console.error("Aucune vidéo de secours trouvée! Le streaming ne fonctionnera pas.");
        return;
      }
      console.log(`Utilisation de la vidéo de secours: ${fallbackPath}`);
      videoPath = fallbackPath;
    }

    // Configuration améliorée de FFmpeg
    const rtpPort = producerTransport.iceCandidates[0].port;
    const rtpIp = '127.0.0.1'; // Toujours utiliser localhost pour la communication interne
    console.log(`Using RTP settings: ${rtpIp}:${rtpPort}`);

    // Fermer FFmpeg précédent s'il existe
    if (ffmpeg) {
      ffmpeg.kill('SIGKILL');
    }

    ffmpeg = spawn('ffmpeg', [
      '-loglevel', 'info',
      '-re',
      '-i', videoPath,
      '-c:v', 'libx264',
      '-profile:v', 'baseline',
      '-preset', 'ultrafast',
      '-tune', 'zerolatency',
      '-pix_fmt', 'yuv420p',
      '-b:v', '1000k',
      '-g', '30',
      '-keyint_min', '30',
      '-f', 'rtp',
      '-payload_type', '96',
      `-sdp_file`, `rtp-stream.sdp`, // Créer un fichier SDP pour debugging
      `rtp://${rtpIp}:${rtpPort}`
    ]);

    console.log(`RTP port used by FFmpeg: ${rtpPort}`);

    ffmpeg.stdout.on('data', (data) => {
      console.log('FFmpeg stdout:', data.toString());
    });

    ffmpeg.stderr.on('data', (data) => {
      const output = data.toString();
      // Filtrer les messages de progression tout en préservant les infos importantes
      if (!output.includes('frame=') && !output.includes('fps=')) {
        console.log('FFmpeg stderr:', output);
      }
    });

    ffmpeg.on('exit', (code, sig) => {
      console.log(`FFmpeg exited ${code}/${sig}`);
      // Try to restart FFmpeg if it exits unexpectedly
      if (code !== 0) {
        console.log('Attempting to restart FFmpeg...');
        setTimeout(() => {
          setupMediasoup();
        }, 2000);
      }
    });

    // Créer le producteur APRÈS que FFmpeg ait commencé à envoyer des données
    setTimeout(async () => {
      try {
        if (producer) {
          producer.close();
          producers.delete(producer.id);
          console.log('Ancien producteur fermé');
        }

        producer = await producerTransport.produce({
          kind: 'video',
          rtpParameters: {
            codecs: [{
              mimeType: 'video/H264',
              payloadType: 96,
              clockRate: 90000,
              parameters: {
                "packetization-mode": 1,
                "profile-level-id": "42e01f",
                "level-asymmetry-allowed": 1
              },
              rtcpFeedback: [
                { type: 'nack' },
                { type: 'nack', parameter: 'pli' },
                { type: 'ccm', parameter: 'fir' }
              ]
            }],
            encodings: [{ ssrc: 1234 }]
          }
        });

        // Enregistrer le producteur
        producers.set(producer.id, producer);

        producer.on('transportclose', () => {
          console.log('Producer transport closed');
          producers.delete(producer.id);
        });

        producer.on('score', (score) => {
          console.log('Producer score:', score);
        });

        console.log('Producer créé avec succès:', producer.id);

        // Informer tous les clients connectés qu'un producteur est disponible
        io.emit('producer-ready', { producerId: producer.id });

      } catch (error) {
        console.error('Erreur lors de la création du producteur:', error);
      }
    }, 3000); // Attendre 3 secondes pour que FFmpeg démarre
  } catch (error) {
    console.error('Error in setupMediasoup:', error);
  }
};

const setupSocketHandlers = () => {
  io.on('connection', (socket) => {
    console.log('Nouvelle connexion WS:', socket.id);

    socket.on('get-router-rtp-capabilities', (_, callback) => {
      if (!router || !router.rtpCapabilities) {
        console.error('Router non initialisé!');
        callback({ error: 'Router non initialisé' });
        return;
      }
      callback(router.rtpCapabilities);
    });

    socket.on('create-consumer-transport', async (_, callback) => {
      try {
        const consumerTransport = await router.createWebRtcTransport({
          listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }], // Utilisation explicite de announcedIp
          enableUdp: true,
          enableTcp: true,
          preferUdp: true
        });

        transports.set(consumerTransport.id, consumerTransport);
        socket.consumerTransport = consumerTransport;

        // Log pour le débogage
        console.log('Consumer transport créé:', consumerTransport.id);
        console.log('ICE candidates:', consumerTransport.iceCandidates);

        callback({
          id: consumerTransport.id,
          iceParameters: consumerTransport.iceParameters,
          iceCandidates: consumerTransport.iceCandidates,
          dtlsParameters: consumerTransport.dtlsParameters
        });

        // Envoyer immédiatement les producteurs actifs après la création du transport
        const producerIds = Array.from(producers.keys());
        if (producerIds.length > 0) {
          socket.emit('producer-ready', { producerId: producerIds[0] });
        }
      } catch (err) {
        console.error('Erreur création transport:', err);
        callback({ error: err.message });
      }
    });

    socket.on('connect-consumer-transport', async ({ dtlsParameters, transportId }, callback) => {
      try {
        const transport = transports.get(transportId);
        if (!transport) throw new Error(`Transport ${transportId} non trouvé`);

        await transport.connect({ dtlsParameters });
        console.log('Transport connecté avec succès:', transportId);
        callback({ connected: true });
      } catch (error) {
        console.error('connect-consumer-transport error:', error);
        callback({ error: error.message });
      }
    });

    socket.on('consume', async ({ rtpCapabilities, transportId, producerId }, callback) => {
      try {
        // Vérifier si le producteur spécifique existe ou utiliser le producteur par défaut
        const targetProducerId = producerId || (producer ? producer.id : null);

        if (!targetProducerId) {
          throw new Error("Aucun producteur disponible");
        }

        const targetProducer = producers.get(targetProducerId);
        if (!targetProducer) {
          throw new Error(`Producteur ${targetProducerId} non trouvé`);
        }

        // Vérifier si le routeur est compatible avec les capacités du client
        if (!router.canConsume({ producerId: targetProducerId, rtpCapabilities })) {
          throw new Error("Le client n'est pas compatible avec le flux");
        }

        const transport = transports.get(transportId);
        if (!transport) throw new Error(`Transport ${transportId} non trouvé`);

        // Créer le consumer
        const consumer = await transport.consume({
          producerId: targetProducerId,
          rtpCapabilities,
          paused: true // Important: commencer pausé
        });

        consumers.set(consumer.id, consumer);
        socket.consumer = consumer;

        console.log('Consumer créé avec succès:', consumer.id, 'kind:', consumer.kind);

        callback({
          id: consumer.id,
          producerId: targetProducerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters
        });
      } catch (error) {
        console.error('consume error:', error);
        callback({ error: error.message });
      }
    });

    socket.on('consumer-resume', async ({ consumerId }, callback) => {
      try {
        const consumer = consumers.get(consumerId);
        if (!consumer) throw new Error(`Consumer ${consumerId} non trouvé`);

        await consumer.resume();
        console.log('Consumer resumed:', consumerId);
        callback({ resumed: true });
      } catch (error) {
        console.error('consumer-resume error:', error);
        callback({ error: error.message });
      }
    });

    socket.on('get-producers', async (data, callback) => {
      try {
        // Obtenir la liste des producteurs actifs
        const producerIds = Array.from(producers.keys());
        console.log('Producteurs actifs demandés:', producerIds);

        // Les retourner au client
        callback(producerIds);
      } catch (error) {
        console.error('Error in get-producers:', error);
        callback({ error: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Déconnexion WS:', socket.id);
      if (socket.consumer) {
        consumers.delete(socket.consumer.id);
        socket.consumer.close();
      }
      if (socket.consumerTransport) {
        transports.delete(socket.consumerTransport.id);
        socket.consumerTransport.close();
      }
    });
  });
};

// Fonction pour arrêter proprement MediaSoup
const shutdown = () => {
  if (ffmpeg) {
    console.log('Fermeture de FFmpeg...');
    ffmpeg.kill('SIGKILL');
  }

  if (worker) {
    console.log('Fermeture du worker MediaSoup...');
    worker.close();
  }

  console.log('Ressources libérées.');
};

// Gestionnaires pour arrêt propre
process.on('SIGINT', () => {
  console.log('Arrêt demandé...');
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Terminaison demandée...');
  shutdown();
  process.exit(0);
});

module.exports = { initWebSocket, shutdown };