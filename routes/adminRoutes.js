import express from "express";
import { DB } from "../models/dbSchema.js";
import userModel from "../models/userModel.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import logger from "../config/logger.js";
import { 
  promoteToAdmin, 
  demoteFromAdmin, 
  getAllAdmins, 
  getAdminStats 
} from "../utils/adminUtils.js";

const router = express.Router();

// Get admin dashboard data with statistics
router.get("/dashboard", userAuth, adminAuth, async (req, res) => {
  try {
    const [contentData, userStats] = await Promise.all([
      DB.findOne({}),
      getAdminStats()
    ]);
    
    res.status(200).json({ 
      success: true, 
      data: contentData,
      stats: userStats
    });
  } catch (error) {
    logger.error('Dashboard fetch error', { error: error.message, adminId: req.user._id });
    res.status(500).json({ 
      success: false, 
      message: "Error fetching dashboard data",
      error: error.message 
    });
  }
});

// Update section data
router.put("/update-section/:sectionName", userAuth, adminAuth, async (req, res) => {
  try {
    const { sectionName } = req.params;
    const updateData = req.body;

    const result = await DB.findOneAndUpdate(
      {},
      { [sectionName]: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({ 
      success: true, 
      message: `${sectionName} updated successfully`,
      data: result 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating section",
      error: error.message 
    });
  }
});

// Add item to section array
router.post("/add-item/:sectionName", userAuth, adminAuth, async (req, res) => {
  try {
    const { sectionName } = req.params;
    const newItem = req.body;

    const result = await DB.findOneAndUpdate(
      {},
      { $push: { [sectionName]: newItem } },
      { new: true, upsert: true }
    );

    res.status(201).json({ 
      success: true, 
      message: "Item added successfully",
      data: result[sectionName] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error adding item",
      error: error.message 
    });
  }
});

// Update specific item in section array
router.put("/update-item/:sectionName/:itemId", userAuth, adminAuth, async (req, res) => {
  try {
    const { sectionName, itemId } = req.params;
    const updateData = req.body;

    const result = await DB.findOneAndUpdate(
      { [`${sectionName}._id`]: itemId },
      { $set: { [`${sectionName}.$`]: updateData } },
      { new: true }
    );

    res.status(200).json({ 
      success: true, 
      message: "Item updated successfully",
      data: result 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating item",
      error: error.message 
    });
  }
});

// Delete item from section array
router.delete("/delete-item/:sectionName/:itemId", userAuth, adminAuth, async (req, res) => {
  try {
    const { sectionName, itemId } = req.params;

    const result = await DB.findOneAndUpdate(
      {},
      { $pull: { [sectionName]: { _id: itemId } } },
      { new: true }
    );

    res.status(200).json({ 
      success: true, 
      message: "Item deleted successfully",
      data: result 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error deleting item",
      error: error.message 
    });
  }
});

// Get specific section data
router.get("/section/:sectionName", userAuth, adminAuth, async (req, res) => {
  try {
    const { sectionName } = req.params;
    const document = await DB.findOne({});
    const sectionData = document?.[sectionName] || [];
    
    res.status(200).json({ success: true, data: sectionData });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching section data",
      error: error.message 
    });
  }
});

// Upload image (placeholder - you'll need to implement file upload)
router.post("/upload-image", userAuth, adminAuth, async (req, res) => {
  try {
    // This is a placeholder - implement actual file upload logic
    res.status(200).json({ 
      success: true, 
      message: "Image upload endpoint - implement file upload logic",
      imageUrl: "placeholder-url" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error uploading image",
      error: error.message 
    });
  }
});

