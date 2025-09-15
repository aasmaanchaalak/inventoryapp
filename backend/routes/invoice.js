const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const DO2 = require('../models/DO2');
const Lead = require('../models/Lead');
const Invoice = require('../models/Invoice');
const emailService = require('../services/emailService');

// GET /api/invoice/:do2Id/pdf - Generate GST-compliant invoice PDF
router.get('/:do2Id/pdf', async (req, res) => {
  try {
    const { do2Id } = req.params;

    // Validate DO2 ID
    if (!do2Id) {
      return res.status(400).json({
        success: false,
        message: 'DO2 ID is required',
      });
    }

    // Fetch DO2 with populated data
    const do2 = await DO2.findById(do2Id)
      .populate(
        'poId',
        'poNumber customerName customerAddress customerGstin customerPan leadId'
      )
      .populate('do1Id', 'do1Number');

    if (!do2) {
      return res.status(404).json({
        success: false,
        message: 'DO2 not found',
      });
    }

    // Fetch lead data for buyer information
    const lead = await Lead.findById(do2.poId.leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead information not found',
      });
    }

    // Check if DO2 is executed
    if (do2.status !== 'executed') {
      return res.status(400).json({
        success: false,
        message: 'DO2 must be executed before generating invoice',
      });
    }

    // Calculate tax details (GST 12% for steel tubes)
    const gstRate = 12;
    const calculateTax = (amount) => {
      const cgst = (amount * gstRate) / 200; // 6% CGST
      const sgst = (amount * gstRate) / 200; // 6% SGST
      return { cgst, sgst, total: cgst + sgst };
    };

    // Prepare invoice items
    const invoiceItems = do2.items.map((item) => {
      const itemTotal = item.dispatchedQuantity * item.rate;
      const tax = calculateTax(itemTotal);

      return {
        description: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Tube ${item.size} × ${item.thickness}mm`,
        hsnCode: item.hsnCode,
        quantity: item.dispatchedQuantity,
        unit: 'TONS',
        rate: item.rate,
        amount: itemTotal,
        cgst: tax.cgst,
        sgst: tax.sgst,
        totalTax: tax.total,
        totalAmount: itemTotal + tax.total,
      };
    });

    // Calculate invoice totals
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const totalCGST = invoiceItems.reduce((sum, item) => sum + item.cgst, 0);
    const totalSGST = invoiceItems.reduce((sum, item) => sum + item.sgst, 0);
    const totalTax = totalCGST + totalSGST;
    const grandTotal = subtotal + totalTax;

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const invoiceDate = new Date(
      do2.executionDetails.executedAt
    ).toLocaleDateString('en-IN');

    // Create or update invoice record
    let invoiceRecord = await Invoice.findOne({ do2Id: do2Id });

    if (!invoiceRecord) {
      // Create new invoice record
      invoiceRecord = new Invoice({
        do2Id: do2Id,
        date: do2.executionDetails.executedAt,
        invoicePDFPath: `invoices/${do2.do2Number}.pdf`,
        metadata: {
          totalItems: invoiceItems.length,
          subtotal: subtotal,
          totalTax: totalTax,
          grandTotal: grandTotal,
          customerName: do2.poId.customerName,
          do2Number: do2.do2Number,
        },
        status: 'generated',
        remarks: 'Invoice PDF generated successfully',
      });

      await invoiceRecord.save();

      // Add audit trail entry for invoice generation
      await invoiceRecord.addAuditEntry(
        'generated',
        'system',
        'Invoice generated from DO2 execution',
        {
          do2Id: do2Id,
          do2Number: do2.do2Number,
          customerName: do2.poId.customerName,
          totalAmount: grandTotal,
          invoiceNumber: invoiceRecord.invoiceNumber,
        }
      );
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    // Capture PDF buffer for email attachment
    const pdfChunks = [];
    doc.on('data', (chunk) => pdfChunks.push(chunk));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(pdfChunks);

      // Send email with PDF attachment
      try {
        const emailResult = await emailService.sendInvoiceEmail(
          lead.email || 'customer@example.com', // Use customer email from lead
          lead.name, // Use name field from lead
          invoiceNumber,
          do2.do2Number,
          pdfBuffer
        );

        if (emailResult.success) {
          console.log(
            'Invoice email sent successfully:',
            emailResult.messageId
          );

          // Add audit trail entry for email sending
          if (invoiceRecord) {
            await invoiceRecord.addAuditEntry(
              'emailed',
              'system',
              `Invoice email sent successfully to ${lead.email || 'customer@example.com'}`,
              {
                messageId: emailResult.messageId,
                recipientEmail: lead.email || 'customer@example.com',
                recipientName: lead.name,
              }
            );
          }
        } else {
          console.error('Failed to send invoice email:', emailResult.error);

          // Add audit trail entry for email failure
          if (invoiceRecord) {
            await invoiceRecord.addAuditEntry(
              'emailed',
              'system',
              `Failed to send invoice email to ${lead.email || 'customer@example.com'}`,
              {
                error: emailResult.error,
                recipientEmail: lead.email || 'customer@example.com',
                recipientName: lead.name,
              }
            );
          }
        }
      } catch (emailError) {
        console.error('Error sending invoice email:', emailError);
      }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="invoice-${do2.do2Number}.pdf"`
    );

    // Add audit trail entry for PDF generation/viewing
    if (invoiceRecord) {
      await invoiceRecord.addAuditEntry(
        'viewed',
        'system',
        'Invoice PDF generated and viewed',
        {
          do2Id: do2Id,
          do2Number: do2.do2Number,
          customerName: do2.poId.customerName,
          totalAmount: grandTotal,
          invoiceNumber: invoiceRecord.invoiceNumber,
        }
      );
    }

    // Add audit trail entry for download
    if (invoiceRecord) {
      await invoiceRecord.addAuditEntry(
        'downloaded',
        'system',
        'Invoice PDF downloaded',
        {
          do2Id: do2Id,
          do2Number: do2.do2Number,
          customerName: do2.poId.customerName,
          totalAmount: grandTotal,
          invoiceNumber: invoiceRecord.invoiceNumber,
          downloadTimestamp: new Date().toISOString(),
        }
      );
    }

    // Pipe PDF to response
    doc.pipe(res);

    // Helper function to add text with proper positioning
    const addText = (text, x, y, options = {}) => {
      doc.fontSize(options.fontSize || 10);
      doc.font(options.font || 'Helvetica');
      doc.fillColor(options.color || 'black');
      doc.text(text, x, y, options);
    };

    // Helper function to draw line
    const drawLine = (x1, y1, x2, y2) => {
      doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
    };

    // Header
    addText('Vikash Steel Tubes', 50, 50, {
      fontSize: 20,
      font: 'Helvetica-Bold',
    });
    addText('Manufacturing Excellence in Steel Tubes', 50, 75, {
      fontSize: 12,
      color: '#666',
    });

    // Company details
    addText('123 Industrial Area, Manufacturing District', 50, 100);
    addText('City - 123456, State, India', 50, 115);
    addText(
      'Phone: +91-9876543210 | Email: info@steeltubeindustries.com',
      50,
      130
    );
    addText(
      `GSTIN: ${do2.companyInfo.gstin} | PAN: ${do2.companyInfo.pan}`,
      50,
      145
    );

    // Invoice details (right side)
    addText('INVOICE', 400, 50, { fontSize: 24, font: 'Helvetica-Bold' });
    addText(`Invoice No: ${invoiceNumber}`, 400, 90);
    addText(`Date: ${invoiceDate}`, 400, 105);
    addText(`DO2 No: ${do2.do2Number}`, 400, 120);
    addText(`PO No: ${do2.poId.poNumber}`, 400, 135);

    // Buyer information
    addText('BILL TO:', 50, 180, { fontSize: 12, font: 'Helvetica-Bold' });
    addText(lead.name, 50, 200);
    addText(lead.address || 'Address not provided', 50, 215);
    addText(`Phone: ${lead.phone}`, 50, 230);
    addText(`Email: ${lead.email || 'Email not provided'}`, 50, 235);
    if (lead.gstin) addText(`GSTIN: ${lead.gstin}`, 50, 245);
    if (lead.pan) addText(`PAN: ${lead.pan}`, 50, 250);

    // Ship to (same as bill to for now)
    addText('SHIP TO:', 300, 180, { fontSize: 12, font: 'Helvetica-Bold' });
    addText(lead.name, 300, 200);
    addText(lead.address || 'Address not provided', 300, 215);
    addText(`Phone: ${lead.phone}`, 300, 230);
    addText(`Email: ${lead.email || 'Email not provided'}`, 300, 235);
    if (lead.gstin) addText(`GSTIN: ${lead.gstin}`, 300, 245);
    if (lead.pan) addText(`PAN: ${lead.pan}`, 300, 250);

    // Line separator
    drawLine(50, 260, 550, 260);

    // Invoice table header
    const tableY = 280;
    const colWidths = [200, 60, 60, 60, 80, 80];
    const colX = [50, 250, 310, 370, 430, 510];

    // Table header
    addText('Description', colX[0], tableY, {
      fontSize: 10,
      font: 'Helvetica-Bold',
    });
    addText('HSN', colX[1], tableY, { fontSize: 10, font: 'Helvetica-Bold' });
    addText('Qty', colX[2], tableY, { fontSize: 10, font: 'Helvetica-Bold' });
    addText('Rate', colX[3], tableY, { fontSize: 10, font: 'Helvetica-Bold' });
    addText('Amount', colX[4], tableY, {
      fontSize: 10,
      font: 'Helvetica-Bold',
    });
    addText('GST %', colX[5], tableY, { fontSize: 10, font: 'Helvetica-Bold' });

    // Draw table header line
    drawLine(50, tableY + 15, 550, tableY + 15);

    // Table rows
    let currentY = tableY + 25;
    invoiceItems.forEach((item, index) => {
      // Check if we need a new page
      if (currentY > 650) {
        doc.addPage();
        currentY = 50;
      }

      addText(item.description, colX[0], currentY, { fontSize: 9 });
      addText(item.hsnCode, colX[1], currentY, { fontSize: 9 });
      addText(item.quantity.toString(), colX[2], currentY, { fontSize: 9 });
      addText(`₹${item.rate.toLocaleString()}`, colX[3], currentY, {
        fontSize: 9,
      });
      addText(`₹${item.amount.toLocaleString()}`, colX[4], currentY, {
        fontSize: 9,
      });
      addText(`${gstRate}%`, colX[5], currentY, { fontSize: 9 });

      currentY += 20;
    });

    // Draw table bottom line
    drawLine(50, currentY, 550, currentY);

    // Totals section
    const totalsY = currentY + 20;

    // Right align totals
    const totalsX = 400;
    const labelWidth = 100;
    const valueWidth = 80;

    addText('Sub Total:', totalsX, totalsY, {
      fontSize: 10,
      font: 'Helvetica-Bold',
    });
    addText(`₹${subtotal.toLocaleString()}`, totalsX + labelWidth, totalsY, {
      fontSize: 10,
    });

    addText('CGST (9%):', totalsX, totalsY + 20, { fontSize: 10 });
    addText(
      `₹${totalCGST.toLocaleString()}`,
      totalsX + labelWidth,
      totalsY + 20,
      { fontSize: 10 }
    );

    addText('SGST (9%):', totalsX, totalsY + 40, { fontSize: 10 });
    addText(
      `₹${totalSGST.toLocaleString()}`,
      totalsX + labelWidth,
      totalsY + 40,
      { fontSize: 10 }
    );

    // Grand total line
    drawLine(
      totalsX,
      totalsY + 55,
      totalsX + labelWidth + valueWidth,
      totalsY + 55
    );

    addText('GRAND TOTAL:', totalsX, totalsY + 70, {
      fontSize: 12,
      font: 'Helvetica-Bold',
    });
    addText(
      `₹${grandTotal.toLocaleString()}`,
      totalsX + labelWidth,
      totalsY + 70,
      { fontSize: 12, font: 'Helvetica-Bold' }
    );

    // Amount in words
    const amountInWords = numberToWords(Math.round(grandTotal));
    addText(
      `Amount in Words: ${amountInWords} Rupees Only`,
      50,
      totalsY + 100,
      { fontSize: 10, font: 'Helvetica-Bold' }
    );

    // Terms and conditions
    addText('Terms & Conditions:', 50, totalsY + 130, {
      fontSize: 10,
      font: 'Helvetica-Bold',
    });
    addText(
      '1. Payment is due within 30 days of invoice date',
      50,
      totalsY + 150,
      { fontSize: 9 }
    );
    addText('2. Goods once sold will not be taken back', 50, totalsY + 165, {
      fontSize: 9,
    });
    addText('3. Subject to local jurisdiction', 50, totalsY + 180, {
      fontSize: 9,
    });
    addText('4. E. & O.E.', 50, totalsY + 195, { fontSize: 9 });

    // Digital signature section
    const signatureY = totalsY + 220;

    // Company signature
    addText('For Vikash Steel Tubes.', 50, signatureY, {
      fontSize: 10,
      font: 'Helvetica-Bold',
    });
    addText('Authorized Signatory', 50, signatureY + 15, { fontSize: 9 });

    // Signature box
    doc.rect(50, signatureY + 25, 150, 60);
    addText('Digital Signature', 70, signatureY + 50, {
      fontSize: 8,
      color: '#999',
    });

    // Customer signature
    addText('Customer Signature', 350, signatureY, {
      fontSize: 10,
      font: 'Helvetica-Bold',
    });

    // Customer signature box
    doc.rect(350, signatureY + 25, 150, 60);
    addText('Customer Stamp & Signature', 370, signatureY + 50, {
      fontSize: 8,
      color: '#999',
    });

    // Footer
    const footerY = 750;
    addText('Thank you for your business!', 50, footerY, {
      fontSize: 10,
      color: '#666',
    });
    addText(
      `Generated on: ${new Date().toLocaleString('en-IN')}`,
      400,
      footerY,
      { fontSize: 8, color: '#999' }
    );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Helper function to convert number to words
function numberToWords(num) {
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];
  const teens = [
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  function convertLessThanOneThousand(n) {
    if (n === 0) return '';

    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
      );
    }
    if (n < 1000) {
      return (
        ones[Math.floor(n / 100)] +
        ' Hundred' +
        (n % 100 !== 0 ? ' and ' + convertLessThanOneThousand(n % 100) : '')
      );
    }
  }

  function convert(n) {
    if (n === 0) return 'Zero';

    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const remainder = n % 1000;

    let result = '';

    if (crore > 0) {
      result += convertLessThanOneThousand(crore) + ' Crore ';
    }
    if (lakh > 0) {
      result += convertLessThanOneThousand(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      result += convertLessThanOneThousand(thousand) + ' Thousand ';
    }
    if (remainder > 0) {
      result += convertLessThanOneThousand(remainder);
    }

    return result.trim();
  }

  return convert(num);
}

// POST /api/invoice/test-email - Test email service
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    // Test email service
    const result = await emailService.sendTestEmail(email);

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        data: {
          messageId: result.messageId,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
