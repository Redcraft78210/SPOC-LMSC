import {  useState } from 'react';
import PropTypes from 'prop-types';

export default function DocumentExplorer({ data, setIdDocument }) {
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const courseList = Object.values(data).map(course => ({
    id: course.ID_cours,
    label: `${course.Matière} > ${course.chapitre} > ${course.titre}`,
  }));

  const selectedDocuments = data[selectedCourseId]?.documents || [];

  const handleSelectDocument = docId => {
    console.log('Selected Document ID:', docId);
    setIdDocument(docId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Explorateur de documents
      </h2>

      <select
        value={selectedCourseId}
        onChange={e => setSelectedCourseId(e.target.value)}
        className="mb-4 w-full p-2 border border-gray-300 rounded-md"
      >
        <option value="">-- Sélectionner un cours --</option>
        {courseList.map(course => (
          <option key={course.id} value={course.id}>
            {course.label}
          </option>
        ))}
      </select>

      {selectedDocuments.length > 0 ? (
        <ul className="space-y-3">
          {selectedDocuments.map(doc => (
            <li
              key={doc.id}
              onClick={() => handleSelectDocument(doc.id)}
              className="cursor-pointer text-blue-600 hover:underline"
            >
              📄 {doc.title} —{' '}
              <span className="text-gray-500">{doc.description}</span>
            </li>
          ))}
        </ul>
      ) : (
        selectedCourseId && (
          <p className="text-gray-500">
            Aucun document disponible pour ce cours.
          </p>
        )
      )}
    </div>
  );
}

DocumentExplorer.propTypes = {
  data: PropTypes.object.isRequired,
  setIdDocument: PropTypes.func.isRequired,
};
