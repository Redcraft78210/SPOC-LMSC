import { useEffect, useState } from 'react';
import FileExplorer from './FileExplorer';
import {
  GetAll_DataStructure,
  getVideoStreamUrl,
  DeleteVideo,
} from '../../API/VideoCaller';
import VideoPlayer from './VideoPlayer';
import VideoUpdater from './VideoUpdater';
import FileUploader from './FileUploader';
import PropTypes from 'prop-types';
import { toast, Toaster } from 'react-hot-toast';

const VideoMng = () => {
  const [data, setData] = useState({});
  const [idVideo, setIdVideo] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [selectedVideoDetails, setSelectedVideoDetails] = useState(null);

  const refreshData = async () => {
    const res = await GetAll_DataStructure();
    if (res) {
      setData(res);
    }
  };

  const handleUploadSuccess = () => {
    refreshData();
  };

  const handleUpdateSuccess = () => {
    refreshData();
  };

  const handleDeleteSuccess = async videoId => {
    try {
      const response = await DeleteVideo(videoId);
      if (response.status === 200) {
        setIdVideo('');
        setVideoUrl(null);
        setSelectedVideoDetails(null);
        await refreshData();
        toast.success('Vidéo supprimée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la vidéo');
    }
  };

  const handleVideoSelect = videoDetails => {
    setVideoUrl(videoDetails.streamUrl);
    setSelectedVideoDetails(videoDetails);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (idVideo) {
      setVideoUrl(getVideoStreamUrl(idVideo));
    }
  }, [idVideo]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-center" />
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des vidéos</h1>
        <p className="text-gray-600 mt-2">
          Téléversez, consultez et mettez à jour les vidéos de vos cours.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <FileExplorer
          data={data}
          setIdVideo={setIdVideo}
          onVideoSelect={handleVideoSelect}
        />
        <FileUploader onUploadSuccess={handleUploadSuccess} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Prévisualisation
          </h2>
          <VideoPlayer url={videoUrl} />
        </div>
        <VideoUpdater
          videoData={selectedVideoDetails}
          onUpdate={handleUpdateSuccess}
          onDelete={handleDeleteSuccess}
        />
      </section>
    </div>
  );
};

VideoMng.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    videos: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        is_main: PropTypes.bool,
      })
    ),
  }),
  onUpdateSuccess: PropTypes.func,
};

VideoMng.defaultProps = {
  data: {},
};

export default VideoMng;
