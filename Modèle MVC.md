# **Cours : Comprendre et implémenter le modèle MVC avec React**

## **Introduction**
Le modèle MVC est une architecture logicielle utilisée pour séparer les préoccupations dans une application. Il est composé de trois éléments principaux : 
- **Model** (Modèle) : Responsable des données et de la logique métier.
- **View** (Vue) : Responsable de l'affichage des données à l'utilisateur.
- **Controller** (Contrôleur) : Sert d'intermédiaire entre le modèle et la vue. Il traite les entrées utilisateur et met à jour les modèles ou les vues en conséquence.

Dans le contexte de React, qui est une bibliothèque basée sur les composants pour construire des interfaces utilisateur, on peut adapter le modèle MVC en respectant les principes de séparation des responsabilités.

---

## **Objectifs**
1. Comprendre comment le modèle MVC s'applique à React.
2. Implémenter un exemple simple d'application React basée sur le modèle MVC.
3. Identifier les avantages et les inconvénients de cette approche.

---

## **1. Comprendre le Modèle MVC dans React**

### **1.1. Le rôle de chaque composant dans MVC**
- **Model (Modèle)** : 
  Dans une application React, le modèle représente généralement l'état de l'application (state) et la logique métier. Il est souvent géré via un gestionnaire d'état comme **useState**, **useReducer**, ou une bibliothèque comme Redux ou MobX.

- **View (Vue)** :
  La vue correspond aux composants React responsables de l'affichage. Ces composants peuvent être des composants fonctionnels ou des composants de classe. Ils reçoivent les données du modèle via les props ou le state et les affichent à l'utilisateur.

- **Controller (Contrôleur)** :
  Le contrôleur dans React est souvent intégré dans les composants eux-mêmes. Il gère les interactions utilisateur (clics, soumissions de formulaires, etc.) et appelle des fonctions pour mettre à jour le modèle.

---

### **1.2. Comment le MVC s’intègre dans React**
Dans une application React :
- Les **composants fonctionnels** peuvent jouer le rôle de contrôleur ou de vue.
- Les **données** (state ou props) représentent le modèle.
- Les interactions utilisateur sont gérées via des gestionnaires d'événements.

---

## **2. Structure d'un projet React avec MVC**

### Exemple de structure :
```
src/
├── components/    # Composants de la Vue (View)
├── controllers/   # Contrôleurs
├── models/        # Modèles (gestion de l'état et logique métier)
├── App.js         # Point d'entrée principal
└── index.js       # Rendu React
```

---

## **3. Exemple d'application React basée sur MVC**

### Contexte
Nous allons créer une application simple de gestion de tâches (« To-Do List »). Les fonctionnalités incluent :
- Ajouter une tâche.
- Marquer une tâche comme terminée.
- Supprimer une tâche.

### **3.1. Modèle : Gestion de l'état**
Dans le modèle, nous gérons l'état des tâches.

```javascript
// src/models/taskModel.js
export const taskModel = {
  tasks: [],

  // Ajouter une tâche
  addTask(task) {
    this.tasks.push({ id: Date.now(), title: task, completed: false });
  },

  // Marquer une tâche comme terminée
  toggleTask(id) {
    this.tasks = this.tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
  },

  // Supprimer une tâche
  deleteTask(id) {
    this.tasks = this.tasks.filter(task => task.id !== id);
  },

  // Obtenir toutes les tâches
  getTasks() {
    return this.tasks;
  }
};
```

---

### **3.2. Vue : Composants pour l'affichage**

```javascript
// src/components/TaskList.js
import React from 'react';

const TaskList = ({ tasks, onToggle, onDelete }) => {
  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>
          <span
            style={{
              textDecoration: task.completed ? 'line-through' : 'none'
            }}
          >
            {task.title}
          </span>
          <button onClick={() => onToggle(task.id)}>Toggle</button>
          <button onClick={() => onDelete(task.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
```

---

### **3.3. Contrôleur : Gérer les interactions utilisateur**

```javascript
// src/controllers/taskController.js
import { taskModel } from '../models/taskModel';

export const taskController = {
  // Obtenir les tâches pour la vue
  getTasks() {
    return taskModel.getTasks();
  },

  // Ajouter une tâche
  addTask(task) {
    taskModel.addTask(task);
  },

  // Marquer une tâche comme terminée
  toggleTask(id) {
    taskModel.toggleTask(id);
  },

  // Supprimer une tâche
  deleteTask(id) {
    taskModel.deleteTask(id);
  }
};
```

---

### **3.4. Intégration dans App.js**

```javascript
// src/App.js
import React, { useState } from 'react';
import { taskController } from './controllers/taskController';
import TaskList from './components/TaskList';

const App = () => {
  const [tasks, setTasks] = useState(taskController.getTasks());
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    taskController.addTask(newTask);
    setTasks(taskController.getTasks());
    setNewTask('');
  };

  const handleToggleTask = id => {
    taskController.toggleTask(id);
    setTasks(taskController.getTasks());
  };

  const handleDeleteTask = id => {
    taskController.deleteTask(id);
    setTasks(taskController.getTasks());
  };

  return (
    <div>
      <h1>To-Do List</h1>
      <input
        type="text"
        value={newTask}
        onChange={e => setNewTask(e.target.value)}
        placeholder="Add a new task"
      />
      <button onClick={handleAddTask}>Add Task</button>
      <TaskList
        tasks={tasks}
        onToggle={handleToggleTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default App;
```

---

## **4. Avantages et inconvénients de l'approche MVC dans React**

### **Avantages**
1. **Séparation des responsabilités** : Chaque couche a un rôle distinct, ce qui améliore la lisibilité et la maintenabilité.
2. **Réutilisabilité** : Les composants et les modèles peuvent être réutilisés dans d'autres parties du projet.
3. **Testabilité** : Les modèles et les contrôleurs peuvent être testés indépendamment des vues.
