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

/**
 * Base WebSocket URL for streaming API connection
 * @constant {string}
 */
const WSS_BASE_URL = 'wss://172.16.87.30/api';

/**
 * StreamReader component for displaying video and audio streams from a WebSocket connection
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.authToken - Authentication token for WebSocket connection
 * @param {boolean} [props.controls=true] - Whether to show video controls
 * @param {string} [props.status] - Current stream status ('ongoing', etc.)
 * @returns {JSX.Element} Rendered component
 */
const StreamReader = ({ authToken, controls, status }) => {
  const containerRef = useRef();
  const playerRef = useRef();
  const controlsTimerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const wsRef = useRef(null);
  const audioDecoderRef = useRef(null);

  /**
   * Handles mouse movement over the player to show controls
   * Sets a timer to hide controls after 3 seconds of inactivity if video is playing
   *
   * @function
   * @returns {void}
   */
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

  /**
   * Toggles play/pause state of the video stream
   *
   * @function
   * @returns {void}
   */
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  /**
   * Toggles audio mute state
   *
   * @function
   * @returns {void}
   */
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  /**
   * Toggles fullscreen mode for the video player
   *
   * @function
   * @returns {void}
   * @throws {Error} If fullscreen request fails
   */
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  /**
   * Effect to handle fullscreen state changes
   * Adds and removes event listeners for fullscreen changes
   *
   * @effect
   * @returns {Function} Cleanup function that removes event listeners
   */
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  /**
   * Main effect to initialize video player, audio decoder, and WebSocket connection
   * Sets up the stream playback and handles incoming WebSocket messages
   *
   * @effect
   * @param {Array} dependencies - Effect dependencies [isPlaying, authToken]
   * @returns {Function} Cleanup function that closes connections and cleans up resources
   */
  useEffect(() => {
    const WSURL = `${WSS_BASE_URL}/stream?token=${authToken}`;

    const player = new Player({
      useWorker: true,
      workerFile: '/Decoder.js',
      webgl: true,
    });

    if (containerRef.current) {
      const existingCanvas = containerRef.current.querySelector('canvas');
      if (existingCanvas) {
        containerRef.current.removeChild(existingCanvas);
      }
      containerRef.current.appendChild(player.canvas);
      player.canvas.classList.add('videoPlayer');

      player.canvas.style.width = '100%';
      player.canvas.style.height = '100%';
      player.canvas.style.objectFit = 'contain';
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.addEventListener(
      'click',
      function () {
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      },
      { once: true }
    );

    /**
     * AudioDecoder class for decoding audio data from the stream
     *
     * @class
     * @param {Object} config - Configuration object
     * @param {Function} config.onSamplesDecoded - Callback function when samples are decoded
     * @returns {Object} AudioDecoder instance
     */
    const audioDecoder = new AudioDecoder({
      /**
       * Callback when audio samples are decoded
       * Creates and plays an audio buffer from the decoded samples
       *
       * @function
       * @param {Float32Array} samples - Decoded audio samples
       * @param {number} sampleRate - Audio sample rate in Hz
       * @param {number} channels - Number of audio channels
       * @returns {void}
       */
      onSamplesDecoded: function (samples, sampleRate, channels) {
        if (!isPlaying) return;

        const audioBuffer = audioContext.createBuffer(
          channels,
          samples.length / channels,
          sampleRate
        );

        for (let channel = 0; channel < channels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          for (let i = 0; i < samples.length / channels; i++) {
            channelData[i] = samples[i * channels + channel];
          }
        }

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

    /**
     * WebSocket message handler
     * Processes incoming data and routes it to the appropriate decoder
     *
     * @function
     * @param {MessageEvent} event - WebSocket message event
     * @returns {void}
     */
    ws.onmessage = (event) => {
      if (!isPlaying) return;

      const data = new Uint8Array(event.data);

      if (data[0] === 1) {
        // Handle audio data
        if (audioDecoderRef.current) {
          audioDecoderRef.current.decode(data.slice(1));
        } else {
          console.error('Audio decoder not initialized');
        }
      } else {
        player.decode(data);
      }
    };

    const container = containerRef.current;

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
            {status === 'ongoing' && (
              <div
                className={`flex items-center gap-2 ${
                  connectionStatus === 'connected'
                    ? 'text-red-500'
                    : 'text-gray-400'
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    connectionStatus === 'connected'
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-gray-400'
                  }`}
                ></span>
                <span className="uppercase text-xs font-semibold tracking-widest">
                  {connectionStatus === 'connected'
                    ? 'LIVE'
                    : 'CONNECTING'}
                </span>
              </div>
            )}
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

/**
 * PropTypes for the StreamReader component
 *
 * @type {Object}
 * @property {string} authToken - Authentication token for WebSocket connection (required)
 * @property {boolean} [controls] - Whether to show video controls
 * @property {string} [status] - Current stream status ('ongoing', etc.)
 */
StreamReader.propTypes = {
  authToken: PropTypes.string.isRequired,
  controls: PropTypes.bool,
  status: PropTypes.string,
};

export { StreamReader };
