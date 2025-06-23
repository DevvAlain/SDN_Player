import User from '../models/user.js';
import Player from '../models/player.js';
import Team from '../models/team.js';

class AdminService {
    // Dashboard statistics
    async getDashboardStats() {
        try {
            const totalUsers = await User.countDocuments();
            const totalAdmins = await User.countDocuments({ isAdmin: true });
            const totalPlayers = await Player.countDocuments();
            const totalTeams = await Team.countDocuments();

            // Users created in last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const newUsers = await User.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            });

            // Players created in last 30 days
            const newPlayers = await Player.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            });

            // Recent users
            const recentUsers = await User.find()
                .select('-password')
                .sort({ createdAt: -1 })
                .limit(5);

            // Recent players
            const recentPlayers = await Player.find()
                .populate('team', 'teamName')
                .sort({ createdAt: -1 })
                .limit(5);

            return {
                success: true,
                data: {
                    stats: {
                        totalUsers,
                        totalAdmins,
                        totalPlayers,
                        totalTeams,
                        newUsers,
                        newPlayers
                    },
                    recentUsers,
                    recentPlayers
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to get dashboard stats',
                error: error.message
            };
        }
    }

    // Team management
    async getAllTeams(options = {}) {
        try {
            const { page = 1, limit = 10, search } = options;
            const skip = (page - 1) * limit;

            let query = {};
            if (search) {
                query.teamName = { $regex: search, $options: 'i' };
            }

            const teams = await Team.find(query)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });

            const total = await Team.countDocuments(query);

            // Đếm số players cho mỗi team
            const teamsWithPlayerCount = await Promise.all(teams.map(async (team) => {
                const playerCount = await Player.countDocuments({ team: team._id });
                return {
                    ...team.toObject(),
                    playerCount
                };
            }));

            return {
                success: true,
                data: {
                    teams: teamsWithPlayerCount,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalTeams: total,
                        hasNext: page < Math.ceil(total / limit),
                        hasPrev: page > 1
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to get teams',
                error: error.message
            };
        }
    }

    async createTeam(teamData) {
        try {
            const team = new Team(teamData);
            await team.save();

            return {
                success: true,
                message: 'Team created successfully',
                data: team
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create team',
                error: error.message
            };
        }
    }

    async updateTeam(teamId, updateData) {
        try {
            const team = await Team.findByIdAndUpdate(
                teamId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!team) {
                return {
                    success: false,
                    message: 'Team not found'
                };
            }

            return {
                success: true,
                message: 'Team updated successfully',
                data: team
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update team',
                error: error.message
            };
        }
    }

    async deleteTeam(teamId) {
        try {
            // Kiểm tra xem có players nào thuộc team này không
            const playersInTeam = await Player.countDocuments({ team: teamId });
            if (playersInTeam > 0) {
                return {
                    success: false,
                    message: 'Cannot delete team with existing players'
                };
            }

            const team = await Team.findByIdAndDelete(teamId);
            if (!team) {
                return {
                    success: false,
                    message: 'Team not found'
                };
            }

            return {
                success: true,
                message: 'Team deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete team',
                error: error.message
            };
        }
    }

    // Player management for admin
    async getAllPlayersAdmin(options = {}) {
        try {
            const { page = 1, limit = 10, team, search } = options;
            const skip = (page - 1) * limit;

            let query = {};

            if (team) {
                query.team = team;
            }

            if (search) {
                query.playerName = { $regex: search, $options: 'i' };
            }

            const players = await Player.find(query)
                .populate('team', 'teamName')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });

            const total = await Player.countDocuments(query);

            return {
                success: true,
                data: {
                    players,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalPlayers: total,
                        hasNext: page < Math.ceil(total / limit),
                        hasPrev: page > 1
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to get players',
                error: error.message
            };
        }
    }
}

export default new AdminService(); 