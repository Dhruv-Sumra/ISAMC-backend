import userModel from '../models/userModel.js';
import logger from '../config/logger.js';

/**
 * Utility functions for admin operations
 */

/**
 * Check if a user is an admin
 * @param {Object} user - User object
 * @returns {boolean} - True if user is admin
 */
export const isUserAdmin = (user) => {
  if (!user) return false;
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  return user.role === 'admin' || adminEmails.includes(user.email);
};

/**
 * Promote a user to admin role
 * @param {string} userId - User ID to promote
 * @param {Object} adminUser - Admin user performing the action
 * @returns {Object} - Updated user object
 */
export const promoteToAdmin = async (userId, adminUser) => {
  try {
    if (!isUserAdmin(adminUser)) {
      throw new Error('Only admins can promote users');
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { role: 'admin' },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new Error('User not found');
    }

    logger.info('User promoted to admin', {
      promotedUserId: userId,
      promotedUserEmail: user.email,
      adminId: adminUser._id,
      adminEmail: adminUser.email
    });

    return user;
  } catch (error) {
    logger.error('Error promoting user to admin', {
      error: error.message,
      userId,
      adminId: adminUser._id
    });
    throw error;
  }
};

/**
 * Demote an admin to regular user
 * @param {string} userId - User ID to demote
 * @param {Object} adminUser - Admin user performing the action
 * @returns {Object} - Updated user object
 */
export const demoteFromAdmin = async (userId, adminUser) => {
  try {
    if (!isUserAdmin(adminUser)) {
      throw new Error('Only admins can demote users');
    }

    // Prevent self-demotion
    if (userId === adminUser._id.toString()) {
      throw new Error('Cannot demote yourself');
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { role: 'user' },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new Error('User not found');
    }

    logger.info('Admin demoted to user', {
      demotedUserId: userId,
      demotedUserEmail: user.email,
      adminId: adminUser._id,
      adminEmail: adminUser.email
    });

    return user;
  } catch (error) {
    logger.error('Error demoting admin to user', {
      error: error.message,
      userId,
      adminId: adminUser._id
    });
    throw error;
  }
};

/**
 * Get all admin users
 * @returns {Array} - Array of admin users
 */
export const getAllAdmins = async () => {
  try {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    
    const admins = await userModel.find({
      $or: [
        { role: 'admin' },
        { email: { $in: adminEmails } }
      ]
    }).select('-password -refreshToken');

    return admins;
  } catch (error) {
    logger.error('Error fetching admin users', { error: error.message });
    throw error;
  }
};

/**
 * Get admin statistics
 * @returns {Object} - Admin statistics
 */
export const getAdminStats = async () => {
  try {
    const totalUsers = await userModel.countDocuments();
    const verifiedUsers = await userModel.countDocuments({ isAccountVerified: true });
    const adminUsers = await userModel.countDocuments({ role: 'admin' });
    const recentUsers = await userModel.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    return {
      totalUsers,
      verifiedUsers,
      adminUsers,
      recentUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(2) : 0
    };
  } catch (error) {
    logger.error('Error fetching admin statistics', { error: error.message });
    throw error;
  }
};
