const Member = require('../models/user');
const Player = require('../models/player');
const bcrypt = require('bcryptjs');

const profileController = {
    // Hiển thị trang profile
    getProfile: async (req, res) => {
        try {
            const member = await Member.findById(req.user._id);

            // Tìm tất cả players có comments của user này
            const players = await Player.find({
                'comments.author': req.user._id
            });

            // Lấy ra các comments của user từ các players
            const comments = players.reduce((acc, player) => {
                const userComments = player.comments
                    .filter(comment => comment.author.toString() === req.user._id.toString())
                    .map(comment => ({
                        ...comment.toObject(),
                        player: {
                            _id: player._id,
                            playerName: player.playerName
                        }
                    }));
                return [...acc, ...userComments];
            }, []);

            // Sắp xếp comments theo thời gian mới nhất
            comments.sort((a, b) => b.createdAt - a.createdAt);

            res.render('profile', {
                user: member,
                comments: comments || [],
                message: req.session.message
            });
            // Clear the message after displaying
            delete req.session.message;
        } catch (error) {
            console.error('Profile error:', error);
            res.status(500).render('error', { message: 'Server error: ' + error.message });
        }
    },

    // Cập nhật thông tin profile
    updateProfile: async (req, res) => {
        try {
            const { name, YOB } = req.body;
            const member = await Member.findById(req.user._id);

            member.name = name;
            member.YOB = YOB;
            await member.save();

            req.session.message = { type: 'success', text: 'Profile updated successfully' };
            res.redirect('/profile');
        } catch (error) {
            console.error('Update profile error:', error);
            req.session.message = { type: 'danger', text: 'Error updating profile' };
            res.redirect('/profile');
        }
    },

    // Đổi mật khẩu
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            const member = await Member.findById(req.user._id);

            // Kiểm tra mật khẩu hiện tại
            const isMatch = await member.comparePassword(currentPassword);
            if (!isMatch) {
                req.session.message = { type: 'danger', text: 'Current password is incorrect' };
                return res.redirect('/profile');
            }

            // Kiểm tra mật khẩu mới và xác nhận
            if (newPassword !== confirmPassword) {
                req.session.message = { type: 'danger', text: 'New passwords do not match' };
                return res.redirect('/profile');
            }

            // Cập nhật mật khẩu mới
            member.password = newPassword;
            await member.save();

            req.session.message = { type: 'success', text: 'Password changed successfully' };
            res.redirect('/profile');
        } catch (error) {
            console.error('Change password error:', error);
            req.session.message = { type: 'danger', text: 'Error changing password' };
            res.redirect('/profile');
        }
    },

    // Xóa comment
    deleteComment: async (req, res) => {
        try {
            // Tìm player có comment cần xóa
            const player = await Player.findOne({
                'comments._id': req.params.id,
                'comments.author': req.user._id
            });

            if (!player) {
                req.session.message = { type: 'danger', text: 'Comment not found or unauthorized' };
                return res.redirect('/profile');
            }

            // Xóa comment khỏi array
            player.comments = player.comments.filter(
                comment => comment._id.toString() !== req.params.id
            );
            await player.save();

            req.session.message = { type: 'success', text: 'Comment deleted successfully' };
            res.redirect('/profile');
        } catch (error) {
            console.error('Delete comment error:', error);
            req.session.message = { type: 'danger', text: 'Error deleting comment' };
            res.redirect('/profile');
        }
    }
};

module.exports = profileController; 