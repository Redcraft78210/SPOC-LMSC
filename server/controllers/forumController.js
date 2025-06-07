/**
 * @fileoverview Contrôleur pour gérer les fonctionnalités du forum, incluant les threads
 * et les commentaires. Gère la création, la récupération et la modération du contenu.
 * Utilise la bibliothèque leo-profanity pour filtrer les mots inappropriés en français.
 * @module forumController
 */
const { Thread, Comment, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const leoProfanity = require('leo-profanity');
const frenchBadwordsList = require('french-badwords-list');


leoProfanity.add(frenchBadwordsList.array);
leoProfanity.loadDictionary('fr');


/**
 * Valide la présence des champs requis dans une requête
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Array<string>} requiredFields - Tableau contenant les noms des champs requis
 * @returns {Array<string>} Tableau des noms des champs manquants
 */
const validateRequiredFields = (req, requiredFields) => {
    return requiredFields.filter(field => !req.body[field]);
};


/**
 * Vérifie si un texte contient des mots interdits
 * 
 * @param {string} text - Le texte à vérifier
 * @returns {boolean} True si le texte contient des mots interdits, sinon False
 */
const containsForbiddenWords = (text) => {
    return leoProfanity.check(text);
};


/**
 * Détermine l'ordre de tri des threads selon le critère spécifié
 * 
 * @param {string} sortBy - Critère de tri ('newest', 'oldest', 'popular', ou 'trending')
 * @returns {Array} Configuration de tri compatible avec Sequelize
 */
const getSortOrder = (sortBy) => {
    const sortOptions = {
        newest: [['createdAt', 'DESC']],
        oldest: [['createdAt', 'ASC']], // Ajout de l'option oldest
        popular: [[sequelize.literal('"commentsCount"'), 'DESC']],
        trending: [
            [sequelize.literal('(commentsCount / (EXTRACT(EPOCH FROM NOW() - "Thread"."createdAt") / 3600))'), 'DESC']
        ]
    };
    return sortOptions[sortBy] || sortOptions.newest;
};


/**
 * Récupère une liste paginée de threads avec options de filtrage et tri
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.query - Paramètres de requête
 * @param {number} [req.query.page=1] - Numéro de page pour la pagination
 * @param {number} [req.query.limit=10] - Nombre d'éléments par page (max 100)
 * @param {string} [req.query.sortBy='newest'] - Critère de tri ('newest', 'oldest', 'popular', 'trending')
 * @param {string} [req.query.search=''] - Texte à rechercher dans les titres et contenus
 * @param {string} [req.query.category=''] - Catégorie pour filtrer les threads
 * @param {string} [req.query.author=''] - Nom d'utilisateur de l'auteur pour filtrer les threads
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Réponse JSON contenant les threads et informations de pagination
 * @throws {Error} Erreur serveur lors de la récupération des threads
 */
const getThreads = async (req, res) => {
    try {

        const { 
            page = 1, 
            limit = 10, 
            sortBy = 'newest', 
            search = '', 
            category = '', 
            author = '' 
        } = req.query;
        
        const pageNumber = Math.max(1, parseInt(page, 10));
        const limitNumber = Math.min(Math.max(1, parseInt(limit, 10)), 100);


        const whereConditions = {};
        

        if (category && category !== 'all') {
            whereConditions.category = category;
        }
        

        if (search) {
            whereConditions[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { content: { [Op.iLike]: `%${search}%` } }
            ];
        }


        const userInclude = {
            model: User,
            attributes: ['id', 'username'],
            required: false
        };
        

        if (author) {
            userInclude.where = {
                username: { [Op.iLike]: `%${author}%` }
            };
            userInclude.required = true; // Rendons-le requis pour filtrer par auteur
        }

        const commentInclude = {
            model: Comment,
            attributes: []
        };


        const totalItems = await Thread.count({
            where: whereConditions,
            include: [userInclude],
            distinct: true
        });


        const threads = await Thread.findAll({
            where: whereConditions,
            include: [
                userInclude,
                commentInclude
            ],
            attributes: {
                include: [
                    [sequelize.fn('COUNT', sequelize.col('Comments.id')), 'commentsCount']
                ]
            },
            group: ['Thread.id', 'User.id'],
            order: getSortOrder(sortBy),
            subQuery: false,
            limit: limitNumber,
            offset: (pageNumber - 1) * limitNumber
        });


        const totalPages = Math.ceil(totalItems / limitNumber);
        if (pageNumber > totalPages && totalPages > 0) {
            return res.status(400).json({
                message: `Page invalide. Nombre maximum de pages : ${totalPages}`
            });
        }


        return res.json({
            threads,
            totalItems,
            itemsPerPage: limitNumber,
            currentPage: pageNumber,
            totalPages,
            hasNextPage: pageNumber < totalPages,
            hasPreviousPage: pageNumber > 1
        });
    } catch (error) {
        console.error('Error retrieving threads:', error);
        return res.status(500).json({
            message: 'Erreur serveur',
            errorCode: 'THREADS_FETCH_ERROR',
            details: error.message
        });
    }
};


/**
 * Crée un nouveau thread dans le forum
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.title - Titre du thread
 * @param {string} req.body.content - Contenu du thread
 * @param {Object} req.user - Informations de l'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur créant le thread
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Réponse JSON avec le thread créé ou message d'erreur
 * @throws {Error} Erreur serveur lors de la création du thread
 */
const createThread = async (req, res) => {
    try {
        const missingFields = validateRequiredFields(req, ['title', 'content']);
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missing: missingFields
            });
        }

        const { title, content } = req.body;

        if (containsForbiddenWords(title) || containsForbiddenWords(content)) {
            return res.status(400).json({ message: 'Content contains forbidden words' });
        }

        const authorId = req.user.id;

        const thread = await Thread.create({
            title: title.trim(),
            content: content.trim(),
            authorId: authorId
        });

        res.status(201).json(thread);
    } catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({ message: 'Server error while creating thread' });
    }
};


