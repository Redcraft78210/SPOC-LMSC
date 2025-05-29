import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { GetCourses } from '../../API/ProfGestion';
import { getVideoDetails, getVideoStreamUrl } from '../../API/VideoCaller';

export default function FileExplorer({ setIdVideo, onVideoSelect }) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [videos, setVideos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Charger la liste des cours
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

  // Mettre à jour la liste des vidéos quand un cours est sélectionné
  useEffect(() => {
    if (selectedCourseId) {
      const selectedCourse = courses.find(
        course => course.id === selectedCourseId
      );
      if (selectedCourse?.videos) {
        setVideos(selectedCourse.videos);
      } else {
        setVideos([]);
      }
      // Reset selected video when changing course
      setSelectedVideo(null);
      setIdVideo(null);
    }
  }, [selectedCourseId, courses, setIdVideo]);

  const handleVideoClick = async videoId => {
    // Debug log for video ID
    

    if (!videoId) {
      console.error('No video ID provided');
      return;
    }

    setLoading(true);
    try {
      const detailsResponse = await getVideoDetails(videoId);
      

      if (detailsResponse?.status === 200) {
        const videoDetails = detailsResponse.data;

        // Set selected video and ID
        setSelectedVideo(videoDetails);
        setIdVideo(videoId);

        // Construct stream URL
        const streamUrl = getVideoStreamUrl(videoId);

        // Pass complete details to parent
        onVideoSelect({
          ...videoDetails,
          id: videoId, // Ensure ID is included
          streamUrl,
          courseId: selectedCourseId,
        });
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Explorateur de vidéos
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un cours
        </label>
        <select
          value={selectedCourseId}
          onChange={e => setSelectedCourseId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        >
          <option value="">Choisir un cours...</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.matiere} | {course.chapitre} | {course.titre}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-4">
          <span className="text-gray-600">Chargement...</span>
        </div>
      )}

      <ul className="space-y-2">
        {videos.map(video => (
          <li
            key={`video-${video.id}`}
            onClick={() => !loading && handleVideoClick(video.id)} // Utilisez video.id au lieu de video.video_id
            className={`
              cursor-pointer p-2 hover:bg-gray-50 rounded-md flex items-center
              ${loading ? 'opacity-50' : ''}
              ${selectedVideo?.id === video.id ? 'bg-blue-50 border border-blue-200' : ''}
            `}
          >
            <span className="mr-2">🎥</span>
            <div>
              <p className="text-blue-600 hover:underline">
                {video.commit_msg}
              </p>
              <p className="text-sm text-gray-500">
                Uploadé le : {new Date(video.upload_date).toLocaleDateString()}
              </p>
            </div>
          </li>
        ))}
        {!loading && videos.length === 0 && (
          <li key="no-videos" className="text-center py-4 text-gray-500">
            Aucune vidéo disponible pour ce cours
          </li>
        )}
      </ul>
    </div>
  );
}

FileExplorer.propTypes = {
  setIdVideo: PropTypes.func.isRequired,
  onVideoSelect: PropTypes.func.isRequired,
};
