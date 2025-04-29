const { Classe, StudentClass, Student } = require('../models');

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

const createClass = async (req, res) => {
  try {
    const { name, description, main_teacher_id, students } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }

    if (!main_teacher_id) {
      return res.status(400).json({ message: 'Missing required field: main_teacher_id' });
    }

    // Créer la classe
    const newClass = await Classe.create({ name, description, main_teacher_id });

    // Ajouter les étudiants à la classe via StudentClass
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

