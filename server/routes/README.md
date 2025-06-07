# SPOC-LMSC — Dossier `routes/`

Ce dossier contient l'ensemble des **routes API** du backend SPOC-LMSC.  
Chaque fichier définit les endpoints REST pour une ressource ou fonctionnalité de la plateforme, en s'appuyant sur les contrôleurs associés (voir dossier `../controllers/`).

---

## Structure des routes

| Fichier                | Description principale                                         |
|------------------------|---------------------------------------------------------------|
| `authRoutes.js`        | Authentification, inscription, gestion des sessions           |
| `avatarRoutes.js`      | Upload, récupération, suppression d'avatars utilisateurs      |
| `chatRoutes.js`        | Chat temps réel pour les lives                                |
| `classRoutes.js`       | Gestion des classes et affectations                           |
| `codeRoutes.js`        | Gestion des codes d'accès (invitation, inscription)           |
| `courseRoutes.js`      | Gestion des cours, documents/vidéos associés                  |
| `documentRoutes.js`    | Upload, récupération, suppression de documents PDF            |
| `forumRoutes.js`       | Threads et commentaires du forum                              |
| `liveRoutes.js`        | Sessions de diffusion en direct (CRUD, modération)            |
| `messageRoutes.js`     | Messagerie interne, pièces jointes, boîte de réception        |
| `moderationRoutes.js`  | Signalements, avertissements, modération de contenu           |
| `progressTracking.js`  | Suivi de la progression, assiduité, statistiques              |
| `recordingRoutes.js`   | Contrôle des enregistrements vidéo                            |
| `userRoutes.js`        | Gestion des utilisateurs, profils, rôles                      |
| `videoRoutes.js`       | Streaming, upload, suppression de vidéos                      |

---

## Fonctionnement

- **Express Router** : chaque fichier exporte un router Express configuré.
- **Sécurité** : toutes les routes sont protégées par un middleware d’authentification (`authMiddleware`), sauf exceptions (ex : inscription, login).
- **Contrôleurs** : la logique métier est déléguée aux fichiers du dossier [`../controllers/`](../controllers/).
- **Validation** : les entrées sont validées côté route ou middleware.
- **Documentation** : chaque route est documentée en JSDoc dans les fichiers sources.

---

## Exemple d’ajout d’une route

1. Créer le contrôleur dans `../controllers/`.
2. Créer le fichier de route ici, par exemple `myResourceRoutes.js`.
3. L’importer dans le serveur principal (`server.js`) :

   ```js
   const myResourceRoutes = require('./routes/myResourceRoutes');
   app.use('/api/my-resource', myResourceRoutes.route);
   ```

---

## Voir aussi

- [README du dossier controllers](../controllers/README.md) — logique métier associée
- [README principal du backend](../../README.md)

---

© SPOC-LMSC — Tous droits réservés.