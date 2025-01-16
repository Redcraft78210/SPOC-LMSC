Pour développer un SPOC (Small Private Online Course) en utilisant Node.js, React, Bootstrap, Tailwind CSS et une base de données PostgreSQL, on va suivre un modèle MVC (Model-View-Controller). Voici l'architecture du projet :

---

## **1. Structure du projet**

```
/spoc-app
|-- /client                # Application frontend (React)
|-- /server                # Application backend (Node.js)
|-- /server/controllers    # Logique des contrôleurs
|-- /server/models         # Schémas de la base de données
|-- /server/routes         # Routes API
|-- /server/config         # Configuration de la base de données et de l'application
|-- /server/middlewares    # Middleware (authentification, logs, etc.)
|-- /server/services       # Services métier
|-- /server/utils          # Fonctions utilitaires
|-- /server/tests          # Tests unitaires
|-- /public                # Ressources statiques
|-- package.json
```

---

## **2. Modèle MVC avec détails**

### **A. Modèle (Model)**

Responsable de la gestion des données et de l'interaction avec PostgreSQL.

**Exemple : Modèle User (PostgreSQL avec Sequelize)**

```javascript
// /server/models/User.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
```

---

### **B. Vue (View)**

Le frontend est géré avec React, combinant Bootstrap et Tailwind CSS pour le design. Le backend peut exposer des API RESTful ou GraphQL.

**Exemple : Page de connexion (React avec Tailwind CSS et Bootstrap)**

```jsx
// /client/src/components/Login.js
import React from 'react';

function Login() {
  return (
    <div className="container mx-auto mt-10">
      <div className="card shadow-lg p-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" className="form-control" id="email" placeholder="Enter your email" />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" placeholder="Enter your password" />
          </div>
          <button type="submit" className="btn btn-primary w-full">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
```

---

### **C. Contrôleur (Controller)**

Les contrôleurs gèrent les requêtes entrantes et appellent les services et modèles nécessaires.

**Exemple : Contrôleur pour l'authentification**

```javascript
// /server/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { login };
```

---

### **D. Routes**

Les routes relient les contrôleurs aux points d'entrée API.

**Exemple : Route pour l'authentification**

```javascript
// /server/routes/authRoutes.js
const express = require('express');
const { login } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);

module.exports = router;
```

---

### **E. Service**

Gère la logique métier. Par exemple, inscrire un utilisateur dans un cours.

**Exemple : Service d'inscription**

```javascript
// /server/services/courseService.js
const User = require('../models/User');
const Course = require('../models/Course');

const enrollUser = async (userId, courseId) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new Error('Course not found');

  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  await course.addUser(user);
  return { message: 'User enrolled successfully' };
};

module.exports = { enrollUser };
```

---

## **3. Intégration des technologies**

1. **Backend (Node.js + PostgreSQL)** :
    
    - Express.js pour gérer les API RESTful.
    - Sequelize comme ORM pour PostgreSQL.
    - bcrypt pour le hashage des mots de passe.
    - JWT pour la gestion des tokens d'authentification.
2. **Frontend (React)** :
    
    - Utiliser React avec des composants Tailwind CSS pour un design moderne et Bootstrap pour des styles préfabriqués.
    - Appeler les API du backend via `fetch` ou `axios`.
3. **Base de données (PostgreSQL)** :
    
    - Schémas pour les utilisateurs, cours, inscriptions, etc.
    - Relations entre utilisateurs et cours pour gérer les inscriptions.
4. **CSS (Tailwind + Bootstrap)** :
    
    - Bootstrap pour la mise en page classique.
    - Tailwind CSS pour personnaliser facilement les styles et ajouter de la flexibilité.

---

## **4. Bonus : Gestion des inscriptions**

Ajouter des relations dans la base de données pour les inscriptions :

```javascript
// /server/models/Course.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Course = sequelize.define('Course', {
  id: { type: DataTypes.UUID, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
});

Course.belongsToMany(User, { through: 'Enrollments' });
User.belongsToMany(Course, { through: 'Enrollments' });

module.exports = Course;
```

