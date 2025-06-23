import Player from '../models/player.js';
import Comment from '../models/comment.js';

class PlayerService {
    // Lấy tất cả players
    async getAllPlayers(options = {}) {
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

    // Lấy player theo ID
    async getPlayerById(playerId) {
        try {
            const player = await Player.findById(playerId)
                .populate('team', 'teamName')
                .populate('comments.author', 'name membername');

            if (!player) {
                return {
                    success: false,
                    message: 'Player not found'
                };
            }

            return {
                success: true,
                data: player
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to get player',
                error: error.message
            };
        }
    }

    // Thêm comment cho player
    async addComment(playerId, commentData, userId) {
        try {
            const player = await Player.findById(playerId);
            if (!player) {
                return {
                    success: false,
                    message: 'Player not found'
                };
            }

            const comment = {
                author: userId,
                content: commentData.content,
                createdAt: new Date()
            };

            player.comments.push(comment);
            await player.save();

            const updatedPlayer = await Player.findById(playerId)
                .populate('comments.author', 'name membername');

            return {
                success: true,
                message: 'Comment added successfully',
                data: updatedPlayer.comments[updatedPlayer.comments.length - 1]
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to add comment',
                error: error.message
            };
        }
    }

    // Xóa comment
    async deleteComment(playerId, commentId, userId, isAdmin = false) {
        try {
            const player = await Player.findById(playerId);
            if (!player) {
                return {
                    success: false,
                    message: 'Player not found'
                };
            }

            const comment = player.comments.id(commentId);
            if (!comment) {
                return {
                    success: false,
                    message: 'Comment not found'
                };
            }

            // Chỉ cho phép xóa comment của chính mình hoặc admin
            if (!isAdmin && comment.author.toString() !== userId.toString()) {
                return {
                    success: false,
                    message: 'Not authorized to delete this comment'
                };
            }

            player.comments.pull(commentId);
            await player.save();

            return {
                success: true,
                message: 'Comment deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete comment',
                error: error.message
            };
        }
    }

    // Tạo player mới (Admin)
    async createPlayer(playerData) {
        try {
            const player = new Player(playerData);
            await player.save();

            const populatedPlayer = await Player.findById(player._id)
                .populate('team', 'teamName');

            return {
                success: true,
                message: 'Player created successfully',
                data: populatedPlayer
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create player',
                error: error.message
            };
        }
    }

    // Cập nhật player (Admin)
    async updatePlayer(playerId, updateData) {
        try {
            const player = await Player.findByIdAndUpdate(
                playerId,
                updateData,
                { new: true, runValidators: true }
            ).populate('team', 'teamName');

            if (!player) {
                return {
                    success: false,
                    message: 'Player not found'
                };
            }

            return {
                success: true,
                message: 'Player updated successfully',
                data: player
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update player',
                error: error.message
            };
        }
    }

    // Xóa player (Admin)
    async deletePlayer(playerId) {
        try {
            const player = await Player.findByIdAndDelete(playerId);

            if (!player) {
                return {
                    success: false,
                    message: 'Player not found'
                };
            }

            return {
                success: true,
                message: 'Player deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete player',
                error: error.message
            };
        }
    }
}

export default new PlayerService(); 