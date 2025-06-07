# SPOC-LMSC — Plateforme d’Apprentissage Numérique

Bienvenue dans le dépôt principal de **SPOC-LMSC** (Small Private Online Course — Lycée Militaire de Saint-Cyr), une solution complète d’e-learning dédiée à la communauté éducative du lycée.

---

## 📚 Vue d’ensemble

**SPOC-LMSC** est une plateforme web moderne, sécurisée et modulaire, conçue pour :
- Gérer, diffuser et suivre des contenus pédagogiques numériques (cours, vidéos, documents, sessions en direct, etc.)
- Administrer les utilisateurs, classes, et événements pédagogiques
- Offrir une expérience d’apprentissage enrichie, accessible et conforme aux standards de sécurité et d’accessibilité.

Le projet est structuré en deux grandes parties :
- **Frontend** : Application React (voir [`client/README.md`](client/README.md)) — interface utilisateur
- **Backend** : API Node.js/Express (voir [`server/README.md`](server/README.md)) — logique métier, sécurité, WebSockets

---

## ✨ Fonctionnalités principales

- 🔐 **Gestion centralisée des utilisateurs** (élèves, enseignants, administrateurs)
- 🎓 **Bibliothèque de cours multimédia** (PDF, vidéos, lives)
- 📡 **Sessions en direct** avec chat intégré, gestion de la présence et modération
- 📈 **Suivi des activités et reporting pédagogique**
- 📦 **Export RGPD** automatisé des données personnelles
- 🧭 **Tutoriels interactifs** pour la prise en main de la plateforme
- ♿ **Accessibilité renforcée** (conformité RGAA)
- 🔒 **Sécurité** : authentification JWT, gestion fine des rôles, stockage chiffré des fichiers

---

## 🏗️ Architecture & Organisation

```

SPOC-LMSC/
├── client/       # Frontend React (UI, assets, tutoriels)
├── server/       # Backend Node.js (API, WebSocket, RGPD scripts)
├── certs/        # Certificats SSL pour HTTPS local
├── .env.example  # Variables d’environnement types
├── README.md     # Présentation globale (ce fichier)
└── ...           # Fichiers de configuration, scripts, documentations diverses

```

- **Communication** : le frontend communique avec le backend via une API RESTful et WebSockets pour les événements temps réel.
- **Séparation des responsabilités** : aucune logique métier n’est implémentée côté client.
- **Respect du RGPD** : scripts d’export et de purge des données utilisateurs (voir `server/rgpd/`).

---

## 🚀 Démarrage rapide

1. **Cloner le dépôt** :
   ```bash
   git clone <url-du-repo>
   cd SPOC-LMSC
   ```
2. **Configurer le backend** :
   Suivre les instructions dans [`server/README.md`](server/README.md)

3. **Configurer le frontend** :
   Suivre les instructions dans [`client/README.md`](client/README.md)

4. **Lancer l’application** :
   Démarrer séparément le backend et le frontend avec leurs scripts respectifs (`npm run dev` ou `yarn dev` selon le cas)

---

## 🤝 Contribution & Support

* 🐞 **Bugs, suggestions** : utilisez le formulaire de contact intégré à la plateforme ou ouvrez une *issue* sur le dépôt si vous y avez accès.
* 📬 **Contact technique** : [support@spoc-lmsc.com](mailto:support@spoc-lmsc.com)

---

## ⚖️ Licence

Ce projet est sous **licence propriétaire**.
Toute reproduction, modification ou utilisation non autorisée est strictement interdite sans accord préalable écrit.

© SPOC-LMSC — Lycée Militaire de Saint-Cyr
