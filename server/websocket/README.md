# Dossier `websocket`

Ce dossier contient la logique de gestion des WebSockets pour la plateforme SPOC-LMSC.  
Il permet la communication temps réel pour deux fonctionnalités principales : le **chat** et le **streaming vidéo/audio**.

---

## Fichiers présents

- **socketManager.js**  
  Module principal qui :
  - Crée deux serveurs WebSocket distincts : un pour le chat (`/chat`), un pour le streaming (`/stream`)
  - Route les connexions entrantes vers le bon serveur selon le chemin de l’URL
  - Gère la montée de connexion (`upgrade`) et évite les doubles connexions sur un même socket

- **README.md**  
  Ce fichier d’explication.

---

## Fonctionnement

- **Séparation des flux :**  
  Le chat et le streaming utilisent chacun leur propre serveur WebSocket pour garantir l’isolation et la sécurité des flux.

- **Routage dynamique :**  
  Lorsqu’un client tente d’établir une connexion WebSocket, le serveur analyse le chemin de l’URL :
  - `/chat` → connexion au serveur de chat (messages texte, notifications)
  - `/stream` → connexion au serveur de streaming (vidéo/audio temps réel)
  - Toute autre route : la connexion est refusée.

- **Gestion des sockets :**  
  Un ensemble (`Set`) garde la trace des sockets déjà « upgradés » pour éviter les conflits ou fuites de ressources.

---

## Exemple d’utilisation

Dans le serveur principal (`server.js`) :

```js
const {
  createChatWSS,
  createStreamWSS,
  setupWebSocketHandlers
} = require('./websocket/socketManager');

const chatWSS = createChatWSS();
const streamWSS = createStreamWSS();

setupWebSocketHandlers(server, chatWSS, streamWSS);
```

---

## Sécurité

- **Authentification :**  
  L’authentification et la gestion des droits sont réalisées dans les contrôleurs associés (`chatController.js`, `socketController.js`).
- **Nettoyage :**  
  Les sockets sont supprimés de l’ensemble lors de leur fermeture pour éviter les fuites mémoire.

---

## Extension

Pour ajouter un nouveau type de WebSocket (ex : notifications), il suffit de :
1. Créer un nouveau serveur WebSocket avec `new WebSocket.Server({ noServer: true })`
2. Ajouter une condition dans `setupWebSocketHandlers` pour router le chemin correspondant

---

© SPOC-LMSC