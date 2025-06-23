const Player = require('../models/player');
const Team = require('../models/team');

const playerController = {
    // Hiển thị trang chủ với danh sách players
    getIndex: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 9;
            const search = req.query.search || '';
            const teamFilter = req.query.team || '';

            let query = {};
            if (search) {
                query.playerName = { $regex: search, $options: 'i' };
            }
            if (teamFilter) {
                query.team = teamFilter;
            }

            const players = await Player.find(query)
                .populate('team')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort('-createdAt');

            const total = await Player.countDocuments(query);
            const teams = await Team.find();

            res.render('index', {
                players,
                teams,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                search,
                selectedTeam: teamFilter,
                user: req.user || null
            });
        } catch (error) {
            console.error('Error in getIndex:', error);
            res.status(500).render('error', { message: 'Server error' });
        }
    },

    // Hiển thị chi tiết player
    getPlayerDetail: async (req, res) => {
        try {
            const player = await Player.findById(req.params.id)
                .populate('team')
                .populate({
                    path: 'comments',
                    populate: { path: 'author', select: 'name' }
                });

            if (!player) {
                return res.status(404).render('error', { message: 'Player not found' });
            }

            let hasCommented = false;
            if (req.user) {
                hasCommented = player.comments.some(comment =>
                    comment.author._id.toString() === req.user._id.toString()
                );
            }

            res.render('player-detail', {
                player,
                user: req.user || null,
                isAdmin: req.user?.isAdmin || false,
                hasCommented
            });
        } catch (error) {
            console.error('Error in getPlayerDetail:', error);
            res.status(500).render('error', { message: 'Server error' });
        }
    },

    // Thêm comment cho player
    addComment: async (req, res) => {
        try {
            const { rating, content } = req.body;

            // Validate input
            if (!rating || !content) {
                req.session.message = { type: 'danger', text: 'Rating and content are required' };
                return res.redirect(`/players/${req.params.id}`);
            }

            // Convert rating to number and validate
            const ratingNum = parseInt(rating);
            if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
                req.session.message = { type: 'danger', text: 'Rating must be between 1 and 5' };
                return res.redirect(`/players/${req.params.id}`);
            }

            const player = await Player.findById(req.params.id);
            if (!player) {
                req.session.message = { type: 'danger', text: 'Player not found' };
                return res.redirect('/');
            }

            // Kiểm tra xem user đã comment chưa
            const hasCommented = player.comments.some(comment =>
                comment.author.toString() === req.user._id.toString()
            );

            if (hasCommented) {
                req.session.message = { type: 'danger', text: 'You have already commented on this player' };
                return res.redirect(`/players/${req.params.id}`);
            }

            // Add the comment
            player.comments.push({
                rating: ratingNum,
                content: content.trim(),
                author: req.user._id
            });

            await player.save();

            req.session.message = { type: 'success', text: 'Comment added successfully' };
            res.redirect(`/players/${req.params.id}`);
        } catch (error) {
            console.error('Error in addComment:', error);
            req.session.message = { type: 'danger', text: 'Error adding comment: ' + error.message };
            res.redirect(`/players/${req.params.id}`);
        }
    }
};

module.exports = playerController; 