import { useState, useEffect } from 'react';
import { uploadVideo } from '../../API/VideoCaller';
import { GetCourses } from '../../API/ProfGestion';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

const FileUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await GetCourses();
        if (result?.status === 200) {
          setCourses(result.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
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
      const formData = new FormData();
      formData.append('video', file);

      // Add metadata as JSON string
      const metadata = {
        cours_id: courseId,
        description: description,
        is_main: isMain,
        commit_msg: description,
      };

      formData.append('metadata', JSON.stringify(metadata));

      const response = await uploadVideo(formData);

      if (response?.status === 201) {
        // Reset form
        setFile(null);
        setDescription('');
        setIsMain(false);
        setCourseId('');
        // Show success toast instead of alert
        toast.success('Vidéo téléversée avec succès');
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors du téléversement de la vidéo');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCourse = () => {
    return courses.find(c => c.id === courseId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Téléverser une vidéo
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fichier vidéo
          </label>
          <input
            type="file"
            accept="video/*"
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
            Définir comme vidéo principale
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

        {courseId && getSelectedCourse() && (
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="font-medium mb-2">Cours sélectionné :</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Matière :</span>{' '}
                {getSelectedCourse().matiere}
              </p>
              <p>
                <span className="font-medium">Chapitre :</span>{' '}
                {getSelectedCourse().chapitre}
              </p>
              <p>
                <span className="font-medium">Titre :</span>{' '}
                {getSelectedCourse().titre}
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file || !courseId}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Téléversement...' : 'Téléverser la vidéo'}
        </button>
      </form>
    </div>
  );
};

FileUploader.propTypes = {
  onUploadSuccess: PropTypes.func,
};

FileUploader.defaultProps = {
  onUploadSuccess: () => {},
};

export default FileUploader;
