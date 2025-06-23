const jwt = require('jsonwebtoken');
const Member = require('../models/user');

// Middleware kiểm tra đăng nhập
exports.isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const member = await Member.findById(decoded.id);

        if (!member) {
            res.clearCookie('token');
            return res.redirect('/login');
        }

        req.user = member;
        next();
    } catch (error) {
        res.clearCookie('token');
        res.redirect('/login');
    }
};

// Middleware kiểm tra quyền admin
exports.isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).render('error', {
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
}; 