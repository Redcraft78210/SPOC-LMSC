import PropTypes from 'prop-types';
import FilePlayer from 'react-player/file';

const VideoPlayer = ({ url }) => {
  if (!url) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Sélectionnez une vidéo à prévisualiser</p>
      </div>
    );
  }

  return (
    <div className="aspect-video relative">
      <FilePlayer
        url={url}
        controls={true}
        width="100%"
        height="100%"
        config={{
          file: {
            attributes: {
              crossOrigin: 'anonymous',
              controlsList: 'nodownload',
            },
            forceVideo: true,
          },
        }}
        pip={false}
        stopOnUnmount={true}
        className="rounded-lg overflow-hidden"
        playing={false}
        playsinline={true}
        onError={e => console.error('Erreur de lecture:', e)}
      />
    </div>
  );
};

VideoPlayer.propTypes = {
  url: PropTypes.string,
};

VideoPlayer.defaultProps = {
  url: '',
};

export default VideoPlayer;
