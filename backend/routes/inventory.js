const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// GET /api/inventory-summary - Get real-time inventory summary
router.get('/summary', async (req, res) => {
  try {
    const {
      productType,
      size,
      thickness,
      stockStatus,
      page = 1,
      limit = 20,
      sortBy = 'lastUpdated',
      sortOrder = 'desc',
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (productType) filter.productType = productType;
    if (size) filter.size = { $regex: size, $options: 'i' };
    if (thickness) filter.thickness = thickness;
    if (stockStatus) {
      if (stockStatus === 'low') {
        filter.$expr = { $lte: ['$availableQty', '$minStockLevel'] };
      } else if (stockStatus === 'high') {
        filter.$expr = {
          $gte: ['$availableQty', { $multiply: ['$maxStockLevel', 0.8] }],
        };
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const inventory = await Inventory.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Inventory.countDocuments(filter);

    // Calculate summary statistics
    const summary = await Inventory.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalStock: { $sum: '$availableQty' },
          totalValue: { $sum: { $multiply: ['$availableQty', '$rate'] } },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ['$availableQty', '$minStockLevel'] }, 1, 0],
            },
          },
          highStockItems: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$availableQty',
                    { $multiply: ['$maxStockLevel', 0.8] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Get stock by product type
    const stockByType = await Inventory.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$productType',
          count: { $sum: 1 },
          totalStock: { $sum: '$availableQty' },
          totalValue: { $sum: { $multiply: ['$availableQty', '$rate'] } },
        },
      },
      { $sort: { totalStock: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        inventory,
        summary: summary[0] || {
          totalItems: 0,
          totalStock: 0,
          totalValue: 0,
          lowStockItems: 0,
          highStockItems: 0,
        },
        stockByType,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET /api/inventory/:id - Get specific inventory item
router.get('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// POST /api/inventory - Add new inventory item
router.post('/', async (req, res) => {
  try {
    const {
      productType,
      size,
      thickness,
      availableQty,
      rate,
      hsnCode,
      minStockLevel,
      maxStockLevel,
      location,
      supplier,
    } = req.body;

    // Validate required fields
    if (!productType || !size || !thickness || availableQty === undefined) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: productType, size, thickness, availableQty',
      });
    }

    // Check if inventory item already exists
    const existingItem = await Inventory.findOne({
      productType,
      size,
      thickness,
    });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Inventory item already exists for this product specification',
      });
    }

    // Create new inventory item
    const inventory = new Inventory({
      productType,
      size,
      thickness,
      availableQty,
      rate: rate || 45000,
      hsnCode: hsnCode || '7306',
      minStockLevel: minStockLevel || 0,
      maxStockLevel: maxStockLevel || 10000,
      location: location || {
        warehouse: 'Main Warehouse',
        section: 'Steel Tubes',
      },
      supplier: supplier || {
        name: 'Steel Tube Industries Ltd.',
        contact: '+91-9876543210',
      },
    });

    await inventory.save();

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: inventory,
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// PUT /api/inventory/:id - Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const {
      availableQty,
      rate,
      minStockLevel,
      maxStockLevel,
      location,
      supplier,
      isActive,
    } = req.body;

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    // Update fields
    if (availableQty !== undefined) inventory.availableQty = availableQty;
    if (rate !== undefined) inventory.rate = rate;
    if (minStockLevel !== undefined) inventory.minStockLevel = minStockLevel;
    if (maxStockLevel !== undefined) inventory.maxStockLevel = maxStockLevel;
    if (location !== undefined) inventory.location = location;
    if (supplier !== undefined) inventory.supplier = supplier;
    if (isActive !== undefined) inventory.isActive = isActive;

    await inventory.save();

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: inventory,
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);

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
        message: 'Invalid inventory ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// PUT /api/inventory/:id/stock - Update stock quantity
router.put('/:id/stock', async (req, res) => {
  try {
    const { quantity, transactionType, reference, remarks } = req.body;

    if (!quantity || !transactionType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: quantity, transactionType',
      });
    }

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    // Update stock using the instance method
    const result = await inventory.updateStock(
      quantity,
      transactionType,
      reference,
      remarks
    );

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        inventory,
        transaction: result,
      },
    });
  } catch (error) {
    console.error('Error updating stock:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: error.message,
    });
  }
});

// DELETE /api/inventory/:id - Delete inventory item (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    // Soft delete by setting isActive to false
    inventory.isActive = false;
    await inventory.save();

    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
      data: {
        _id: inventory._id,
        productType: inventory.productType,
        size: inventory.size,
        thickness: inventory.thickness,
      },
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID',
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
