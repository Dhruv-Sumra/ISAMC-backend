import jwt from 'jsonwebtoken'


export const generateAccessToken = (user) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    if (!user || !user._id) {
      throw new Error('User object is invalid');
    }
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
  } catch (error) {
    console.error('JWT Access Token Generation Error:', error.message);
    throw error;
  }
};

export const generateRefreshToken = (user) => {
  try {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    if (!user || !user._id) {
      throw new Error('User object is invalid');
    }
    return jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  } catch (error) {
    console.error('JWT Refresh Token Generation Error:', error.message);
    throw error;
  }
};

export const verifyAccessToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('JWT Access Token Verification Error:', error.message);
    throw error;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    console.error('JWT Refresh Token Verification Error:', error.message);
    throw error;
  }
};

// module.exports = {
//   generateAccessToken,
//   generateRefreshToken,
//   verifyAccessToken,
//   verifyRefreshToken,
// };
    