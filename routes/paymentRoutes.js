import express from 'express';
import { 
  processPayment, 
  getMembershipStatus, 
  getTransactionHistory,
  getMembershipPricing,
  createPaymentIntent,
  initiateRefund,
  renewMembership,
  getPaymentAnalytics,
  handleStripeWebhook
} from '../controller/paymentController.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
// Get membership pricing
router.get('/pricing', getMembershipPricing);

// Stripe webhook (no auth required)
router.post('/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

// User routes (require authentication)
// Create payment intent
router.post('/create-intent', userAuth, createPaymentIntent);

// Process payment after successful intent
router.post('/process', userAuth, processPayment);

// Get user's membership status
router.get('/membership-status', userAuth, getMembershipStatus);

// Get user's transaction history
router.get('/transactions', userAuth, getTransactionHistory);

// Initiate refund
router.post('/refund', userAuth, initiateRefund);

// Renew membership
router.post('/renew', userAuth, renewMembership);

// Admin routes (require admin authentication)
// Get payment analytics
router.get('/analytics', adminAuth, getPaymentAnalytics);

export default router;

