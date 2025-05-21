// services/virusScanService.js
const { spawn } = require('child_process');
const { Attachment } = require('../models');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const QUARANTINE_SCRIPT = path.join(__dirname, '../quarantine.sh');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Make sure quarantine script is executable
fs.chmodSync(QUARANTINE_SCRIPT, '755');

// Scan attachment using quarantine script
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

    // Use quarantine script instead of direct clamdscan call
    const quarantineProcess = spawn(QUARANTINE_SCRIPT, [filePath]);
    
    let output = '';
    
    quarantineProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    quarantineProcess.stderr.on('data', (data) => {
      console.error(`Quarantine script stderr: ${data}`);
    });

    quarantineProcess.on('close', async (code) => {
      // Quarantine script returns 1 if infected (and file is moved to quarantine), 0 if clean
      if (code === 1) {
        // Virus detected and file moved to quarantine
        console.log(`File ${filePath} was infected and moved to quarantine`);
        attachment.scanStatus = 'infected';
      } else if (code === 0) {
        // No virus
        console.log(`File ${filePath} is clean`);
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