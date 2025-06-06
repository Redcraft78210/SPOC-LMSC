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

const WSS_BASE_URL = 'wss://172.16.87.30/api';

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


  };

  const toggleMute = () => {
    setIsMuted(!isMuted);



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

    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

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


    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();


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


    ws.onmessage = event => {
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
                className={`flex items-center gap-2 ${connectionStatus === 'connected' ? 'text-red-500' : 'text-gray-400'}`}
              >
                <span
                  className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}
                ></span>
                <span className="uppercase text-xs font-semibold tracking-widest">
                  {connectionStatus === 'connected' ? 'LIVE' : 'CONNECTING'}
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

StreamReader.propTypes = {
  authToken: PropTypes.string.isRequired,
  controls: PropTypes.bool,
  status: PropTypes.string,
};

export { StreamReader };
