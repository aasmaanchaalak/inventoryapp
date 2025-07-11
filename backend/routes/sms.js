const express = require('express');
const router = express.Router();
const { sendSMS, sendDO2ExecutionNotification } = require('../services/smsService');

// POST /api/sms/test - Test custom SMS
router.post('/test', async (req, res) => {
  try {
    const { phone, message, clientName, do2Id, companyName } = req.body;

    // Validate required fields
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Use custom message if provided, otherwise use default DO2 format
    let smsMessage = message;
    if (!smsMessage) {
      smsMessage = `Dear ${clientName || 'Customer'}, your steel tubes order (DO#${do2Id || 'N/A'}) has been dispatched. Invoice will be sent shortly. - ${companyName || 'Your Company'}`;
    }

    // Send SMS
    const result = await sendSMS(phone, smsMessage);

    if (result.success) {
      res.json({
        success: true,
        message: 'SMS sent successfully',
        messageId: result.messageId,
        response: result.response
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send SMS',
        error: result.error,
        response: result.response
      });
    }

  } catch (error) {
    console.error('Error testing SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/sms/test-do2 - Test DO2 execution notification
router.post('/test-do2', async (req, res) => {
  try {
    const { phone, clientName, do2Id, companyName } = req.body;

    // Validate required fields
    if (!phone || !clientName || !do2Id) {
      return res.status(400).json({
        success: false,
        message: 'Phone, client name, and DO2 ID are required'
      });
    }

    // Send DO2 execution notification
    const result = await sendDO2ExecutionNotification(
      phone,
      clientName,
      do2Id,
      companyName || 'Your Company'
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'DO2 notification sent successfully',
        messageId: result.messageId,
        response: result.response,
        sentMessage: `Dear ${clientName}, your steel tubes order (DO#${do2Id}) has been dispatched. Invoice will be sent shortly. - ${companyName || 'Your Company'}`
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send DO2 notification',
        error: result.error,
        response: result.response
      });
    }

  } catch (error) {
    console.error('Error testing DO2 notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/sms/status - Get SMS service status
router.get('/status', async (req, res) => {
  try {
    const config = {
      gateway: 'MSG91',
      apiKey: process.env.MSG91_API_KEY ? 'Configured' : 'Not configured',
      senderId: process.env.MSG91_SENDER_ID || 'Not configured',
      templateId: process.env.MSG91_TEMPLATE_ID ? 'Configured' : 'Not configured',
      companyName: process.env.COMPANY_NAME || 'Not configured'
    };

    res.json({
      success: true,
      message: 'SMS service status',
      config
    });

  } catch (error) {
    console.error('Error getting SMS status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 