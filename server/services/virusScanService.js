// services/virusScanService.js
const { spawn } = require('child_process');
const { Attachment } = require('../models');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Scan attachment using ClamAV
const scanAttachment = async (attachmentId) => {
  try {
    const attachment = await Attachment.findByPk(attachmentId);
    if (!attachment) {
      console.error(`Attachment ${attachmentId} not found`);
      return;
    }

    const filePath = path.join(UPLOADS_DIR, attachment.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File ${filePath} does not exist`);
      attachment.scanStatus = 'infected'; // Mark as infected if file is missing
      await attachment.save();
      return;
    }

    // Use clamdscan if available, otherwise use clamscan
    const clamAV = spawn('clamdscan', ['--stream', filePath]);
    
    let output = '';
    
    clamAV.stdout.on('data', (data) => {
      output += data.toString();
    });

    clamAV.stderr.on('data', (data) => {
      console.error(`ClamAV stderr: ${data}`);
    });

    clamAV.on('close', async (code) => {
      // ClamAV returns 0 if no virus, 1 if virus found, 2 if error
      if (code === 1 || output.includes(': Infected')) {
        // Virus detected
        attachment.scanStatus = 'infected';
      } else if (code === 0) {
        // No virus
        attachment.scanStatus = 'clean';
      } else {
        // Error scanning, keep as pending for now
        console.error(`Error scanning file ${filePath}: ${output}`);
      }

      await attachment.save();
    });
  } catch (error) {
    console.error('Error scanning attachment:', error);
  }
};

module.exports = { scanAttachment };