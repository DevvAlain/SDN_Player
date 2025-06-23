const Member = require('../models/user');
const jwt = require('jsonwebtoken');

const authController = {
    // Hiển thị trang login
    getLogin: async (req, res) => {
        const message = req.session.message;
        delete req.session.message;
        res.render('login', { message });
    },

    // Xử lý đăng nhập
    login: async (req, res) => {
        try {
            const { membername, password } = req.body;
            const member = await Member.findOne({ membername });

            if (!member) {
                req.session.message = { type: 'error', text: 'Invalid username or password' };
                return res.redirect('/login');
            }

            const isMatch = await member.comparePassword(password);
            if (!isMatch) {
                req.session.message = { type: 'error', text: 'Invalid username or password' };
                return res.redirect('/login');
            }

            // Tạo JWT token
            const token = jwt.sign(
                { id: member._id, isAdmin: member.isAdmin },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            // Redirect admin to dashboard, others to home
            if (member.isAdmin) {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/');
            }
        } catch (error) {
            req.session.message = { type: 'error', text: 'An error occurred' };
            res.redirect('/login');
        }
    },

    // Hiển thị trang đăng ký
    getRegister: async (req, res) => {
        const message = req.session.message;
        delete req.session.message;
        res.render('register', { message });
    },

    // Xử lý đăng ký
    register: async (req, res) => {
        try {
            const { membername, password, name, YOB } = req.body;

            // Kiểm tra username đã tồn tại
            const existingMember = await Member.findOne({ membername });
            if (existingMember) {
                req.session.message = { type: 'error', text: 'Username already exists' };
                return res.redirect('/register');
            }

            // Tạo member mới
            const member = new Member({
                membername,
                password,
                name,
                YOB
            });

            await member.save();

            req.session.message = { type: 'success', text: 'Registration successful. Please login.' };
            res.redirect('/login');
        } catch (error) {
            req.session.message = { type: 'error', text: 'An error occurred during registration' };
            res.redirect('/register');
        }
    },

    // Đăng xuất
    logout: (req, res) => {
        res.clearCookie('token');
        req.session.message = { type: 'success', text: 'Logged out successfully' };
        res.redirect('/login');
    }
};

module.exports = authController; 