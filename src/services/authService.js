import User from '../models/user.js';
import jwt from 'jsonwebtoken';

class AuthService {
    // Đăng ký user mới
    async register(userData) {
        try {
            const { membername, password, name, YOB } = userData;

            // Kiểm tra username đã tồn tại
            const existingUser = await User.findOne({ membername });
            if (existingUser) {
                return {
                    success: false,
                    message: 'Username already exists'
                };
            }

            // Tạo user mới
            const user = new User({
                membername,
                password,
                name,
                YOB
            });

            await user.save();

            return {
                success: true,
                message: 'Registration successful',
                data: {
                    id: user._id,
                    membername: user.membername,
                    name: user.name,
                    YOB: user.YOB,
                    isAdmin: user.isAdmin
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Registration failed',
                error: error.message
            };
        }
    }

    // Đăng nhập
    async login(credentials) {
        try {
            const { membername, password } = credentials;

            // Tìm user
            const user = await User.findOne({ membername });
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid username or password'
                };
            }

            // Kiểm tra password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return {
                    success: false,
                    message: 'Invalid username or password'
                };
            }

            // Tạo JWT token
            const token = jwt.sign(
                { id: user._id, isAdmin: user.isAdmin },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return {
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user: {
                        id: user._id,
                        membername: user.membername,
                        name: user.name,
                        YOB: user.YOB,
                        isAdmin: user.isAdmin
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Login failed',
                error: error.message
            };
        }
    }

    // Lấy thông tin user hiện tại
    async getCurrentUser(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            return {
                success: true,
                data: user
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to get user info',
                error: error.message
            };
        }
    }
}

export default new AuthService(); 