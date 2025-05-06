const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');

const CAMERA_IP = '192.168.0.12';

const record = async (req, res) => {

    const { videoId } = req.query;

    const launchRecord = (videoId) => {
        console.log('Starting stream recording...');

        const videoDirectory = 'videos/';
        const videoPath = path.resolve(videoDirectory, `${videoId}.mp4`);

        const proc = ffmpeg()
            .input(`udp://${CAMERA_IP}:1234`)
            .outputOptions(['-movflags', 'faststart'])
            .output(videoPath)
            .on('end', () => {
                console.log('Stream recording stopped');
            })
            .on('error', (err) => {
                console.error('Stream recording error:', err);
            })
            .run();

        return proc.pid;
    };

    const stopRecord = async (videoId) => {
        const videoDirectory = 'videos/';
        const videoPath = path.resolve(videoDirectory, `${videoId}.mp4`);

        const pid = videoId.split('-')[1];

        await new Promise((resolve, reject) => {
            const checkProcess = setInterval(() => {
                try {
                    process.kill(pid, 0);
                } catch (e) {
                    clearInterval(checkProcess);
                    resolve();
                }
            }, 100);
        });

        return { success: true };
    };

    try {

        if (videoId) {
            const { success } = await stopRecord(videoId);

            if (!success) {
                return res.status(500).send('Internal Server Error');
            }

            return res.status(200).send('Record stopped');
        }

        const videoTempID = Math.random().toString(36).substring(2, 10) + (new Date()).getTime().toString(36);
        const pid = launchRecord(videoTempID);

        return res.status(200).json({
            videoTempID: videoTempID + '-' + pid,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }

};

module.exports = {
    record,
};
