import logger from '../config/logger.js';

/**
 * Admin authentication middleware
 * Checks if the authenticated user has admin privileges
 * Supports both role-based and email-based admin verification
 */
const adminAuth = async (req, res, next) => {
  try {
    // Ensure user is authenticated first
    if (!req.user) {
      logger.warn('Admin access attempted without authentication', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url
      });
      
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required. Please log in to access admin features.",
        code: 'AUTH_REQUIRED'
      });
    }

    // Get admin emails from environment variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    
    // Check if user is admin based on:
    // 1. Role field in user document
    // 2. Email address in ADMIN_EMAILS environment variable
    const isAdminByRole = req.user.role === 'admin';
    const isAdminByEmail = adminEmails.includes(req.user.email);
    
    if (!isAdminByRole && !isAdminByEmail) {
      logger.warn('Unauthorized admin access attempt', {
        userId: req.user._id,
        email: req.user.email,
        role: req.user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url
      });
      
      return res.status(403).json({ 
        success: false, 
        message: "Admin privileges required. You don't have permission to access this resource.",
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }
    
    // Log successful admin access
    logger.info('Admin access granted', {
      userId: req.user._id,
      email: req.user.email,
      role: req.user.role,
      method: isAdminByRole ? 'role' : 'email',
      url: req.url
    });
    
    next();
  } catch (error) {
    logger.error('Admin authentication error', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      url: req.url
    });
    
    res.status(500).json({ 
      success: false, 
      message: "Authentication service error. Please try again later.",
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

export default adminAuth;

// Remove the debugging console.log statements after export
