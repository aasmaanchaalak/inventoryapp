const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Item type is required'],
    enum: {
      values: ['square', 'rectangular', 'round', 'oval'],
      message: 'Please select a valid item type'
    }
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    trim: true,
    maxlength: [50, 'Size cannot be more than 50 characters']
  },
  thickness: {
    type: Number,
    required: [true, 'Thickness is required'],
    min: [0.1, 'Thickness must be at least 0.1mm'],
    max: [50, 'Thickness cannot exceed 50mm']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.1, 'Quantity must be at least 0.1 tons'],
    max: [10000, 'Quantity cannot exceed 10,000 tons']
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    min: [1, 'Rate must be at least ₹1'],
    max: [1000000, 'Rate cannot exceed ₹10,00,000']
  },
  tax: {
    type: Number,
    required: [true, 'Tax percentage is required'],
    min: [0, 'Tax percentage cannot be negative'],
    max: [100, 'Tax percentage cannot exceed 100%']
  },
  hsnCode: {
    type: String,
    required: true,
    default: '7306' // Default HSN code for steel tubes
  },
  subtotal: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

const quotationSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: [true, 'Lead reference is required']
  },
  items: {
    type: [itemSchema],
    required: [true, 'At least one item is required'],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'At least one item is required'
    }
  },
  validity: {
    type: Number,
    required: [true, 'Quotation validity is required'],
    min: [1, 'Validity must be at least 1 day'],
    max: [365, 'Validity cannot exceed 365 days']
  },
  deliveryTerms: {
    type: String,
    required: [true, 'Delivery terms are required'],
    trim: true,
    maxlength: [2000, 'Delivery terms cannot be more than 2000 characters']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  quotationNumber: {
    type: String,
    unique: true,
    required: false  // Will be set by pre-save middleware
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  validUntil: {
    type: Date,
    required: false  // Will be set by pre-save middleware
  },
  companyInfo: {
    name: {
      type: String,
      default: 'Steel Tube Industries Ltd.'
    },
    address: {
      type: String,
      default: '123 Industrial Area, Manufacturing District, City - 123456'
    },
    phone: {
      type: String,
      default: '+91-9876543210'
    },
    email: {
      type: String,
      default: 'info@steeltubeindustries.com'
    },
    gstin: {
      type: String,
      default: '22AAAAA0000A1Z5'
    },
    pan: {
      type: String,
      default: 'AAAAA0000A'
    }
  }
}, {
  timestamps: true
});

// Generate quotation number and validUntil before saving
quotationSchema.pre('save', async function(next) {
  if (this.isNew && !this.quotationNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.quotationNumber = `QT-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate valid until date if not set
  if (!this.validUntil && this.validity) {
    this.validUntil = new Date();
    this.validUntil.setDate(this.validUntil.getDate() + this.validity);
  }
  
  next();
});

// Virtual for formatted valid until date
quotationSchema.virtual('formattedValidUntil').get(function() {
  if (!this.validUntil) {
    return 'Not available';
  }
  return this.validUntil.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for checking if quotation is expired
quotationSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

// Ensure virtual fields are serialized
quotationSchema.set('toJSON', { virtuals: true });
quotationSchema.set('toObject', { virtuals: true });

// Create indexes for better performance
quotationSchema.index({ leadId: 1, createdAt: -1 });
quotationSchema.index({ quotationNumber: 1 });
quotationSchema.index({ status: 1 });
quotationSchema.index({ validUntil: 1 });

module.exports = mongoose.model('Quotation', quotationSchema); 