import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

// Secure HLS video player component
// This component loads an HLS video stream from the backend and plays it
// using the hls.js library. It also uses the fetch API to load the m3u8
// file securely with the credentials included.

const SecureHLSPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    const fetchM3U8 = async () => {
      try {
        const response = await fetch(m3u8Url, { credentials: "same-origin" }); // Fetch the file securely
        const m3u8Content = await response.text();
        
        // Create a Blob and a secure Blob URL
        const blob = new Blob([m3u8Content], { type: "application/vnd.apple.mpegurl" });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (error) {
        console.error("Error fetching .m3u8 file:", error);
      }
    };

    fetchM3U8();
  }, [m3u8Url]);

  useEffect(() => {
    if (!blobUrl || !videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(blobUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = blobUrl;
      videoRef.current.addEventListener("loadedmetadata", () => {
        videoRef.current.play();
      });
    }

    return () => {
      URL.revokeObjectURL(blobUrl); // Cleanup Blob URL
    };
  }, [blobUrl]);

  return (
    <div className="video-container">
      <video ref={videoRef} controls className="video-player" />
    </div>
  );
};

export default SecureHLSPlayer;


