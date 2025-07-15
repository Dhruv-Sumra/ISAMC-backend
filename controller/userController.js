import userModel from "../models/userModel.js"
import bcrypt from "bcryptjs"

export const getUserData = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    return res.json({
      success: true,
      userData: user
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      contact, 
      bio, 
      institute, 
      designation, 
      gender, 
      expertise, 
      dateOfBirth, 
      linkedinUrl 
    } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !contact || !bio || !institute || !designation || !gender || !expertise || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided: name, contact, bio, institute, designation, gender, expertise, and dateOfBirth'
      });
    }

    // Update user profile
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        name,
        contact,
        bio,
        institute,
        designation,
        gender,
        expertise,
        dateOfBirth,
        linkedinUrl: linkedinUrl || ""
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
