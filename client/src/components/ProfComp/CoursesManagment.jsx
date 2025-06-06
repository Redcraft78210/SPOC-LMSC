import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  GetClasses,
  GetCourses,
  CreateCourse,
  UpdateCourse,
  DeleteCourse,
} from '../../API/ProfGestion';

const matièresDisponibles = [
  { value: 'math_info', label: 'Mathématiques & Informatique' },
  { value: 'physique', label: 'Physique' },
  { value: 'svt', label: 'Sciences de la Vie et de la Terre' },
  { value: 'français', label: 'Français' },
];

const CoursesManagement = ({ token }) => {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formData, setFormData] = useState({
    matière: '',
    chapitre: '',
    titre: '',
    description: '',
    teacher_name: '',
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


  useEffect(() => {
    const fetchCourses = async () => {
      const result = await GetCourses();
      if (result && result.status === 200) {
        setCourses(result.data);
      }
    };
    fetchCourses();
  }, []);

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
      chapitre: course.chapitre,
      titre: course.titre,
      description: course.description,
      teacher_name: course.teacher_name,
      allowedClasses: allowed,
    });

    setEditingCourseId(course.id);
    setIsModalOpen(true);
  };

  const openNewCourseModal = () => {
    setEditingCourseId(null);
    setFormData({
      matière: '',
      chapitre: '',
      titre: '',
      description: '',
      teacher_name: '',
      allowedClasses: {},
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const selectedClasses = Object.keys(formData.allowedClasses).filter(
      id => formData.allowedClasses[id]
    );

    const courseData = {
      matiere: formData.matière,
      chapitre: formData.chapitre,
      titre: formData.titre,
      description: formData.description,
      teacher_name: formData.teacher_name,
      date_creation: new Date().toISOString(),
      allowed_classes: selectedClasses.length > 0 ? selectedClasses : 'ALL',
    };

    try {
      let result;

      if (editingCourseId) {

        result = await UpdateCourse(editingCourseId, courseData);
      } else {

        result = await CreateCourse(courseData);
      }

      if (result && (result.status === 200 || result.status === 201)) {

        const coursesResult = await GetCourses();
        if (coursesResult && coursesResult.status === 200) {
          setCourses(coursesResult.data);
        }


        setIsModalOpen(false);
        setEditingCourseId(null);
        setFormData({
          matière: '',
          chapitre: '',
          titre: '',
          description: '',
          teacher_name: '',
          allowedClasses: {},
        });


        alert(
          editingCourseId
            ? 'Cours mis à jour avec succès'
            : 'Cours créé avec succès'
        );
      } else {
        throw new Error("Erreur lors de l'opération");
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert("Une erreur est survenue lors de l'opération");
    }
  };

  const handleDelete = async courseId => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        const result = await DeleteCourse(courseId);
        if (result && result.status === 200) {

          const coursesResult = await GetCourses();
          if (coursesResult && coursesResult.status === 200) {
            setCourses(coursesResult.data);
          }
          alert('Cours supprimé avec succès');
        } else {
          throw new Error('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la suppression');
      }
    }
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
              key={course.id}
              className="cursor-pointer p-4 rounded-lg border border-gray-200 hover:shadow-md transition bg-gray-50"
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-1">
                {course.titre}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Matière :{' '}
                {matièresDisponibles.find(m => m.value === course.matiere)
                  ?.label || course.matiere}
              </p>
              <p className="text-sm text-gray-500">
                Chapitre : <span className="italic">{course.chapitre}</span>
              </p>
              {/* Utiliser openEditModal */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => openEditModal(course)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
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

            {/* Afficher le champ Matière uniquement pour un nouveau cours */}
            {!editingCourseId && (
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
            )}

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

            <label className="block mt-3 text-sm font-medium text-gray-700">
              Nom du professeur
              <input
                type="text"
                name="teacher_name"
                value={formData.teacher_name}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded"
                placeholder="Entrez le nom du professeur"
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
              {editingCourseId && (
                <button
                  onClick={() => handleDelete(editingCourseId)}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Supprimer
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!formData.titre}
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
