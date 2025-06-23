import adminService from '../../services/adminService.js';
import playerService from '../../services/playerService.js';

class AdminAPIController {
    // GET /api/admin/dashboard
    async getDashboard(req, res) {
        try {
            const result = await adminService.getDashboardStats();

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

    // Team Management APIs
    // GET /api/admin/teams
    async getAllTeams(req, res) {
        try {
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                search: req.query.search
            };

            const result = await adminService.getAllTeams(options);

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

    // POST /api/admin/teams
    async createTeam(req, res) {
        try {
            const result = await adminService.createTeam(req.body);

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

    // PUT /api/admin/teams/:id
    async updateTeam(req, res) {
        try {
            const result = await adminService.updateTeam(req.params.id, req.body);

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

    // DELETE /api/admin/teams/:id
    async deleteTeam(req, res) {
        try {
            const result = await adminService.deleteTeam(req.params.id);

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

    // Player Management APIs
    // GET /api/admin/players
    async getAllPlayersAdmin(req, res) {
        try {
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                team: req.query.team,
                search: req.query.search
            };

            const result = await adminService.getAllPlayersAdmin(options);

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

    // POST /api/admin/players
    async createPlayer(req, res) {
        try {
            const result = await playerService.createPlayer(req.body);

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

    // PUT /api/admin/players/:id
    async updatePlayer(req, res) {
        try {
            const result = await playerService.updatePlayer(req.params.id, req.body);

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

    // DELETE /api/admin/players/:id
    async deletePlayer(req, res) {
        try {
            const result = await playerService.deletePlayer(req.params.id);

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

export default new AdminAPIController(); 