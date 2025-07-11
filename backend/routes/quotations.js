const express = require('express');
const PDFDocument = require('pdfkit');
const Quotation = require('../models/Quotation');
const Lead = require('../models/Lead');
const router = express.Router();

// POST /api/quotations - Create a new quotation
router.post('/', async (req, res) => {
  try {
    const { leadId, items, validity, deliveryTerms, totalAmount } = req.body;

    // Validate required fields
    if (!leadId || !items || !validity || !deliveryTerms || totalAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: leadId, items, validity, deliveryTerms, and totalAmount are required'
      });
    }

    // Validate lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Calculate totals for each item
    const itemsWithTotals = items.map(item => {
      const subtotal = item.quantity * item.rate;
      const taxAmount = subtotal * (item.tax / 100);
      const total = subtotal + taxAmount;
      
      return {
        ...item,
        subtotal,
        taxAmount,
        total
      };
    });

    // Create new quotation
    const newQuotation = new Quotation({
      leadId,
      items: itemsWithTotals,
      validity,
      deliveryTerms,
      totalAmount
    });

    // Save to database
    const savedQuotation = await newQuotation.save();

    // Populate lead details for response
    await savedQuotation.populate('leadId', 'name phone product source');

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Quotation created successfully!',
      data: {
        id: savedQuotation._id,
        quotationNumber: savedQuotation.quotationNumber,
        lead: savedQuotation.leadId,
        items: savedQuotation.items,
        validity: savedQuotation.validity,
        deliveryTerms: savedQuotation.deliveryTerms,
        totalAmount: savedQuotation.totalAmount,
        status: savedQuotation.status,
        validUntil: savedQuotation.validUntil,
        formattedValidUntil: savedQuotation.formattedValidUntil,
        isExpired: savedQuotation.isExpired,
        createdAt: savedQuotation.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating quotation:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A quotation with this number already exists'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// GET /api/quotations/:id/pdf - Generate quotation PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('leadId', 'name phone product source notes');
    
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quotation-${quotation.quotationNumber}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add company header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(quotation.companyInfo.name, { align: 'center' })
       .moveDown(0.5);

    doc.fontSize(10)
       .font('Helvetica')
       .text(quotation.companyInfo.address, { align: 'center' })
       .moveDown(0.5);

    doc.fontSize(10)
       .text(`Phone: ${quotation.companyInfo.phone} | Email: ${quotation.companyInfo.email}`, { align: 'center' })
       .moveDown(0.5);

    doc.fontSize(10)
       .text(`GSTIN: ${quotation.companyInfo.gstin} | PAN: ${quotation.companyInfo.pan}`, { align: 'center' })
       .moveDown(2);

    // Add quotation details
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('QUOTATION', { align: 'center' })
       .moveDown(1);

    // Quotation info table
    const quotationInfo = [
      ['Quotation No:', quotation.quotationNumber],
      ['Date:', quotation.createdAt.toLocaleDateString('en-IN')],
      ['Valid Until:', quotation.formattedValidUntil],
      ['Status:', quotation.status.toUpperCase()]
    ];

    doc.fontSize(10);
    quotationInfo.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true })
         .font('Helvetica').text(` ${value}`)
         .moveDown(0.3);
    });

    doc.moveDown(1);

    // Customer information
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Customer Information')
       .moveDown(0.5);

    const customerInfo = [
      ['Name:', quotation.leadId.name],
      ['Phone:', quotation.leadId.phone],
      ['Product Interest:', quotation.leadId.product],
      ['Source:', quotation.leadId.source]
    ];

    doc.fontSize(10);
    customerInfo.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true })
         .font('Helvetica').text(` ${value}`)
         .moveDown(0.3);
    });

    doc.moveDown(2);

    // Items table
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Items')
       .moveDown(0.5);

    // Table headers
    const tableHeaders = ['S.No', 'Type', 'Size', 'Thickness (mm)', 'Quantity (tons)', 'Rate (₹)', 'Tax (%)', 'HSN Code', 'Subtotal (₹)', 'Tax (₹)', 'Total (₹)'];
    const columnWidths = [40, 60, 60, 50, 50, 50, 40, 50, 60, 50, 60];
    
    let x = 50;
    doc.fontSize(8).font('Helvetica-Bold');
    tableHeaders.forEach((header, index) => {
      doc.text(header, x, doc.y);
      x += columnWidths[index];
    });

    doc.moveDown(0.5);

    // Table data
    doc.fontSize(8).font('Helvetica');
    quotation.items.forEach((item, index) => {
      x = 50;
      const rowData = [
        (index + 1).toString(),
        item.type,
        item.size,
        item.thickness.toString(),
        item.quantity.toString(),
        item.rate.toLocaleString('en-IN'),
        item.tax.toString(),
        item.hsnCode,
        item.subtotal.toLocaleString('en-IN'),
        item.taxAmount.toLocaleString('en-IN'),
        item.total.toLocaleString('en-IN')
      ];

      rowData.forEach((cell, cellIndex) => {
        doc.text(cell, x, doc.y);
        x += columnWidths[cellIndex];
      });
      doc.moveDown(0.5);
    });

    doc.moveDown(1);

    // Total amount
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(`Total Amount: ₹${quotation.totalAmount.toLocaleString('en-IN')}`, { align: 'right' })
       .moveDown(2);

    // Delivery terms
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Delivery Terms:')
       .moveDown(0.5);

    doc.fontSize(10)
       .font('Helvetica')
       .text(quotation.deliveryTerms)
       .moveDown(2);

    // Terms and conditions
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Terms & Conditions:')
       .moveDown(0.5);

    const terms = [
      '1. Prices are subject to change without prior notice.',
      '2. Payment terms: 50% advance, balance before delivery.',
      '3. Delivery time: 7-15 days from order confirmation.',
      '4. Warranty: 1 year from date of delivery.',
      '5. Returns accepted within 7 days in original condition.',
      '6. Force majeure conditions apply.',
      '7. Jurisdiction: Local courts only.'
    ];

    doc.fontSize(10).font('Helvetica');
    terms.forEach(term => {
      doc.text(term).moveDown(0.3);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10)
       .font('Helvetica')
       .text('Thank you for your business!', { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF'
    });
  }
});

// GET /api/quotations - Get all quotations
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, leadId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (leadId) filter.leadId = leadId;

    const quotations = await Quotation.find(filter)
      .populate('leadId', 'name phone product source')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quotation.countDocuments(filter);
    
    res.json({
      success: true,
      data: quotations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotations'
    });
  }
});

// GET /api/quotations/:id - Get a specific quotation
router.get('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('leadId', 'name phone product source notes');
    
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    res.json({
      success: true,
      data: quotation
    });
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotation'
    });
  }
});

// PUT /api/quotations/:id/status - Update quotation status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: draft, sent, accepted, rejected, expired'
      });
    }

    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('leadId', 'name phone product source');

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    res.json({
      success: true,
      message: 'Quotation status updated successfully',
      data: quotation
    });
  } catch (error) {
    console.error('Error updating quotation status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quotation status'
    });
  }
});

// DELETE /api/quotations/:id - Delete a quotation
router.delete('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    res.json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quotation'
    });
  }
});

module.exports = router; 