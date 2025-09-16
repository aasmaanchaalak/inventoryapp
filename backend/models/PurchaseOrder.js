const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: [0.1, 'Quantity must be at least 0.1 tons'],
    max: [10000, 'Quantity cannot exceed 10,000 tons'],
  },
  rate: {
    type: Number,
    required: true,
    min: [1, 'Rate must be at least ₹1'],
    max: [1000000, 'Rate cannot exceed ₹10,00,000'],
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax percentage cannot be negative'],
    max: [100, 'Tax percentage cannot exceed 100%'],
  },
  hsnCode: {
    type: String,
    required: true,
    default: '7306',
  },
  subtotal: {
    type: Number,
    required: true,
  },
  taxAmount: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required'],
    },
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: [true, 'Quotation reference is required'],
    },
    poNumber: {
      type: String,
      unique: true,
      required: function () {
        return !this.isNew; // Only require after document is created
      },
    },
    poDate: {
      type: Date,
      required: [true, 'PO date is required'],
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot be more than 1000 characters'],
    },
    items: {
      type: [poItemSchema],
      required: [true, 'At least one item is required'],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'At least one item is required',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    quotationNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'dispatched', 'partial dispatch'],
      default: 'pending',
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    inventoryStatus: {
      type: String,
      enum: ['Inventory Available', 'Partial Inventory', 'No Inventory', 'Not Checked'],
      default: 'Not Checked',
    },
    dispatchDate: {
      type: Date,
      required: false,
    },
    companyInfo: {
      name: {
        type: String,
        default: 'Vikash Steel Tubes',
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

// Generate PO number before saving
purchaseOrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.poNumber) {
    try {
      const count = await this.constructor.countDocuments();
      const year = new Date().getFullYear();
      this.poNumber = `PO-${year}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Virtual for formatted PO date
purchaseOrderSchema.virtual('formattedPoDate').get(function () {
  if (!this.poDate) return 'Not available';
  return this.poDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Ensure virtual fields are serialized
purchaseOrderSchema.set('toJSON', { virtuals: true });
purchaseOrderSchema.set('toObject', { virtuals: true });

// Create indexes for better performance
purchaseOrderSchema.index({ leadId: 1, createdAt: -1 });
purchaseOrderSchema.index({ quotationId: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ poDate: -1 });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
