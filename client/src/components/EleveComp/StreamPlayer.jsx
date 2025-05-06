import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { Device } from 'mediasoup-client';

const StreamPlayer = () => {
  const [status, setStatus] = useState('Déconnecté');
  const [connectionState, setConnectionState] = useState('Initialisation');
  const socketRef = useRef(null);
  const deviceRef = useRef(null);
  const consumerTransportRef = useRef(null);
  const consumerRef = useRef(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // Ajouté pour le débogage

  const containerRef = useRef(null);

  // Effet pour définir srcObject quand mediaStream change
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      console.log('📺 Affectation du MediaStream à la vidéo');
      videoRef.current.srcObject = mediaStream;

      // Essayer de lire la vidéo automatiquement
      videoRef.current
        .play()
        .then(() => console.log('▶️ Lecture vidéo démarrée automatiquement'))
        .catch(err => {
          console.warn('⚠️ Autoplay impossible:', err.message);
          setShowPlayButton(true);
        });
    }
  }, [mediaStream]);

  // Supprimer le test vidéo qui peut interférer avec le flux MediaSoup
  // useEffect(() => {
  //   // Test with a simple video first to ensure the player works
  //   if (videoRef.current && !mediaStream) {
  //     ...
  //   }
  // }, [videoRef.current, !mediaStream]);

  useEffect(() => {
    // Clear previous errors when reconnecting
    setError(null);
    setDebugInfo(null);

    socketRef.current = io('https://localhost:8443', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      secure: true,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const initializeMediaSoup = async () => {
      try {
        setConnectionState('Initialisation du device MediaSoup');
        deviceRef.current = new Device();

        // Get router capabilities
        setConnectionState('Récupération des capacités du routeur');
        const routerRtpCapabilities = await new Promise((resolve, reject) => {
          socketRef.current.emit(
            'get-router-rtp-capabilities',
            null,
            response => {
              if (response.error) {
                reject(new Error(response.error));
              } else {
                resolve(response);
              }
            }
          );
        });

        console.log('Router capabilities:', routerRtpCapabilities);
        setDebugInfo(prev => ({
          ...prev,
          routerCapabilities: routerRtpCapabilities,
        }));

        // Check if router capabilities are valid
        if (
          !routerRtpCapabilities ||
          !routerRtpCapabilities.codecs ||
          routerRtpCapabilities.codecs.length === 0
        ) {
          throw new Error('Invalid router RTP capabilities received');
        }

        await deviceRef.current.load({ routerRtpCapabilities });
        console.log(
          'Device loaded with codecs:',
          deviceRef.current.rtpCapabilities?.codecs?.length || 0
        );

        // Create consumer transport
        setConnectionState('Création du transport consommateur');
        const transportData = await new Promise((resolve, reject) => {
          socketRef.current.emit(
            'create-consumer-transport',
            null,
            response => {
              if (response.error) {
                reject(new Error(response.error));
              } else {
                resolve(response);
              }
            }
          );
        });

        console.log('Transport data:', transportData);
        setDebugInfo(prev => ({ ...prev, transportData }));

        // Verify transport data
        if (
          !transportData ||
          !transportData.id ||
          !transportData.dtlsParameters
        ) {
          throw new Error('Invalid transport data received');
        }

        consumerTransportRef.current =
          deviceRef.current.createRecvTransport(transportData);
        console.log('Transport créé:', consumerTransportRef.current.id);

        // Connect transport event
        consumerTransportRef.current.on(
          'connect',
          async ({ dtlsParameters }, callback, errback) => {
            try {
              console.log('⚡ Événement connect déclenché!');
              setConnectionState('Connexion du transport');

              await new Promise((resolve, reject) => {
                socketRef.current.emit(
                  'connect-consumer-transport',
                  {
                    dtlsParameters,
                    transportId: consumerTransportRef.current.id,
                  },
                  response => {
                    if (response.error) {
                      console.error(
                        'Transport connect error from server:',
                        response.error
                      );
                      reject(new Error(response.error));
                    } else {
                      resolve(response);
                    }
                  }
                );
              });
              callback(); // Signal successful connection
            } catch (error) {
              console.error('Transport connect error:', error);
              errback(error);
              setError(`Transport connection failed: ${error.message}`);
            }
          }
        );

        // First check if there's an active producer
        setConnectionState('Vérification des producteurs actifs');
        const activeProducers = await new Promise((resolve, reject) => {
          socketRef.current.emit('get-producers', null, response => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          });
        });

        console.log('Active producers:', activeProducers);
        setDebugInfo(prev => ({ ...prev, activeProducers }));

        if (!activeProducers || activeProducers.length === 0) {
          setConnectionState("En attente d'un producteur actif");

          // Set up a listener for when a producer becomes available
          socketRef.current.on('producer-ready', async ({ producerId }) => {
            console.log('Producer became available:', producerId);
            try {
              await consumeStream(producerId);
            } catch (err) {
              console.error('Error consuming new producer:', err);
              setError(`Failed to consume new producer: ${err.message}`);
            }
          });

          return; // Exit but keep socket connection open
        }

        // Consume the first available producer
        await consumeStream(activeProducers[0]);
      } catch (error) {
        console.error('Erreur MediaSoup:', error);
        setError(`Connection error: ${error.message}`);
        setConnectionState('Erreur de connexion');
      }
    };

    // Extracted consume logic into a separate function
    const consumeStream = async producerId => {
      try {
        // Start consuming
        setConnectionState('Démarrage de la consommation');
        console.log(
          '👉 Demande de consommation pour le producteur:',
          producerId
        );

        const consumerData = await new Promise((resolve, reject) => {
          socketRef.current.emit(
            'consume',
            {
              transportId: consumerTransportRef.current.id,
              producerId: producerId,
              rtpCapabilities: deviceRef.current.rtpCapabilities,
            },
            response => {
              if (response.error) {
                console.error('Consume error from server:', response.error);
                reject(new Error(response.error));
              } else {
                resolve(response);
              }
            }
          );
        });

        console.log('📦 Données reçues pour consommation:', consumerData);
        setDebugInfo(prev => ({ ...prev, consumerData }));

        // Verify consumer data
        if (
          !consumerData ||
          !consumerData.id ||
          !consumerData.producerId ||
          !consumerData.rtpParameters
        ) {
          throw new Error('Invalid consumer data received');
        }

        const consumer = await consumerTransportRef.current.consume({
          id: consumerData.id,
          producerId: consumerData.producerId,
          kind: consumerData.kind,
          rtpParameters: consumerData.rtpParameters,
        });

        consumerRef.current = consumer;
        console.log('Consumer créé:', consumer.id, 'kind:', consumer.kind);

        // Resume the consumer (required in some MediaSoup setups)
        await new Promise((resolve, reject) => {
          socketRef.current.emit(
            'consumer-resume',
            { consumerId: consumer.id },
            response => {
              if (response.error) {
                reject(new Error(response.error));
              } else {
                resolve();
              }
            }
          );
        });

        if (consumer.track) {
          console.log(
            'Track info:',
            consumer.track.kind,
            consumer.track.readyState
          );
          const stream = new MediaStream([consumer.track]);
          console.log(
            'MediaStream créé avec track:',
            stream.getTracks()[0].kind
          );

          setMediaStream(stream);
          setIsMuted(false);
          setConnectionState('Stream connecté');

          // Vérification si le flux a bien des données
          const track = stream.getTracks()[0];
          if (track) {
            console.log(
              'Track actif:',
              track.enabled,
              'état:',
              track.readyState
            );
            setDebugInfo(prev => ({
              ...prev,
              trackInfo: {
                enabled: track.enabled,
                readyState: track.readyState,
                kind: track.kind,
              },
            }));
          }
        } else {
          throw new Error('Consumer has no track');
        }

        consumer.on('transportclose', () => {
          console.log('Transport fermé pour le consumer');
          setConnectionState('Transport fermé');
        });

        consumer.on('trackended', () => {
          console.log('Track ended');
          setConnectionState('Stream terminé');
        });
      } catch (error) {
        console.error('Error in consumeStream:', error);
        throw error;
      }
    };

    socketRef.current.on('connect', async () => {
      setStatus('Connecté');
      console.log('🌐 Socket connecté au serveur');
      await initializeMediaSoup();
    });

    socketRef.current.on('disconnect', () => {
      setStatus('Déconnecté');
      setConnectionState('Connexion perdue');
      console.log('🔌 Socket déconnecté');
    });

    socketRef.current.on('producer-closed', ({ producerId }) => {
      console.log('Producer closed:', producerId);
      if (
        consumerRef.current &&
        consumerRef.current.producerId === producerId
      ) {
        setConnectionState('Le stream a été terminé par le producteur');
      }
    });

    socketRef.current.on('connect_error', err => {
      console.error('Socket connection error:', err);
      setError(`Socket connection error: ${err.message}`);
    });

    return () => {
      if (consumerRef.current) consumerRef.current.close();
      if (consumerTransportRef.current) consumerTransportRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Handle play errors - browser may block autoplay
  const handlePlayError = error => {
    console.error('Erreur lors du démarrage de la lecture:', error);
    setShowPlayButton(true);
    setError(`Erreur de lecture vidéo: ${error.message}`);
  };

  // Handle successful playback
  const handlePlaySuccess = () => {
    console.log('Lecture vidéo démarrée avec succès');
    setShowPlayButton(false);
  };

  // Function to manually play video
  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().then(handlePlaySuccess).catch(handlePlayError);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-4 bg-gray-100 rounded-lg shadow-lg"
      ref={containerRef}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Stream Vidéo</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            status === 'Connecté'
              ? 'bg-green-200 text-green-800'
              : 'bg-red-200 text-red-800'
          }`}
        >
          {status}
        </span>
      </div>

      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        muted={isMuted}
        className="w-full aspect-video bg-black rounded-lg"
        onPlay={handlePlaySuccess}
        onError={handlePlayError}
      />

      {showPlayButton && (
        <button
          className="manual-play-button mt-2 px-3 py-1 bg-blue-500 text-white rounded"
          onClick={playVideo}
        >
          Lire la vidéo
        </button>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {!mediaStream && !error && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
          {connectionState}
        </div>
      )}

      <div className="mt-4">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
          onClick={() => {
            // Toggle mute state
            setIsMuted(!isMuted);
            if (videoRef.current) {
              videoRef.current.muted = !isMuted;
            }
          }}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>

        <button
          className="px-3 py-1 bg-green-500 text-white rounded mr-2"
          onClick={() => {
            // Force reconnection
            if (socketRef.current) {
              socketRef.current.disconnect();
              socketRef.current.connect();
            }
          }}
        >
          Reconnecter
        </button>

        {/* Nouveau bouton pour forcer le refresh des pistes */}
        <button
          className="px-3 py-1 bg-purple-500 text-white rounded"
          onClick={() => {
            if (mediaStream && videoRef.current) {
              // Forcer la reconnexion du stream à la vidéo
              videoRef.current.srcObject = null;
              setTimeout(() => {
                videoRef.current.srcObject = mediaStream;
                videoRef.current
                  .play()
                  .then(handlePlaySuccess)
                  .catch(handlePlayError);
              }, 500);
            }
          }}
        >
          Rafraîchir le stream
        </button>
      </div>

      {/* Ajout d'une section de débogage */}
      {debugInfo && (
        <div className="mt-4 p-3 bg-gray-100 text-gray-800 rounded-lg">
          <details>
            <summary className="cursor-pointer font-semibold">
              Informations de débogage
            </summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export { StreamPlayer };
