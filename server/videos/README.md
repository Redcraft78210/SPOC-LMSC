# Dossier `videos`

Ce dossier contient les fichiers vidéo utilisés par la plateforme SPOC-LMSC.

## Fonction

- Stockage permanent des vidéos associées aux cours et contenus pédagogiques.
- Chaque fichier vidéo est nommé selon la convention :  
  `<UUID>-<empreinte>.mp4`  
  où :
  - `UUID` est l’identifiant unique de la vidéo (généré par la base de données).
  - `empreinte` est une empreinte numérique (hash/fingerprint) du fichier pour garantir son intégrité.

## Structure

- Exemple de nom de fichier :  
  `7f4b5385-04fa-cde3-c881-b73844f52f27-5f6e7d8c.mp4`
- Les vidéos sont ajoutées, lues et supprimées uniquement via l’API sécurisée du backend.
- Ce dossier ne doit pas contenir d’autres types de fichiers.

## Sécurité

- **Ne jamais placer de fichiers manuellement dans ce dossier.**
- Les accès en lecture/écriture sont strictement réservés au processus Node.js du serveur.
- Les vidéos sont soumises à des contrôles d’intégrité et de sécurité lors de l’upload.

## Sauvegarde

- Ce dossier doit être inclus dans les sauvegardes régulières du serveur.
- En cas de restauration, veillez à conserver les droits d’accès d’origine.

---

© SPOC-LMSC