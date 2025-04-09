import React, { useState } from "react";
import Checkbox from "./Checkbox";

const VideoUpdater = ({ video_info }) => {
  const [isMain, setIsMain] = useState(null);
  return (
    <div className="flex flex-col p-2 space-x-2 space-y-4 ">
      <h1 className="text-2xl font-bold mb-4 text-[--white]">
        Update video information
      </h1>
      <input
        type="text"
        placeholder="Update the video title"
        className="text-lg texte-[--white] bg-neutral-500 rounded-lg px-2"
      />
      <input
        type="text"
        placeholder="Update the descriptions"
        className="text-lg texte-[--white] bg-neutral-500 rounded-lg px-2"
      />
      <input
        type="text"
        placeholder="Update Teacher name"
        className="text-lg texte-[--white] bg-neutral-500 rounded-lg px-2"
        id="teacher_name"
      />
      <input
        type="text"
        placeholder="Update the subject"
        className="text-lg texte-[--white] bg-neutral-500 rounded-lg px-2"
      />
      <Checkbox setIsMain={setIsMain} isMain={isMain} />
      <button className=" bg-neutral-500 rounded-lg text-xl text-[--white] ">
        Update
      </button>
    </div>
  );
};

export default VideoUpdater;
