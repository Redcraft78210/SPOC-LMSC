import { useState, useEffect } from 'react';
import { updateVideo, DeleteVideo } from '../../API/VideoCaller';
import { GetCourses } from '../../API/ProfGestion';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

const VideoUpdater = ({ videoData, onUpdate }) => {
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

  useEffect(() => {
    if (videoData) {
      setDescription(videoData.commit_msg || '');
      setIsMain(videoData.is_main || false);
      setCourseId(videoData.courseId || '');
    }
  }, [videoData]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        commit_msg: description,
        is_main: isMain,
        cours_id: courseId,
      };

      await updateVideo(videoData.id, updateData);
      onUpdate();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!videoData?.id) {
        toast.error('Aucune vidéo sélectionnée');
        return;
      }


      const confirmed = await new Promise(resolve => {
        toast(
          t => (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Confirmer la suppression ?</p>
              <p className="text-sm text-gray-600">
                Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    toast.dismiss(t.id);
                    resolve(false);
                  }}
                >
                  Annuler
                </button>
                <button
                  className="px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md"
                  onClick={() => {
                    toast.dismiss(t.id);
                    resolve(true);
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ),
          {
            duration: Infinity,
            position: 'top-center',
          }
        );
      });

      if (confirmed) {
        const response = await DeleteVideo(videoData.id);
        if (response.status === 200) {
          onUpdate();
          toast.success('Vidéo supprimée avec succès');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la vidéo');
    }
  };

  if (!videoData) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un cours
        </label>
        <select
          value={courseId}
          onChange={e => setCourseId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Choisir un cours...</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.matiere} | {course.chapitre} | {course.titre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Description"
        />
      </div>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isMain}
          onChange={e => setIsMain(e.target.checked)}
        />
        <span>Vidéo principale</span>
      </label>
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded disabled:bg-gray-400"
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded disabled:bg-gray-400"
        >
          {loading ? 'Suppression...' : 'Supprimer'}
        </button>
      </div>
    </form>
  );
};

VideoUpdater.propTypes = {
  videoData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    commit_msg: PropTypes.string,
    is_main: PropTypes.bool,
    courseId: PropTypes.string,
  }),
  onUpdate: PropTypes.func.isRequired,
};

VideoUpdater.defaultProps = {
  videoData: null,
};

export default VideoUpdater;
