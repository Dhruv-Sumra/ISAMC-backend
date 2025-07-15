import express from 'express';
import { login, logout, register, sendVerifyOtp, verifyEmail, sendResetOtp, resetPassword, refreshToken, getServerTime } from '../controller/authController.js';
import userAuth from '../middleware/userAuth.js';
import { 
  validateRegister, 
  validateLogin, 
  validateOTP, 
  validatePasswordReset,
  handleValidationErrors 
} from '../middleware/validation.js';

const authRouter = express.Router();

authRouter.get('/server-time', getServerTime);
authRouter.post('/register', validateRegister, handleValidationErrors, register);
authRouter.post('/login', validateLogin, handleValidationErrors, login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, validateOTP, handleValidationErrors, verifyEmail);
authRouter.post('/send-reset-password', sendResetOtp);
authRouter.post('/reset-password', validatePasswordReset, handleValidationErrors, resetPassword);
authRouter.get('/refresh', refreshToken);
authRouter.post('/verify-email', verifyEmail);

export default authRouter;
