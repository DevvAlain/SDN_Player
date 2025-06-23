const Player = require('../models/player');
const Team = require('../models/team');
const Member = require('../models/user');

const adminController = {
    // Dashboard
    getDashboard: async (req, res) => {
        try {
            const teams = await Team.find().sort('teamName');
            const players = await Player.find().populate('team').sort('-createdAt');
            res.render('admin/dashboard', { teams, players });
        } catch (error) {
            res.status(500).render('error', { message: 'Server error' });
        }
    },

    // Team Management
    createTeam: async (req, res) => {
        try {
            const { teamName } = req.body;
            await Team.create({ teamName });
            res.redirect('/admin/dashboard');
        } catch (error) {
            res.status(500).render('error', { message: 'Server error' });
        }
    },

    updateTeam: async (req, res) => {
        try {
            const { teamName } = req.body;
            await Team.findByIdAndUpdate(req.params.id, { teamName });
            res.redirect('/admin/dashboard');
        } catch (error) {
            res.status(500).render('error', { message: 'Server error' });
        }
    },

    deleteTeam: async (req, res) => {
        try {
            await Team.findByIdAndDelete(req.params.id);
            res.redirect('/admin/dashboard');
        } catch (error) {
            res.status(500).render('error', { message: 'Server error' });
        }
    },

    // Player Management
    getPlayerForm: async (req, res) => {
        try {
            const teams = await Team.find().sort('teamName');
            let player = null;
            if (req.params.id) {
                player = await Player.findById(req.params.id).populate('team');
            }
            res.render('admin/player-form', { teams, player });
        } catch (error) {
            res.status(500).render('error', { message: 'Server error' });
        }
    },

    createPlayer: async (req, res) => {
        try {
            const { playerName, team, cost, information, isCaptain, image } = req.body;

            const playerData = {
                playerName,
                team,
                cost: Number(cost),
                infomation: information,
                isCaptain: !!isCaptain,
                image
            };

            console.log('Creating player with data:', playerData);
            await Player.create(playerData);

            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error('Error creating player:', error);
            res.status(500).render('error', { message: 'Server error: ' + error.message });
        }
    },

    updatePlayer: async (req, res) => {
        try {
            const { playerName, team, cost, information, isCaptain, image } = req.body;
            const updateData = {
                playerName,
                team,
                cost: Number(cost),
                infomation: information,
                isCaptain: !!isCaptain,
                image
            };

            console.log('Updating player with data:', updateData);
            await Player.findByIdAndUpdate(req.params.id, updateData);

            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error('Error updating player:', error);
            res.status(500).render('error', { message: 'Server error: ' + error.message });
        }
    },

    deletePlayer: async (req, res) => {
        try {
            await Player.findByIdAndDelete(req.params.id);
            res.redirect('/admin/dashboard');
        } catch (error) {
            res.status(500).render('error', { message: 'Server error' });
        }
    },

    // Member Management
    getMembers: async (req, res) => {
        try {
            const members = await Member.find().sort('-createdAt');
            res.render('admin/members', { members });
        } catch (error) {
            res.status(500).render('error', { message: 'Server error' });
        }
    },

    toggleAdmin: async (req, res) => {
        try {
            const member = await Member.findById(req.params.id);
            if (!member) {
                return res.status(404).render('error', { message: 'Member not found' });
            }

            member.isAdmin = !member.isAdmin;
            await member.save();

            res.redirect('/admin/members');
        } catch (error) {
            res.status(500).render('error', { message: 'Server error' });
        }
    },

    // Account Management
    getAccounts: async (req, res) => {
        try {
            res.render('admin/accounts', {
                title: 'Quản lý tài khoản'
            });
        } catch (error) {
            res.status(500).render('error', { message: 'Server error' });
        }
    }
};

module.exports = adminController; 