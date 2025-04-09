import React, { useEffect, useState } from "react";
import NavBar from "../../components/ProfComp/NavBar";
import FileExplorer from "../../components/ProfComp/FileExplorer";
import Card from "../../components/ProfComp/Card";
import { GetAll_DataStructure } from "../../API/VideoCaller";
import FIleUploader from "../../components/ProfComp/FIleUploader";
import VideoPlayer from "../../components/ProfComp/VideoPlayer";
import VideoUpdater from "../../components/ProfComp/VideoUpdater";
const VideoMng = () => {
  const [data, setData] = useState({});
  const [idVideo, setIdVideo] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
  const video_info = "coucou";
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
    if (idVideo) {
      setVideoUrl(`http://localhost:8000/api/video/view/${idVideo}/`);
      console.log(idVideo);
      console.log(videoUrl);
    }
    // const handleInfo = async ()=>{
    //   const res = await
    // }
  }, [idVideo, videoUrl]);

  return (
    <div className="min-h-screen flex">
      {/* Navbar positionnée en fixe à gauche */}
      <nav className="w-64 fixed left-0 top-0 bottom-0 ">
        <NavBar />
      </nav>
      {/* Contenu principal décalé pour laisser la place à la navbar */}
      <main className="flex-1 ml-64 p-4">
        {/* Top bar (title + darkmode switch) */}
        <div className="w-full h-16 flex justify-center items-center bg-neutral-900 rounded-[15px] mb-4">
          <h1 className="text-4xl font-bold text-white">Video Manager</h1>
        </div>
        {/* Première rangée de contenu */}
        <div className="flex justify-between mb-4">
          <Card
            content={<FileExplorer data={data} setIdVideo={setIdVideo} />}
          />
          <Card content={<FIleUploader />} />
        </div>

        {/* Deuxième rangée de contenu */}
        <div className="flex justify-between">
          <Card content={<VideoPlayer url={videoUrl} />} />
          <Card content={<VideoUpdater video_info={video_info} />} />
        </div>
      </main>
    </div>
  );
};

export default VideoMng;
