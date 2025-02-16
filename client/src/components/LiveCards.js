import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';

const ContentCard = ({ content }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  // Construct URLs based on the API link
  const thumbnailUrl = `${content.link}/thumbnail`; // Assume thumbnail endpoint
  const videoUrl = `${content.link}/preview`;      // Assume video preview endpoint

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setShowVideo(true);
    }, 5000);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    setShowVideo(false);
  };

  return (
    <div className="mb-4 position-relative">
      <Card
        style={{ width: '18rem', minHeight: '400px' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isLoading && (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {!hasImageError && (
          <Card.Img
            variant="top"
            src={thumbnailUrl}
            style={{ display: showVideo ? 'none' : 'block' }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasImageError(true);
              setIsLoading(false);
            }}
          />
        )}

        {showVideo && !hasVideoError && (
          <video
            autoPlay
            muted
            loop
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover'
            }}
            onError={() => setHasVideoError(true)}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}

        <Card.Body>
          <Card.Title>{content.title}</Card.Title>
          <Card.Text>{content.description}</Card.Text>
          <Card.Text className="text-muted">
            Instructor: {content.Teacher.username}
          </Card.Text>
          <Button variant="primary" href={content.link}>
            View Content
          </Button>
        </Card.Body>
      </Card>

      {hasImageError && (
        <div className="position-absolute top-0 start-0 w-100 h-50 bg-light d-flex align-items-center justify-content-center">
          <span className="text-muted">Thumbnail unavailable</span>
        </div>
      )}
    </div>
  );
};

export default ContentCard;