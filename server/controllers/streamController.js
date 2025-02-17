const fs = require('fs');
const path = require('path');

const serveM3U8 = (req, res) => {
//   const { filename } = req.params;
  const { filename } = 'test/test.m3u8';
  const filePath = path.join(__dirname, '../streaming', filename); // Assuming the m3u8 files are in the 'streaming' directory

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading .m3u8 file:', err);
      return res.status(500).json({ message: 'Error reading .m3u8 file' });
    }

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', 'same-origin'); // Restrict to same-site origin
    res.send(data);
  });
};

module.exports = { serveM3U8 };

