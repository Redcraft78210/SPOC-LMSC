import { useState } from 'react';
import PropTypes from 'prop-types';

const CourseVisibilityManager = ({ courses, classes, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [allowedClasses, setAllowedClasses] = useState({});

  const toggleClass = classId => {
    setAllowedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId],
    }));
  };

  const handleSave = () => {
    const selected = Object.keys(allowedClasses).filter(
      id => allowedClasses[id]
    );
    onSave(selectedCourseId, selected);
    setIsOpen(false);
  };

  return (
    <>
      {/* Card */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold text-blue-600">
          Gestion de visibilité des cours
        </h2>
        <p className="text-gray-600 mt-2">
          Déterminer quelle(s) classe(s) a le droit d&apos;accéder aux cours.
        </p>
        <button
          onClick={() => setIsOpen(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Gérer
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Sélectionner un cours
            </h3>

            <select
              value={selectedCourseId}
              onChange={e => {
                setSelectedCourseId(e.target.value);
                setAllowedClasses({}); // reset
              }}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            >
              <option value="">-- Choisir un cours --</option>
              {courses.map(course => (
                <option key={course.ID_cours} value={course.ID_cours}>
                  {`${course.Matière} > ${course.chapitre} > ${course.titre}`}
                </option>
              ))}
            </select>

            {selectedCourseId && (
              <div className="mb-4 space-y-2">
                <h4 className="font-semibold text-gray-700">
                  Choisir les classes :
                </h4>
                {classes.map(cls => (
                  <label key={cls.id} className="block text-sm">
                    <input
                      type="checkbox"
                      checked={!!allowedClasses[cls.id]}
                      onChange={() => toggleClass(cls.id)}
                      className="mr-2"
                    />
                    {cls.name}
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedCourseId}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

CourseVisibilityManager.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      ID_cours: PropTypes.string.isRequired,
      Matière: PropTypes.string,
      chapitre: PropTypes.string,
      titre: PropTypes.string,
    })
  ).isRequired,
  classes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CourseVisibilityManager;
