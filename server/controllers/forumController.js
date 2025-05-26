const { Thread, Comment, User, sequelize } = require('../models');

const leoProfanity = require('leo-profanity');
const frenchBadwordsList = require('french-badwords-list');

// Configure leo-profanity to include French bad words
leoProfanity.add(frenchBadwordsList.array);
leoProfanity.loadDictionary('fr');


// Helper function for input validation
const validateRequiredFields = (req, requiredFields) => {
    return requiredFields.filter(field => !req.body[field]);
};

// Helper function to check for forbidden words
const containsForbiddenWords = (text) => {
    return leoProfanity.check(text);
};

// Helper pour le tri
const getSortOrder = (sortBy) => {
    const sortOptions = {
        newest: [['createdAt', 'DESC']],
        popular: [[sequelize.literal('"commentsCount"'), 'DESC']],
        trending: [
            [sequelize.literal('(commentsCount / (EXTRACT(EPOCH FROM NOW() - "Thread"."createdAt") / 3600))'), 'DESC']
        ]
    };
    return sortOptions[sortBy] || sortOptions.newest;
};

// Get all threads with pagination
const getThreads = async (req, res) => {
    try {
        // 1. Validation des paramètres
        const { page = 1, limit = 10, sortBy = 'newest', search } = req.query;
        const pageNumber = Math.max(1, parseInt(page, 10));
        const limitNumber = Math.min(Math.max(1, parseInt(limit, 10)), 100);

        // 2. Construction dynamique des includes
        const userInclude = {
            model: User,
            attributes: ['id', 'username'],
            required: false // toujours inclure le thread même sans user correspondant
        };
        if (search) {
            userInclude.where = {
                username: {
                    [Op.iLike]: `%${search}%`
                }
            };
        }

        const commentInclude = {
            model: Comment,
            attributes: []
        };

        // 3. Compter le total des threads (pour pagination)
        const totalItems = await Thread.count({
            include: [userInclude],
            distinct: true
        });

        // 4. Récupération des threads paginés avec le nombre de commentaires
        const threads = await Thread.findAll({
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

        // 5. Calcul de la pagination
        const totalPages = Math.ceil(totalItems / limitNumber);
        if (pageNumber > totalPages && totalPages > 0) {
            return res.status(400).json({
                message: `Page invalide. Nombre maximum de pages : ${totalPages}`
            });
        }

        // 6. Formatage de la réponse
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


// Create a new thread with validation
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

// Get thread details with comments and authors
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

// Add comment with validation
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

        // Return comment with author details
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