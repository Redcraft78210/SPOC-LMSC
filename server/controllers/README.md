# Dossier `controllers`

Ce dossier contient les contrôleurs principaux de l’application serveur SPOC-LMSC.  
Chaque contrôleur gère la logique métier pour une ressource ou fonctionnalité spécifique (authentification, chat, cours, enregistrements, modération, etc.).

## Fichiers présents

- **authController.js** : Gestion de l’authentification et des sessions utilisateur.
- **avatarController.js** : Gestion des avatars utilisateurs.
- **chatController.js** : Logique du chat en direct (messages, suppression, etc.).
- **classController.js** : Gestion des classes et affectations.
- **codeController.js** : Contrôleur pour la gestion des codes d’invitation ou d’accès.
- **courseController.js** : Gestion des cours (création, édition, suppression).
- **documentController.js** : Gestion des documents (upload, suppression).
- **forumController.js** : Logique du forum (threads, commentaires).
- **liveController.js** : Gestion des lives/streams vidéo.
- **messageController.js** : Gestion de la messagerie interne.
- **moderationController.js** : Outils de modération (signalement, avertissements).
- **progressTracking.js** : Suivi de la progression des utilisateurs.
- **recordingController.js** : Gestion des enregistrements vidéo via FFmpeg.
- **socketController.js** : Gestion des sockets temps réel.
- **userController.js** : Gestion des profils utilisateurs.
- **videoController.js** : Gestion des vidéos (upload, lecture, suppression).
- **README.md** : Ce fichier d’explication.

## Remarques

- Chaque contrôleur exporte des fonctions utilisées dans les routes Express correspondantes.
- Respectez la séparation des responsabilités : la logique métier doit rester dans ces fichiers, la logique de routage dans le dossier `routes`.
- N’ajoutez pas d’informations sensibles dans ce dossier.