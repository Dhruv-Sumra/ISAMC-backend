import express from 'express';
import { sendContactMessage } from '../controller/contactController.js';
import { validateContact, handleValidationErrors } from '../middleware/validation.js';

const contactRouter = express.Router();

contactRouter.post('/send-message', validateContact, handleValidationErrors, sendContactMessage);

export default contactRouter;
