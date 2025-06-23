import express from "express";
import authAPIController from "../controllers/api/authAPIController";
import playerAPIController from "../controllers/api/playerAPIController";
import adminAPIController from "../controllers/api/adminAPIController";
import accountAPIController from "../controllers/api/accountAPIController";
import { isAuthAPI, isAdminAPI } from "../middleware/authAPI";

const router = express.Router();

const initAPIRoutes = (app) => {
    // Auth API endpoints
    router.post('/auth/login', authAPIController.login);
    router.post('/auth/register', authAPIController.register);
    router.post('/auth/logout', isAuthAPI, authAPIController.logout);
    router.get('/auth/me', isAuthAPI, authAPIController.getMe);

    // Player API endpoints
    router.get('/players', playerAPIController.getAllPlayers);
    router.get('/players/:id', playerAPIController.getPlayerById);
    router.post('/players/:id/comments', isAuthAPI, playerAPIController.addComment);
    router.delete('/players/:playerId/comments/:commentId', isAuthAPI, playerAPIController.deleteComment);

    // Account management API endpoints
    router.get('/accounts', isAuthAPI, isAdminAPI, accountAPIController.getAllAccounts);
    router.get('/accounts/stats', isAuthAPI, isAdminAPI, accountAPIController.getAccountStats);
    router.get('/accounts/:id', isAuthAPI, accountAPIController.getAccountById);
    router.put('/accounts/:id', isAuthAPI, accountAPIController.updateAccount);
    router.delete('/accounts/:id', isAuthAPI, isAdminAPI, accountAPIController.deleteAccount);
    router.patch('/accounts/:id/toggle-admin', isAuthAPI, isAdminAPI, accountAPIController.toggleAdminStatus);
    router.patch('/accounts/:id/change-password', isAuthAPI, accountAPIController.changePassword);

    // Admin API endpoints
    router.get('/admin/dashboard', isAuthAPI, isAdminAPI, adminAPIController.getDashboard);

    // Team management API
    router.get('/admin/teams', isAuthAPI, isAdminAPI, adminAPIController.getAllTeams);
    router.post('/admin/teams', isAuthAPI, isAdminAPI, adminAPIController.createTeam);
    router.put('/admin/teams/:id', isAuthAPI, isAdminAPI, adminAPIController.updateTeam);
    router.delete('/admin/teams/:id', isAuthAPI, isAdminAPI, adminAPIController.deleteTeam);

    // Player management API
    router.get('/admin/players', isAuthAPI, isAdminAPI, adminAPIController.getAllPlayersAdmin);
    router.post('/admin/players', isAuthAPI, isAdminAPI, adminAPIController.createPlayer);
    router.put('/admin/players/:id', isAuthAPI, isAdminAPI, adminAPIController.updatePlayer);
    router.delete('/admin/players/:id', isAuthAPI, isAdminAPI, adminAPIController.deletePlayer);

    return app.use("/api", router);
};

export default initAPIRoutes; 