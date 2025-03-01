import React from "react";
import { StreamStatusBar } from "../../components/StreamStatusBar";
import LivePreview from "../../components/LivePreview";
import CreateStream from "../../components/CreateStream";

const LiveManagement = () => {
  
  return (
    <>
    {/* main containers of pages */}
      <div className="">
        {/* top bar  (title + darkmode switch) */}
        <div className="m-auto w-full h-15 flex justify-center items-center bg-neutral-900 rounded-[15px]">
            <h1 className="text-4xl font-bold text-white">Stream Handler</h1>
        </div>
        {/* main content */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2 mt-8">
          {/* div create stream component */}
          <div className="w-4/6"><CreateStream /></div>
          {/* preview */}
          <div><LivePreview /></div>
          {/* status bar */}
          <div className="col-start-2 mt-4"><StreamStatusBar /></div>
        </div>
      </div>
    </>
  )
}

export default LiveManagement