/**
 * Récupère les détails d'un thread spécifique avec ses commentaires
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.threadId - ID du thread à récupérer
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Réponse JSON avec les détails du thread et ses commentaires
 * @throws {Error} Erreur serveur lors de la récupération des détails du thread
 */
const getThreadDetails = async (req, res) => {
    try {
        const { threadId } = req.params;

        if (!threadId) {
            return res.status(400).json({ message: 'Invalid thread ID' });
        }

        const thread = await Thread.findByPk(threadId, {
            include: [{
                model: Comment,
                include: [{
                    model: User,
                    attributes: ['id', 'username']
                }]
            }, {
                model: User,
                attributes: ['id', 'username']
            }],
            order: [[Comment, 'createdAt', 'ASC']] // Oldest comments first
        });

        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        res.json(thread);
    } catch (error) {
        console.error('Error retrieving thread details:', error);
        res.status(500).json({ message: 'Server error while retrieving thread details' });
    }
};


/**
 * Ajoute un commentaire à un thread spécifique
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.threadId - ID du thread pour ajouter le commentaire
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.content - Contenu du commentaire
 * @param {Object} req.user - Informations de l'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur ajoutant le commentaire
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Réponse JSON avec le commentaire créé ou message d'erreur
 * @throws {Error} Erreur serveur lors de l'ajout du commentaire
 */
const addComment = async (req, res) => {
    try {
        const missingFields = validateRequiredFields(req, ['content']);
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missing: missingFields
            });
        }

        const { threadId } = req.params;
        const { content } = req.body;

        if (!threadId) {
            return res.status(400).json({ message: 'Invalid thread ID' });
        }

        if (containsForbiddenWords(content)) {
            return res.status(400).json({ message: 'Comment contains forbidden words' });
        }

        const authorId = req.user.id;

        const comment = await Comment.create({
            content: content.trim(),
            authorId: authorId,
            threadId
        });


        const newComment = await Comment.findByPk(comment.id, {
            include: [{
                model: User,
                attributes: ['id', 'username']
            }]
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error while adding comment' });
    }
};

module.exports = {
    getThreads,
    createThread,
    getThreadDetails,
    addComment
};