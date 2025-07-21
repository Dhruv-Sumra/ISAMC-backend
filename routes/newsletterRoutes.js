import express from 'express';
import { subscribe, sendNewsletter } from '../controller/newsletterController.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// @route   POST api/newsletter/subscribe
// @desc    Subscribe to the newsletter
// @access  Public
router.post('/subscribe', subscribe);

// @route   POST api/newsletter/send
// @desc    Send a newsletter to all subscribers
// @access  Private/Admin
router.post('/send', userAuth, adminAuth, sendNewsletter);

export default router; 