import { useEffect, useState } from 'react';
import FileExplorer from '../../components/ProfComp/FileExplorer';
import {
  GetAll_DataStructure,
  Get_Video_Information,
} from '../../API/VideoCaller';
import FIleUploader from '../../components/ProfComp/FIleUploader';
import VideoPlayer from '../../components/ProfComp/VideoPlayer';
import VideoUpdater from '../../components/ProfComp/VideoUpdater';

const VideoMng = () => {
  const [data, setData] = useState({});
  const [idVideo, setIdVideo] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoData, setVideoData] = useState({});

  useEffect(() => {
    const handleData = async () => {
      const res = await GetAll_DataStructure();
      if (res) {
        setData(res);
      }
    };
    handleData();
  }, []);

  useEffect(() => {
    const handleData = async () => {
      const res = await Get_Video_Information(idVideo);
      if (res) {
        setVideoData(res.data);
      }
    };

    if (idVideo) {
      setVideoUrl(`http://localhost:8000/api/video/view/${idVideo}/`);
      handleData();
    }
  }, [idVideo]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des vidéos</h1>
        <p className="text-gray-600 mt-2">
          Téléversez, consultez et mettez à jour les vidéos de vos cours.
        </p>
      </header>

      {/* Section de sélection et téléversement */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Explorateur de fichiers
          </h2>
          <FileExplorer data={data} setIdVideo={setIdVideo} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Uploader une vidéo
          </h2>
          <FIleUploader />
        </div>
      </section>

      {/* Section de visualisation et mise à jour */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Prévisualisation
          </h2>
          <VideoPlayer url={videoUrl} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Modifier les informations
          </h2>
          <VideoUpdater videoData={videoData} />
        </div>
      </section>
    </div>
  );
};

export default VideoMng;
