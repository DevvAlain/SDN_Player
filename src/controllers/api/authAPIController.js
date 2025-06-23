import authService from '../../services/authService.js';

class AuthAPIController {
    // POST /api/auth/login
    async login(req, res) {
        try {
            const result = await authService.login(req.body);

            if (!result.success) {
                return res.status(400).json(result);
            }

            // Set cookie for web access
            res.cookie('token', result.data.token, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // POST /api/auth/register
    async register(req, res) {
        try {
            const result = await authService.register(req.body);

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

    // POST /api/auth/logout
    async logout(req, res) {
        try {
            res.clearCookie('token');

            return res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // GET /api/auth/me
    async getMe(req, res) {
        try {
            const result = await authService.getCurrentUser(req.user._id);

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
}

export default new AuthAPIController(); 