import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';

export const StreamPlayer = () => {
  const videoRef = useRef();

  useEffect(() => {
    const run = async () => {
      const socket = io('http://localhost:3001/ws');

      socket.on('router-rtp-capabilities', async rtpCapabilities => {
        const device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities: rtpCapabilities });

        socket.emit('create-consumer-transport', {}, async ({ params }) => {
          const transport = device.createRecvTransport(params);

          socket.emit('connect-consumer-transport', {
            dtlsParameters: transport.dtlsParameters,
          });

          socket.on('consumer-created', async ({ id, kind, rtpParameters }) => {
            const consumer = await transport.consume({
              id,
              producerId: id,
              kind,
              rtpParameters,
            });

            const stream = new MediaStream();
            stream.addTrack(consumer.track);
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          });
        });
      });
    };

    run();
  }, []);

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="rounded shadow-xl max-w-full"
      />
    </div>
  );
};
