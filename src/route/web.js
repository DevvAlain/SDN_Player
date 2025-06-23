import express from "express";
import authController from "../controllers/authController";
import playerController from "../controllers/playerController";
import adminController from "../controllers/adminController";
import profileController from "../controllers/profileController";
import { isAuth, isAdmin } from "../middleware/auth";

let router = express.Router();

let initWebRoutes = (app) => {
    // Public routes
    router.get('/', playerController.getIndex);
    router.get('/players/:id', playerController.getPlayerDetail);

    // Auth routes
    router.get('/login', authController.getLogin);
    router.post('/login', authController.login);
    router.get('/register', authController.getRegister);
    router.post('/register', authController.register);
    router.post('/logout', isAuth, authController.logout);

    // Profile routes (yêu cầu đăng nhập)
    router.get('/profile', isAuth, profileController.getProfile);
    router.post('/profile', isAuth, profileController.updateProfile);
    router.post('/profile/password', isAuth, profileController.changePassword);
    router.post('/comments/:id', isAuth, profileController.deleteComment);

    // Player comment routes (yêu cầu đăng nhập)
    router.post('/players/:id/comment', isAuth, playerController.addComment);

    // Admin routes (yêu cầu quyền admin)
    router.get('/admin/dashboard', isAuth, isAdmin, adminController.getDashboard);

    // Account management routes (Admin only)
    router.get('/admin/accounts', isAuth, isAdmin, adminController.getAccounts);

    // Team management
    router.post('/admin/teams', isAuth, isAdmin, adminController.createTeam);
    router.put('/admin/teams/:id', isAuth, isAdmin, adminController.updateTeam);
    router.delete('/admin/teams/:id', isAuth, isAdmin, adminController.deleteTeam);

    // Player management
    router.get('/admin/players/new', isAuth, isAdmin, adminController.getPlayerForm);
    router.get('/admin/players/edit/:id', isAuth, isAdmin, adminController.getPlayerForm);
    router.post('/admin/players', isAuth, isAdmin, adminController.createPlayer);
    router.put('/admin/players/:id', isAuth, isAdmin, adminController.updatePlayer);
    router.delete('/admin/players/:id', isAuth, isAdmin, adminController.deletePlayer);

    // Member management
    router.get('/admin/members', isAuth, isAdmin, adminController.getMembers);
    router.post('/admin/members/:id/toggle-admin', isAuth, isAdmin, adminController.toggleAdmin);

    return app.use("/", router);
};

module.exports = initWebRoutes;
