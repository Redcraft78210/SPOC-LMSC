import React from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { StreamStatusBar } from "../../components/StreamStatusBar";
import LivePreview from "../../components/LivePreview";
import CreateStream from "../../components/CreateStream";
import NavBar from "../../components/ProfComp/NavBar";

const LiveManagement = () => {
  return (
    <div className="grid grid-col-2  grid-rows-1">
      <div className="col-start-1 w-fit mr-4">
        <NavBar />
      </div>
      {/* main containers of pages */}
      <div className="col-start-2">
        {/* top bar  (title + darkmode switch) */}
        <div className="m-auto w-full h-16 flex justify-center items-center bg-neutral-900 rounded-[15px]">
          <h1 className="text-4xl font-bold text-white">Stream Handler</h1>
        </div>
        {/* main content */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2 mt-8">
          {/* div create stream component */}
          <div className="w-4/6">
            <CreateStream />
          </div>
          {/* preview */}
          <div>
            <LivePreview />
          </div>
          {/* status bar */}
          <div className="col-start-2 mt-4">
            <StreamStatusBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveManagement;
