# Dossier `documents`

Ce dossier contient les fichiers PDF et autres documents stockés ou générés par le serveur SPOC-LMSC.  
Les documents sont généralement associés à des cours et gérés via les routes et contrôleurs Express.

## Fichiers présents

- **a6fa5fc1-1234-4321-0000-000000000016-2e3d4c5b.pdf** : Exemple de document PDF stocké (nom généré automatiquement à partir de l’ID et de l’empreinte).
- **README.md** : Ce fichier d’explication.

## Fonctionnement

- Les documents sont uploadés, récupérés et supprimés via les routes définies dans [`documentRoutes.js`](../routes/documentRoutes.js) et la logique métier du contrôleur [`documentController.js`](../controllers/documentController.js).
- Les métadonnées des documents (titre, description, empreinte, etc.) sont gérées par le modèle [`Document`](../models/Document.js).
- Les associations entre documents et cours sont gérées par le modèle [`CourseDocument`](../models/CourseDocument.js).

## Remarques

- Les fichiers sont nommés de façon unique (`<id>-<empreinte>.pdf`) pour éviter les conflits et garantir la sécurité.
- Ce dossier ne doit contenir que des documents accessibles via l’application.
- Ne stockez pas d’informations sensibles ou confidentielles sans chiffrement adapté.
- La suppression d’un document via l’API entraîne également la suppression du fichier correspondant dans ce dossier.