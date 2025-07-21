const axios = require('axios');

// MSG91 Configuration
const MSG91_API_KEY = process.env.MSG91_API_KEY || 'your_msg91_api_key_here';
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'INVENTORY';
const MSG91_TEMPLATE_ID =
  process.env.MSG91_TEMPLATE_ID || 'your_template_id_here';
const MSG91_URL = 'https://api.msg91.com/api/v5/flow/';

/**
 * Send SMS using MSG91 API
 * @param {string} phone - Phone number (with country code)
 * @param {string} message - Message content
 * @returns {Promise<Object>} - API response
 */
const sendSMS = async (phone, message) => {
  try {
    // Validate phone number
    if (!phone || phone.length < 10) {
      throw new Error('Invalid phone number');
    }

    // Ensure phone number has country code (add +91 if not present)
    let formattedPhone = phone;
    if (!phone.startsWith('+91') && !phone.startsWith('91')) {
      formattedPhone = `+91${phone}`;
    }

    // MSG91 API payload
    const payload = {
      flow_id: MSG91_TEMPLATE_ID,
      sender: MSG91_SENDER_ID,
      mobiles: formattedPhone.replace('+', ''),
      VAR1: message, // Using VAR1 for dynamic message content
    };

    console.log('Sending SMS:', {
      to: formattedPhone,
      message: message,
      sender: MSG91_SENDER_ID,
    });

    // Make API call to MSG91
    const response = await axios.post(MSG91_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authkey: MSG91_API_KEY,
      },
    });

    console.log('SMS sent successfully:', response.data);
    return {
      success: true,
      messageId: response.data.message_id || 'unknown',
      response: response.data,
    };
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    return {
      success: false,
      error: error.message,
      response: error.response?.data || null,
    };
  }
};

/**
 * Send DO2 execution notification
 * @param {string} phone - Client phone number
 * @param {string} clientName - Client name
 * @param {string} do2Id - DO2 ID
 * @param {string} companyName - Company name
 * @returns {Promise<Object>} - SMS sending result
 */
const sendDO2ExecutionNotification = async (
  phone,
  clientName,
  do2Id,
  companyName = 'Your Company'
) => {
  const message = `Dear ${clientName}, your steel tubes order (DO#${do2Id}) has been dispatched. Invoice will be sent shortly. - ${companyName}`;

  return await sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendDO2ExecutionNotification,
};
