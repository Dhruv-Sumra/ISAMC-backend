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
        message: "Authentication required. Please log in first." 
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
        message: "Admin access required. Contact administrator for access permissions." 
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
      message: "Admin authentication error. Please try again." 
    });
  }
};

export default adminAuth;


// Add temporary logging:
console.log('Admin check:', {
  email: req.user.email, 
  role: req.user.role,
  isAdminByRole: req.user.role === 'admin',
  isAdminByEmail: adminEmails.includes(req.user.email)
});
