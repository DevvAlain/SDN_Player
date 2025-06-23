import playerService from '../../services/playerService.js';

class PlayerAPIController {
    // GET /api/players
    async getAllPlayers(req, res) {
        try {
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                team: req.query.team,
                search: req.query.search
            };

            const result = await playerService.getAllPlayers(options);

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // GET /api/players/:id
    async getPlayerById(req, res) {
        try {
            const result = await playerService.getPlayerById(req.params.id);

            if (!result.success) {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // POST /api/players/:id/comments
    async addComment(req, res) {
        try {
            const result = await playerService.addComment(
                req.params.id,
                req.body,
                req.user._id
            );

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // DELETE /api/players/:playerId/comments/:commentId
    async deleteComment(req, res) {
        try {
            const result = await playerService.deleteComment(
                req.params.playerId,
                req.params.commentId,
                req.user._id,
                req.user.isAdmin
            );

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

export default new PlayerAPIController(); 