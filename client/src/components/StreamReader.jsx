import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Player } from 'broadwayjs';
import {
  Play,
  Pause,
  Volume2,
  VolumeOff,
  Maximize,
  Shrink,
} from 'lucide-react';

const WSS_BASE_URL = 'wss://172.20.10.5:8443/api';

const StreamReader = ({ authToken, controls }) => {
  const containerRef = useRef();
  const playerRef = useRef();
  const controlsTimerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  // const [bufferingState, setBufferingState] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const wsRef = useRef(null);
  const audioDecoderRef = useRef(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // If we're pausing/resuming, we could add logic here to handle that
    // For example, stop receiving or processing frames when paused
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Add actual mute logic here
    // For audio context this might look like:
    // audioContext.destination.gain.value = isMuted ? 0 : 1;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    // Monitor fullscreen changes
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    // Constants
    const WSURL = `${WSS_BASE_URL}/stream?token=${authToken}`;

    // Create the Broadway player
    const player = new Player({
      useWorker: true,
      workerFile: '/Decoder.js',
      webgl: true,
    });

    // Add the Broadway canvas to the DOM
    if (containerRef.current) {
      // Check if a canvas already exists
      const existingCanvas = containerRef.current.querySelector('canvas');
      if (existingCanvas) {
        // Replace the existing canvas
        containerRef.current.removeChild(existingCanvas);
      }
      containerRef.current.appendChild(player.canvas);
      player.canvas.classList.add('videoPlayer');

      // Style the canvas to fit properly
      player.canvas.style.width = '100%';
      player.canvas.style.height = '100%';
      player.canvas.style.objectFit = 'contain';
    }

    // Initialize audio decoder
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Resume audio context after user interaction
    document.addEventListener(
      'click',
      function () {
        if (audioContext.state === 'suspended') {
          audioContext.resume();
          
        }
      },
      { once: true }
    );

    const audioDecoder = new AudioDecoder({
      onSamplesDecoded: function (samples, sampleRate, channels) {
        // Only process audio if we're playing and not muted
        if (!isPlaying) return;

        // Create an audio buffer from the decoded samples
        const audioBuffer = audioContext.createBuffer(
          channels,
          samples.length / channels,
          sampleRate
        );

        // Fill the audio buffer with the samples
        for (let channel = 0; channel < channels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          for (let i = 0; i < samples.length / channels; i++) {
            channelData[i] = samples[i * channels + channel];
          }
        }

        // Create a buffer source and play it
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();

        console.log(
          `Playing audio: ${samples.length} samples, ${sampleRate}Hz, ${channels} channels`
        );
      },
    }).init();

    audioDecoderRef.current = audioDecoder;

    // WebSocket connection to receive the stream
    const ws = new WebSocket(WSURL);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = function () {
      
      setConnectionStatus('connected');
    };

    ws.onclose = function () {
      
      setConnectionStatus('disconnected');
    };

    ws.onerror = function () {
      console.error('WebSocket error occurred');
      setConnectionStatus('error');
    };

    // Handle incoming messages (H264 fragments)
    ws.onmessage = event => {
      if (!isPlaying) return; // Skip processing if paused

      const data = new Uint8Array(event.data);

      // Simple protocol: first byte indicates content type
      // 0 = video, 1 = audio
      if (data[0] === 1) {
        // Decode audio (remove 1-byte header)
        // audioDecoder.decode(data.slice(1));
      } else {
        // Decode video (remove 1-byte header)
        player.decode(data);
      }
    };

    // Capture refs for cleanup
    const container = containerRef.current;

    // Cleanup function
    return () => {
      ws.close();
      if (container && player.canvas) {
        container.removeChild(player.canvas);
      }
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      audioDecoder.reset();
    };
  }, [isPlaying, authToken]);

  return (
    <>
      <div
        className="relative w-full aspect-video bg-black rounded-xl shadow-lg overflow-hidden group"
        ref={playerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          ref={containerRef}
        />

        <div
          className={`
            absolute inset-0 flex flex-col justify-between pointer-events-none
            transition-opacity duration-300
            ${showControls ? 'opacity-100' : 'opacity-0'}
            group-hover:opacity-100
          `}
        >
          <div className="flex justify-end px-4 pt-2">
            <div
              className={`flex items-center gap-2 ${connectionStatus === 'connected' ? 'text-red-500' : 'text-gray-400'}`}
            >
              <span
                className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}
              ></span>
              <span className="uppercase text-xs font-semibold tracking-widest">
                {connectionStatus === 'connected' ? 'LIVE' : 'CONNECTING'}
              </span>
            </div>
          </div>

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <button
                className="bg-black/60 rounded-full p-6 shadow-lg hover:bg-black/80 transition"
                onClick={togglePlay}
              >
                <Play className="w-8 h-8 text-white" />
              </button>
            </div>
          )}

          {controls && (
            <div className="w-full px-4 pb-3 pointer-events-auto">
              <div className="h-1 w-full bg-gray-700 rounded mb-2 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="text-white hover:text-blue-400 transition"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause /> : <Play />}
                </button>
                <button
                  className="text-white hover:text-blue-400</svg> transition"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeOff /> : <Volume2 />}
                </button>
                <span className="text-xs text-gray-300">
                  {connectionStatus === 'connected'
                    ? 'Stream Connected'
                    : 'Connecting...'}
                </span>
                <button
                  className="ml-auto text-white ho</svg>ver:text-blue-400 transition"
                  onClick={toggleFullScreen}
                >
                  {isFullScreen ? <Shrink /> : <Maximize />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

StreamReader.propTypes = {
  authToken: PropTypes.string.isRequired,
  controls: PropTypes.bool,
};

export { StreamReader };
