import { useEffect, useState } from 'react';
import { SendVideo } from '../../API/VideoCaller';

const FIleUploader = () => {
  const [file, setFile] = useState(null);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Simulation d'un appel API pour récupérer la liste des cours
    const fetchCourses = async () => {
      try {
        // Remplace ça par un vrai appel API (ex: await GetCourses())
        const mockCourses = [
          {
            ID_cours: 'cours_07e6094f-d32e-466c-b34f-fadc92fd9ab5',
            titre: 'Introduction aux Nombres Imaginaires',
            Matière: 'Mathématiques',
            chapitre: 'Nombres Complexes',
          },
        ];
        setCourses(mockCourses);
      } catch (error) {
        console.error('Erreur lors du chargement des cours :', error);
      }
    };

    fetchCourses();
  }, []);

  const handleSend = async () => {
    if (!file || !titre || !selectedCourseId) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const payload = {
      file,
      titre,
      description,
      ID_cours: selectedCourseId,
    };

    try {
      const request = await SendVideo(payload);
      if (request) {
        alert('Vidéo envoyée avec succès !');
      }
    } catch (err) {
      console.error('Erreur lors de l’envoi :', err);
      alert('Une erreur est survenue.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Envoyer une vidéo
      </h2>

      <input
        type="text"
        onChange={e => setTitre(e.target.value)}
        placeholder="Titre de la vidéo"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
      />

      <input
        type="text"
        onChange={e => setDescription(e.target.value)}
        placeholder="Description"
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
        accept="video/mp4"
        onChange={e => {
          const selectedFile = e.target.files[0];
          if (selectedFile && selectedFile.type !== 'video/mp4') {
            alert('Seuls les fichiers .mp4 sont autorisés.');
            e.target.value = ''; // reset le champ fichier
            setFile(null);
            return;
          }
          setFile(selectedFile);
        }}
        className="w-full mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />
      <button
        onClick={handleSend}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
      >
        Envoyer
      </button>
    </div>
  );
};

export default FIleUploader;
