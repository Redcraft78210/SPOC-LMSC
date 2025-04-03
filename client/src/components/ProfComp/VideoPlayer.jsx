import React from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ url }) => {
  console.log("Video URL:", url); // Ajoutez ceci pour vérifier la valeur de l'URL
  return (
    <div className="player-wrapper">
      {url ? (
        <ReactPlayer url={url} controls={true} width="100%" height="100%" />
      ) : (
        <div>Chargement de la vidéo...</div>
      )}
    </div>
  );
};

export default VideoPlayer;
