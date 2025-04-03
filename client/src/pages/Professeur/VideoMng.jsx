import React, { useEffect, useState } from "react";
import NavBar from "../../components/ProfComp/NavBar";
import FileExplorer from "../../components/ProfComp/FileExplorer";
import Card from "../../components/ProfComp/Card";
import { Get_special_Video, GetAll_DataStructure } from "../../API/VideoCaller";
import FIleUploader from "../../components/ProfComp/FIleUploader";
import VideoPlayer from "../../components/ProfComp/VideoPlayer";
const VideoMng = () => {
  const [data, setData] = useState({});
  const [idVideo, setIdVideo] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
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
  }, [idVideo, videoUrl]);

  return (
    <div className="grid grid-col-2  grid-rows-1">
      <div className="col-start-1 w-fit mr-4">
        <NavBar />
      </div>
      {/* main containers of pages */}
      <div className="col-start-2">
        {/* top bar  (title + darkmode switch) */}
        <div className="m-auto w-full h-16 flex justify-center items-center bg-neutral-900 rounded-[15px]">
          <h1 className="text-4xl font-bold text-white">Video Manager</h1>
        </div>
        {/* main content */}
        <div className="flex justify-between">
          <div className="flex items-start justify-start mt-4">
            <Card
              content={<FileExplorer data={data} setIdVideo={setIdVideo} />}
            />
          </div>
          <div className="flex items-start justify-start mt-4">
            <Card content={<FIleUploader />} />
          </div>
        </div>
        <div className="flex items-start justify-start mt-4">
          <Card content={<VideoPlayer url={videoUrl} />} />
        </div>
      </div>
    </div>
  );
};

export default VideoMng;
