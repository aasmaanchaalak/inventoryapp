const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    productType: {
      type: String,
      required: [true, 'Product type is required'],
      enum: [
        'square-tubes',
        'rectangular-tubes',
        'round-tubes',
        'oval-tubes',
        'custom-steel-products',
      ],
      trim: true,
    },
    size: {
      type: String,
      required: [true, 'Size is required'],
      trim: true,
      maxlength: [50, 'Size cannot be more than 50 characters'],
    },
    thickness: {
      type: Number,
      required: [true, 'Thickness is required'],
      min: [0.1, 'Thickness must be at least 0.1mm'],
      max: [50, 'Thickness cannot exceed 50mm'],
    },
    availableQty: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative'],
      max: [100000, 'Available quantity cannot exceed 100,000 tons'],
    },
    hsnCode: {
      type: String,
      required: true,
      default: '7306',
    },
    unit: {
      type: String,
      required: true,
      default: 'tons',
      enum: ['tons', 'kg', 'pieces'],
    },
    rate: {
      type: Number,
      required: true,
      min: [1, 'Rate must be at least ₹1'],
      max: [1000000, 'Rate cannot exceed ₹10,00,000'],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    lastTransaction: {
      type: {
        type: String,
        enum: ['in', 'out', 'adjustment'],
        default: 'out',
      },
      quantity: {
        type: Number,
        default: 0,
      },
      transactionDate: {
        type: Date,
        default: Date.now,
      },
      reference: {
        type: String,
        default: null,
      },
      remarks: {
        type: String,
        default: '',
      },
    },
    minStockLevel: {
      type: Number,
      default: 0,
      min: [0, 'Minimum stock level cannot be negative'],
    },
    maxStockLevel: {
      type: Number,
      default: 10000,
      min: [0, 'Maximum stock level cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    location: {
      warehouse: {
        type: String,
        default: 'Main Warehouse',
      },
      section: {
        type: String,
        default: 'Steel Tubes',
      },
      rack: {
        type: String,
        default: null,
      },
    },
    supplier: {
      name: {
        type: String,
        default: 'Vikash Steel Tubes.',
      },
      contact: {
        type: String,
        default: '+91-9876543210',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for unique product identification
inventorySchema.index(
  { productType: 1, size: 1, thickness: 1 },
  { unique: true }
);

// Create indexes for better performance
inventorySchema.index({ availableQty: 1 });
inventorySchema.index({ lastUpdated: -1 });
inventorySchema.index({ isActive: 1 });
inventorySchema.index({ 'location.warehouse': 1 });

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function () {
  if (this.availableQty <= this.minStockLevel) {
    return 'low';
  } else if (this.availableQty >= this.maxStockLevel * 0.8) {
    return 'high';
  } else {
    return 'normal';
  }
});

// Virtual for formatted last updated
inventorySchema.virtual('formattedLastUpdated').get(function () {
  if (!this.lastUpdated) {
    return 'Not available';
  }
  return this.lastUpdated.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Virtual for stock percentage
inventorySchema.virtual('stockPercentage').get(function () {
  if (this.maxStockLevel === 0) return 0;
  return Math.round((this.availableQty / this.maxStockLevel) * 100);
});

// Ensure virtual fields are serialized
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

// Pre-save middleware to update lastUpdated
inventorySchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to find or create inventory item
inventorySchema.statics.findOrCreate = async function (productData) {
  const { productType, size, thickness } = productData;

  let inventory = await this.findOne({ productType, size, thickness });

  if (!inventory) {
    inventory = new this({
      ...productData,
      availableQty: 0,
      rate: productData.rate || 45000,
    });
    await inventory.save(); // Save the new inventory item
    console.log(
      `Created new inventory item: ${productType} ${size} ${thickness}mm`
    );
  }

  return inventory;
};

// Instance method to update stock
inventorySchema.methods.updateStock = async function (
  quantity,
  transactionType,
  reference,
  remarks
) {
  const oldQty = this.availableQty;

  if (transactionType === 'out') {
    if (this.availableQty < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${this.availableQty} tons, Requested: ${quantity} tons`
      );
    }
    this.availableQty -= quantity;
  } else if (transactionType === 'in') {
    this.availableQty += quantity;
  } else if (transactionType === 'adjustment') {
    this.availableQty = quantity;
  }

  // Update last transaction details
  this.lastTransaction = {
    type: transactionType,
    quantity: Math.abs(quantity),
    transactionDate: new Date(),
    reference: reference || null,
    remarks: remarks || '',
  };

  await this.save();

  return {
    oldQuantity: oldQty,
    newQuantity: this.availableQty,
    change: this.availableQty - oldQty,
    transactionType,
    reference,
  };
};

module.exports = mongoose.model('Inventory', inventorySchema);
