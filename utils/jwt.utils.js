import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    if (!user || !user._id) {
      throw new Error('User object is invalid');
    }

    return jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email // Add email for additional verification
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '365d', // Changed from '30d' to '365d' for longer sessions
        issuer: 'your-app-name',
        audience: 'your-app-users'
      }
    );
  } catch (error) {
    console.error('JWT Access Token Generation Error:', error.message);
    throw new Error(`Failed to generate access token: ${error.message}`);
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
      { 
        id: user._id,
        tokenType: 'refresh' // Add token type for security
      },
      process.env.JWT_REFRESH_SECRET,
      { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '10y', // Changed from '90d' to '10y' for "forever" login
        issuer: 'your-app-name',
        audience: 'your-app-users'
      }
    );
  } catch (error) {
    console.error('JWT Refresh Token Generation Error:', error.message);
    throw new Error(`Failed to generate refresh token: ${error.message}`);
  }
};

export const verifyAccessToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    if (!token) {
      throw new Error('Token is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'your-app-name',
      audience: 'your-app-users'
    });

    // Additional validation
    if (!decoded.id) {
      throw new Error('Invalid token payload');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Access token not active yet');
    }
    
    console.error('JWT Access Token Verification Error:', error.message);
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

export const verifyRefreshToken = (token) => {
  try {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    if (!token) {
      throw new Error('Refresh token is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'your-app-name',
      audience: 'your-app-users'
    });

    // Additional validation
    if (!decoded.id || decoded.tokenType !== 'refresh') {
      throw new Error('Invalid refresh token payload');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Refresh token not active yet');
    }
    
    console.error('JWT Refresh Token Verification Error:', error.message);
    throw new Error(`Refresh token verification failed: ${error.message}`);
  }
};

// Additional utility functions for "forever" login

export const generateTokenPair = (user) => {
  try {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '365d'
    };
  } catch (error) {
    console.error('Token pair generation error:', error.message);
    throw new Error(`Failed to generate token pair: ${error.message}`);
  }
};

export const decodeTokenWithoutVerification = (token) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }
    
    return jwt.decode(token, { complete: true });
  } catch (error) {
    console.error('Token decode error:', error.message);
    throw new Error(`Failed to decode token: ${error.message}`);
  }
};

export const getTokenExpiry = (token) => {
  try {
    const decoded = decodeTokenWithoutVerification(token);
    if (decoded && decoded.payload && decoded.payload.exp) {
      return new Date(decoded.payload.exp * 1000);
    }
    return null;
  } catch (error) {
    console.error('Get token expiry error:', error.message);
    return null;
  }
};

export const isTokenExpired = (token) => {
  try {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;
    
    return Date.now() >= expiry.getTime();
  } catch (error) {
    console.error('Token expiry check error:', error.message);
    return true;
  }
};

// For development/debugging purposes
export const getTokenInfo = (token) => {
  try {
    const decoded = decodeTokenWithoutVerification(token);
    if (!decoded) return null;
    
    const { header, payload } = decoded;
    const expiry = payload.exp ? new Date(payload.exp * 1000) : null;
    const issued = payload.iat ? new Date(payload.iat * 1000) : null;
    
    return {
      header,
      payload: {
        ...payload,
        exp: expiry,
        iat: issued,
        isExpired: expiry ? Date.now() >= expiry.getTime() : false
      }
    };
  } catch (error) {
    console.error('Get token info error:', error.message);
    return null;
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  decodeTokenWithoutVerification,
  getTokenExpiry,
  isTokenExpired,
  getTokenInfo
};
