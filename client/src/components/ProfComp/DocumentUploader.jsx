import { useState } from 'react';
import PropTypes from 'prop-types';
// Remplace ceci par ton vrai appel API
// import { SendDocument } from '../../API/DocumentCaller';

const DocumentUploader = ({ courses }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const handleSend = async () => {
    if (!file || !title || !selectedCourseId) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const payload = {
      file,
      title,
      description,
      ID_cours: selectedCourseId,
    };

    try {
      // const response = await SendDocument(payload);
      // Simule une réponse :
      console.log('Document payload:', payload);
      alert('Document envoyé avec succès !');
    } catch (err) {
      console.error('Erreur lors de l’envoi :', err);
      alert('Une erreur est survenue.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Envoyer un document
      </h2>

      <input
        type="text"
        placeholder="Titre du document"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
      />

      <select
        value={selectedCourseId}
        onChange={e => setSelectedCourseId(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
      >
        <option value="">Sélectionner un cours</option>
        {courses.map(course => (
          <option key={course.ID_cours} value={course.ID_cours}>
            {`${course.Matière} > ${course.chapitre} > ${course.titre}`}
          </option>
        ))}
      </select>

      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={e => setFile(e.target.files[0])}
        className="w-full mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-green-700"
      />

      <button
        onClick={handleSend}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
      >
        Envoyer
      </button>
    </div>
  );
};

DocumentUploader.propTypes = {
  courses: PropTypes.array.isRequired,
};

export default DocumentUploader;
