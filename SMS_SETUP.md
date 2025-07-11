# SMS Integration Setup Guide

This guide explains how to set up SMS notifications using MSG91 for the inventory management system.

## Prerequisites

1. MSG91 account (https://msg91.com/)
2. API key from MSG91 dashboard
3. Sender ID approval from MSG91
4. Template ID for dynamic messages

## Environment Variables

Add the following variables to your `.env` file:

```env
# SMS Gateway Configuration (MSG91)
MSG91_API_KEY=your_msg91_api_key_here
MSG91_SENDER_ID=INVENTORY
MSG91_TEMPLATE_ID=your_template_id_here

# Company Information
COMPANY_NAME=Your Steel Tubes Company
```

## MSG91 Setup Steps

### 1. Get API Key
1. Log in to your MSG91 account
2. Go to API Keys section
3. Copy your API key

### 2. Set Sender ID
1. Go to Sender ID section in MSG91 dashboard
2. Request approval for your desired sender ID (e.g., "INVENTORY")
3. Wait for approval from MSG91

### 3. Create Template
1. Go to Templates section
2. Create a new template with variables
3. Template format: `Dear {{#var#}}, your steel tubes order (DO#{{#var#}}) has been dispatched. Invoice will be sent shortly. - {{#var#}}`
4. Note the template ID

### 4. Configure Variables
- VAR1: Full message content
- VAR2: Client name
- VAR3: DO2 ID
- VAR4: Company name

## Features

### Automatic SMS Notifications
- SMS is sent automatically when DO2 is executed
- Message format: "Dear [ClientName], your steel tubes order (DO#[DO2-ID]) has been dispatched. Invoice will be sent shortly. - [Your Company]"

### SMS Testing
- Use the SMS Tester component in the frontend
- Test custom messages
- Test DO2 notification format
- View SMS delivery status

### API Endpoints

#### Test Custom SMS
```
POST /api/sms/test
{
  "phone": "9876543210",
  "message": "Custom message",
  "clientName": "John Doe",
  "do2Id": "DO2-2024-001",
  "companyName": "Steel Tubes Co."
}
```

#### Test DO2 Notification
```
POST /api/sms/test-do2
{
  "phone": "9876543210",
  "clientName": "John Doe",
  "do2Id": "DO2-2024-001",
  "companyName": "Steel Tubes Co."
}
```

#### Get SMS Status
```
GET /api/sms/status
```

## Integration Points

### DO2 Execution
When a DO2 is executed via `/api/do2/:id/execute`:
1. DO2 status is updated to 'executed'
2. Inventory is updated
3. SMS notification is sent automatically
4. SMS details are stored in execution details

### Error Handling
- SMS failures don't prevent DO2 execution
- SMS errors are logged and stored
- Retry mechanism can be implemented

## Testing

1. Start the backend server
2. Navigate to SMS Tester in the frontend
3. Configure your MSG91 credentials
4. Test with a valid phone number
5. Check SMS delivery status

## Troubleshooting

### Common Issues
1. **Invalid API Key**: Check your MSG91 API key
2. **Sender ID not approved**: Wait for MSG91 approval
3. **Template not found**: Verify template ID
4. **Phone number format**: Ensure country code is included

### Debug Information
- Check server logs for SMS API responses
- Use SMS status endpoint to verify configuration
- Test with MSG91 dashboard first

## Security Notes

1. Never commit API keys to version control
2. Use environment variables for sensitive data
3. Validate phone numbers before sending
4. Implement rate limiting for SMS API calls
5. Monitor SMS costs and usage 