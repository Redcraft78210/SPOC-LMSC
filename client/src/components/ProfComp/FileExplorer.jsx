import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function Page({ setIdVideo, data }) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (selectedCourseId) {
      const selectedCourse = data[selectedCourseId];
      if (selectedCourse && selectedCourse.video) {
        const videoList = Array.isArray(selectedCourse.video)
          ? selectedCourse.video
          : [selectedCourse.video];
        setVideos(videoList);
      } else {
        setVideos([]);
      }
    }
  }, [selectedCourseId, data]);

  const handleVideoClick = videoId => {
    console.log('Video ID:', videoId);
    setIdVideo(videoId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Explorateur de vidéos
      </h2>

      <select
        value={selectedCourseId}
        onChange={e => setSelectedCourseId(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
      >
        <option value="">Sélectionnez un cours</option>
        {Object.entries(data).map(([id, course]) => (
          <option key={id} value={id}>
            {`${course.Matière} > ${course.chapitre} > ${course.titre}`}
          </option>
        ))}
      </select>

      <ul className="space-y-2">
        {videos.map(video => (
          <li
            key={video.video_id}
            onClick={() => handleVideoClick(video.video_id)}
            className="cursor-pointer text-blue-600 hover:underline"
          >
            🎥 {video.video_desc} | uploadé le :{' '}
            {new Date(video.upload_date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

Page.propTypes = {
  setIdVideo: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
};
