/**
 * @fileoverview Contrôleur pour la gestion des classes dans l'application.
 * Fournit des fonctions pour créer, lire, mettre à jour et supprimer des classes,
 * ainsi que pour gérer les relations entre les classes et les étudiants.
 * @module controllers/classController
 */
const { Classe, StudentClass, Student } = require('../models');

/**
 * Récupère toutes les classes avec leurs étudiants associés.
 * Renvoie un tableau de classes trié par ordre alphabétique, avec le nombre d'étudiants
 * et la liste des IDs des étudiants pour chaque classe.
 *
 * @async
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} - Envoie une réponse JSON avec les données des classes.
 * @throws {Error} - Si une erreur survient lors de la récupération des classes.
 */
const getAllClasses = async (req, res) => {
  try {
    const classes = await Classe.findAll({
      include: [
        {
          model: Student,
          through: StudentClass,
        },
      ],
    });

    const classesWithCounts = classes.map((classItem) => {
      const plainClass = classItem.get({ plain: true });
      const memberCount = plainClass.Students ? plainClass.Students.length : 0;
      return {
        ...plainClass,
        memberCount,
      };
    });

    const sortedClasses = classesWithCounts.sort((a, b) => a.name.localeCompare(b.name));

    const classesWithStudentIds = sortedClasses.map((classItem) => {
      const studentIds = classItem.Students ? classItem.Students.map(student => student.id) : [];
      return {
        ...classItem,
        students: studentIds,
      };
    });

    res.status(200).json(classesWithStudentIds);

  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to retrieve classes' });
  }
};

/**
 * Récupère une classe spécifique par son ID.
 *
 * @async
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.params - Les paramètres de la requête.
 * @param {string} req.params.id - L'ID de la classe à récupérer.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} - Envoie une réponse JSON avec les données de la classe.
 * @throws {Error} - Si une erreur survient lors de la récupération de la classe.
 */
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await Classe.findByPk(id);
    if (!classData) {
      return res.status(404).json({ error: 'Classe not found' });
    }
    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve class' });
  }
};

/**
 * Crée une nouvelle classe avec les informations fournies.
 * Si une liste d'étudiants est fournie, crée également les associations entre la classe et les étudiants.
 *
 * @async
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.body - Le corps de la requête.
 * @param {string} req.body.name - Le nom de la classe (obligatoire).
 * @param {string} [req.body.description] - La description de la classe.
 * @param {number} req.body.main_teacher_id - L'ID de l'enseignant principal (obligatoire).
 * @param {Array<number>} [req.body.students] - Liste des IDs des étudiants à associer à la classe.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} - Envoie une réponse JSON confirmant la création de la classe.
 * @throws {Error} - Si une erreur survient lors de la création de la classe.
 */
const createClass = async (req, res) => {
  try {
    const { name, description, main_teacher_id, students } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }

    if (!main_teacher_id) {
      return res.status(400).json({ message: 'Missing required field: main_teacher_id' });
    }


    const newClass = await Classe.create({ name, description, main_teacher_id });


    if (students && students.length > 0) {
      const studentClassEntries = students.map((studentId) => ({
        "student_id": studentId,
        "class_id": newClass.id,
      }));

      await StudentClass.bulkCreate(studentClassEntries);
    }

    res.status(201).json({
      message: 'Class created successfully',
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
};

/**
 * Met à jour une classe existante avec les informations fournies.
 * Si une liste d'étudiants est fournie, remplace les associations actuelles
 * entre la classe et les étudiants par les nouvelles associations.
 *
 * @async
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.params - Les paramètres de la requête.
 * @param {string} req.params.id - L'ID de la classe à mettre à jour.
 * @param {Object} req.body - Le corps de la requête.
 * @param {string} [req.body.name] - Le nouveau nom de la classe.
 * @param {string} [req.body.description] - La nouvelle description de la classe.
 * @param {number} [req.body.main_teacher_id] - Le nouvel ID de l'enseignant principal.
 * @param {Array<number>} [req.body.students] - Nouvelle liste des IDs des étudiants.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} - Envoie une réponse JSON avec les données de la classe mise à jour.
 * @throws {Error} - Si une erreur survient lors de la mise à jour de la classe.
 */
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, students, main_teacher_id } = req.body;

    const classToUpdate = await Classe.findByPk(id);
    if (!classToUpdate) {
      return res.status(404).json({ error: 'Classe not found' });
    }

    classToUpdate.name = name ?? classToUpdate.name;
    classToUpdate.description = description ?? classToUpdate.description;
    classToUpdate.main_teacher_id = main_teacher_id ?? classToUpdate.main_teacher_id;

    await classToUpdate.save();

    if (students) {
      await StudentClass.destroy({ where: { class_id: id } });
      const studentClassEntries = students.map((studentId) => ({
        student_id: studentId,
        class_id: id,
      }));
      await StudentClass.bulkCreate(studentClassEntries);
    }

    const updatedClass = await Classe.findByPk(id, {
      include: [{ model: Student, through: StudentClass }],
    });

    res.status(200).json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
};

/**
 * Supprime une classe existante par son ID.
 *
 * @async
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.params - Les paramètres de la requête.
 * @param {string} req.params.id - L'ID de la classe à supprimer.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} - Envoie une réponse avec le statut 204 si la suppression est réussie.
 * @throws {Error} - Si une erreur survient lors de la suppression de la classe.
 */
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Classe.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Classe not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};

