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

    res.status(200).json(sortedClasses);
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
    const { name } = req.body;
    const main_teacher_id = req.user.id;
    const newClass = await Classe.create({ name, main_teacher_id });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class' });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, main_teacher_id } = req.body;
    const [updated] = await Classe.update({ name, main_teacher_id }, { where: { id } });
    if (!updated) {
      return res.status(404).json({ error: 'Classe not found' });
    }
    const updatedClass = await Classe.findByPk(id);
    res.status(200).json(updatedClass);
  } catch (error) {
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

