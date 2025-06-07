/**
 * @fileoverview Contrôleur de chat pour la gestion des messages en temps réel via WebSocket
 * et endpoints API REST. Gère l'authentification, la modération du contenu et les opérations CRUD
 * sur les messages du chat.
 * @module chatController
 */

const WebSocket = require('ws');
const { ChatMessage, User, Lives } = require('../models');
const leoProfanity = require('leo-profanity');
const frenchBadwordsList = require('french-badwords-list');
const jwt = require('jsonwebtoken');

/** @constant {string} SECRET - Clé secrète pour la vérification des tokens JWT */
const SECRET = process.env.JWT_SECRET;

// Configuration du filtrage des mots inappropriés
leoProfanity.add(frenchBadwordsList.array);
leoProfanity.loadDictionary('fr');

/** 
 * @constant {Set} chatClients - Ensemble des clients WebSocket connectés au chat
 * @private
 */
const chatClients = new Set();

/**
 * Configure et initialise la connexion WebSocket pour le chat
 * 
 * @param {WebSocket.Server} wss - Serveur WebSocket à configurer
 */
const setupChatWebSocket = (wss) => {
    wss.on('connection', async (ws, request) => {
        console.log('Client WebSocket connecté au chat');


        try {
            const fullUrl = new URL(request.url, `https://${request.headers.host}`);
            const token = fullUrl.searchParams.get('token');

            if (!token) {
                console.error('Token manquant');
                ws.close(4001, 'Token manquant');
                return;
            }

            try {
                const payload = jwt.verify(token, SECRET);
                ws.user = payload;
                console.log('Token vérifié pour :', payload.role);
            } catch (err) {
                console.error('Erreur de vérification du token JWT :', err.message);
                ws.close(4002, 'Token invalide');
                return;
            }


            chatClients.add(ws);


            ws.on('message', async (data) => {
                try {
                    const msgData = JSON.parse(data);

                    if (msgData.type === 'chat_message') {
                        const { liveId, message } = msgData;

                        if (!message || !liveId) {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Message and liveId are required'
                            }));
                            return;
                        }

                        if (containsForbiddenWords(message)) {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Message contains forbidden words'
                            }));
                            return;
                        }




                        const chatMessage = await ChatMessage.create({
                            live_id: liveId,
                            user_id: ws.user.id,
                            content: message
                        });

                        const userDetails = await User.findOne({
                            where: { id: ws.user.id },
                            attributes: ['name', 'surname', 'role']
                        });

                        const response = {
                            ...chatMessage.toJSON(),
                            User: {
                                name: userDetails.role === 'teacher' ? `Professeur ${userDetails.surname}` : userDetails.name
                            }
                        };


                        response.type = 'new_message';


                        response.sender_id = ws.user.id;


                        broadcastMessage(response); 
                    }
                } catch (err) {
                    console.error('Error processing WebSocket message:', err);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Failed to process message'
                    }));
                }
            });

            ws.on('close', () => {
                console.log('Client WebSocket déconnecté du chat');
                chatClients.delete(ws);
            });

            ws.on('error', (err) => {
                console.error('Erreur WebSocket dans le chat :', err);
                chatClients.delete(ws);
            });

        } catch (e) {
            console.error('Erreur lors de l\'analyse de l\'URL ou du token :', e.message);
            ws.close(4001, 'Bad Request');
        }
    });
};

/**
 * Diffuse un message à tous les clients WebSocket connectés
 * 
 * @param {Object} message - Message à diffuser
 * @param {WebSocket|null} [excludeWs=null] - Client WebSocket à exclure de la diffusion (optionnel)
 * @private
 */
const broadcastMessage = (message, excludeWs = null) => {

    const messageToSend = message.type 
        ? message 
        : { ...message, type: 'new_message' };
    
    chatClients.forEach((client) => {

        if (client.readyState === WebSocket.OPEN && (excludeWs === null || client !== excludeWs)) {
            client.send(JSON.stringify(messageToSend));
        }
    });
};

/**
 * Vérifie si un texte contient des mots interdits
 * 
 * @param {string} text - Texte à vérifier
 * @returns {boolean} true si le texte contient des mots interdits, false sinon
 * @private
 */
const containsForbiddenWords = (text) => {
    return leoProfanity.check(text);
};

/**
 * Récupère tous les messages d'un live
 * 
 * @param {Object} req - Requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.liveId - ID du live dont on veut récupérer les messages
 * @param {Object} res - Réponse Express
 * @returns {Object} Messages formatés avec informations utilisateurs
 * @throws {Error} Erreur 500 en cas de problème serveur
 */
