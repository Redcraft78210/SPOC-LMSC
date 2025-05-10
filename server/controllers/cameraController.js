const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const net = require('net');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// TCP server and recording state
let isRecording = false;
let currentRecordingFile = null;
let writeStream = null;
const recordingsDir = path.join(__dirname, '../recordings');

// Ensure recordings directory exists
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

// Create TCP server to listen for FFmpeg stream
const tcpServer = net.createServer((socket) => {
  console.log('FFmpeg connected to TCP server');
  
  socket.on('data', (chunk) => {
    // If recording is active, write the data to file
    if (isRecording && writeStream) {
      writeStream.write(chunk);
    }
  });
  
  socket.on('end', () => {
    console.log('FFmpeg disconnected from TCP server');
  });
  
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

// Listen on TCP port 9000 - this is where FFmpeg will send the stream
tcpServer.listen(9000, () => {
  console.log('TCP server listening on port 9000');
});

// Route to start recording
app.post('/camera/record', (req, res) => {
  if (isRecording) {
    return res.status(400).json({ 
      success: false, 
      message: 'Already recording' 
    });
  }
  
  // Generate unique filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `recording-${timestamp}.ts`;
  currentRecordingFile = path.join(recordingsDir, filename);
  
  // Create write stream to save the data
  writeStream = fs.createWriteStream(currentRecordingFile);
  
  writeStream.on('error', (err) => {
    console.error('File write error:', err);
    isRecording = false;
    if (writeStream) {
      writeStream.end();
      writeStream = null;
    }
  });
  
  isRecording = true;
  
  res.json({
    success: true,
    message: 'Recording started',
    filename: filename
  });
});

// Route to stop recording
app.post('/camera/stop-record', (req, res) => {
  if (!isRecording) {
    return res.status(400).json({ 
      success: false, 
      message: 'Not currently recording' 
    });
  }
  
  // Close the write stream
  if (writeStream) {
    writeStream.end();
    writeStream = null;
  }
  
  isRecording = false;
  
  res.json({
    success: true,
    message: 'Recording stopped',
    filename: path.basename(currentRecordingFile)
  });
});

// Get recording status
app.get('/camera/record-status', (req, res) => {
  res.json({
    recording: isRecording,
    currentFile: isRecording ? path.basename(currentRecordingFile) : null
  });
});

// List all recordings
app.get('/camera/recordings', (req, res) => {
  fs.readdir(recordingsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    // Get file details
    const recordings = files
      .filter(file => file.endsWith('.ts'))
      .map(file => {
        const filePath = path.join(recordingsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime
        };
      })
      .sort((a, b) => b.created - a.created); // Sort newest first

    res.json({ success: true, recordings });
  });
});

// Download a recording
app.get('/camera/recordings/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(recordingsDir, filename);

  // Security check to prevent directory traversal
  if (!filename.match(/^[a-zA-Z0-9_-]+\.ts$/)) {
    return res.status(400).json({ success: false, message: 'Invalid filename' });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }

  // Send the file
  res.download(filePath);
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});