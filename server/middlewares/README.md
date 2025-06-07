# Middlewares

Ce dossier contient les middlewares utilisés dans le serveur Express de SPOC-LMSC. Les middlewares servent à valider, contrôler ou enrichir les requêtes HTTP avant qu'elles n'atteignent les contrôleurs.

## Fichiers présents

- **authMiddleware.js**  
  Middleware d'authentification pour vérifier l'accès des utilisateurs aux routes protégées.

- **courseValidation.js**  
  Middleware de validation des données liées aux cours (création, modification, etc.).

- **liveMiddleware.js**  
  Middleware pour la gestion des sessions en direct (live), par exemple la vérification d'accès ou la gestion des droits.

- **liveValidation.js**  
  Middleware de validation des données spécifiques aux sessions en direct.

- **userValidation.js**  
  Middleware de validation des données utilisateur lors de l'inscription ou de la mise à jour du profil. Utilise `express-validator` pour vérifier les champs comme le nom, le prénom, l'email et le mot de passe.

## Utilisation

Dans vos routes Express, importez le middleware souhaité et ajoutez-le à la route concernée.  
Exemple pour la validation utilisateur :

```js
const validateUser = require('./middlewares/userValidation');

router.post('/register', validateUser, userController.register);