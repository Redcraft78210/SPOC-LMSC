# SPOC-LMSC — Frontend

Bienvenue dans le dossier du **frontend** de l’Espace Numérique de Formation **SPOC-LMSC** (Small Private Online Course).
Cette application **React** constitue une plateforme d’apprentissage en ligne sécurisée, moderne et adaptée à la gestion de cours, de documents, de sessions en direct, et d’interactions entre enseignants, étudiants et administrateurs.

---

## Sommaire

* [Présentation](#présentation)
* [Fonctionnalités principales](#fonctionnalités-principales)
* [Structure du projet](#structure-du-projet)
* [Installation & Lancement](#installation--lancement)
* [Scripts disponibles](#scripts-disponibles)
* [Technologies utilisées](#technologies-utilisées)
* [Arborescence](#arborescence)
* [Bonnes pratiques & Accessibilité](#bonnes-pratiques--accessibilité)
* [Aide & Contact](#aide--contact)
* [Licence](#licence)

---

## Présentation

**SPOC-LMSC** est une plateforme d’apprentissage en ligne dédiée à la communauté éducative du **Lycée Militaire de Saint-Cyr**. Elle permet notamment :

* La gestion et la consultation de cours numériques (vidéos, PDF, sessions en direct)
* L’administration des utilisateurs, classes et contenus
* Le suivi de la progression et de l’assiduité
* La communication sécurisée entre membres

Le frontend est développé en **React** et consomme une API REST sécurisée.

---

## Fonctionnalités principales

* **Authentification & gestion des rôles** : Étudiant, Professeur, Administrateur
* **Bibliothèque de cours** : recherche, filtrage, tri, accès aux vidéos et documents
* **Lecteur sécurisé** pour les vidéos et les fichiers PDF
* **Sessions en direct** : accès live, chat intégré, gestion de la présence
* **Gestion des classes** : création, édition, affectation des élèves/enseignants
* **Outils de modération** : blocage, désapprobation, suppression de contenus
* **Tutoriels interactifs** pour la prise en main
* **Accessibilité renforcée** : conformité RGAA, navigation au clavier, contrastes
* **Export RGPD** : export des données personnelles de l’utilisateur

---

## Structure du projet

```
src/
├── API/           # Appels aux endpoints backend (auth, cours, documents, lives…)
├── assets/        # Images, icônes, fichiers de style
├── components/    # Composants réutilisables (Navbar, Footer, etc.)
├── contexts/      # Contextes React (authentification, tutoriels…)
├── pages/         # Pages principales (Accueil, Bibliothèque, Live, Admin…)
├── tutorials/     # Tutoriels interactifs (React Joyride)
public/            # Fichiers statiques, manifest, favicon
```

---

## Installation & Lancement

### Prérequis

* **Node.js** ≥ 18.x
* **npm** ≥ 9.x

### Installation

```bash
cd client
npm install
```

### Démarrage en mode développement

```bash
npm run dev
```

### Build pour la production

```bash
npm run build
```

Le build optimisé sera généré dans le dossier `dist/`.

---

## Scripts disponibles

* `npm start` : démarre le serveur de développement React
* `npm run build` : génère un build de production
* `npm run lint` : analyse du code avec ESLint
* `npm run test` : lance les tests unitaires (si présents)

---

## Technologies utilisées

* **React 18+**
* **React Router** (navigation)
* **Tailwind CSS** (UI responsive)
* **React Hot Toast** (notifications)
* **Lucide React** (icônes SVG)
* **Plyr** (lecteur vidéo sécurisé)
* **PropTypes** (validation des props)
* **Axios** (requêtes HTTP)
* **React Mentions** (chat live)
* **JWT Decode** (gestion des tokens)
* **React Joyride** (tutoriels interactifs)

---

## Arborescence (extrait)

```
client/
├── public/
│   └── index.html
├── src/
│   ├── API/
│   ├── assets/
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── tutorials/
│   ├── App.jsx
│   └── index.js
├── package.json
└── README.md
```

---

## Bonnes pratiques & Accessibilité

* Conformité aux standards **RGAA** (accessibilité numérique)
* Navigation entièrement possible au **clavier**
* **Contrastes adaptés** et police lisible
* Respect du **RGPD** : export des données personnelles, mentions légales, politique de confidentialité accessibles

---

## Aide & Contact

Pour toute question, suggestion ou signalement de bug :

* 📧 Email : [support@spoc-lmsc.com](mailto:support@spoc-lmsc.com)
* 📝 Formulaire de contact intégré à la plateforme

---

## Licence

Ce projet est sous **licence propriétaire**.
Toute reproduction ou utilisation non autorisée est interdite sans accord préalable.

© SPOC-LMSC