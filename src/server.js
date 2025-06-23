import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import methodOverride from 'method-override';
import jwt from 'jsonwebtoken';
import Member from './models/user';
import connectDB from './config/conectDB.js';
import viewEngine from "./config/viewEngine";
import initWebRoutes from './route/web.js';
import initAPIRoutes from './route/api.js';

dotenv.config();  // Load biến môi trường từ .env

let app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(methodOverride('_method')); // Cho phép sử dụng PUT/DELETE trong form

// JWT verification middleware
app.use(async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await Member.findById(decoded.id);
            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
        // Token không hợp lệ hoặc hết hạn
        res.clearCookie('token');
    }
    next();
});

// Thêm user vào res.locals để sử dụng trong views
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// View engine
viewEngine(app);

// Routes
initWebRoutes(app);
initAPIRoutes(app);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'Something broke!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { message: 'Page not found' });
});

// Connect to database
connectDB();

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 Backend Nodejs is running on port: ${port}`);
});
