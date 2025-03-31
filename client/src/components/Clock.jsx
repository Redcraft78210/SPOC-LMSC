import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

const LiveClock = ({ format = "LLLL dd, yyyy HH:mm:ss" }) => {
  const [currentTime, setCurrentTime] = useState(DateTime.now().toFormat(format));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(DateTime.now().toFormat(format));
    }, 1000); // Update the time every second

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [format]);

  return <div>{currentTime}</div>;
};

export default LiveClock;
