import express from 'express';

const userRouter = express.Router();
import { getUserData, updateProfile, updatePassword } from '../controller/userController.js';
import userAuth from '../middleware/userAuth.js';
import { 
  validateProfileUpdate, 
  validatePasswordUpdate,
  handleValidationErrors 
} from '../middleware/validation.js';
import { uploadProfilePicture } from '../controller/userController.js';

userRouter.get('/data', userAuth, getUserData);
userRouter.put('/profile', userAuth, validateProfileUpdate, handleValidationErrors, updateProfile);
userRouter.put('/password', userAuth, validatePasswordUpdate, handleValidationErrors, updatePassword);

export default userRouter;
