import PropTypes from 'prop-types';
import { ReactPlayer } from 'react-player';
const VideoPlayer = ({ url }) => {
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

VideoPlayer.propTypes = {
  url: PropTypes.string,
};

export default VideoPlayer;
