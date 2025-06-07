/**
 * @fileoverview Service de scan antivirus pour les pièces jointes
 * Ce module fournit des fonctionnalités pour scanner les pièces jointes à la recherche de virus
 * et met en quarantaine les fichiers infectés en utilisant un script externe.
 * @module virusScanService
 */

const { spawn } = require('child_process');
const { Attachment } = require('../models');
const path = require('path');
const fs = require('fs');

/**
 * Chemin vers le répertoire des fichiers téléchargés
 * @constant {string}
 */
const UPLOADS_DIR = path.join(__dirname, '../uploads');

/**
 * Chemin vers le script de mise en quarantaine
 * @constant {string}
 */
const QUARANTINE_SCRIPT = path.join(__dirname, '../quarantine.sh');


// Création du répertoire des téléchargements s'il n'existe pas
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Attribution des permissions d'exécution au script de quarantaine
fs.chmodSync(QUARANTINE_SCRIPT, '755');

/**
 * Analyse une pièce jointe à la recherche de virus
 * 
 * Cette fonction récupère une pièce jointe par son ID, vérifie si le fichier existe,
 * puis exécute un script de quarantaine pour analyser le fichier. Le statut de scan
 * de la pièce jointe est mis à jour en fonction du résultat.
 * 
 * @async
 * @param {string|number} attachmentId - L'identifiant de la pièce jointe à analyser
 * @returns {Promise<void>} Ne retourne rien directement, mais met à jour le statut de la pièce jointe dans la base de données
 * @throws {Error} Peut générer une erreur lors de l'accès à la base de données ou de la manipulation des fichiers
 * 
 * @example
 * // Analyser une pièce jointe avec l'ID 123
 * await scanAttachment(123);
 */
const scanAttachment = async (attachmentId) => {
  try {
    const attachment = await Attachment.findByPk(attachmentId);
    if (!attachment) {
      console.error(`Attachment ${attachmentId} not found`);
      return;
    }

    const filePath = path.join(UPLOADS_DIR, attachment.id);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File ${filePath} does not exist`);
      attachment.scanStatus = 'infected'; // Mark as infected if file is missing
      await attachment.save();
      return;
    }

    const quarantineProcess = spawn(QUARANTINE_SCRIPT, [filePath]);
    
    let output = '';
    
    quarantineProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    quarantineProcess.stderr.on('data', (data) => {
      console.error(`Quarantine script stderr: ${data}`);
    });

    quarantineProcess.on('close', async (code) => {
      if (code === 1) {
        console.log(`File ${filePath} was infected and moved to quarantine`);
        attachment.scanStatus = 'infected';
      } else if (code === 0) {
        console.log(`File ${filePath} is clean`);
        attachment.scanStatus = 'clean';
      } else {
        console.error(`Error scanning file ${filePath}: ${output}`);
      }

      await attachment.save();
    });
  } catch (error) {
    console.error('Error scanning attachment:', error);
  }
};

module.exports = { scanAttachment };