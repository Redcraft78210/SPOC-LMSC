import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const SecureVideoPlayer = ({ videoId, authToken }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  // Références persistantes
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const abortControllerRef = useRef(null);
  const videoUrlRef = useRef(null);
  const currentOffsetRef = useRef(0);
  const totalSizeRef = useRef(null);
  const isFetchingRef = useRef(false);
  const bufferQueue = useRef([]);
  const isProcessing = useRef(false);
  const pendingSeekPosition = useRef(null);

  // Configuration
  const CHUNK_SIZE = 20 * 1024 * 1024; // 20MB
  const BUFFER_AHEAD_TARGET = 20; // Secondes
  const BUFFER_TRIM_INTERVAL = 5000; // 5s
  const KEYFRAME_OFFSET = 1024 * 512; // Ajustement pour l'alignement des keyframes

  const safelyEndMediaSource = async () => {
    if (!mediaSourceRef.current) return;

    if (mediaSourceRef.current.readyState === "open") {
      try {
        const sourceBuffer = sourceBufferRef.current;

        if (sourceBuffer) {
          sourceBuffer.abort();
          if (!sourceBuffer.updating) {
            mediaSourceRef.current.endOfStream();
          }
        } else {
          mediaSourceRef.current.endOfStream();
        }
      } catch (err) {
        console.log("Nettoyage MediaSource:", err);
      }
    }
  };

  const initializeMediaSource = async () => {
    try {
      // Nettoyage des précédentes instances
      await safelyEndMediaSource();
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }

      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;

      const handleSourceOpen = async () => {
        try {
          const mime = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
          if (!MediaSource.isTypeSupported(mime)) {
            throw new Error(`Type MIME non supporté: ${mime}`);
          }

          const sourceBuffer = mediaSource.addSourceBuffer(mime);
          sourceBufferRef.current = sourceBuffer;
          sourceBuffer.mode = "segments";

          if (pendingSeekPosition.current !== null) {
            currentOffsetRef.current = Math.floor(
              (pendingSeekPosition.current / videoRef.current.duration) *
                totalSizeRef.current
            );
            pendingSeekPosition.current = null;
          }

          checkBufferAndFetch();
        } catch (err) {
          setError(err.message);
        }
      };

      mediaSource.addEventListener("sourceopen", handleSourceOpen, {
        once: true,
      });

      const url = URL.createObjectURL(mediaSource);
      videoUrlRef.current = url;
      setVideoUrl(url);
    } catch (err) {
      setError(`Erreur d'initialisation: ${err.message}`);
    }
  };

  const processBufferQueue = async () => {
    if (isProcessing.current || !sourceBufferRef.current) return;
    isProcessing.current = true;

    while (bufferQueue.current.length > 0) {
      const buffer = bufferQueue.current.shift();
      try {
        await appendToSourceBuffer(buffer);
      } catch (err) {
        console.error("Erreur d'ajout de buffer:", err);
        bufferQueue.current.unshift(buffer);
        break;
      }
    }

    isProcessing.current = false;
  };

  const appendToSourceBuffer = async (buffer) => {
    const sourceBuffer = sourceBufferRef.current;
    if (!sourceBuffer || sourceBuffer.updating) {
      throw new Error("SourceBuffer non disponible");
    }

    return new Promise((resolve, reject) => {
      const onUpdateEnd = () => {
        sourceBuffer.removeEventListener("updateend", onUpdateEnd);
        resolve();
      };

      const onError = (err) => {
        sourceBuffer.removeEventListener("error", onError);
        reject(err);
      };

      sourceBuffer.addEventListener("updateend", onUpdateEnd, { once: true });
      sourceBuffer.addEventListener("error", onError, { once: true });

      if (
        mediaSourceRef.current &&
        mediaSourceRef.current.readyState === "open"
      ) {
        try {
          sourceBuffer.appendBuffer(buffer);
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error("MediaSource not open"));
      }
    });
  };

  const fetchVideoData = async () => {
    if (isFetchingRef.current || !sourceBufferRef.current) return;
    isFetchingRef.current = true;

    try {
      const headers = {
        Authorization: `Bearer ${authToken}`,
        Range: `bytes=${currentOffsetRef.current}-${
          currentOffsetRef.current + CHUNK_SIZE - 1
        }`,
      };

      const response = await fetch(
        `https://localhost:8443/api/videos/${videoId}`,
        { headers, signal: abortControllerRef.current?.signal }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const contentRange = response.headers.get("Content-Range");
      if (!contentRange) throw new Error("Content-Range header manquant");

      const [, start, end, total] =
        contentRange.match(/bytes (\d+)-(\d+)\/(\d+)/) || [];
      if (!start || !end || !total)
        throw new Error("Format Content-Range invalide");

      currentOffsetRef.current = parseInt(end, 10) + 1;
      totalSizeRef.current = parseInt(total, 10);

      const buffer = await response.arrayBuffer();
      bufferQueue.current.push(buffer);
      processBufferQueue();
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(`Erreur de chargement: ${err.message}`);
      }
    } finally {
      isFetchingRef.current = false;
    }
  };
  const handleSeeking = async () => {
    if (!videoRef.current || !totalSizeRef.current) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const targetByte = Math.max(
      0,
      Math.floor(
        (videoRef.current.currentTime / videoRef.current.duration) *
          totalSizeRef.current
      ) - KEYFRAME_OFFSET
    );

    // Réinitialisation plus robuste
    bufferQueue.current = [];
    currentOffsetRef.current = Math.max(0, targetByte);

    try {
      if (sourceBufferRef.current) {
        sourceBufferRef.current.abort();
        await new Promise((resolve) => {
          if (!sourceBufferRef.current) return resolve();
          const handler = () => {
            sourceBufferRef.current?.remove(0, Infinity);
            resolve();
          };
          sourceBufferRef.current.addEventListener("updateend", handler, {
            once: true,
          });
        });
      }
    } catch (err) {
      console.log("Nettoyage buffer:", err);
    }

    initializeMediaSource();
  };

  const checkBufferAndFetch = async () => {
    const video = videoRef.current;
    const sourceBuffer = sourceBufferRef.current;

    if (!video || !sourceBuffer || isFetchingRef.current) return;

    try {
      const currentTime = video.currentTime;
      const bufferEnd = getBufferEnd(currentTime);
      const needsData = bufferEnd < currentTime + BUFFER_AHEAD_TARGET;

      if (
        needsData &&
        (currentOffsetRef.current < totalSizeRef.current ||
          currentOffsetRef.current === 0)
      ) {
        await fetchVideoData();
      }
    } catch (err) {
      setError(`Erreur de buffer: ${err.message}`);
    }
  };
  const getBufferEnd = (currentTime) => {
    const sourceBuffer = sourceBufferRef.current;
    const mediaSource = mediaSourceRef.current;

    if (!sourceBuffer || !mediaSource || mediaSource.readyState !== "open") {
      return 0;
    }

    const ranges = sourceBuffer.buffered;
    return ranges.length ? ranges.end(ranges.length - 1) : 0;
  };

  const trimExcessBuffer = async () => {
    const sourceBuffer = sourceBufferRef.current;
    const video = videoRef.current;

    if (!sourceBuffer || sourceBuffer.updating || !video) return;

    try {
      const currentTime = video.currentTime;
      const safeTrimPoint = Math.max(0, currentTime - 5);

      if (
        sourceBuffer.buffered.length > 0 &&
        sourceBuffer.buffered.start(0) < safeTrimPoint
      ) {
        await new Promise((resolve) => {
          sourceBuffer.addEventListener("updateend", resolve, { once: true });
          sourceBuffer.remove(0, safeTrimPoint);
        });
      }
    } catch (err) {
      console.error("Erreur de nettoyage:", err);
    }
  };

  useEffect(() => {
    initializeMediaSource();

    return () => {
      abortControllerRef.current?.abort();
      if (mediaSourceRef.current?.readyState === "open") {
        mediaSourceRef.current.endOfStream();
      }
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    };
  }, [videoId, authToken]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const events = {
      timeupdate: () => checkBufferAndFetch(),
      seeking: handleSeeking,
      error: () => setError(`Erreur média: ${video.error?.message}`),
    };

    Object.entries(events).forEach(([event, handler]) =>
      video.addEventListener(event, handler)
    );
    const trimInterval = setInterval(trimExcessBuffer, BUFFER_TRIM_INTERVAL);

    return () => {
      Object.entries(events).forEach(([event, handler]) =>
        video.removeEventListener(event, handler)
      );
      clearInterval(trimInterval);
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleError = () => {
      const err = videoElement.error;
      if (err) {
        console.error("Media error:", err);
        switch (err.code) {
          case 3: // MEDIA_ERR_DECODE
            handleSeeking();
            break;
          default:
            setError(`Media error (${err.code}): ${err.message}`);
        }
      }
    };

    const handleCanPlay = () => {
      videoElement
        .play()
        .catch((err) => setError(`Play error: ${err.message}`));
    };

    videoElement.addEventListener("error", handleError);
    videoElement.addEventListener("canplay", handleCanPlay);

    return () => {
      videoElement.removeEventListener("canplay", handleCanPlay);
    };
  }, [videoUrl]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleContextMenu = (e) => e.preventDefault();
    videoElement.addEventListener("contextmenu", handleContextMenu);
    return () =>
      videoElement.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        onContextMenu={(e) => e.preventDefault()}
      />
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        autoPlay
        muted
        playsInline
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        className="w-full aspect-video bg-black rounded-lg"
      >
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
};

SecureVideoPlayer.propTypes = {
  videoId: PropTypes.string.isRequired,
  authToken: PropTypes.string.isRequired,
};

export default SecureVideoPlayer;
