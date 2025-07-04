import express from 'express';
import { getUserData, updateProfile, updatePassword } from '../controller/userController.js';
import userAuth from '../middleware/userAuth.js';
import { 
  validateProfileUpdate, 
  validatePasswordUpdate,
  handleValidationErrors 
} from '../middleware/validation.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.put('/profile', userAuth, validateProfileUpdate, handleValidationErrors, updateProfile);
userRouter.put('/password', userAuth, validatePasswordUpdate, handleValidationErrors, updatePassword);

export default userRouter;
