# Main courante SPOC-LMSC (Projet 9)
Mise à Jour du 10 Avril 2025

Élèves :
  E1: Adrien DE CASTRO
  E2: Ewen Williart
  E3: Clément BÉLAISE

# Objet du Document
  Ce document a pour objet de consigner le quotidien des opérations, remarques et questions techniques relatives au projet 9, SPOC-LMSC
  
## Main courante SPOC-LMSC WILLIART

- Du 16 janvier au 03 février 2025 :
  - Je me suis approprié le projet,
  - J'ai commencé la présentation pour une revue 0 de compréhension,
  - J'ai réaliser les UI préliminaires afin d'offrir une base de discussion,
  - Mise en place sur le temps personnel (en dehors  des cours) du code de base:
    - Écriture de la base JS pour la page de dashboard
    - Choix des composants UI sur [le site de UIverse](https://uiverse.io/).
    - Développement des solutions élémentaires comme la login/register page
    - Mise en place du toogle pour le darkmode
  
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
  
- Du 07 février au 13 fevrier 2025 : (semaine de TP employeur donc tous a été réalisé sur le temps personnel)
  - Réalisation de modificatio sur la logique de la page LOGIN poiur correspondre au backend
  - Début de modification de certain styles afin d'uniformiser

- Du 15 février au 2 mars : ( temps personnel)
  - Vacances :
          - Réalisation de la page Live manager qui servira à gérer l'état du live
          - Modification de la technologie de styles principale : Passage de vanilla css à tailwindcss

- Du 03 mars  au 9 mars :
  - contrôle de configuration du projet générale
  - Mise en place de petite cofiguration nécessaire pour le fonctionnement.

- Du 10 mars au 14 mars : (semaine de TP employeur donc tous a été réalisé sur le temps personnel)
  - j'ai continué de developper le front-end et modifier des styles. (pas fait de gros changement cette semaine)

- Du 17 mars au 20 mars :
  - Réalisation du responsive et Refonte totale du dashboard prof afin de garder la main dessus (être maitre du fontend de ma partie car avant contrôler par belaise)
  - J'ai également aider DE CASTRO à réaliser le serveur backend de gestion des vidéos qui est en django (python) chose que je fais beaucoup sur mon temps personnel.

- Le 21 mars :
  - Continuité du responsive et ecriture Réécriture de ma propre main courante.
  - Début du developement de la partie gestion des vidéo avec la refonte du composant LIveManager en VideoManager
  
- Du 22 mars au 1 avril :
  - Mise en ligne et fin du dev de la partie responsive

- Du 2 avril au 5 avril :
  - Correction de bugs CSS sur certains composants (padding/margin non uniformes en mobile),
  - Optimisation des composants React pour limiter les rerenders inutiles,
  - Début de l’intégration de l’upload vidéo côté frontend.

- Du 6 avril au 7 avril :
  - Tests fonctionnels sur l’upload et vérification des types MIME,
  - Ajout d’un spinner de chargement et de messages d’erreur en cas d’échec,
  - Revue rapide avec l’équipe pour valider le workflow côté utilisateur.

- 7 avril au 13 avril :
  - Semaine d'examen et début des vacances

- Le 14 avril :
  - Finalisation du composant VideoManager avec pagination et tri,
  - Revue technique avec DE CASTRO pour validation du backend Django lié à la vidéo,
  - Sauvegarde du projet sur un dépôt distant secondaire (GITHUB personnel),
  - Préparation d’une démonstration live de la plateforme pour les enseignants.
  - 
* Du 15 avril au 20 avril :

  * Finalisation de l’upload vidéo (interface et interaction complète avec l’API Django),
  * Intégration d’un système de notification utilisateur en cas d’échec ou succès (toasts),
  * Ajout de la gestion des formats vidéos acceptés (.mp4, .webm, .mkv),
  * Déploiement sur environnement de test.

* Du 21 avril au 25 avril :

  * Tests multi-utilisateurs du composant VideoManager (pagination, tri dynamique, upload),
  * Optimisation de la gestion d’état React (utilisation de Zustand pour alléger les props drilling),
  * Mise en place du système de rôles dans l'interface : Prof vs Élève.

* Du 26 avril au 1er mai :

  * Tests sur les permissions d’accès frontend en fonction des rôles,
  * Correction des comportements anormaux lors du changement d’état (ex : vidéo supprimée par erreur),
  * Documentation interne : début de la rédaction du guide de développement frontend.

* Du 2 mai au 6 mai :

  * Création d’un composant d’aperçu rapide des vidéos sur hover,
  * Mise à jour des pages LiveManager et VideoManager avec un design plus sobre et cohérent avec la charte graphique,
  * Déploiement de la version stable frontend sur l'environnement de staging.

* Du 7 mai au 10 mai :

  * Réunion d’équipe pour synchronisation avec les évolutions backend,
  * Participation à la phase de test des routes API Django en postman,
  * Débogage suite à l'intégration du nouveau middleware de sécurité.

* Du 11 mai au 16 mai :

  * Ajout du système de recherche dynamique (titre, date, type),
  * Réalisation d’une vidéo de démonstration du SPOC pour les soutenances,
  * Finalisation de la documentation utilisateur (guide d’utilisation de l’interface),
  * Début du diaporama de soutenance (slides techniques côté frontend).

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

* Du 15 avril au 21 avril :

  * Finalisation de l’API de gestion des documents pédagogiques (upload, get, delete),
  * Intégration des documents associés à une vidéo dans les réponses API.

* Du 22 avril au 28 avril :

  * Documentation de l'API,
  * Optimisation de la sérialisation des vidéos pour limiter les temps de réponse.

* Du 29 avril au 3 mai :

  * Création d’une tâche cron pour la purge des fichiers non utilisés,
  * Participation aux tests d’intégration frontend/backend avec Williart.


* Du 4 mai au 10 mai :

  * Refonte partielle du modèle de base de données pour supporter la multi-session vidéo.
.
* Du 11 mai au 20 mai :

  * Finalisation du backend : gel des fonctionnalités,
  * Préparation de la soutenance technique : rédaction du dossier technique backend,
  * Capture d’écran, logs de tests, schémas techniques à jour,
  * Réseau réalisé .


  
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



#### 15 - 20 avril : Validation et sécurisation des accès

* **Authentification :**

  * Validation complète du 2FA avec tests multi-navigateurs.
  * Finalisation de l’intégration frontend du Captcha.
* **Robustesse API :**

  * Lancement de tests de résistance sur les endpoints d’authentification.
  * Analyse des logs backend pour détection d’anomalies.

---

#### 21 - 27 avril : Environnements et automatisation

* **Environnements d’exécution :**

  * Séparation propre des environnements **production**, **staging** et **développement** dans les configurations Docker.
* **Déploiement :**

  * Écriture d’un **script de déploiement unifié** pour faciliter l'installation du projet (DB + API + Front).
* **UX et erreurs :**

  * Personnalisation des pages d'erreur 404/500.

---

#### 28 avril - 4 mai : Sécurité avancée et monitoring

* **Sessions :**

  * Implémentation d’un module de **gestion des sessions actives** : affichage et révocation depuis l’espace utilisateur.
* **Observabilité :**

  * Déploiement de **Grafana + Prometheus** pour monitorer les ressources système et les appels API.
* **Documentation technique :**

  * Début de rédaction de la **documentation back-end** (routes API, schéma DB, système d’authentification).

---

#### 5 - 16 mai : Finalisation du backend et documentation

* **CI/CD et qualité :**

  * Mise en place d’un pipeline d’intégration continue basique avec GitHub Actions (tests, lint, build).
  * Ajout de tests automatisés sur les routes d’authentification et de gestion utilisateur.
* **Finalisation documentaire :**

  * Clôture de la documentation technique (API REST + schémas + procédure d’installation).
  * Contribution au **dossier de soutenance**, rédaction d’un résumé technique de la partie backend.
* **Répétition de soutenance :**

  * Simulation de présentation, retour de l’équipe sur les points d’amélioration,
  * Ajustements mineurs du backend suite aux retours (messages d’erreur, statuts HTTP, logs).