// Bulk upload items from Excel
router.post("/bulk-upload/:sectionName", userAuth, adminAuth, async (req, res) => {
  try {
    const { sectionName } = req.params;
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format or empty data array"
      });
    }

    // Validate data based on section
    const validationErrors = [];
    data.forEach((item, index) => {
      const errors = validateBulkUploadItem(item, sectionName);
      if (errors.length > 0) {
        validationErrors.push({
          row: index + 1,
          errors
        });
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors found",
        errors: validationErrors
      });
    }

    // Add items to the database
    const result = await DB.findOneAndUpdate(
      {},
      { $push: { [sectionName]: { $each: data } } },
      { new: true, upsert: true }
    );

    logger.info('Bulk upload successful', { 
      sectionName, 
      count: data.length, 
      adminId: req.user._id 
    });

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${data.length} items to ${sectionName}`,
      data: result[sectionName]
    });
  } catch (error) {
    logger.error('Bulk upload error', { 
      error: error.message, 
      sectionName: req.params.sectionName, 
      adminId: req.user._id 
    });
    res.status(500).json({
      success: false,
      message: "Error uploading data",
      error: error.message
    });
  }
});

// Helper function to validate bulk upload items
const validateBulkUploadItem = (item, sectionName) => {
  const errors = [];

  switch (sectionName) {
    case 'Publications':
      if (!item.title || item.title.trim() === '') {
        errors.push('Title is required');
      }
      if (!item.subtitle || item.subtitle.trim() === '') {
        errors.push('Subtitle is required');
      }
      if (!item.body || item.body.trim() === '') {
        errors.push('Body is required');
      }
      break;
    case 'News':
      if (!item.title || item.title.trim() === '') {
        errors.push('Title is required');
      }
      if (!item.body || item.body.trim() === '') {
        errors.push('Body is required');
      }
      if (!item.date || item.date.trim() === '') {
        errors.push('Date is required');
      }
      break;
    case 'Events':
    case 'upevents':
    case 'pastEvents':
      if (!item.title || item.title.trim() === '') {
        errors.push('Title is required');
      }
      if (!item.body || item.body.trim() === '') {
        errors.push('Body is required');
      }
      if (!item.date || item.date.trim() === '') {
        errors.push('Date is required');
      }
      if (!item.location || item.location.trim() === '') {
        errors.push('Location is required');
      }
      break;
    default:
      if (!item.title || item.title.trim() === '') {
        errors.push('Title is required');
      }
  }

  return errors;
};

// User Management Routes

// Get all users with pagination
router.get("/users", userAuth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await userModel.find({})
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await userModel.countDocuments();
    
    res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching users', { error: error.message, adminId: req.user._id });
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
});

// Get all admin users
router.get("/admins", userAuth, adminAuth, async (req, res) => {
  try {
    const admins = await getAllAdmins();
    res.status(200).json({ success: true, admins });
  } catch (error) {
    logger.error('Error fetching admins', { error: error.message, adminId: req.user._id });
    res.status(500).json({
      success: false,
      message: "Error fetching admin users",
      error: error.message
    });
  }
});

// Search users (MUST be before parameterized routes)
router.get("/users/search", userAuth, adminAuth, async (req, res) => {
  try {
    const { q, role } = req.query;
    
    let query = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    const users = await userModel.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.status(200).json({ success: true, users });
  } catch (error) {
    logger.error('Error searching users', { error: error.message, adminId: req.user._id });
    res.status(500).json({
      success: false,
      message: "Error searching users",
      error: error.message
    });
  }
});

// Promote user to admin
router.put("/users/:userId/promote", userAuth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await promoteToAdmin(userId, req.user);
    
    res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      user: updatedUser
    });
  } catch (error) {
    logger.error('Error promoting user', { error: error.message, userId: req.params.userId, adminId: req.user._id });
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Demote admin to user
router.put("/users/:userId/demote", userAuth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await demoteFromAdmin(userId, req.user);
    
    res.status(200).json({
      success: true,
      message: "Admin demoted to user successfully",
      user: updatedUser
    });
  } catch (error) {
    logger.error('Error demoting user', { error: error.message, userId: req.params.userId, adminId: req.user._id });
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete user (soft delete by deactivating)
router.delete("/users/:userId", userAuth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent self-deletion
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }
    
    const user = await userModel.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    logger.info('User deleted by admin', {
      deletedUserId: userId,
      deletedUserEmail: user.email,
      adminId: req.user._id,
      adminEmail: req.user.email
    });
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    logger.error('Error deleting user', { error: error.message, userId: req.params.userId, adminId: req.user._id });
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message
    });
  }
});

// Get user statistics
router.get("/stats", userAuth, adminAuth, async (req, res) => {
  try {
    const stats = await getAdminStats();
    res.status(200).json({ success: true, stats });
  } catch (error) {
    logger.error('Error fetching stats', { error: error.message, adminId: req.user._id });
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message
    });
  }
});

export default router;
