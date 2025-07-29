const express = require('express');
const router = express.Router();
const DO1 = require('../models/DO1');
const PurchaseOrder = require('../models/PurchaseOrder');

// POST /api/do1 - Create a new DO1
router.post('/', async (req, res) => {
  try {
    const { poId, doNumber, dispatchDate, remarks, items } = req.body;

    // Validate required fields
    if (!poId || !items) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: poId and items',
      });
    }

    // Validate that PO exists
    const purchaseOrder = await PurchaseOrder.findById(poId);
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required',
      });
    }

    // Validate dispatched quantities against stock
    const remainingQuantities = [];
    for (const item of items) {
      const availableStock = await getAvailableStock(item);

      if (item.dispatchedQuantity > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot dispatch ${item.dispatchedQuantity} tons of ${item.type} ${item.size} when only ${availableStock} tons are available`,
        });
      }

      // Calculate remaining quantity for DO2
      const remainingQuantity = availableStock - item.dispatchedQuantity;
      remainingQuantities.push({
        itemId: item.itemId,
        type: item.type,
        size: item.size,
        thickness: item.thickness,
        originalQuantity: item.originalQuantity,
        dispatchedQuantity: item.dispatchedQuantity,
        remainingQuantity: remainingQuantity,
        rate: item.rate,
      });
    }

    // Create the DO1 with status 'executed'
    console.log('Creating DO1 with data:', { poId, dispatchDate, remarks, itemsCount: items.length });
    const do1 = new DO1({
      poId,
      // Remove doNumber - let the pre-save hook generate it
      dispatchDate: dispatchDate ? new Date(dispatchDate) : new Date(),
      remarks,
      status: 'executed',
      items: await Promise.all(items.map(async (item) => {
        // Get the actual available stock for validation
        const actualStock = await getAvailableStock(item);
        return {
          itemId: item.itemId,
          type: item.type,
          size: item.size,
          thickness: item.thickness,
          availableStock: actualStock,
          dispatchedQuantity: item.dispatchedQuantity,
          rate: item.rate,
          total: Math.round(item.dispatchedQuantity * item.rate * 100) / 100,
          hsnCode: item.hsnCode || '7306',
          originalQuantity: item.originalQuantity || item.dispatchedQuantity,
        };
      })),
      totals: {
        subtotal:
          Math.round(
            items.reduce(
              (sum, item) => sum + item.dispatchedQuantity * item.rate,
              0
            ) * 100
          ) / 100,
        totalTax:
          Math.round(
            items.reduce(
              (sum, item) => sum + item.dispatchedQuantity * item.rate * 0.18,
              0
            ) * 100
          ) / 100,
        grandTotal:
          Math.round(
            items.reduce(
              (sum, item) => sum + item.dispatchedQuantity * item.rate * 1.18,
              0
            ) * 100
          ) / 100,
      },
    });

    console.log('About to save DO1, doNumber before save:', do1.doNumber);
    try {
      await do1.save();
      console.log('DO1 saved successfully, final doNumber:', do1.doNumber);
    } catch (saveError) {
      console.error('Error saving DO1:', saveError);
      console.error('DO1 data at time of error:', JSON.stringify(do1.toObject(), null, 2));
      throw saveError;
    }

    // Populate PO details for response
    await do1.populate('poId', 'poNumber leadId totalAmount');

    // Auto-generate DO2 for remaining quantities
    let do2Data = null;
    try {
      const DO2 = require('../models/DO2');

      // Filter items with remaining quantities > 0
      const itemsWithRemaining = remainingQuantities.filter(
        (item) => item.remainingQuantity > 0
      );

      if (itemsWithRemaining.length > 0) {
        const purchaseOrder = await PurchaseOrder.findById(poId);

        // Auto-approve DO2 if PO is admin-approved
        let do2Status = 'draft';
        let approvalStatus = {
          isApproved: false,
          approvedBy: null,
          approvedAt: null,
          approvedQuantity: 0,
          remarks: '',
        };

        if (purchaseOrder.approvalStatus === 'approved') {
          do2Status = 'approved'; // Auto-approve DO2
          approvalStatus = {
            isApproved: true,
            approvedBy: 'System (Auto-approval)',
            approvedAt: new Date(),
            approvedQuantity: itemsWithRemaining.reduce(
              (sum, item) => sum + item.remainingQuantity,
              0
            ),
            remarks: 'Auto-approved due to PO approval',
          };
        }

        const do2 = new DO2({
          poId,
          do1Id: do1._id,
          status: do2Status,
          approvalStatus,
          items: itemsWithRemaining,
          autoGenerated: true,
        });

        await do2.save();

        do2Data = {
          do2Number: do2.do2Number,
          status: do2.status,
          totalItems: do2.items.length,
          totalRemainingQuantity: do2.totalRemainingQuantity,
        };
      }
    } catch (do2Error) {
      console.error('Error auto-generating DO2:', do2Error);
      // Don't fail the DO1 creation if DO2 generation fails
    }

    res.status(201).json({
      success: true,
      message: 'DO1 created successfully',
      data: {
        _id: do1._id,
        doNumber: do1.doNumber,
        poId: do1.poId,
        status: do1.status,
        totalItems: do1.items.length,
        grandTotal: do1.totals.grandTotal,
        remainingQuantities: remainingQuantities,
        do2Generated: do2Data ? true : false,
        do2: do2Data,
      },
    });
  } catch (error) {
    console.error('Error creating DO1:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${errors.join(', ')}`,
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'DO1 with this number already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Function to get available stock from inventory API
const getAvailableStock = async (item) => {
  try {
    const Inventory = require('../models/Inventory');
    
    // Find the inventory item that matches the DO1 item specifications
    const inventoryItem = await Inventory.findOne({
      productType: item.type,
      size: item.size,
      thickness: item.thickness,
      isActive: true
    });

    if (inventoryItem) {
      return inventoryItem.availableQty;
    }
    
    // If no exact match found, return 0 to prevent dispatch
    return 0;
  } catch (error) {
    console.error('Error fetching inventory stock:', error);
    // Return 0 if there's an error - no fallback to mock data
    return 0;
  }
};

// GET /api/do1 - Get all DO1s with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      poId,
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

    if (poId) filter.poId = poId;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.dispatchDate = {};
      if (startDate) filter.dispatchDate.$gte = new Date(startDate);
      if (endDate) filter.dispatchDate.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const do1s = await DO1.find(filter)
      .populate('poId', 'poNumber leadId totalAmount')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await DO1.countDocuments(filter);

    res.json({
      success: true,
      data: do1s,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching DO1s:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET /api/do1/:id - Get a specific DO1 for display
router.get('/:id', async (req, res) => {
  try {
    const do1 = await DO1.findById(req.params.id).populate(
      'poId',
      'poNumber leadId totalAmount quotationNumber'
    );

    if (!do1) {
      return res.status(404).json({
        success: false,
        message: 'DO1 not found',
      });
    }

    // Format data for display
    const displayData = {
      doNumber: do1.doNumber,
      dispatchDate: do1.dispatchDate,
      status: do1.status,
      remarks: do1.remarks,

      // PO details
      po: {
        poNumber: do1.poId.poNumber,
        totalAmount: do1.poId.totalAmount,
        quotationNumber: do1.poId.quotationNumber,
      },

      // Customer details
      customer: {
        name: do1.poId.leadId?.name || 'Unknown',
        phone: do1.poId.leadId?.phone || 'N/A',
        product: do1.poId.leadId?.product || 'N/A',
      },

      // Dispatched items
      items: do1.items.map((item) => ({
        type: item.type,
        size: item.size,
        thickness: item.thickness,
        dispatchedQuantity: item.dispatchedQuantity,
        rate: item.rate,
        total: item.total,
        hsnCode: item.hsnCode,
      })),

      // Totals
      totals: {
        subtotal: do1.totals.subtotal,
        totalTax: do1.totals.totalTax,
        grandTotal: do1.totals.grandTotal,
      },

      // Company info
      company: do1.companyInfo,

      // Timestamps
      createdAt: do1.createdAt,
      updatedAt: do1.updatedAt,
    };

    res.json({
      success: true,
      message: 'DO1 data retrieved successfully',
      data: displayData,
    });
  } catch (error) {
    console.error('Error fetching DO1:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid DO1 ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// PUT /api/do1/:id - Update a DO1
router.put('/:id', async (req, res) => {
  try {
    const { dispatchDate, remarks, status, items, totals } = req.body;

    const updateData = {};

    if (dispatchDate) updateData.dispatchDate = new Date(dispatchDate);
    if (remarks !== undefined) updateData.remarks = remarks;
    if (status) updateData.status = status;
    if (items) {
      // Validate dispatched quantities
      for (const item of items) {
        if (item.dispatchedQuantity > item.availableStock) {
          return res.status(400).json({
            success: false,
            message: `Cannot dispatch ${item.dispatchedQuantity} tons when only ${item.availableStock} tons are available`,
          });
        }
      }
      updateData.items = items.map((item) => ({
        ...item,
        total: Math.round(item.total * 100) / 100,
      }));
    }
    if (totals) {
      updateData.totals = {
        subtotal: Math.round(totals.subtotal * 100) / 100,
        totalTax: Math.round(totals.totalTax * 100) / 100,
        grandTotal: Math.round(totals.grandTotal * 100) / 100,
      };
    }

    const do1 = await DO1.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('poId', 'poNumber leadId totalAmount');

    if (!do1) {
      return res.status(404).json({
        success: false,
        message: 'DO1 not found',
      });
    }

    res.json({
      success: true,
      message: 'DO1 updated successfully',
      data: do1,
    });
  } catch (error) {
    console.error('Error updating DO1:', error);

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
        message: 'Invalid DO1 ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// DELETE /api/do1/:id - Delete a DO1
router.delete('/:id', async (req, res) => {
  try {
    const do1 = await DO1.findByIdAndDelete(req.params.id);

    if (!do1) {
      return res.status(404).json({
        success: false,
        message: 'DO1 not found',
      });
    }

    res.json({
      success: true,
      message: 'DO1 deleted successfully',
      data: {
        doNumber: do1.doNumber,
        _id: do1._id,
      },
    });
  } catch (error) {
    console.error('Error deleting DO1:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid DO1 ID',
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
