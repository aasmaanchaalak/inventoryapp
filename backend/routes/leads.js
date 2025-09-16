const express = require('express');
const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');
const PurchaseOrder = require('../models/PurchaseOrder');
const DO1 = require('../models/DO1');
const DO2 = require('../models/DO2');
const Invoice = require('../models/Invoice');
const router = express.Router();

// POST /api/leads - Create a new lead
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      address,
      gstin,
      pan,
      productInterest,
      leadSource,
      notes,
    } = req.body;

    // Validate required fields
    if (!customerName || !phone || !productInterest || !leadSource) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: customerName, phone, productInterest, and leadSource are required',
      });
    }

    // Create new lead
    const newLead = new Lead({
      name: customerName,
      phone: phone,
      email: email || undefined,
      address: address || undefined,
      gstin: gstin || undefined,
      pan: pan || undefined,
      product: productInterest,
      source: leadSource,
      notes: notes || '',
    });

    // Save to database
    const savedLead = await newLead.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Lead created successfully!',
      data: {
        id: savedLead._id,
        name: savedLead.name,
        phone: savedLead.phone,
        email: savedLead.email,
        address: savedLead.address,
        gstin: savedLead.gstin,
        pan: savedLead.pan,
        product: savedLead.product,
        source: savedLead.source,
        notes: savedLead.notes,
        createdAt: savedLead.createdAt,
        formattedCreatedAt: savedLead.formattedCreatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating lead:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A lead with this name and phone number already exists',
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
});

// GET /api/leads - Get all leads (optional endpoint for future use)
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
    });
  }
});

// GET /api/leads/dashboard - Get leads dashboard data with filters and summary
router.get('/dashboard', async (req, res) => {
  try {
    const { leadSource, status, dateRange, limit = 50, offset = 0 } = req.query;

    console.log('Dashboard request - Query params:', req.query);
    console.log('Status filter:', status);

    // Build filter query for database fields only
    const filter = {};

    if (leadSource) {
      filter.source = leadSource;
    }

    // Note: status filtering will be done after calculating dynamic status

    // Handle date range filtering
    if (dateRange) {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          break;
      }

      if (startDate) {
        filter.createdAt = { $gte: startDate };
      }
    }

    // Get leads with filters (get more than needed for status filtering)
    const leads = await Lead.find(filter).sort({ createdAt: -1 });

    // Format leads data with dynamic status based on workflow stage
    const allFormattedLeads = await Promise.all(
      leads.map(async (lead) => {
        let dynamicStatus = 'new';

        // Check for quotation
        const quotation = await Quotation.findOne({ leadId: lead._id }).sort({
          createdAt: -1,
        });
        if (quotation) {
          dynamicStatus = 'quotation';

          // Check for PO
          const po = await PurchaseOrder.findOne({
            quotationId: quotation._id,
          }).sort({ createdAt: -1 });
          if (po) {
            dynamicStatus = 'po received';

            // Check for DO1
            const do1 = await DO1.findOne({ poId: po._id }).sort({
              createdAt: -1,
            });
            if (do1) {
              dynamicStatus = 'do1 generated';

              // Check for DO2
              const do2 = await DO2.findOne({ do1Id: do1._id }).sort({
                createdAt: -1,
              });
              if (do2) {
                dynamicStatus = 'do sent';

                // Check for Invoice
                const invoice = await Invoice.findOne({ do2Id: do2._id }).sort({
                  createdAt: -1,
                });
                if (invoice) {
                  dynamicStatus = 'invoiced';
                }
              }
            }
          }
        }

        return {
          _id: lead._id,
          customerName: lead.name,
          phone: lead.phone,
          email: lead.email,
          address: lead.address,
          gstin: lead.gstin,
          pan: lead.pan,
          productInterest: lead.product,
          leadSource: lead.source,
          status: dynamicStatus,
          notes: lead.notes,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
        };
      })
    );

    // Filter by status after calculating dynamic status
    let filteredLeads = allFormattedLeads;

    if (status) {
      console.log('Filtering by status:', status);
      console.log('Available statuses:', [
        ...new Set(allFormattedLeads.map((l) => l.status)),
      ]);
      filteredLeads = allFormattedLeads.filter((lead) => {
        console.log(
          `Comparing lead status "${lead.status}" with filter "${status}"`
        );
        return lead.status === status;
      });
      console.log('Leads after status filter:', filteredLeads.length);
    }

    // Apply pagination to filtered results
    const totalLeads = filteredLeads.length;
    const paginatedLeads = filteredLeads.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        leads: paginatedLeads,
        pagination: {
          total: totalLeads,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < totalLeads,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching leads dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads dashboard data',
    });
  }
});

// GET /api/leads/:id - Get a specific lead (optional endpoint for future use)
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead',
    });
  }
});

// GET /api/timeline/:leadId - Get complete timeline for a lead
router.get('/timeline/:leadId', async (req, res) => {
  try {
    const { leadId } = req.params;

    // Validate leadId format
    if (!leadId || !/^[0-9a-fA-F]{24}$/.test(leadId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID format',
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

    // Step 1: Get Lead
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }
    timeline.lead = {
      id: lead._id,
      customerName: lead.name,
      phone: lead.phone,
      product: lead.product,
      source: lead.source,
      createdAt: lead.createdAt,
      status: 'active',
    };

    // Step 2: Get Quotation
    const quotation = await Quotation.findOne({ leadId: leadId }).sort({
      createdAt: -1,
    });
    if (quotation) {
      timeline.quotation = {
        id: quotation._id,
        quotationNumber: quotation.quotationNumber,
        leadId: quotation.leadId,
        createdAt: quotation.createdAt,
        status: 'issued',
      };
    }

    // Step 3: Get PO (if quotation exists)
    if (timeline.quotation) {
      const po = await PurchaseOrder.findOne({
        quotationId: timeline.quotation.id,
      }).sort({ createdAt: -1 });
      if (po) {
        timeline.po = {
          id: po._id,
          poNumber: po.poNumber,
          quotationId: po.quotationId,
          leadId: po.leadId,
          createdAt: po.createdAt,
          status: po.status,
        };
      }
    }

    // Step 4: Get DO1 (if PO exists)
    if (timeline.po) {
      const do1 = await DO1.findOne({ poId: timeline.po.id }).sort({
        createdAt: -1,
      });
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
    }

    // Step 5: Get DO2 (if DO1 exists)
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

    // Step 6: Get Invoice (if DO2 exists)
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
        leadId: leadId,
        timeline: timeline,
        progress: {
          completed: completedSteps,
          total: steps.length,
          percentage: progress,
        },
        summary: {
          customerName: timeline.lead.customerName,
          product: timeline.lead.product,
          leadCreated: timeline.lead.createdAt,
          lastActivity:
            timeline.invoice?.createdAt ||
            timeline.do2?.createdAt ||
            timeline.do1?.createdAt ||
            timeline.po?.createdAt ||
            timeline.quotation?.createdAt ||
            timeline.lead.createdAt,
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

module.exports = router;
