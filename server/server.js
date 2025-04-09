// server.js

// Required modules
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const privateKey = fs.readFileSync('certs/selfsigned.key', 'utf8');
const certificate = fs.readFileSync('certs/selfsigned.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Import routes
const authRoutes = require('./routes/authRoutes').default;
const courseRoutes = require('./routes/courseRoutes').default;
const userRoutes = require('./routes/userRoutes').default;
const liveRoutes = require('./routes/liveRoutes').default;
const videoRoutes = require('./routes/videoRoutes').default;
const documentRoutes = require('./routes/documentRoutes').default;


// Initialize environment variables
dotenv.config();
const PORT = process.env.PORT || 8443;
const HTTP_PORT = process.env.HTTP_PORT || 5000;

// Create an Express app
const app = express();
app.enable('trust proxy');

app.use((request, response, next) => {
  if (request.secure) {
    next();
  } else {
    var secure_host = req.headers.host.replace(/:\d+/, ":" + PORT);
    response.redirect('https://' + secure_host + request.url);
  }
});


// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(morgan('dev')); // Log HTTP requests in the console
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Serve public static files
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));

// API routes
app.use('/api/auth', authRoutes); // Authentication routes (login, register)
app.use('/api/courses', courseRoutes); // Courses-related routes
app.use('/api/user', userRoutes); // Courses-related routes
app.use('/api/lives', liveRoutes); // Courses-related routes
app.use('/api/videos', videoRoutes); // Video-related routes
app.use('/api/documents', documentRoutes); // Document-related routes

// Serve React frontend (if applicable)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Serve all frontend routes as the index.html page for React Router to handle
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
} else {
  // In development mode, fallback to React's development server
  app.get('*', (req, res) => {
    res.send('API is running');
  });
}

const httpsServer = https.createServer(credentials, app);
const httpServer = http.createServer((req, res) => {
  req.headers["host"] = req.headers["host"].replace(/:\d+/, ":" + PORT);
  res.writeHead(301, { "Location": "https://" + req.headers["host"] + req.url });
  res.end();
});

// Start the HTTPS server
httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server is running on port ${PORT}`);
});

// Start the HTTP server (redirects to HTTPS)
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP Server is running on port ${HTTP_PORT} and redirecting to HTTPS`);
});

