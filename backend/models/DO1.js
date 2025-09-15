const mongoose = require('mongoose');

const do1ItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'square-tubes',
      'rectangular-tubes',
      'round-tubes',
      'oval-tubes',
      'custom-steel-products',
    ],
  },
  size: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Size cannot be more than 50 characters'],
  },
  thickness: {
    type: Number,
    required: true,
    min: [0.1, 'Thickness must be at least 0.1mm'],
    max: [50, 'Thickness cannot exceed 50mm'],
  },
  availableStock: {
    type: Number,
    required: false,
    min: [0, 'Available stock cannot be negative'],
  },
  dispatchedQuantity: {
    type: Number,
    required: true,
    min: [0.1, 'Dispatched quantity must be at least 0.1 tons'],
  },
  rate: {
    type: Number,
    required: true,
    min: [1, 'Rate must be at least ₹1'],
    max: [1000000, 'Rate cannot exceed ₹10,00,000'],
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative'],
  },
  hsnCode: {
    type: String,
    required: true,
    default: '7306',
  },
  originalQuantity: {
    type: Number,
    required: false,
  },
});

const do1Schema = new mongoose.Schema(
  {
    doNumber: {
      type: String,
      unique: true,
      required: false,
    },
    poId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: [true, 'PO reference is required'],
    },
    dispatchDate: {
      type: Date,
      required: [true, 'Dispatch date is required'],
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot be more than 1000 characters'],
    },
    items: {
      type: [do1ItemSchema],
      required: [true, 'At least one item is required'],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'At least one item is required',
      },
    },
    totals: {
      subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative'],
      },
      totalTax: {
        type: Number,
        required: true,
        min: [0, 'Total tax cannot be negative'],
      },
      grandTotal: {
        type: Number,
        required: true,
        min: [0, 'Grand total cannot be negative'],
      },
    },
    status: {
      type: String,
      enum: ['pending', 'executed', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
    dispatchTeam: {
      name: {
        type: String,
        default: 'Dispatch Team',
      },
      contact: {
        type: String,
        default: '+91-9876543210',
      },
    },
    companyInfo: {
      name: {
        type: String,
        default: 'Vikash Steel Tubes.',
      },
      address: {
        type: String,
        default: '123 Industrial Area, Manufacturing District, City - 123456',
      },
      phone: {
        type: String,
        default: '+91-9876543210',
      },
      email: {
        type: String,
        default: 'info@steeltubeindustries.com',
      },
      gstin: {
        type: String,
        default: '22AAAAA0000A1Z5',
      },
      pan: {
        type: String,
        default: 'AAAAA0000A',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Generate DO number before validation (this runs before validation)
do1Schema.pre('validate', async function (next) {
  console.log(
    'Pre-validate hook running, isNew:',
    this.isNew,
    'current doNumber:',
    this.doNumber
  );
  if (this.isNew && !this.doNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.doNumber = `DO-${year}-${String(count + 1).padStart(4, '0')}`;
    console.log('Generated doNumber:', this.doNumber);
  }
  next();
});

// Virtual for formatted dispatch date
do1Schema.virtual('formattedDispatchDate').get(function () {
  if (!this.dispatchDate) return 'Not available';
  return this.dispatchDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Ensure virtual fields are serialized
do1Schema.set('toJSON', { virtuals: true });
do1Schema.set('toObject', { virtuals: true });

// Create indexes for better performance
do1Schema.index({ poId: 1, createdAt: -1 });
do1Schema.index({ status: 1 });
do1Schema.index({ dispatchDate: -1 });

module.exports = mongoose.model('DO1', do1Schema);
