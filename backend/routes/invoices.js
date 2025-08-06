const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const DO2 = require('../models/DO2');

// GET /api/invoices - Get all invoices with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      pushedToTally,
      dateFrom,
      dateTo,
      search,
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (pushedToTally !== undefined)
      filter.pushedToTally = pushedToTally === 'true';
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'metadata.customerName': { $regex: search, $options: 'i' } },
        { 'metadata.do2Number': { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const invoices = await Invoice.find(filter)
      .populate('do2Id', 'do2Number status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Invoice.countDocuments(filter);

    // Calculate summary statistics
    const summary = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalPushedToTally: {
            $sum: { $cond: ['$pushedToTally', 1, 0] },
          },
          totalAmount: { $sum: '$metadata.grandTotal' },
          averageAmount: { $avg: '$metadata.grandTotal' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        invoices,
        summary: summary[0] || {
          totalInvoices: 0,
          totalPushedToTally: 0,
          totalAmount: 0,
          averageAmount: 0,
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET /api/invoices/:id - Get specific invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('do2Id', 'do2Number status items poId')
      .populate(
        'do2Id.poId',
        'poNumber customerName customerAddress customerGstin customerPan'
      );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// POST /api/invoices - Create new invoice record
router.post('/', async (req, res) => {
  try {
    const { do2Id, invoicePDFPath, metadata } = req.body;

    // Validate required fields
    if (!do2Id) {
      return res.status(400).json({
        success: false,
        message: 'DO2 ID is required',
      });
    }

    // Check if invoice already exists for this DO2
    const existingInvoice = await Invoice.findOne({ do2Id });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Invoice already exists for this DO2',
      });
    }

    // Verify DO2 exists and is executed
    const do2 = await DO2.findById(do2Id);
    if (!do2) {
      return res.status(404).json({
        success: false,
        message: 'DO2 not found',
      });
    }

    if (do2.status !== 'executed') {
      return res.status(400).json({
        success: false,
        message: 'DO2 must be executed before creating invoice',
      });
    }

    // Create new invoice
    const invoice = new Invoice({
      do2Id,
      invoicePDFPath,
      metadata: {
        totalItems: metadata?.totalItems || 0,
        subtotal: metadata?.subtotal || 0,
        totalTax: metadata?.totalTax || 0,
        grandTotal: metadata?.grandTotal || 0,
        customerName: metadata?.customerName || '',
        do2Number: metadata?.do2Number || do2.do2Number,
      },
      status: 'generated',
      remarks: 'Invoice generated successfully',
    });

    await invoice.save();

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// PUT /api/invoices/:id/push-to-tally - Update invoice when pushed to Tally
router.put('/:id/push-to-tally', async (req, res) => {
  try {
    const { id } = req.params;
    const { tallyVoucherNumber, remarks } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Update invoice with Tally push information
    invoice.pushedToTally = true;
    invoice.pushedToTallyAt = new Date();
    invoice.tallyVoucherNumber = tallyVoucherNumber || `TALLY-${Date.now()}`;
    invoice.status = 'pushed_to_tally';
    invoice.remarks = remarks || 'Successfully pushed to Tally ERP';

    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice updated with Tally push information',
      data: invoice,
    });
  } catch (error) {
    console.error('Error updating invoice for Tally push:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// PUT /api/invoices/:id - Update invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const invoice = await Invoice.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice,
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET /api/invoices/:id/audit-trail - Get audit trail for an invoice
router.get('/:id/audit-trail', async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Get audit summary
    const auditSummary = invoice.getAuditSummary();

    res.json({
      success: true,
      message: 'Audit trail retrieved successfully',
      data: {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        do2Id: invoice.do2Id,
        auditTrail: invoice.auditTrail,
        auditSummary,
        totalEvents: invoice.auditTrail.length,
      },
    });
  } catch (error) {
    console.error('Error fetching audit trail:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// POST /api/invoices/:id/audit-entry - Add manual audit entry
router.post('/:id/audit-entry', async (req, res) => {
  try {
    const { id } = req.params;
    const { event, performedBy, notes, metadata } = req.body;

    if (!event) {
      return res.status(400).json({
        success: false,
        message: 'Event is required',
      });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Add audit entry
    await invoice.addAuditEntry(
      event,
      performedBy || 'system',
      notes || '',
      metadata || {}
    );

    res.json({
      success: true,
      message: 'Audit entry added successfully',
      data: {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        latestEntry: invoice.getLatestAuditEntry(),
      },
    });
  } catch (error) {
    console.error('Error adding audit entry:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
