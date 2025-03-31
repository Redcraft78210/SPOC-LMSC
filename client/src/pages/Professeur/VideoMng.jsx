import React from "react";
import Darkmode2 from "../../components/ProfComp/Darkmode2";
import NavBar from "../../components/ProfComp/NavBar";
import CardFolder from "../../components/ProfComp/CardFolder";
import FileExplorer from "../../components/ProfComp/FileExplorer";
import Card from "../../components/ProfComp/Card";
const VideoMng = () => {
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
        <div className="flex items-start justify-start mt-4">
          <Card content={<FileExplorer/>} />
        </div>
      </div>
    </div>
  );
};

export default VideoMng;
