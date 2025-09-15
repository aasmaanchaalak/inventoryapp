const express = require('express');
const router = express.Router();
const DO1 = require('../models/DO1');
const DO2 = require('../models/DO2');
const PurchaseOrder = require('../models/PurchaseOrder');
const Lead = require('../models/Lead');
const Inventory = require('../models/Inventory');

// Helper function to get week number
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - ((d.getDay() + 7) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `Week ${weekNo}`;
};

// GET /api/reports/weekly-do-summary - Group DOs by week with dispatch volume
router.get('/weekly-do-summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to last 12 weeks if no date range provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

    // Aggregate DO1 data by week
    const do1Data = await DO1.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%U', date: '$createdAt' } },
          totalDOs: { $sum: 1 },
          totalVolume: { $sum: { $sum: '$items.quantity' } },
          totalValue: {
            $sum: { $sum: { $multiply: ['$items.quantity', '$items.rate'] } },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Aggregate DO2 data by week
    const do2Data = await DO2.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%U', date: '$createdAt' } },
          totalDOs: { $sum: 1 },
          totalVolume: { $sum: { $sum: '$items.remainingQuantity' } },
          totalValue: {
            $sum: {
              $sum: { $multiply: ['$items.remainingQuantity', '$items.rate'] },
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Combine and format data
    const weeklyData = [];
    const weekMap = new Map();

    // Process DO1 data
    do1Data.forEach((item) => {
      const week = getWeekNumber(new Date(item._id));
      weekMap.set(week, {
        week,
        totalDOs: item.totalDOs,
        totalVolume: item.totalVolume,
        totalValue: item.totalValue,
      });
    });

    // Add DO2 data
    do2Data.forEach((item) => {
      const week = getWeekNumber(new Date(item._id));
      if (weekMap.has(week)) {
        const existing = weekMap.get(week);
        existing.totalDOs += item.totalDOs;
        existing.totalVolume += item.totalVolume;
        existing.totalValue += item.totalValue;
      } else {
        weekMap.set(week, {
          week,
          totalDOs: item.totalDOs,
          totalVolume: item.totalVolume,
          totalValue: item.totalValue,
        });
      }
    });

    // Convert to array and sort
    weeklyData.push(...weekMap.values());
    weeklyData.sort((a, b) => a.week.localeCompare(b.week));

    res.json({
      success: true,
      message: 'Weekly DO summary retrieved successfully',
      data: weeklyData,
    });
  } catch (error) {
    console.error('Error fetching weekly DO summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET /api/reports/top-clients - Aggregate dispatch tonnage by client
router.get('/top-clients', async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to last 30 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const topClients = await DO1.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $lookup: {
          from: 'purchaseorders',
          localField: 'poId',
          foreignField: '_id',
          as: 'po',
        },
      },
      {
        $unwind: '$po',
      },
      {
        $lookup: {
          from: 'leads',
          localField: 'po.leadId',
          foreignField: '_id',
          as: 'lead',
        },
      },
      {
        $unwind: '$lead',
      },
      {
        $group: {
          _id: '$lead._id',
          clientName: { $first: '$lead.name' },
          clientId: { $first: '$lead._id' },
          totalVolume: { $sum: { $sum: '$items.quantity' } },
          totalValue: {
            $sum: { $sum: { $multiply: ['$items.quantity', '$items.rate'] } },
          },
          doCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalVolume: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.json({
      success: true,
      message: 'Top clients by dispatch tonnage retrieved successfully',
      data: topClients,
    });
  } catch (error) {
    console.error('Error fetching top clients:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET /api/reports/top-products - Aggregate by tube type/size
router.get('/top-products', async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to last 30 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const topProducts = await DO1.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: {
            type: '$items.type',
            size: '$items.size',
            thickness: '$items.thickness',
          },
          productName: {
            $first: {
              $concat: [
                '$items.type',
                ' - ',
                '$items.size',
                ' (',
                '$items.thickness',
                ')',
              ],
            },
          },
          productId: {
            $first: {
              $concat: [
                '$items.type',
                '_',
                '$items.size',
                '_',
                '$items.thickness',
              ],
            },
          },
          type: { $first: '$items.type' },
          size: { $first: '$items.size' },
          thickness: { $first: '$items.thickness' },
          totalVolume: { $sum: '$items.quantity' },
          totalValue: {
            $sum: { $multiply: ['$items.quantity', '$items.rate'] },
          },
          dispatchCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalVolume: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.json({
      success: true,
      message: 'Top products by tube type/size retrieved successfully',
      data: topProducts,
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET /api/reports/low-stock - Return products with quantity below 10 tons
router.get('/low-stock', async (req, res) => {
  try {
    const { threshold = 10 } = req.query; // Default threshold is 10 tons

    const lowStockItems = await Inventory.aggregate([
      {
        $match: {
          availableQty: { $lt: parseFloat(threshold) },
        },
      },
      {
        $project: {
          productId: '$_id',
          productName: {
            $concat: ['$productType', ' - ', '$size', ' (', { $toString: '$thickness' }, 'mm)'],
          },
          type: '$productType',
          size: '$size',
          thickness: '$thickness',
          stockLevel: '$availableQty',
          minThreshold: '$minStockLevel',
          lastUpdated: '$lastUpdated',
        },
      },
      {
        $sort: { stockLevel: 1 },
      },
    ]);

    res.json({
      success: true,
      message: 'Low stock items (below 10 tons) retrieved successfully',
      data: lowStockItems,
    });
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