const getMessages = async (req, res) => {
    try {
        const { liveId } = req.params;
        const messages = await ChatMessage.findAll({
            where: { live_id: liveId },
            include: [
                {
                    model: User,
                    attributes: ['name', 'surname', 'role'],
                    required: true
                }
            ],
            order: [['createdAt', 'ASC']],
        });


        const formattedMessages = messages.map(message => {
            const msgObj = message.toJSON();
            if (msgObj.User && msgObj.User.role === 'teacher') {
                msgObj.User.name = `Professeur ${msgObj.User.surname}`;
            }
            return msgObj;
        });

        res.json({ messages: formattedMessages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Crée un nouveau message dans un live
 * 
 * @param {Object} req - Requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.liveId - ID du live où publier le message
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.message - Contenu du message
 * @param {Object} req.user - Utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} res - Réponse Express
 * @returns {Object} Message créé avec informations utilisateur
 * @throws {Error} Erreur 400 si le message est invalide ou 404 si le live n'existe pas
 */
const postMessage = async (req, res) => {
    try {
        const { liveId } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Le message est requis' });
        }

        if (containsForbiddenWords(message)) {
            return res.status(400).json({ error: 'Le message contient des mots interdits' });
        }

        if (message.length > 500) {
            return res.status(400).json({ error: 'Le message ne doit pas dépasser 500 caractères' });
        }

        if (message.length < 1) {
            return res.status(400).json({ error: 'Le message doit contenir au moins 1 caractère' });
        }


        const liveExists = await Lives.findByPk(liveId);
        if (!liveExists) {
            return res.status(404).json({ error: 'Live non trouvé' });
        }
        const user = req.user.id;

        let chatMessage = await ChatMessage.create({
            live_id: liveId,
            user_id: user,
            content: message,
        });

        const userDetails = await User.findOne({
            where: { id: user },
            attributes: ['name', 'role']
        });


        const response = {
            ...chatMessage.toJSON(),
            User: userDetails ? {
                name: userDetails.role === 'teacher' ? `Mr ${userDetails.name}` : userDetails.name
            } : null
        };        



        res.status(201).json(response);
    } catch (err) {
        res.status(400).json({ error: 'Impossible d\'envoyer le message' });
    }
};

/**
 * Supprime un message spécifique et notifie tous les clients
 * 
 * @param {Object} req - Requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.messageId - ID du message à supprimer
 * @param {Object} res - Réponse Express
 * @returns {undefined} Statut 204 en cas de succès
 * @throws {Error} Erreur 500 en cas de problème serveur
 */
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        await ChatMessage.destroy({ where: { id: messageId } });


        broadcastMessage({
            type: 'message_deleted',
            messageId
        });

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Supprime tous les messages d'un utilisateur et notifie tous les clients
 * 
 * @param {Object} req - Requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.userId - ID de l'utilisateur dont on veut supprimer les messages
 * @param {Object} res - Réponse Express
 * @returns {undefined} Statut 204 en cas de succès
 * @throws {Error} Erreur 500 en cas de problème serveur
 */
const deleteUserMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        await ChatMessage.destroy({ where: { user_id: userId } });


        broadcastMessage({
            type: 'user_messages_deleted',
            userId
        });

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Supprime tous les messages d'un live
 * 
 * @param {Object} req - Requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.liveId - ID du live dont on veut supprimer les messages
 * @param {Object} res - Réponse Express
 * @returns {undefined} Statut 204 en cas de succès
 * @throws {Error} Erreur 500 en cas de problème serveur
 */
const deleteLiveMessages = async (req, res) => {
    try {
        const { liveId } = req.params;
        await ChatMessage.destroy({ where: { live_id: liveId } });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Supprime tous les messages d'un utilisateur dans un live spécifique
 * 
 * @param {Object} req - Requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.liveId - ID du live concerné
 * @param {string} req.params.userId - ID de l'utilisateur dont on veut supprimer les messages
 * @param {Object} res - Réponse Express
 * @returns {undefined} Statut 204 en cas de succès
 * @throws {Error} Erreur 500 en cas de problème serveur
 */
const deleteUserLiveMessages = async (req, res) => {
    try {
        const { liveId, userId } = req.params;
        await ChatMessage.destroy({ where: { live_id: liveId, user_id: userId } });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { setupChatWebSocket, getMessages, postMessage, deleteMessage, deleteUserMessages, deleteLiveMessages, deleteUserLiveMessages };
