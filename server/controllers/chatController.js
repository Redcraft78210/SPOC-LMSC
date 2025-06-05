const WebSocket = require('ws');
const { ChatMessage, User, Lives } = require('../models');
const leoProfanity = require('leo-profanity');
const frenchBadwordsList = require('french-badwords-list');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

// Configure leo-profanity to include French bad words
leoProfanity.add(frenchBadwordsList.array);
leoProfanity.loadDictionary('fr');

// WebSocket clients
const chatClients = new Set();

const setupChatWebSocket = (wss) => {
    wss.on('connection', async (ws, request) => {
        console.log('Client WebSocket connecté au chat');

        // Parse and verify token
        try {
            const fullUrl = new URL(request.url, `http://${request.headers.host}`);
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

            // Add to client set if authentication passed
            chatClients.add(ws);

            // Handle WebSocket messages
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

                        // Other validations...

                        // Save to database
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

                        // IMPORTANT: Add a type to the response to differentiate it
                        response.type = 'new_message';

                        // IMPORTANT: Add original sender information to identify messages sent by this user
                        response.sender_id = ws.user.id;

                        // Broadcast to all clients EXCEPT the sender
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

// Modifiez la fonction broadcastMessage pour diffuser à tous les clients

const broadcastMessage = (message, excludeWs = null) => {
    // Ne pas modifier le type si un type existe déjà
    const messageToSend = message.type 
        ? message 
        : { ...message, type: 'new_message' };
    
    chatClients.forEach((client) => {
        // Si un client spécifique doit être exclu, vérifiez
        if (client.readyState === WebSocket.OPEN && (excludeWs === null || client !== excludeWs)) {
            client.send(JSON.stringify(messageToSend));
        }
    });
};

// Helper function to check for forbidden words
const containsForbiddenWords = (text) => {
    return leoProfanity.check(text);
};

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

        // Vérification de l'existence du live
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

        // Ajout explicite des détails de l'utilisateur dans la réponse avec préfixe "Mr" pour les professeurs
        const response = {
            ...chatMessage.toJSON(),
            User: userDetails ? {
                name: userDetails.role === 'teacher' ? `Mr ${userDetails.name}` : userDetails.name
            } : null
        };        

        // broadcastMessage(response);

        res.status(201).json(response);
    } catch (err) {
        res.status(400).json({ error: 'Impossible d\'envoyer le message' });
    }
};

// Supprimer un message
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        await ChatMessage.destroy({ where: { id: messageId } });

        // Notifier les clients de la suppression
        broadcastMessage({
            type: 'message_deleted',
            messageId
        });

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Supprimer tous les messages d'un utilisateur
const deleteUserMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        await ChatMessage.destroy({ where: { user_id: userId } });

        // Notifier les clients de la suppression des messages de l'utilisateur
        broadcastMessage({
            type: 'user_messages_deleted',
            userId
        });

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Supprimer tous les messages d'un live
const deleteLiveMessages = async (req, res) => {
    try {
        const { liveId } = req.params;
        await ChatMessage.destroy({ where: { live_id: liveId } });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Supprimer tous les messages d'un utilisateur dans un live
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