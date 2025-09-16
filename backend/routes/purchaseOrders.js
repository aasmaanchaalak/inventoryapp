const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');
const DO1 = require('../models/DO1');
const DO2 = require('../models/DO2');
const Invoice = require('../models/Invoice');

// POST /api/pos - Create a new Purchase Order
router.post('/', async (req, res) => {
  try {
    const { quotationId, leadId, remarks, customItems, customTotalAmount } =
      req.body;

    // Validate required fields
    if (!quotationId || !leadId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: quotationId and leadId',
      });
    }

    // Validate that lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Validate that quotation exists and fetch with details
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found',
      });
    }

    // Use custom items if provided, otherwise copy from quotation
    const items = customItems
      ? customItems.map((item) => ({
          type: item.type,
          size: item.size,
          thickness: item.thickness,
          quantity: item.quantity,
          rate: item.rate,
          tax: item.tax,
          hsnCode: item.hsnCode || '7306',
          subtotal: item.subtotal,
          taxAmount: item.taxAmount,
          total: item.total,
        }))
      : quotation.items.map((item) => ({
          type: item.type,
          size: item.size,
          thickness: item.thickness,
          quantity: item.quantity,
          rate: item.rate,
          tax: item.tax,
          hsnCode: item.hsnCode || '7306',
          subtotal: item.subtotal,
          taxAmount: item.taxAmount,
          total: item.total,
        }));

    // Use custom total amount if provided, otherwise use quotation total
    const totalAmount =
      customTotalAmount !== undefined
        ? customTotalAmount
        : quotation.totalAmount;

    // Create the purchase order with copied data
    const purchaseOrder = new PurchaseOrder({
      leadId,
      quotationId,
      poDate: new Date(),
      remarks: remarks || '',
      items: items,
      totalAmount: totalAmount,
      quotationNumber: quotation.quotationNumber,
      approvalStatus: 'pending',
    });

    await purchaseOrder.save();

    res.status(201).json({
      success: true,
      message: 'Purchase Order created successfully',
      data: {
        _id: purchaseOrder._id,
        poNumber: purchaseOrder.poNumber,
        leadId: purchaseOrder.leadId,
        quotationId: purchaseOrder.quotationId,
        approvalStatus: purchaseOrder.approvalStatus,
      },
    });
  } catch (error) {
    console.error('Error creating Purchase Order:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Purchase Order with this number already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET /api/pos - Get all Purchase Orders with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      leadId,
      quotationId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter object
    const filter = {};

    if (leadId) filter.leadId = leadId;
    if (quotationId) filter.quotationId = quotationId;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.poDate = {};
      if (startDate) filter.poDate.$gte = new Date(startDate);
      if (endDate) filter.poDate.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const purchaseOrders = await PurchaseOrder.find(filter)
      .populate('leadId', 'name phone product')
      .populate('quotationId', 'quotationNumber totalAmount')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await PurchaseOrder.countDocuments(filter);

    res.json({
      success: true,
      data: purchaseOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching Purchase Orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET /api/pos/:id - Get a specific Purchase Order
router.get('/:id', async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('leadId', 'name phone product source notes')
      .populate(
        'quotationId',
        'quotationNumber totalAmount validity deliveryTerms'
      );

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }

    res.json({
      success: true,
      data: purchaseOrder,
    });
  } catch (error) {
    console.error('Error fetching Purchase Order:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Purchase Order ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET /api/pos/:id/details - Get detailed PO for DO1 generation
router.get('/:id/details', async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('leadId', 'name phone product source notes')
      .populate(
        'quotationId',
        'quotationNumber totalAmount validity deliveryTerms validityDate'
      );

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }

    // Format data specifically for DO1 generation
    const do1Data = {
      poNumber: purchaseOrder.poNumber,
      poDate: purchaseOrder.poDate,
      approvalStatus: purchaseOrder.approvalStatus,
      remarks: purchaseOrder.remarks,
      totalAmount: purchaseOrder.totalAmount,
      quotationNumber: purchaseOrder.quotationNumber,

      // Lead details
      customer: {
        name: purchaseOrder.leadId.name,
        phone: purchaseOrder.leadId.phone,
        product: purchaseOrder.leadId.product,
        source: purchaseOrder.leadId.source,
        notes: purchaseOrder.leadId.notes,
      },

      // Quotation details
      quotation: {
        number: purchaseOrder.quotationId.quotationNumber,
        totalAmount: purchaseOrder.quotationId.totalAmount,
        validity: purchaseOrder.quotationId.validity,
        deliveryTerms: purchaseOrder.quotationId.deliveryTerms,
        validityDate: purchaseOrder.quotationId.validityDate,
      },

      // Items for DO1
      items: purchaseOrder.items.map((item) => ({
        type: item.type,
        size: item.size,
        thickness: item.thickness,
        quantity: item.quantity,
        rate: item.rate,
        tax: item.tax,
        hsnCode: item.hsnCode,
        subtotal: item.subtotal,
        taxAmount: item.taxAmount,
        total: item.total,
      })),

      // Company info
      company: purchaseOrder.companyInfo,

      // Timestamps
      createdAt: purchaseOrder.createdAt,
      updatedAt: purchaseOrder.updatedAt,
    };

    res.json({
      success: true,
      message: 'PO details retrieved for DO1 generation',
      data: do1Data,
    });
  } catch (error) {
    console.error('Error fetching PO details for DO1:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Purchase Order ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// PUT /api/pos/:id - Update a Purchase Order
router.put('/:id', async (req, res) => {
  try {
    const { poDate, remarks, status, items, totalAmount } = req.body;

    const updateData = {};

    if (poDate) updateData.poDate = new Date(poDate);
    if (remarks !== undefined) updateData.remarks = remarks;
    if (status) updateData.status = status;
    if (items) {
      // Recalculate totals for updated items
      const processedItems = items.map((item) => {
        const subtotal = item.quantity * item.rate;
        const taxAmount = (subtotal * item.tax) / 100;
        const total = subtotal + taxAmount;

        return {
          ...item,
          subtotal: Math.round(subtotal * 100) / 100,
          taxAmount: Math.round(taxAmount * 100) / 100,
          total: Math.round(total * 100) / 100,
        };
      });
      updateData.items = processedItems;
    }
    if (totalAmount)
      updateData.totalAmount = Math.round(totalAmount * 100) / 100;

    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('leadId', 'name phone product')
      .populate('quotationId', 'quotationNumber totalAmount');

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }

    res.json({
      success: true,
      message: 'Purchase Order updated successfully',
      data: purchaseOrder,
    });
  } catch (error) {
    console.error('Error updating Purchase Order:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Purchase Order ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// DELETE /api/pos/:id - Delete a Purchase Order
router.delete('/:id', async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }

    res.json({
      success: true,
      message: 'Purchase Order deleted successfully',
      data: {
        poNumber: purchaseOrder.poNumber,
        _id: purchaseOrder._id,
      },
    });
  } catch (error) {
    console.error('Error deleting Purchase Order:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Purchase Order ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET /api/pos/timeline/:poId - Get complete timeline for a PO
router.get('/timeline/:poId', async (req, res) => {
  try {
    const { poId } = req.params;

    // Validate poId format
    if (!poId || !/^[0-9a-fA-F]{24}$/.test(poId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PO ID format',
      });
    }

    // Initialize timeline structure
    const timeline = {
      lead: null,
      quotation: null,
      po: null,
      do1: null,
      do2: null,
      invoice: null,
    };

    // Step 1: Get PO
    const po = await PurchaseOrder.findById(poId);
    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }
    timeline.po = {
      id: po._id,
      poNumber: po.poNumber,
      leadId: po.leadId,
      quotationId: po.quotationId,
      createdAt: po.createdAt,
      status: po.status || 'pending',
    };

    // Step 2: Get Lead
    const lead = await Lead.findById(po.leadId);
    if (lead) {
      timeline.lead = {
        id: lead._id,
        customerName: lead.name,
        phone: lead.phone,
        product: lead.product,
        source: lead.source,
        createdAt: lead.createdAt,
        status: 'active',
      };
    }

    // Step 3: Get Quotation
    const quotation = await Quotation.findById(po.quotationId);
    if (quotation) {
      timeline.quotation = {
        id: quotation._id,
        quotationNumber: quotation.quotationNumber,
        leadId: quotation.leadId,
        createdAt: quotation.createdAt,
        status: 'issued',
      };
    }

    // Step 4: Get DO1
    const do1 = await DO1.findOne({ poId: poId }).sort({ createdAt: -1 });
    if (do1) {
      timeline.do1 = {
        id: do1._id,
        do1Number: do1.do1Number,
        poId: do1.poId,
        leadId: do1.leadId,
        createdAt: do1.createdAt,
        status: do1.status,
      };
    }

    // Step 5: Get DO2
    if (timeline.do1) {
      const do2 = await DO2.findOne({ do1Id: timeline.do1.id }).sort({
        createdAt: -1,
      });
      if (do2) {
        timeline.do2 = {
          id: do2._id,
          do2Number: do2.do2Number,
          do1Id: do2.do1Id,
          poId: do2.poId,
          leadId: do2.leadId,
          createdAt: do2.createdAt,
          status: do2.status,
        };
      }
    }

    // Step 6: Get Invoice
    if (timeline.do2) {
      const invoice = await Invoice.findOne({ do2Id: timeline.do2.id }).sort({
        createdAt: -1,
      });
      if (invoice) {
        timeline.invoice = {
          id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          do2Id: invoice.do2Id,
          createdAt: invoice.createdAt,
          generatedAt: invoice.generatedAt,
          pushedToTally: invoice.pushedToTally,
          status: invoice.pushedToTally ? 'pushed' : 'pending',
        };
      }
    }

    // Calculate overall progress
    const steps = ['lead', 'quotation', 'po', 'do1', 'do2', 'invoice'];
    const completedSteps = steps.filter(
      (step) => timeline[step] !== null
    ).length;
    const progress = Math.round((completedSteps / steps.length) * 100);

    res.json({
      success: true,
      message: 'Timeline retrieved successfully',
      data: {
        poId: poId,
        timeline: timeline,
        progress: {
          completed: completedSteps,
          total: steps.length,
          percentage: progress,
        },
        summary: {
          poNumber: timeline.po.poNumber,
          customerName: timeline.lead?.customerName || 'N/A',
          product: timeline.lead?.product || 'N/A',
          poCreated: timeline.po.createdAt,
          lastActivity:
            timeline.invoice?.createdAt ||
            timeline.do2?.createdAt ||
            timeline.do1?.createdAt ||
            timeline.po.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timeline data',
    });
  }
});

// GET /api/pos/:id/pdf - Generate Purchase Order PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Purchase Order ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Purchase Order ID is required',
      });
    }

    // Fetch PO with populated data
    const po = await PurchaseOrder.findById(id)
      .populate('leadId', 'name phone product source notes')
      .populate('quotationId', 'quotationNumber validity deliveryTerms');

    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="purchase-order-${po.poNumber}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add company header
    doc.fontSize(24).font('Helvetica-Bold').text('Vikash Steel Tubes.', 50, 50);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Industrial Steel Tube Manufacturer', 50, 80)
      .text('GST: 06XXXXX1234X1Z5', 50, 95)
      .text('Email: orders@steeltubes.com | Phone: +91-XXXXX-XXXXX', 50, 110);

    // Add document title
    doc.fontSize(20).font('Helvetica-Bold').text('PURCHASE ORDER', 50, 150);

    // Add PO details
    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`PO Number: ${po.poNumber}`, 50, 190)
      .text(
        `PO Date: ${new Date(po.poDate).toLocaleDateString('en-IN')}`,
        50,
        210
      )
      .text(`Status: ${po.status.toUpperCase()}`, 50, 230);

    // Add customer details
    doc.fontSize(14).font('Helvetica-Bold').text('Customer Details:', 50, 270);

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Name: ${po.leadId.name}`, 50, 295)
      .text(`Phone: ${po.leadId.phone}`, 50, 315)
      .text(`Product Interest: ${po.leadId.product}`, 50, 335)
      .text(`Source: ${po.leadId.source}`, 50, 355);

    // Add quotation reference
    if (po.quotationId) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Quotation Reference:', 300, 270);

      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Quotation Number: ${po.quotationId.quotationNumber}`, 300, 295)
        .text(`Validity: ${po.quotationId.validity} days`, 300, 315)
        .text(`Delivery Terms: ${po.quotationId.deliveryTerms}`, 300, 335);
    }

    // Add items table
    let yPosition = 400;

    doc.fontSize(14).font('Helvetica-Bold').text('Items:', 50, yPosition);

    yPosition += 30;

    // Table headers and column positions
    const tableHeaders = [
      'Type',
      'Size',
      'Thickness',
      'Quantity',
      'Rate',
      'HSN',
      'Total',
    ];
    const columnPositions = [50, 130, 210, 280, 350, 430, 470];

    // Draw table headers
    doc.fontSize(10).font('Helvetica-Bold');
    tableHeaders.forEach((header, index) => {
      doc.text(header, columnPositions[index], yPosition);
    });

    // Draw header line
    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    // Add items
    doc.fontSize(9).font('Helvetica');
    po.items.forEach((item) => {
      const itemData = [
        item.type,
        item.size,
        `${item.thickness}mm`,
        `${item.quantity} tons`,
        `₹${item.rate.toLocaleString('en-IN')}`,
        item.hsnCode || '7306',
        `₹${item.total.toLocaleString('en-IN')}`,
      ];

      itemData.forEach((data, index) => {
        doc.text(data, columnPositions[index], yPosition);
      });

      yPosition += 20;
    });

    // Draw total line
    doc.moveTo(50, yPosition).lineTo(520, yPosition).stroke();
    yPosition += 15;

    // Add totals
    const subtotal = po.items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalTax = po.items.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = po.totalAmount;

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`Subtotal: ₹${subtotal.toLocaleString('en-IN')}`, 400, yPosition)
      .text(
        `Total Tax (12% GST): ₹${totalTax.toLocaleString('en-IN')}`,
        400,
        yPosition + 20
      )
      .text(
        `Grand Total: ₹${grandTotal.toLocaleString('en-IN')}`,
        400,
        yPosition + 40
      );

    // Add remarks if any
    if (po.remarks) {
      yPosition += 80;
      doc.fontSize(12).font('Helvetica-Bold').text('Remarks:', 50, yPosition);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(po.remarks, 50, yPosition + 20, { width: 500 });
    }

    // Add footer
    const footerY = 750;
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Thank you for your business!', 50, footerY)
      .text(
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        400,
        footerY
      );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating Purchase Order PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message,
    });
  }
});

module.exports = router;
