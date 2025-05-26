class AudioDecoder {
  constructor(options = {}) {
    this.onSamplesDecoded = options.onSamplesDecoded || function() {};
    this.initialized = false;
    this.sampleRate = 44100;
    this.channels = 2;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.player = null;
    this.bufferSize = 4096;
    this.audioBuffers = []; // Buffer for collecting audio packets
    
    // Set up the audio format you're working with
    this.format = options.format || 'aac'; // 'aac', 'mp3', etc.
  }
  
  init() {
    try {
      // Check if Aurora.js is available
      if (typeof AV === 'undefined') {
        console.error("Aurora.js (AV) is not defined. Make sure it is properly loaded.");
        return this; // Return early but don't set initialized=true
      }
      
      // Create a very basic AudioDecoder fallback if no Aurora.js
      if (!AV.Player) {
        console.warn("AV.Player not available, using basic decoder");
        this.initialized = true;
        return this;
      }
      
      // Create an Aurora.js player
      this.player = new AV.Player();
      
      // Set up the audio output
      this.player.on('format', (format) => {
        this.sampleRate = format.sampleRate;
        this.channels = format.channelCount;
        console.log(`Audio format: ${this.sampleRate}Hz, ${this.channels} channels`);
      });
      
      // Handle decoded audio data
      this.player.on('data', (buffer) => {
        if (this.onSamplesDecoded) {
          this.onSamplesDecoded(buffer, this.sampleRate, this.channels);
        }
      });
      
      this.initialized = true;
      console.log("AudioDecoder initialized with Aurora.js");
    } catch (error) {
      console.error("Error initializing Aurora.js player:", error);
      // Set a fallback approach - we'll use Web Audio API directly
      console.log("Using fallback audio decoding method");
      this.initialized = true; // Still mark as initialized so we can use fallback
    }
    
    return this;
  }
  
  decode(audioData) {
    if (!this.initialized) {
      console.warn("AudioDecoder not properly initialized");
      return;
    }
    
    try {
      // Add the data to the buffer
      this.audioBuffers.push(audioData);
      
      // If we have enough data, try to decode it
      if (this.audioBuffers.length > 1) {
        // Combine all buffered data
        const combinedLength = this.audioBuffers.reduce((total, buffer) => total + buffer.length, 0);
        const combinedBuffer = new Uint8Array(combinedLength);
        
        let offset = 0;
        for (const buffer of this.audioBuffers) {
          combinedBuffer.set(buffer, offset);
          offset += buffer.length;
        }
        
        if (this.player && typeof AV !== 'undefined' && AV.Asset) {
          try {
            // Create an Aurora.js asset from the buffer
            const asset = AV.Asset.fromBuffer(combinedBuffer.buffer);
            
            // Load and decode the asset
            if (this.player.playing) this.player.stop();
            this.player.asset = asset;
            this.player.preload();  // Preload first
            
            // Only attempt to play once we have a valid asset
            if (this.player.asset) {
              this.player.play();
            } else {
              console.warn("Player asset is undefined, can't play");
            }
            
            // Clear the buffer after successful decoding
            this.audioBuffers = [];
          } catch (error) {
            console.warn("Could not decode audio:", error);
            // Try Web Audio API fallback
            this._tryWebAudioFallback(combinedBuffer);
          }
        } else {
          // Use Web Audio API fallback
          this._tryWebAudioFallback(combinedBuffer);
        }
      }
    } catch (error) {
      console.error("Error processing audio packet:", error);
    }
  }
  
  _tryWebAudioFallback(buffer) {
    console.log("Attempting Web Audio API fallback");
    try {
      // Use AudioContext.decodeAudioData if available
      this.audioContext.decodeAudioData(buffer.buffer, 
        (audioBuffer) => {
          // Success callback
          if (this.onSamplesDecoded) {
            // Extract samples to match expected format
            const samples = new Float32Array(audioBuffer.length * audioBuffer.numberOfChannels);
            for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
              const channelData = audioBuffer.getChannelData(c);
              for (let i = 0; i < audioBuffer.length; i++) {
                samples[i * audioBuffer.numberOfChannels + c] = channelData[i];
              }
            }
            this.onSamplesDecoded(samples, audioBuffer.sampleRate, audioBuffer.numberOfChannels);
          }
          this.audioBuffers = []; // Clear buffer after successful decode
        },
        (error) => {
          console.error("Web Audio API fallback failed:", error);
        }
      );
    } catch (error) {
      console.error("Web Audio API fallback error:", error);
    }
  }
  
  reset() {
    if (this.player && this.player.stop) {
      this.player.stop();
    }
    this.audioBuffers = [];
  }
}

// Expose the class globally
window.AudioDecoder = AudioDecoder;