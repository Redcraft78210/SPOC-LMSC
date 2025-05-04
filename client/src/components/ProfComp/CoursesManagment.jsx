import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { GetClasses } from '../../API/ProfGestion';

const matièresDisponibles = [
  { value: 'math_info', label: 'Mathématiques & Informatique' },
  { value: 'physique', label: 'Physique' },
  { value: 'svt', label: 'Sciences de la Vie et de la Terre' },
  { value: 'français', label: 'Français' },
];

// ⚠️ Liste de cours simulée localement
const fakeCourses = [
  {
    Matière: 'math_info',
    chapitre: 'Logique',
    titre: 'Initiation à la logique booléenne',
    date_creation: '2025-05-04T08:00:00Z',
    description: 'Cours de base sur les opérateurs logiques.',
    ID_cours: 'cours_001',
    video: null,
    documents: [],
    allowedClasses: ['1A'],
  },
  {
    Matière: 'svt',
    chapitre: 'Cellule',
    titre: 'Structure de la cellule animale',
    date_creation: '2025-04-30T12:45:00Z',
    description: 'Les composants de la cellule et leur fonction.',
    ID_cours: 'cours_002',
    video: null,
    documents: [],
    allowedClasses: 'ALL',
  },
];

const CoursesManagement = ({ token }) => {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState(fakeCourses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formData, setFormData] = useState({
    matière: '',
    chapitre: '',
    titre: '',
    description: '',
    allowedClasses: {},
  });

  useEffect(() => {
    const fetchClasses = async () => {
      const result = await GetClasses(token);
      if (result && result.status === 200) {
        setClasses(result.data);
      }
    };
    fetchClasses();
  }, [token]);

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleClass = classId => {
    setFormData(prev => ({
      ...prev,
      allowedClasses: {
        ...prev.allowedClasses,
        [classId]: !prev.allowedClasses[classId],
      },
    }));
  };

  const openEditModal = course => {
    const allowed = Array.isArray(course.allowedClasses)
      ? course.allowedClasses.reduce((acc, id) => {
          acc[id] = true;
          return acc;
        }, {})
      : {};

    setFormData({
      matière: course.Matière,
      chapitre: course.chapitre,
      titre: course.titre,
      description: course.description,
      allowedClasses: allowed,
    });

    setEditingCourseId(course.ID_cours);
    setIsModalOpen(true);
  };

  const openNewCourseModal = () => {
    setEditingCourseId(null);
    setFormData({
      matière: '',
      chapitre: '',
      titre: '',
      description: '',
      allowedClasses: {},
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const selectedClasses = Object.keys(formData.allowedClasses).filter(
      id => formData.allowedClasses[id]
    );

    const newCourse = {
      Matière: formData.matière,
      chapitre: formData.chapitre,
      titre: formData.titre,
      date_creation: new Date().toISOString(),
      description: formData.description,
      ID_cours: editingCourseId || `cours_${Date.now()}`,
      video: null,
      documents: [],
      allowedClasses: selectedClasses.length > 0 ? selectedClasses : 'ALL',
    };

    setCourses(prev =>
      editingCourseId
        ? prev.map(c => (c.ID_cours === editingCourseId ? newCourse : c))
        : [...prev, newCourse]
    );

    setIsModalOpen(false);
    setEditingCourseId(null);
    setFormData({
      matière: '',
      chapitre: '',
      titre: '',
      description: '',
      allowedClasses: {},
    });
  };

  return (
    <>
      {/* Liste des cours */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Cours existants
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <div
              key={course.ID_cours}
              onClick={() => openEditModal(course)}
              className="cursor-pointer p-4 rounded-lg border border-gray-200 hover:shadow-md transition bg-gray-50"
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-1">
                {course.titre}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Matière :{' '}
                {matièresDisponibles.find(m => m.value === course.Matière)
                  ?.label || course.Matière}
              </p>
              <p className="text-sm text-gray-500">
                Chapitre : <span className="italic">{course.chapitre}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bouton créer */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-blue-600">Créer un cours</h2>
        <p className="text-gray-600 mt-2">
          Ajouter un nouveau cours à l’espace pédagogique.
        </p>
        <button
          onClick={openNewCourseModal}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Nouveau cours
        </button>
      </div>

      {/* Modal (création/édition) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingCourseId ? 'Modifier le cours' : 'Nouveau Cours'}
            </h3>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Matière
              <select
                name="matière"
                value={formData.matière}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              >
                <option value="">-- Sélectionner une matière --</option>
                {matièresDisponibles.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block mt-3 text-sm font-medium text-gray-700">
              Chapitre
              <input
                type="text"
                name="chapitre"
                value={formData.chapitre}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </label>

            <label className="block mt-3 text-sm font-medium text-gray-700">
              Titre
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </label>

            <label className="block mt-3 text-sm font-medium text-gray-700">
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </label>

            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 text-sm mb-1">
                Classes autorisées
              </h4>
              {classes.map(cls => (
                <label key={cls.id} className="block text-sm">
                  <input
                    type="checkbox"
                    checked={!!formData.allowedClasses[cls.id]}
                    onChange={() => toggleClass(cls.id)}
                    className="mr-2"
                  />
                  {cls.name}
                </label>
              ))}
              <p className="text-xs text-gray-500 mt-1">
                Si aucune classe n’est sélectionnée, le cours sera visible par
                tous.
              </p>
            </div>

            <div className="flex justify-end mt-6 gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCourseId(null);
                }}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.matière || !formData.titre}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                {editingCourseId ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

CoursesManagement.propTypes = {
  token: PropTypes.string.isRequired,
};

export default CoursesManagement;
