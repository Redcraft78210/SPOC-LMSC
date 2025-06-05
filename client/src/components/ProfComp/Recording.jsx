import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Play, Square, Video } from 'lucide-react';
// import {
//   startRecording,
//   stopRecording,
//   getRecordingStatus,
// } from '../../API/RecordCaller';
import { GetCourses } from '../../API/ProfGestion';
import { StreamReader } from '../StreamReader';

const Recording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    // Récupérer le token depuis le localStorage
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }

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

    const checkStatus = async () => {
      try {
        // const status = await getRecordingStatus();
        setIsRecording(true);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    };

    checkStatus();
  }, []);

  const handleStart = async () => {
    if (!selectedCourse || !description) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      // await startRecording(selectedCourse, description);
      setIsRecording(true);
      toast.success('Enregistrement démarré');
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      toast.error("Erreur lors du démarrage de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      // await stopRecording();
      setIsRecording(false);
      toast.success('Enregistrement arrêté');
      // Reset form
      setDescription('');
      setSelectedCourse('');
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error);
      toast.error("Erreur lors de l'arrêt de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        {/* Header avec icône */}
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Enregistrement Vidéo
          </h1>
        </div>

        {/* Retour caméra avec StreamReader */}
        <div className="bg-black aspect-video rounded-lg mb-6 overflow-hidden">
          {authToken && <StreamReader authToken={authToken} />}
        </div>

        {/* Formulaire et contrôles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un cours
              </label>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={isRecording || loading}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                disabled={isRecording || loading}
                required
              />
            </div>

            {/* Barre de contrôle */}
            <div className="flex justify-center gap-4 pt-4">
              {!isRecording ? (
                <button
                  onClick={handleStart}
                  disabled={loading || !selectedCourse || !description}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                    loading || !selectedCourse || !description
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <Play className="w-5 h-5" />
                  Démarrer
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                    loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <Square className="w-5 h-5" />
                  Arrêter
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Recording;
