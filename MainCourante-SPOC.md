# Main courante SPOC-LMSC

## Du 16 janvier 2025 au 06 février 2025

### WILLIART

- Du 16 janvier au 03 février 2025 :
  - Je me suis approprié le projet,
  - J'ai commencé la présentation pour une revue 0 de compréhension,
  - J'ai réaliser les UI préliminaires afin d'offrir une base de discussion,
  - Mise en place sur le temps personnel (en dehors  des cours) du code de base:
    -  Écriture de la base JS pour la page de dashboard
    -  Choix des composants UI sur [le site de UIverse](https://uiverse.io/).
    -  Développement des solutions élémentaires comme la login/register page
    -  Mise en place du toogle pour le darkmode
  

- Le 04 février 2025 :
  - J'ai fini de développer la page de login, mais elle n'est pas encore liée avec le backend,
  - J'ai également créé le composant du dashboard pour savoir si le live est en cours,
    - Si le live est en cours, on peut cliquer pour rejoindre,
    - Sinon, on peut en démarrer un.
  - Note : J'ai uniquement réalisé le frontend, pas la liaison avec le serveur de streaming.
  - J'ai commencé la rédaction du compte rendu de la revue 0 sur la base de mes notes de revue.

  
- Le 05 février 2025 :
  - correction de problèmes liés à la dockerisation du projet (middleware et backend).
  - Mise en place d'un correctif du code de base.
  - Amélioration du style du composant de prévisualisation des lives.

- Le 06 février 2025 :
    - Début du développement de la page `changement de mots de passe`.
  
      
### DE CASTRO

- Du 16 janvier au 03 février 2025  :
  - Je me suis également approprié le sujet (Attribution du rôle de chaque élève),
  - J'ai créé un schéma globale du réseau,
  - J'ai commencé les diagrammes SYSML des cas d'utilisations, de missions et des exigences.

- puis, depuis le 04 février j'ai :
    
  - fini le diagramme SYSML dont celui de séquence,
  - réalisé le gantt prévisionel du projet,
  - rajouté mes parties dans la présentation pour la revue 0,
  - Envoyé la liste du matériel dont j'avais besoin pour l'élève réalisant l'étude de marché.

- Jusqu'à la date de la première revue j'ai:
  - Adapter le synoptique à notre besoin,
  - Adresser et configurer tout les appareils présent dans le synoptique sur Cisco packet Tracer,
  - Etabli un document répertoriant chaque ip de chaque interface,
  - Commencer à configurer le FireWall qui nous a été confié.

- Pendant les vacances j'ai :
  - Repensé ma partie dans le projet,
  - Mis en commun nos prévisions pour se mettre d'accord sur les objectifs.
  
- Du 03 Mars jusqu'au 10 Mars j'ai  :
  - Réceptionné le matériel concernant ma partie,
  - Commencé la création du serveur de live ( Mis en Pause ).
    
- Du 11 Mars jusqu'au 21 mars j'ai :
  - Commencé le serveur de streaming grâce aux technologies python et Django pour la distribution des vidéos vers le backend,
  - Pour l'instant je peux fournir une vidéo grâce à son titre,la hiérarchie des vidéos mais je peux aussi uploader des vidéos,
  - Pensé à au pilotage du servomoteur pour le contrôle des différents angles de vue de la caméra,
  - Fais la fonction pour uploader une vidéo,
  - Fais la fonction pour supprimer une vidéo par son ID,
  - Récuperer toute l'arborescence des vidéos,
  - Récupérer une vidéo par son ID.

- Du 21 Mars jusqu'au 9 avril j'ai :
  - Fais une fonction pour fournir au backend toutes les vidéos dites principales c'est à dire celles présentes sur le site,
  - Commencé à créer une rajouter un moyen de fournir les documents associés aux cours et le cours complet,
  - Adapté la réponse de ma vue get_all pour m'adapter au besoins de Belaise,
  - Reçu un un schéma de câblage pour le contrôle de la camèra,
  - Fini le synoptique , prêt à être basculé physiquement.
    
  
### BELAISE

## 16 - 19 janvier : Prise en main et mise en place des outils

- **Appropriation du sujet :** Attribution des rôles pour chaque élève.
- **Mise en place des outils collaboratifs :**
  - Installation et configuration de **Git** pour le contrôle de version.
  - Création et organisation d’un **GitHub Project** dédié à la gestion du travail collaboratif.

---

## 19 - 28 janvier : Brainstorming et structuration du projet

- **Brainstorming et définition de la direction :**
  - Réunion de brainstorming avec l’élève Williart pour déterminer la direction générale du projet.
- **Structure du projet :**
  - Mise en place de l’arborescence du projet.
  - Implémentation du modèle **MVC** (Modèle-Vue-Contrôleur).
- **Portabilité et environnement de développement :**
  - Intégration de **Docker** afin d’assurer une portabilité optimale.
- **Développement Backend initial :**
  - Choix des technologies : base de données sous **PostgreSQL** et utilisation de **React** pour le frontend.

---

## 29 janvier - 4 février : Préparation de la revue 0

- **Documentation du projet :**
  - Rédaction de la liste détaillée du matériel nécessaire pour le projet.
- **Modélisation de la base de données :**
  - Réalisation d’un extrait du **MCD** (Modèle Conceptuel des Données) et du **MLD** (Modèle Logique des Données) pour certaines tables déjà créées.

---

## 4 - 15 février : Correction du Backend et contrôle d’accès

- **Amélioration du backend :**
  - Correction et optimisation de certaines parties de l’API ainsi que de la base de données.
- **Mise en place du contrôle d’accès :**
  - Implémentation d’un système d’authentification générique permettant aux professeurs et aux élèves d’accéder au même espace après authentification.

---

## 24 février - 14 mars : Ajouts fonctionnels et amélioration de l’UX

- **Déconnexion et gestion des sessions :**
  - Ajout d’un module dédié à la déconnexion de l’utilisateur.
- **Optimisations Docker :**
  - Correction de divers éléments liés à l’environnement Docker.
- **Amélioration de l’expérience utilisateur (UX) :**
  - Implémentation du mode *light/dark* (la logique en arrière-plan, en attendant l’ajout du bouton).
  - Ajout de la persistance du mode choisi (dark/light).
- **Refonte de la base de données pour la sécurité :**
  - Séparation des schémas correspondant aux professeurs, élèves et administrateurs.
- **Identité visuelle et séparation des tableaux de bord :**
  - Création et intégration d’un nouveau logo pour l’ENF.
  - Distinction claire entre les tableaux de bord élèves et professeurs.
- **Implémentation de fonctionnalités supplémentaires :**
  - Développement d’une logique de live streaming (actuellement suspendue, hors cahier des charges).

---

## 17 - 22 mars : Optimisation des technologies et de la gestion des styles

- **Mise à jour des technologies frontend :**
  - Transition de **create-react-app** vers **Vite.js** sur demande de l’élève Williart, pour bénéficier de développements et compilations plus rapides.
- **Gestion des styles :**
  - Passage d’un fichier CSS statique (contenant les classes Tailwind) à une intégration automatisée pour optimiser la gestion des styles.

---

## 22 mars - Revue : Préparation et finalisation des fonctionnalités

- **Préparation de la revue :**
  - Organisation d’une présentation détaillée du projet incluant des extraits de code.
  - Mise en avant de la gestion de version et de l’environnement de travail collaboratif.
- **Développement des fonctionnalités de contenu :**
  - Finalisation de la page présentant les cours disponibles.
  - Mise en place d’un système d’aperçu des vidéos ainsi qu’un outil de recherche et de filtrage des cours.

---

## Revue - 10 avril : Séparation de la charte graphique et intégration des sécurités

- **Organisation et modularisation du code :**
  - Séparation de la charte graphique, auparavant commune entre l’application web React Native du professeur et l’Espace Numérique de Formation, afin de réduire les collisions de style et améliorer la flexibilité du développement.
- **Refonte des interfaces utilisateurs :**
  - Réalisation de la refonte complète du tableau de bord élève et du formulaire de connexion/inscription.
  - Développement de la page dédiée à la bibliothèque de cours.
- **Renforcement de la sécurité de l’application :**
  - Intégration de l’authentification à double facteur, conforme à la RFC 6238.
  - Ajout d’un Captcha pour limiter le nombre de requêtes d’authentification au serveur.
- **Amélioration de l’expérience utilisateur :**
  - Mise en place d’un menu accessible via la photo de profil, permettant la modification du profil ainsi qu’un bouton de déconnexion.
  - Finalisation de la page d’accueil **PUBLIQUE** du SPOC pour une meilleure présentation aux utilisateurs externes.

