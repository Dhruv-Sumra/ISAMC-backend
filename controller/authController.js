import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.utils.js";

// Store server start time
const serverStartTime = Date.now();

// Get server start time endpoint
export const getServerTime = async (req, res) => {
  try {
    return res.json({
      success: true,
      serverStartTime: serverStartTime
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// export const googleAuth = (req, res, next) => {
//   passport.authenticate('google', {
//     scope: ['profile', 'email']
//   })(req, res, next);
// };

// Google Auth Callback
// export const googleAuthCallback = (req, res, next) => {
//   passport.authenticate('google', {
//     failureRedirect: '/login',
//     session: false
//   }, async (err, user, info) => {
//     try {
//       if (err || !user) {
//         console.error('Google authentication failed:', err || 'No user returned');
//         return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
//       }

//       if (!process.env.JWT_SECRET) {
//         throw new Error('JWT_SECRET is not defined');
//       }

//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//         expiresIn: '7d'
//       });

//       const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

//       res.cookie('token', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//         domain: process.env.COOKIE_DOMAIN || undefined
//       });

//       res.redirect(frontendUrl);
//     } catch (error) {
//       console.error('Error in Google auth callback:', error);
//       res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
//     }
//   })(req, res, next);
// };

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "User already exists with this email address" 
      });
    }

    const user = new userModel({ name, email, password });
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();
    const accessToken = generateAccessToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to dhruv's website",
      text: `Welcome message from My website and here is your OTP: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email,
        contact: user.contact || "",
        bio: user.bio || "",
        role: user.role || "user",
        isVerified: user.isVerified || false,
        createdAt: user.createdAt
      },
      accessToken,
      serverStartTime: serverStartTime,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Registration failed. Please try again." 
    });
  }
};

// Ensure login returns user data immediately
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "user not found" });
    }
    const isMatch = await user.comparePassword(password);
    console.log(isMatch);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    const accessToken = generateAccessToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return user data with login response
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      contact: user.contact || "",
      bio: user.bio || "",
      role: user.role || "user",
      isVerified: user.isVerified || false,
      createdAt: user.createdAt
    };

    return res.json({
      success: true,
      message: "Login successful",
      accessToken,
      user: userData,
      serverStartTime: serverStartTime,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    res.clearCookie("refreshToken");
    if (token) {
      await userModel.findOneAndUpdate(
        { refreshToken: token },
        { refreshToken: "" }
      );
    }

    return res.status(200).json({ success: true, message: "Logged Out" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const refreshToken = async (req, res) => {
  try {
    console.log("Refresh token request received");
    
    // Check if JWT secrets are available
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.error("JWT secrets not configured");
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error" 
      });
    }
    
    const token = req.cookies.refreshToken;
    console.log("Refresh token from cookies:", token ? "Token exists" : "No token");
    
    if (!token) {
      console.log("No refresh token in cookies");
      return res.status(401).json({ 
        success: false, 
        message: "No refresh token provided" 
      });
    }
    
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
      console.log("Token decoded successfully:", decoded.id);
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError.message);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired refresh token" 
      });
    }
    
    const user = await userModel.findById(decoded.id);
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    if (user.refreshToken !== token) {
      console.log("Token mismatch in database");
      return res.status(401).json({ 
        success: false, 
        message: "Token mismatch" 
      });
    }
    
    // Generate new access and refresh tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Save the new refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();
    
    // Set new refresh token in HTTP-only cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    console.log("Refresh token successful");
    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact || "",
        bio: user.bio || "",
        role: user.role || "user",
        isVerified: user.isVerified || false,
        createdAt: user.createdAt
      },
      serverStartTime: serverStartTime,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error during token refresh" 
    });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification OTP",
      text: `Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Verification OTP sent" });
  } catch (err) {
    console.error("Send verify OTP error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP Expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res.json({ success: true, message: "Verification successful" });
  } catch (err) {
    console.error("Email verification error:", err);
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// Update isAuthenticated to match frontend expectations

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password reset OTP",
      text: `Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP and new password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    

    user.password = newPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};
