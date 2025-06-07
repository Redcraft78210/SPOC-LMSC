# SPOC-LMSC — Modèles Sequelize

Ce dossier contient l'ensemble des **modèles de données Sequelize** utilisés par le backend de SPOC-LMSC. Chaque fichier définit la structure, les contraintes et les relations d'une entité de la base de données du système éducatif (utilisateurs, cours, classes, documents, vidéos, messages, etc.).

## Sommaire

- [Présentation](#présentation)
- [Liste des modèles](#liste-des-modèles)
- [Relations principales](#relations-principales)
- [Exemple d'utilisation](#exemple-dutilisation)
- [Bonnes pratiques](#bonnes-pratiques)

---

## Présentation

Les modèles Sequelize décrivent la structure des tables et les relations entre entités dans la base de données.  
Ils sont centralisés dans ce dossier et importés via [`index.js`](index.js), qui configure également toutes les associations.

---

## Liste des modèles principaux

- **User.js** : Utilisateurs (étudiants, professeurs, administrateurs)
- **Student.js** : Informations spécifiques aux étudiants
- **Teacher.js** : Informations spécifiques aux enseignants
- **Admin.js** : Informations spécifiques aux administrateurs
- **Classe.js** : Classes d'élèves
- **StudentClass.js** : Liaison étudiants-classes (many-to-many)
- **TeacherClass.js** : Liaison enseignants-classes (many-to-many)
- **Course.js** : Cours pédagogiques
- **CourseProgress.js** : Suivi de la progression des étudiants dans les cours
- **Document.js** : Documents PDF associés aux cours
- **CourseDocument.js** : Liaison cours-documents (many-to-many)
- **Video.js** : Vidéos associées aux cours
- **CourseVideo.js** : Liaison cours-vidéos (many-to-many)
- **Lives.js** : Sessions de cours en direct
- **ClassLives.js** : Liaison classes-sessions live (many-to-many)
- **LiveAttendance.js** : Présence des étudiants aux lives
- **ChatMessage.js** : Messages de chat en direct
- **Thread.js** : Threads de discussion (forums)
- **Comment.js** : Commentaires sur les threads
- **Message.js** : Messages privés entre utilisateurs
- **Recipient.js** : Destinataires des messages
- **Attachment.js** : Pièces jointes aux messages
- **TrashMessage.js** : Messages supprimés (corbeille)
- **Warning.js** : Avertissements émis aux utilisateurs
- **Flag.js** : Signalements de contenu inapproprié
- **Code.js** : Codes d'invitation à la plateforme
- **UserAvatar.js** : Avatars utilisateurs
- **Stats.js** : Statistiques d'apprentissage

---

## Relations principales

Les relations entre modèles sont définies dans [`index.js`](index.js) :

- **One-to-Many** : Un enseignant possède plusieurs cours, un cours possède plusieurs documents, etc.
- **Many-to-Many** : 
  - Étudiants et classes via `StudentClass`
  - Cours et documents via `CourseDocument`
  - Cours et vidéos via `CourseVideo`
  - Classes et sessions live via `ClassLives`
- **Associations avancées** : 
  - Suivi de progression (`CourseProgress`)
  - Présence aux lives (`LiveAttendance`)
  - Messagerie (messages, destinataires, pièces jointes, corbeille)
  - Modération (signalements, avertissements)

---

## Exemple d'utilisation

```js
const { User, Course, Document, CourseDocument } = require('./models');

// Récupérer tous les documents d'un cours
const documents = await CourseDocument.findAll({
  where: { course_id: 'id-du-cours' }
});

// Créer un nouvel utilisateur
const user = await User.create({
  email: 'test@example.com',
  password: 'motDePasseHashé',
  name: 'Jean',
  surname: 'Dupont'
});
```

---

## Bonnes pratiques

- **Ne pas modifier la structure des modèles sans migration** (voir la documentation Sequelize)
- **Documenter chaque modèle** avec JSDoc et exemples d'utilisation
- **Centraliser les associations dans [`index.js`](index.js)**
- **Respecter les conventions de nommage** (snake_case pour les champs SQL, camelCase côté JS)

---

## Références

- [Documentation Sequelize](https://sequelize.org/master/manual/model-basics.html)
- [Fichier d'index des modèles](index.js)

---

© SPOC-LMSC — Tous droits réservés