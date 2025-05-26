import React from "react";
import FileExplorer from './FileExplorer'
const OnAir2 = () => {
  const url = "https://192.168.127.12:8080/hls/test.m3u8";

  return (
    <>
      <h1 className="text-xl text-[--white] text-center w-full">
        <FileExplorer onDashboard={true}/>
      </h1>
    </>
  );
};

export default OnAir2;
