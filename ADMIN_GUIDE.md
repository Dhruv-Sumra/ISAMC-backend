# ISAMC Backend - Admin System Guide

## 🔐 Admin Authentication System

The admin system is now implemented with robust role-based access control and comprehensive logging.

### ✅ **Fixed Issues**
- ❌ Removed simple placeholder admin check
- ✅ Implemented proper role-based authentication
- ✅ Added email-based admin verification
- ✅ Created dedicated admin middleware
- ✅ Added comprehensive logging
- ✅ Built user management utilities

## 🚀 **Setting Up Your First Admin**

### Method 1: Using the Setup Script (Recommended)
```bash
# Run the interactive admin setup script
npm run setup:admin
```

This script will:
- Connect to your database
- Check for existing admins
- Guide you through creating an admin user
- Auto-verify the admin account

### Method 2: Environment Variable + Registration
1. Add admin emails to `.env`:
   ```env
   ADMIN_EMAILS=admin@yourdomain.com,admin2@yourdomain.com
   ```

2. Register normally through the API
3. Users with emails in `ADMIN_EMAILS` automatically get admin privileges

### Method 3: Database Update (Advanced)
```javascript
// Update existing user to admin role
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

## 🛡️ **Admin Authentication Flow**

### 1. **Two-Layer Authentication**
- **Layer 1**: Regular user authentication (`userAuth` middleware)
- **Layer 2**: Admin privilege check (`adminAuth` middleware)

### 2. **Admin Verification Methods**
- **Role-based**: User has `role: "admin"` in database
- **Email-based**: User's email is in `ADMIN_EMAILS` environment variable

### 3. **Security Features**
- Comprehensive logging of all admin actions
- IP address and user agent tracking
- Failed admin access attempt monitoring
- Self-action prevention (can't delete/demote yourself)

## 📡 **Admin API Endpoints**

### Dashboard & Statistics
```http
GET /api/admin/dashboard
# Returns: Content data + user statistics

GET /api/admin/stats
# Returns: Detailed user statistics
```

### User Management
```http
GET /api/admin/users?page=1&limit=10
# Get paginated user list

GET /api/admin/users/search?q=john&role=admin
# Search users by name/email and role

GET /api/admin/admins
# Get all admin users

PUT /api/admin/users/:userId/promote
# Promote user to admin

PUT /api/admin/users/:userId/demote
# Demote admin to user

DELETE /api/admin/users/:userId
# Delete user (prevents self-deletion)
```

### Content Management
```http
GET /api/admin/section/:sectionName
# Get specific content section

PUT /api/admin/update-section/:sectionName
# Update entire section

POST /api/admin/add-item/:sectionName
# Add item to section array

PUT /api/admin/update-item/:sectionName/:itemId
# Update specific item in section

DELETE /api/admin/delete-item/:sectionName/:itemId
# Delete item from section
```

## 🔍 **Admin Middleware Details**

### `adminAuth` Middleware
Located: `middleware/adminAuth.js`

**Features:**
- Verifies user authentication first
- Checks admin role or email
- Logs all admin access attempts
- Provides detailed error messages
- Tracks user actions for security

**Usage:**
```javascript
import adminAuth from '../middleware/adminAuth.js';

// Protect admin routes
router.get('/admin-only', userAuth, adminAuth, controller);
```

## 🛠️ **Admin Utilities**

### `utils/adminUtils.js`

**Functions:**
- `isUserAdmin(user)` - Check if user is admin
- `promoteToAdmin(userId, adminUser)` - Promote user to admin
- `demoteFromAdmin(userId, adminUser)` - Demote admin to user  
- `getAllAdmins()` - Get all admin users
- `getAdminStats()` - Get user statistics

**Example Usage:**
```javascript
import { isUserAdmin, promoteToAdmin } from '../utils/adminUtils.js';

// Check admin status
if (isUserAdmin(req.user)) {
  // User is admin
}

// Promote user
const updatedUser = await promoteToAdmin(userId, req.user);
```

## 📊 **Admin Statistics**

The admin dashboard provides:
- **Total Users**: All registered users
- **Verified Users**: Users who verified their email
- **Admin Users**: Users with admin role
- **Recent Users**: Users registered in last 7 days
- **Verification Rate**: Percentage of verified users

## 🔒 **Security Best Practices**

### 1. **Admin Email Management**
```env
# Production: Use specific admin emails
ADMIN_EMAILS=admin@isamc.org,director@isamc.org

# Development: Use test emails
ADMIN_EMAILS=admin@test.com,dev@test.com
```

### 2. **Role Management**
- Always use the promotion/demotion utilities
- Never directly modify roles in database
- Monitor admin actions through logs

### 3. **Access Control**
- Admin routes always require both `userAuth` and `adminAuth`
- Log all admin actions for security auditing
- Prevent self-destructive actions (self-deletion, self-demotion)

## 📝 **Logging & Monitoring**

### Admin Action Logs
All admin actions are logged with:
- Admin user details (ID, email, role)
- Target user details (for user management)
- Action performed
- Timestamp and request details
- IP address and user agent

### Log Files
- `logs/combined.log` - All application logs
- `logs/error.log` - Error logs only

### Monitoring Commands
```bash
# View admin activity
grep -i "admin" logs/combined.log

# Monitor failed admin access
grep -i "unauthorized admin" logs/combined.log

# View user promotions/demotions
grep -i "promoted\|demoted" logs/combined.log
```

## 🚨 **Troubleshooting**

### Common Issues

#### "Admin access required" Error
**Cause**: User doesn't have admin privileges
**Solution**: 
1. Check if user email is in `ADMIN_EMAILS`
2. Verify user has `role: "admin"` in database
3. Use setup script to create admin user

#### "Authentication required" Error
**Cause**: User not logged in
**Solution**: Ensure valid JWT token in Authorization header

#### Cannot Access Admin Routes
**Check:**
1. Environment variables loaded properly
2. User authenticated with valid token
3. User has admin privileges
4. Database connection working

### Debug Commands
```bash
# Check environment variables
echo $ADMIN_EMAILS

# Verify database connection
npm run setup:admin

# Check logs for errors
npm run logs:error
```

## 🔄 **Upgrading Existing Systems**

If upgrading from the old admin system:

1. **Update existing admin users**:
   ```javascript
   // In MongoDB
   db.users.updateMany(
     { email: { $in: ["admin1@domain.com", "admin2@domain.com"] } },
     { $set: { role: "admin" } }
   )
   ```

2. **Set environment variables**:
   ```env
   ADMIN_EMAILS=existing-admin@domain.com,another-admin@domain.com
   ```

3. **Test admin access**:
   ```bash
   # Test admin dashboard
   curl -X GET http://localhost:5000/api/admin/dashboard \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## 📞 **Support**

For admin system issues:
1. Check the logs: `npm run logs`
2. Verify environment variables
3. Test with the setup script: `npm run setup:admin`
4. Review the admin middleware logs
5. Check database user roles

The admin system is now production-ready with comprehensive security, logging, and user management capabilities! 🎉
