import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const SecureVideoPlayer = ({ videoId, authToken }) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);

  useEffect(() => {
    const fetchVideoStream = async () => {
      try {
        const referrer = document.location.hostname;
        
        // Création d'une MediaSource
        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        
        // Création d'une URL pour la MediaSource
        const videoUrl = URL.createObjectURL(mediaSource);
        videoRef.current.src = videoUrl;

        mediaSource.addEventListener('sourceopen', async () => {
          try {
            // Initialisation du SourceBuffer
            const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
            sourceBufferRef.current = sourceBuffer;

            const response = await fetch(`/api/videos/${videoId}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Referrer': referrer
              }
            });

            if (!response.ok) throw new Error('Accès non autorisé');
            if (!response.body) throw new Error('ReadableStream non supporté');

            const reader = response.body.getReader();
            const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);
            let receivedLength = 0;
            let chunks = [];

            while (true) {
              const { done, value } = await reader.read();
              
              if (done) break;
              
              chunks.push(value);
              receivedLength += value.length;
              
              // Mise à jour de la progression
              if (contentLength > 0) {
                setProgress(Math.round((receivedLength / contentLength) * 100));
              }

              // Ajout des données au SourceBuffer quand disponible
              if (!sourceBuffer.updating) {
                const data = new Uint8Array(receivedLength);
                let position = 0;
                for (const chunk of chunks) {
                  data.set(chunk, position);
                  position += chunk.length;
                }
                chunks = [];
                sourceBuffer.appendBuffer(data);
              }
            }

            // Fin du flux
            mediaSource.endOfStream();
            setLoading(false);
          } catch (err) {
            if (mediaSource.readyState === 'open') {
              mediaSource.endOfStream('network');
            }
            throw err;
          }
        });

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVideoStream();

    return () => {
      if (mediaSourceRef.current) {
        if (mediaSourceRef.current.readyState === 'open') {
          mediaSourceRef.current.endOfStream();
        }
        URL.revokeObjectURL(videoRef.current?.src);
      }
    };
  }, [videoId, authToken]);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, []);

  if (loading) return (
    <div className="p-4 text-center">
      <div>Chargement... {progress}%</div>
      <progress 
        value={progress} 
        max="100" 
        className="w-full h-2 bg-gray-200 rounded"
      />
    </div>
  );
  
  if (error) return <div className="p-4 text-red-600">Erreur : {error}</div>;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        onContextMenu={(e) => e.preventDefault()}
      />
      
      <video
        ref={videoRef}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        className="w-full aspect-video bg-black rounded-lg"
      >
        Votre navigateur ne supporte pas les vidéos HTML5.
      </video>
    </div>
  );
};

SecureVideoPlayer.propTypes = {
  videoId: PropTypes.string.isRequired,
  authToken: PropTypes.string.isRequired
};

export default SecureVideoPlayer;