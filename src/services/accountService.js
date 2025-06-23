import User from '../models/user.js';
import bcrypt from 'bcryptjs';

class AccountService {
    // Lấy tất cả accounts (Admin only)
    async getAllAccounts(options = {}) {
        try {
            const { page = 1, limit = 10, search, isAdmin } = options;
            const skip = (page - 1) * limit;

            let query = {};

            if (search) {
                query.$or = [
                    { membername: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } }
                ];
            }

            if (isAdmin !== undefined) {
                query.isAdmin = isAdmin;
            }

            const accounts = await User.find(query)
                .select('-password')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });

            const total = await User.countDocuments(query);

            return {
                success: true,
                data: {
                    accounts,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalAccounts: total,
                        hasNext: page < Math.ceil(total / limit),
                        hasPrev: page > 1
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to get accounts',
                error: error.message
            };
        }
    }

    // Lấy account theo ID
    async getAccountById(accountId) {
        try {
            const account = await User.findById(accountId).select('-password');

            if (!account) {
                return {
                    success: false,
                    message: 'Account not found'
                };
            }

            return {
                success: true,
                data: account
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to get account',
                error: error.message
            };
        }
    }

    // Cập nhật thông tin account
    async updateAccount(accountId, updateData, requestUserId, isAdmin = false) {
        try {
            // Chỉ cho phép user update chính mình hoặc admin update bất kỳ ai
            if (!isAdmin && accountId !== requestUserId.toString()) {
                return {
                    success: false,
                    message: 'Not authorized to update this account'
                };
            }

            // Không cho phép thay đổi password qua route này
            delete updateData.password;
            delete updateData.isAdmin; // Chỉ admin mới được thay đổi qua route riêng

            const account = await User.findByIdAndUpdate(
                accountId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            if (!account) {
                return {
                    success: false,
                    message: 'Account not found'
                };
            }

            return {
                success: true,
                message: 'Account updated successfully',
                data: account
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update account',
                error: error.message
            };
        }
    }

    // Xóa account (Admin only)
    async deleteAccount(accountId) {
        try {
            const account = await User.findByIdAndDelete(accountId);

            if (!account) {
                return {
                    success: false,
                    message: 'Account not found'
                };
            }

            return {
                success: true,
                message: 'Account deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete account',
                error: error.message
            };
        }
    }

    // Toggle admin status (Admin only)
    async toggleAdminStatus(accountId) {
        try {
            const account = await User.findById(accountId);

            if (!account) {
                return {
                    success: false,
                    message: 'Account not found'
                };
            }

            account.isAdmin = !account.isAdmin;
            await account.save();

            return {
                success: true,
                message: `Account ${account.isAdmin ? 'promoted to' : 'demoted from'} admin`,
                data: {
                    id: account._id,
                    membername: account.membername,
                    name: account.name,
                    isAdmin: account.isAdmin
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to toggle admin status',
                error: error.message
            };
        }
    }

    // Thay đổi password
    async changePassword(accountId, passwordData, requestUserId, isAdmin = false) {
        try {
            const { currentPassword, newPassword } = passwordData;

            // Chỉ cho phép user thay đổi password của chính mình hoặc admin reset password
            if (!isAdmin && accountId !== requestUserId.toString()) {
                return {
                    success: false,
                    message: 'Not authorized to change this password'
                };
            }

            const account = await User.findById(accountId);
            if (!account) {
                return {
                    success: false,
                    message: 'Account not found'
                };
            }

            // Nếu không phải admin, cần verify current password
            if (!isAdmin) {
                const isMatch = await account.comparePassword(currentPassword);
                if (!isMatch) {
                    return {
                        success: false,
                        message: 'Current password is incorrect'
                    };
                }
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            account.password = await bcrypt.hash(newPassword, salt);
            await account.save();

            return {
                success: true,
                message: 'Password changed successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to change password',
                error: error.message
            };
        }
    }

    // Thống kê accounts
    async getAccountStats() {
        try {
            const totalAccounts = await User.countDocuments();
            const totalAdmins = await User.countDocuments({ isAdmin: true });
            const totalUsers = totalAccounts - totalAdmins;

            // Accounts created in last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const newAccounts = await User.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            });

            return {
                success: true,
                data: {
                    totalAccounts,
                    totalAdmins,
                    totalUsers,
                    newAccountsLast30Days: newAccounts
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to get account stats',
                error: error.message
            };
        }
    }
}

export default new AccountService(); 