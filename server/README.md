# SPOC-LMSC — Backend

Bienvenue dans le dossier du **backend** de l’Espace Numérique de Formation **SPOC-LMSC** (Small Private Online Course). Ce backend Node.js/Express fournit une API REST sécurisée et des WebSockets pour la gestion des cours, utilisateurs, classes, documents, vidéos, sessions en direct, messagerie, forum, suivi de progression et modération.

---

## Sommaire

- [Présentation](#présentation)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Architecture & Structure](#architecture--structure)
- [Installation & Lancement](#installation--lancement)
- [Variables d’environnement](#variables-denvironnement)
- [Scripts disponibles](#scripts-disponibles)
- [Principales routes API](#principales-routes-api)
- [Sécurité & RGPD](#sécurité--rgpd)
- [Aide & Contact](#aide--contact)
- [Licence](#licence)

---

## Présentation

Le backend SPOC-LMSC gère :

- L’authentification JWT et la gestion des rôles (Étudiant, Professeur, Administrateur)
- Les cours, documents PDF, vidéos, et sessions en direct (streaming WebSocket)
- Les classes, utilisateurs, avatars, invitations et progression
- La messagerie privée, le forum, le chat live, la modération et les exports RGPD
- La sécurité (CORS, HTTPS, validation, quarantaine Docker pour fichiers suspects)

---

## Fonctionnalités principales

- **API RESTful** pour toutes les entités (cours, classes, utilisateurs, etc.)
- **WebSockets** pour le chat en direct et le streaming vidéo/audio
- **Gestion sécurisée des fichiers** (PDF, vidéos, avatars)
- **Suivi de progression** (cours, présence aux lives, statistiques)
- **Messagerie privée** et **forum** intégrés
- **Modération** : blocage, suppression, avertissements, signalements
- **Export RGPD** des données utilisateur
- **Logs et monitoring** (morgan, gestion des erreurs)
- **Conformité RGPD & sécurité** (HTTPS, CORS, validation, Docker de quarantaine)

---

## Architecture & Structure

```
server/
├── controllers/    # Logique métier (auth, cours, lives, chat, etc.)
├── models/         # Modèles Sequelize (User, Course, Document, etc.)
├── routes/         # Définition des routes Express (API REST)
├── middlewares/    # Middlewares Express (auth, validation, etc.)
├── websocket/      # Gestionnaires WebSocket (chat, streaming)
├── public/         # Fichiers statiques (vidéos, documents)
├── certs/          # Certificats SSL pour HTTPS
├── server.js       # Point d’entrée principal (Express + WebSocket)
└── .env            # Variables d’environnement
```

---

## Installation & Lancement

### Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **PostgreSQL** (ou autre SGBD compatible Sequelize)
- **ffmpeg** (pour la gestion des vidéos/thumbnails)
- **Docker** (pour la quarantaine des fichiers suspects)

### Installation

```bash
cd server
npm install
```

### Configuration

Créez un fichier `.env` à la racine du dossier `server/` (voir [Variables d’environnement](#variables-denvironnement)).

### Lancement en développement

```bash
npm run dev
```

### Lancement en production

```bash
npm start
```

Le serveur HTTPS écoute par défaut sur le port 443 (modifiable via `.env`).

---

## Variables d’environnement

Exemple de fichier `.env` :

```
PORT=443
HTTP_PORT=80
DB_HOST=localhost
DB_PORT=5432
DB_USER=spoc_user
DB_PASS=motdepasse
DB_NAME=spoc_lmsc
JWT_SECRET=une_chaine_secrete
NODE_ENV=development
```

---

## Scripts disponibles

- `npm start` : démarre le serveur en mode production
- `npm run dev` : démarre le serveur avec rechargement automatique (nodemon)
- `npm run lint` : analyse du code avec ESLint

---

## Principales routes API

- `/api/auth` : Authentification, inscription, gestion des codes d’invitation
- `/api/users` : Gestion des utilisateurs, rôles, avatars, export RGPD
- `/api/classes` : CRUD sur les classes et affectation des membres
- `/api/courses` : CRUD sur les cours, documents, vidéos
- `/api/lives` : Sessions en direct (création, gestion, présence)
- `/api/forum` : Threads, commentaires, modération
- `/api/messages` : Messagerie privée, pièces jointes
- `/api/progress` : Suivi de progression, statistiques, présence
- `/api/moderation` : Signalements, avertissements, blocages
- `/api/streams` : Chat live (WebSocket)
- `/api/videos` : Streaming vidéo sécurisé
- `/api/documents` : Téléchargement sécurisé de documents

---

## Sécurité & RGPD

- **HTTPS** obligatoire (redirection automatique depuis HTTP)
- **CORS** strict (origines autorisées configurables)
- **Validation** des entrées (middlewares)
- **Gestion des fichiers suspects** via Docker de quarantaine
- **Export RGPD** des données utilisateur sur demande
- **Logs** détaillés des accès et erreurs

---

## Aide & Contact

Pour toute question, suggestion ou signalement de bug :

- Email : [support@spoc-lmsc.com](mailto:support@spoc-lmsc.com)
- Formulaire de contact intégré à la plateforme

---

## Licence

Ce projet est sous licence **propriétaire**. Toute reproduction ou utilisation non autorisée est interdite sans accord préalable.

---

© SPOC-LMSC — Lycée Militaire de Saint-Cyr
