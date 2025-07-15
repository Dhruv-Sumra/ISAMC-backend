import express from 'express';
import { sendContactMessage, sendMembershipApplication } from '../controller/contactController.js';
import { validateContact, handleValidationErrors } from '../middleware/validation.js';

const contactRouter = express.Router();

contactRouter.post('/send-message', validateContact, handleValidationErrors, sendContactMessage);
contactRouter.post('/send-membership-application', sendMembershipApplication);

export default contactRouter;
