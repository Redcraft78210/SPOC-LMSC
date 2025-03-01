// verifier que l'utilisatteur est bien acces au live avec authmiddleware et 
// récuperer la classe de l'eleve (classeid) et utiliser la methode livecontroller.getlivebyclass et
// vérifie si dans la reponse , il y est l'id du live demander dans la requete get
const { getLiveByClass } = require('./liveController');

const liveMiddleware = async (req, res, next) => {
  const { classid } = req.user; // get classid du from the payload of the token
  const { liveid } = req.params; // get the liveid from the request

  if (!classid) {
    return res.status(400).send({ error: 'Class ID is missing in the token payload.' });
  }

  try {
    const lives = await getLiveByClass(classid);

    // controll if the live exist in the retrieved lives
    const liveExists = lives.some(live => live.id === liveid);

    if (!liveExists) {
      return res.status(404).send({ error: 'The requested live does not exist for this class.' });
    }

    // if live exist, go to next middleware or route handler 
    next();
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while checking live availability.' });
  }
};

module.exports = liveMiddleware;
