


const { getLiveByClass } = require('./liveController');

const liveMiddleware = async (req, res, next) => {
  const { classid } = req.user; // get classid du from the payload of the token
  const { liveid } = req.params; // get the liveid from the request

  if (!classid) {
    return res.status(400).send({ error: 'Classe ID is missing in the token payload.' });
  }

  try {
    const lives = await getLiveByClass(classid);


    const liveExists = lives.some(live => live.id === liveid);

    if (!liveExists) {
      return res.status(404).send({ error: 'The requested live does not exist for this class.' });
    }


    next();
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while checking live availability.' });
  }
};

module.exports = liveMiddleware;
