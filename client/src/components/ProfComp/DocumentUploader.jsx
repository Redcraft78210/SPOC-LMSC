import { useState, useEffect } from 'react';
import { SendDocument } from '../../API/DocumentCaller'; // Changé de uploadDocument à SendDocument
import { GetCourses } from '../../API/ProfGestion';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

const DocumentUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await GetCourses();
        if (result?.status === 200) {
          setCourses(result.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
        toast.error('Erreur lors du chargement des cours');
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file || !courseId) {
      toast.error('Veuillez sélectionner un fichier et un cours');
      return;
    }

    setLoading(true);
    try {
      const response = await SendDocument({
        file,
        title: description || 'No description',
        authToken: localStorage.getItem('authToken'),
      });

      if (response?.status === 201) {
        setFile(null);
        setDescription('');
        setIsMain(false);
        setCourseId('');
        onUploadSuccess();
        toast.success('Document téléversé avec succès');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors du téléversement du document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Téléverser un document
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fichier document
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={e => setFile(e.target.files[0])}
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
        </div>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isMain}
            onChange={e => setIsMain(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">
            Définir comme document principal
          </span>
        </label>

        <div className="pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner le cours associé
          </label>
          <select
            value={courseId}
            onChange={e => setCourseId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">Choisir un cours...</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.matiere} | {course.chapitre} | {course.titre}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !file || !courseId}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Téléversement...' : 'Téléverser le document'}
        </button>
      </form>
    </div>
  );
};

DocumentUploader.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
};

export default DocumentUploader;
