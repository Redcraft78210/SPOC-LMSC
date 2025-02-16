const { Lives, ClassLives, Class, Teacher } = require('../models');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

// Example controller functions
const getLive = async (req, res) => {
    try {
        const { id } = req.params;
        const live = await Lives.findByPk(id);
        if (live) {
            res.json(live);
        } else {
            res.status(404).json({ message: 'Live data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving live data', error });
    }
};

const getAllLives = async (req, res) => {
    try {
        const lives = await Lives.findAll();
        res.json(lives);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving all live data', error });
    }
};

const getLiveByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const lives = await Lives.findAll({
            attributes: ['id', 'title', 'description', 'link'],
            include: [{
                model: Class,
                where: { id: classId },
                through: {
                    model: ClassLives,
                    as: 'ClassLives'
                },
                attributes: []
            }],
            include: [{
                model: Teacher,
                attributes: ['username']
            }]
        });

        const promises = lives.map(async live => {
            const path = live.link + '/';
            const thumbnail = `${path}/thumbnail.png`;

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const fileStats = fs.statSync(thumbnail);
            const timeElapsed = (Date.now() - fileStats.mtimeMs) / 1000 / 60;
            if (timeElapsed > 5) {
                ffmpeg(live.link)
                    .setStartTime('-0.5')
                    .setDuration('00:00:00.500')
                    .takeScreenshots({
                        filename: thumbnail,
                        timemarks: [0.5],
                        size: '640x480'
                    }, (err, screenshots) => {
                        if (err) {
                            console.error(err);
                        }
                    });
            }
            return live;
        });

        const results = await Promise.all(promises);
        if (results.length === 0) {
            res.status(404).json({ message: 'No lives found for class' });
        } else {
            res.json(results);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving live data by class', error });
    }
};

const addLive = async (req, res) => {
    try {
        const live = await Lives.create(req.body);
        res.status(201).json(live);
    } catch (error) {
        res.status(500).json({ message: 'Error adding live data', error });
    }
};

const editLive = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Lives.update(req.body, {
            where: { id }
        });
        if (updated) {
            const updatedLive = await Lives.findByPk(id);
            res.json(updatedLive);
        } else {
            res.status(404).json({ message: 'Live data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error editing live data', error });
    }
};

const deleteLive = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Lives.destroy({
            where: { id }
        });
        if (deleted) {
            res.json({ message: `Live data with ID ${id} deleted successfully` });
        } else {
            res.status(404).json({ message: 'Live data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting live data', error });
    }
};

module.exports = {
    getLive,
    getAllLives,
    getLiveByClass,
    addLive,
    editLive,
    deleteLive,
};
