const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    do2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DO2',
      required: [true, 'DO2 reference is required'],
      unique: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    pushedToTally: {
      type: Boolean,
      default: false,
    },
    pushedToTallyAt: {
      type: Date,
      default: null,
    },
    tallyVoucherNumber: {
      type: String,
      default: null,
    },
    invoicePDFPath: {
      type: String,
      default: null,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['generated', 'pushed_to_tally', 'failed'],
      default: 'generated',
    },
    metadata: {
      totalItems: {
        type: Number,
        default: 0,
      },
      subtotal: {
        type: Number,
        default: 0,
      },
      totalTax: {
        type: Number,
        default: 0,
      },
      grandTotal: {
        type: Number,
        default: 0,
      },
      customerName: {
        type: String,
        default: '',
      },
      do2Number: {
        type: String,
        default: '',
      },
    },
    remarks: {
      type: String,
      default: '',
    },
    auditTrail: [
      {
        event: {
          type: String,
          enum: [
            'generated',
            'downloaded',
            'emailed',
            'tally_push',
            'tally_push_success',
            'tally_push_failed',
            'viewed',
            'modified',
            'deleted',
          ],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        performedBy: {
          type: String,
          required: true,
          default: 'system',
        },
        notes: {
          type: String,
          default: '',
        },
        metadata: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate invoice number before saving
invoiceSchema.pre('save', async function (next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      invoiceNumber: { $regex: `^INV-${year}-` },
    });
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for formatted date
invoiceSchema.virtual('formattedDate').get(function () {
  if (!this.date) return 'Not available';
  return this.date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Virtual for formatted generated date
invoiceSchema.virtual('formattedGeneratedAt').get(function () {
  if (!this.generatedAt) return 'Not available';
  return this.generatedAt.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Virtual for formatted pushed to tally date
invoiceSchema.virtual('formattedPushedToTallyAt').get(function () {
  if (!this.pushedToTallyAt) return 'Not available';
  return this.pushedToTallyAt.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Ensure virtual fields are serialized
invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

// Create indexes for better performance
invoiceSchema.index({ date: -1 });
invoiceSchema.index({ pushedToTally: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ 'auditTrail.event': 1 });
invoiceSchema.index({ 'auditTrail.timestamp': -1 });

// Helper method to add audit trail entry
invoiceSchema.methods.addAuditEntry = function (
  event,
  performedBy = 'system',
  notes = '',
  metadata = {}
) {
  this.auditTrail.push({
    event,
    timestamp: new Date(),
    performedBy,
    notes,
    metadata,
  });
  return this.save();
};

// Helper method to get audit trail by event type
invoiceSchema.methods.getAuditTrailByEvent = function (event) {
  return this.auditTrail.filter((entry) => entry.event === event);
};

// Helper method to get latest audit entry
invoiceSchema.methods.getLatestAuditEntry = function () {
  if (this.auditTrail.length === 0) return null;
  return this.auditTrail[this.auditTrail.length - 1];
};

// Helper method to get audit trail summary
invoiceSchema.methods.getAuditSummary = function () {
  const summary = {};
  this.auditTrail.forEach((entry) => {
    if (!summary[entry.event]) {
      summary[entry.event] = {
        count: 0,
        lastOccurrence: null,
        performedBy: [],
      };
    }
    summary[entry.event].count++;
    summary[entry.event].lastOccurrence = entry.timestamp;
    if (!summary[entry.event].performedBy.includes(entry.performedBy)) {
      summary[entry.event].performedBy.push(entry.performedBy);
    }
  });
  return summary;
};

module.exports = mongoose.model('Invoice', invoiceSchema);
