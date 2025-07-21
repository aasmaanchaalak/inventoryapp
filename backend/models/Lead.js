const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot be more than 20 characters'],
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot be more than 100 characters'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    address: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, 'Address cannot be more than 500 characters'],
    },
    gstin: {
      type: String,
      required: false,
      trim: true,
      maxlength: [15, 'GSTIN cannot be more than 15 characters'],
    },
    pan: {
      type: String,
      required: false,
      trim: true,
      maxlength: [10, 'PAN cannot be more than 10 characters'],
    },
    product: {
      type: String,
      required: [true, 'Product interest is required'],
      enum: {
        values: [
          'square-tubes',
          'rectangular-tubes',
          'round-tubes',
          'oval-tubes',
          'custom-steel-products',
        ],
        message: 'Please select a valid product category',
      },
    },
    source: {
      type: String,
      required: [true, 'Lead source is required'],
      enum: {
        values: [
          'website',
          'social-media',
          'referral',
          'cold-call',
          'email-campaign',
          'trade-show',
          'advertising',
          'other',
        ],
        message: 'Please select a valid lead source',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot be more than 1000 characters'],
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt fields
  }
);

// Create a compound index for better query performance
leadSchema.index({ name: 1, phone: 1 });

// Add a virtual field for formatted creation date
leadSchema.virtual('formattedCreatedAt').get(function () {
  if (!this.createdAt) {
    return 'Not available';
  }
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Ensure virtual fields are serialized
leadSchema.set('toJSON', { virtuals: true });
leadSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Lead', leadSchema);
