import React, { useState } from "react";
import { SendVideo } from "../../API/VideoCaller";

const FIleUploader = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");

  const handleTitle = (event) => {
    setTitle(event.target.value);
  };
  const handleDesc = (event) => {
    setDesc(event.target.value);
  };
  const handleFile = (event) => {
    setFile(event.target.files[0]);
  };
  const handleSend = async () => {
    if (!file || !title) {
      console.error("Veuillez fournir un fichier et un titre.");
      return;
    }
    const request = await SendVideo({ file, title, desc });
    if (request) {
      alert("Video send successfully !");
    }
    return null;
  };

  return (
    <div className="flex flex-col p-2 space-x-2 space-y-4 ">
      <h1 className="text-2xl font-bold mb-4 text-[--white]">Send a video</h1>
      <input
        type="text"
        onChange={handleTitle}
        placeholder="Your video title's"
        className="text-lg texte-[--white] bg-neutral-500 rounded-lg px-2"
      />
      <input
        type="text"
        onChange={handleDesc}
        placeholder="Your video descriptions's"
        className="text-lg texte-[--white] bg-neutral-500 rounded-lg px-2"
      />
      <input
        className="flex rounded-md bg-neutral-500 text-sm text-[--white] file:border-0 file:bg-neutral-500 file:text-[--white] file:text-sm file:font-medium"
        type="file"
        id="file"
        accept="video/*"
        onChange={handleFile}
      />

      <button
        className=" bg-neutral-500 rounded-lg text-xl text-[--white] "
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
};

export default FIleUploader;
