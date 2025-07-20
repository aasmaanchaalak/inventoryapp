const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  // Gmail configuration (placeholder - replace with actual credentials)
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email service class
class EmailService {
  constructor() {
    this.transporter = transporter;
    this.fromEmail = process.env.EMAIL_USER || 'your-email@gmail.com';
    this.fromName = 'Steel Tube Industries Ltd.';
  }

  // Send invoice email
  async sendInvoiceEmail(toEmail, customerName, invoiceNumber, do2Number, pdfBuffer) {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: toEmail,
        subject: `Tax Invoice from ${this.fromName} - ${invoiceNumber}`,
        html: this.generateInvoiceEmailHTML(customerName, invoiceNumber, do2Number),
        attachments: [
          {
            filename: `invoice-${do2Number}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Invoice email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Invoice email sent successfully'
      };
    } catch (error) {
      console.error('Error sending invoice email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate HTML email template
  generateInvoiceEmailHTML(customerName, invoiceNumber, do2Number) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tax Invoice - ${invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #1f2937;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .invoice-details {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
          }
          .highlight {
            color: #3b82f6;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Steel Tube Industries Ltd.</h1>
          <p>Manufacturing Excellence in Steel Tubes</p>
        </div>
        
        <div class="content">
          <h2>Dear ${customerName},</h2>
          
          <p>Thank you for your business! Your tax invoice has been generated and is attached to this email.</p>
          
          <div class="invoice-details">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Number:</strong> <span class="highlight">${invoiceNumber}</span></p>
            <p><strong>DO2 Number:</strong> <span class="highlight">${do2Number}</span></p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
          
          <p>Please find your detailed tax invoice attached to this email. The invoice includes:</p>
          <ul>
            <li>Complete itemized list of products</li>
            <li>GST calculations (CGST & SGST)</li>
            <li>Payment terms and conditions</li>
            <li>Company details and contact information</li>
          </ul>
          
          <p><strong>Payment Terms:</strong> Payment is due within 30 days of invoice date.</p>
          
          <p>If you have any questions about this invoice, please don't hesitate to contact us:</p>
          <ul>
            <li>Phone: +91-9876543210</li>
            <li>Email: info@steeltubeindustries.com</li>
            <li>Address: 123 Industrial Area, Manufacturing District, City - 123456</li>
          </ul>
          
          <p>Thank you for choosing Steel Tube Industries Ltd. We appreciate your business!</p>
          
          <p>Best regards,<br>
          <strong>Steel Tube Industries Ltd.</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </body>
      </html>
    `;
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send test email
  async sendTestEmail(toEmail) {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: toEmail,
        subject: 'Test Email from Steel Tube Industries',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email from the Steel Tube Industries invoice system.</p>
          <p>If you received this email, the email service is working correctly.</p>
          <p>Sent at: ${new Date().toLocaleString('en-IN')}</p>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Test email sent successfully'
      };
    } catch (error) {
      console.error('Error sending test email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new EmailService(); 