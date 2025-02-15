const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Register controller with validation middleware
const register = async (req, res) => {
  const { email, username, password, name } = req.body;

  // Vérification de la présence de tous les champs requis
  if (!email || !username || !password || !name) {
    return res.status(400).json({ message: 'Email, username, password et name sont obligatoires pour l\'inscription.' });
  }

  try {
    // Vérification de l'existence d'un utilisateur avec le même email
    const existingUserEmail = await User.findOne({ where: { email } });
    if (existingUserEmail) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    const existingUserName = await User.findOne({ where: { username } });
    if (existingUserName) {
      return res.status(400).json({ message: 'Un utilisateur avec ce nom d\'utilisateur existe déjà.' });
    }

    // Hashage du mot de passe avec un salt de 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur dans la base de données
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
      name,
    });

    // Génération d'un token JWT valide pendant 1 heure
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({ token });
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};


// Login controller with validation (no additional validation middleware required for login)
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }


  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, isProf: user.role == "Professeur" }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login };
