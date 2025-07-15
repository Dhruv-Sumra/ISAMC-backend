import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  membershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'membership',
    required: false // Not required for failed transactions
  },
  paymentIntentId: {
    type: String,
    required: false // May not be available for some payment methods
  },
  transactionId: {
    type: String,
    required: true,
    default: function() {
      return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'inr'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'razorpay', 'bank_transfer', 'upi', 'wallet']
  },
  paymentGatewayResponse: {
    type: mongoose.Schema.Types.Mixed, // Store raw response from payment gateway
    default: {}
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  membershipType: {
    type: String,
    required: true
  },
  membershipDuration: {
    type: String,
    required: true,
    enum: ['annual', 'lifetime']
  },
  // Additional transaction details
  description: {
    type: String,
    default: function() {
      return `Payment for ${this.membershipType} membership (${this.membershipDuration})`;
    }
  },
  failureReason: {
    type: String,
    required: false
  },
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundDate: Date,
    refundReason: String,
    refundStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed']
    }
  },
  // Billing address (optional)
  billingAddress: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  // Metadata for additional information
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ transactionDate: -1 });
transactionSchema.index({ paymentIntentId: 1 });
transactionSchema.index({ transactionId: 1 }, { unique: true });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `${this.currency.toUpperCase()} ${this.amount.toFixed(2)}`;
});

// Method to check if transaction can be refunded
transactionSchema.methods.canRefund = function() {
  if (this.status !== 'completed') return false;
  if (this.refundDetails && this.refundDetails.refundStatus === 'completed') return false;
  
  // Allow refunds within 30 days of transaction
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.transactionDate > thirtyDaysAgo;
};

// Static method to get transaction statistics
transactionSchema.statics.getStats = function(startDate, endDate) {
  const matchConditions = {
    transactionDate: {
      $gte: startDate || new Date(0),
      $lte: endDate || new Date()
    }
  };

  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $group: {
        _id: null,
        stats: {
          $push: {
            status: '$_id',
            count: '$count',
            totalAmount: '$totalAmount',
            avgAmount: '$avgAmount'
          }
        },
        totalTransactions: { $sum: '$count' },
        totalRevenue: {
          $sum: {
            $cond: [
              { $eq: ['$_id', 'completed'] },
              '$totalAmount',
              0
            ]
          }
        }
      }
    }
  ]);
};

// Static method to get monthly revenue
transactionSchema.statics.getMonthlyRevenue = function(year) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        transactionDate: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$transactionDate' },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
};

const transactionModel = mongoose.models.transaction || mongoose.model('transaction', transactionSchema);

export default transactionModel;
