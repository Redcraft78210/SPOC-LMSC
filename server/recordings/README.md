# Dossier `recordings`

Ce dossier contient les enregistrements vidéo temporaires générés par le serveur lors de l'utilisation des fonctionnalités d'enregistrement.  
Les fichiers ici sont créés et gérés automatiquement par le contrôleur [`recordingController.js`](../controllers/recordingController.js).

## Fonctionnement

- Lorsqu'un enregistrement démarre via l'API, un fichier `.mp4` est créé dans ce dossier avec un nom basé sur la date et l'heure (ex : `2025-05-10T11-38-26-802Z-3248214138.mp4`).
- À l'arrêt de l'enregistrement, le fichier est déplacé vers le dossier `videos` et catalogué en base de données.
- Les fichiers présents ici sont donc temporaires et peuvent être supprimés automatiquement après traitement.

## Structure des fichiers

- `YYYY-MM-DDTHH-MM-SS-SSSZ[-CHECKSUM].mp4` : fichiers vidéo générés par FFmpeg.
- `README.md` : ce fichier d'explication.

## À propos du contrôleur

La logique de gestion des enregistrements est définie dans [`recordingController.js`](../controllers/recordingController.js) :
- **Démarrage** : création d’un nouveau fichier dans ce dossier.
- **Arrêt** : calcul d’un hash CRC32, déplacement du fichier, sauvegarde en base.
- **Statut** : expose l’état courant de l’enregistrement.

## Nettoyage

Ce dossier peut être vidé régulièrement pour éviter l’accumulation de fichiers temporaires non utilisés.

---
*Ce dossier ne doit pas être utilisé pour stocker des vidéos finales ou archivées.*