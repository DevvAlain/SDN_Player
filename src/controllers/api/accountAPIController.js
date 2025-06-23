import accountService from '../../services/accountService.js';

class AccountAPIController {
    // GET /api/accounts - Admin only
    async getAllAccounts(req, res) {
        try {
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                search: req.query.search,
                isAdmin: req.query.isAdmin ? req.query.isAdmin === 'true' : undefined
            };

            const result = await accountService.getAllAccounts(options);

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

    // GET /api/accounts/:id
    async getAccountById(req, res) {
        try {
            const result = await accountService.getAccountById(req.params.id);

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

    // PUT /api/accounts/:id
    async updateAccount(req, res) {
        try {
            const result = await accountService.updateAccount(
                req.params.id,
                req.body,
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

    // DELETE /api/accounts/:id - Admin only
    async deleteAccount(req, res) {
        try {
            const result = await accountService.deleteAccount(req.params.id);

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

    // PATCH /api/accounts/:id/toggle-admin - Admin only
    async toggleAdminStatus(req, res) {
        try {
            const result = await accountService.toggleAdminStatus(req.params.id);

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

    // PATCH /api/accounts/:id/change-password
    async changePassword(req, res) {
        try {
            const result = await accountService.changePassword(
                req.params.id,
                req.body,
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

    // GET /api/accounts/stats - Admin only
    async getAccountStats(req, res) {
        try {
            const result = await accountService.getAccountStats();

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

export default new AccountAPIController(); 