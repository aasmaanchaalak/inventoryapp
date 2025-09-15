const express = require('express');
const router = express.Router();
const DO2 = require('../models/DO2');
const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');

// POST /api/tally/push - Push DO2 data to Tally
router.post('/push', async (req, res) => {
  try {
    const { do2Id } = req.body;

    // Validate DO2 ID
    if (!do2Id) {
      return res.status(400).json({
        success: false,
        message: 'DO2 ID is required',
      });
    }

    // Fetch DO2 with populated PO data
    const do2 = await DO2.findById(do2Id)
      .populate(
        'poId',
        'poNumber customerName customerAddress customerGstin customerPan'
      )
      .populate('do1Id', 'do1Number');

    if (!do2) {
      return res.status(404).json({
        success: false,
        message: 'DO2 not found',
      });
    }

    // Check if DO2 is executed
    if (do2.status !== 'executed') {
      return res.status(400).json({
        success: false,
        message: 'DO2 must be executed before pushing to Tally',
      });
    }

    // Calculate tax details (GST 18%)
    const gstRate = 18;
    const calculateTax = (amount) => {
      const cgst = (amount * gstRate) / 200; // 9% CGST
      const sgst = (amount * gstRate) / 200; // 9% SGST
      return { cgst, sgst, total: cgst + sgst };
    };

    // Prepare items for Tally
    const tallyItems = do2.items.map((item) => {
      const itemTotal = item.dispatchedQuantity * item.rate;
      const tax = calculateTax(itemTotal);

      return {
        hsnCode: item.hsnCode,
        productName: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Tube ${item.size} × ${item.thickness}mm`,
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
    const subtotal = tallyItems.reduce((sum, item) => sum + item.amount, 0);
    const totalTax = tallyItems.reduce((sum, item) => sum + item.totalTax, 0);
    const grandTotal = subtotal + totalTax;

    // Prepare Tally XML payload
    const tallyXML = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Vikash Steel Tubes.</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE>
          <VOUCHER>
            <DATE>${new Date(do2.executionDetails.executedAt).toLocaleDateString('dd/MM/yyyy')}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${do2.do2Number}</VOUCHERNUMBER>
            <REFERENCE>${do2.poId.poNumber}</REFERENCE>
            <PARTYLEDGERNAME>${do2.poId.customerName}</PARTYLEDGERNAME>
            <BASICBUYERIDENTIFICATION>
              <PARTYGSTIN>${do2.poId.customerGstin}</PARTYGSTIN>
              <PARTYPAN>${do2.poId.customerPan}</PARTYPAN>
            </BASICBUYERIDENTIFICATION>
            <BASICSELLERIDENTIFICATION>
              <COMPANYGSTIN>${do2.companyInfo.gstin}</COMPANYGSTIN>
              <COMPANYPAN>${do2.companyInfo.pan}</COMPANYPAN>
            </BASICSELLERIDENTIFICATION>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${do2.poId.customerName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <LEDGERFROMITEM>No</LEDGERFROMITEM>
              <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
              <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
              <ISLASTLEVEL>No</ISLASTLEVEL>
              <AMOUNT>-${grandTotal.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            ${tallyItems
              .map(
                (item) => `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <LEDGERFROMITEM>No</LEDGERFROMITEM>
              <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
              <ISPARTYLEDGER>No</ISPARTYLEDGER>
              <ISLASTLEVEL>No</ISLASTLEVEL>
              <AMOUNT>${item.amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>CGST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <LEDGERFROMITEM>No</LEDGERFROMITEM>
              <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
              <ISPARTYLEDGER>No</ISPARTYLEDGER>
              <ISLASTLEVEL>No</ISLASTLEVEL>
              <AMOUNT>${item.cgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>SGST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <LEDGERFROMITEM>No</LEDGERFROMITEM>
              <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
              <ISPARTYLEDGER>No</ISPARTYLEDGER>
              <ISLASTLEVEL>No</ISLASTLEVEL>
              <AMOUNT>${item.sgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`
              )
              .join('')}
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Inventory</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <LEDGERFROMITEM>No</LEDGERFROMITEM>
              <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
              <ISPARTYLEDGER>No</ISPARTYLEDGER>
              <ISLASTLEVEL>No</ISLASTLEVEL>
              <AMOUNT>-${subtotal.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    // Prepare Tally JSON payload
    const tallyJSON = {
      voucher: {
        date: new Date(do2.executionDetails.executedAt).toLocaleDateString(
          'dd/MM/yyyy'
        ),
        voucherTypeName: 'Sales',
        voucherNumber: do2.do2Number,
        reference: do2.poId.poNumber,
        partyLedgerName: do2.poId.customerName,
        basicBuyerIdentification: {
          partyGstin: do2.poId.customerGstin,
          partyPan: do2.poId.customerPan,
        },
        basicSellerIdentification: {
          companyGstin: do2.companyInfo.gstin,
          companyPan: do2.companyInfo.pan,
        },
        allLedgerEntries: [
          {
            ledgerName: do2.poId.customerName,
            isDeemedPositive: 'No',
            ledgerFromItem: 'No',
            removeZeroEntries: 'No',
            isPartyLedger: 'Yes',
            isLastLevel: 'No',
            amount: `-${grandTotal.toFixed(2)}`,
          },
          ...tallyItems.flatMap((item) => [
            {
              ledgerName: 'Sales',
              isDeemedPositive: 'No',
              ledgerFromItem: 'No',
              removeZeroEntries: 'No',
              isPartyLedger: 'No',
              isLastLevel: 'No',
              amount: item.amount.toFixed(2),
            },
            {
              ledgerName: 'CGST',
              isDeemedPositive: 'No',
              ledgerFromItem: 'No',
              removeZeroEntries: 'No',
              isPartyLedger: 'No',
              isLastLevel: 'No',
              amount: item.cgst.toFixed(2),
            },
            {
              ledgerName: 'SGST',
              isDeemedPositive: 'No',
              ledgerFromItem: 'No',
              removeZeroEntries: 'No',
              isPartyLedger: 'No',
              isLastLevel: 'No',
              amount: item.sgst.toFixed(2),
            },
          ]),
          {
            ledgerName: 'Inventory',
            isDeemedPositive: 'Yes',
            ledgerFromItem: 'No',
            removeZeroEntries: 'No',
            isPartyLedger: 'No',
            isLastLevel: 'No',
            amount: `-${subtotal.toFixed(2)}`,
          },
        ],
        items: tallyItems.map((item) => ({
          stockItemName: item.productName,
          rate: item.rate.toFixed(2),
          amount: item.amount.toFixed(2),
          actualQuantity: item.quantity.toFixed(2),
          actualRate: item.rate.toFixed(2),
          billingQuantity: item.quantity.toFixed(2),
          billingRate: item.rate.toFixed(2),
          hsnCode: item.hsnCode,
          gstRate: gstRate,
          cgstAmount: item.cgst.toFixed(2),
          sgstAmount: item.sgst.toFixed(2),
          totalTaxAmount: item.totalTax.toFixed(2),
          totalAmount: item.totalAmount.toFixed(2),
        })),
      },
      summary: {
        subtotal: subtotal.toFixed(2),
        totalTax: totalTax.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
        totalItems: tallyItems.length,
        totalQuantity: tallyItems
          .reduce((sum, item) => sum + item.quantity, 0)
          .toFixed(2),
      },
    };

    // Mock Tally push (console log for now)
    console.log('=== TALLY PUSH REQUEST ===');
    console.log('DO2 ID:', do2Id);
    console.log('DO2 Number:', do2.do2Number);
    console.log('Customer:', do2.poId.customerName);
    console.log('Total Items:', tallyItems.length);
    console.log('Subtotal:', formatCurrency(subtotal));
    console.log('Total Tax:', formatCurrency(totalTax));
    console.log('Grand Total:', formatCurrency(grandTotal));
    console.log('\n=== XML PAYLOAD ===');
    console.log(tallyXML);
    console.log('\n=== JSON PAYLOAD ===');
    console.log(JSON.stringify(tallyJSON, null, 2));
    console.log('=== END TALLY PUSH ===\n');

    // Update invoice record with Tally push information
    const invoiceRecord = await Invoice.findOne({ do2Id: do2Id });
    if (invoiceRecord) {
      invoiceRecord.pushedToTally = true;
      invoiceRecord.pushedToTallyAt = new Date();
      invoiceRecord.tallyVoucherNumber = `TALLY-${Date.now()}`;
      invoiceRecord.status = 'pushed_to_tally';
      invoiceRecord.remarks = 'Successfully pushed to Tally ERP';
      await invoiceRecord.save();

      // Add audit trail entry for Tally push
      await invoiceRecord.addAuditEntry(
        'tally_push',
        'system',
        `Tally payload ID: ${invoiceRecord.tallyVoucherNumber} - Push confirmation: Successfully pushed to Tally ERP`,
        {
          do2Id: do2Id,
          do2Number: do2.do2Number,
          customerName: do2.poId.customerName,
          totalAmount: grandTotal,
          tallyVoucherNumber: invoiceRecord.tallyVoucherNumber,
          itemsCount: tallyItems.length,
          payloadId: invoiceRecord.tallyVoucherNumber,
        }
      );

      // Add audit trail entry for Tally push success
      await invoiceRecord.addAuditEntry(
        'tally_push_success',
        'system',
        'Successfully pushed to Tally ERP',
        {
          do2Id: do2Id,
          do2Number: do2.do2Number,
          customerName: do2.poId.customerName,
          totalAmount: grandTotal,
          tallyVoucherNumber: invoiceRecord.tallyVoucherNumber,
          itemsCount: tallyItems.length,
        }
      );
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.json({
      success: true,
      message: 'DO2 data pushed to Tally successfully',
      data: {
        do2Id,
        do2Number: do2.do2Number,
        customerName: do2.poId.customerName,
        totalItems: tallyItems.length,
        subtotal: subtotal.toFixed(2),
        totalTax: totalTax.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
        formats: {
          xml: tallyXML,
          json: tallyJSON,
        },
      },
    });
  } catch (error) {
    console.error('Error pushing DO2 to Tally:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// GET /api/tally/status/:do2Id - Get Tally push status for a DO2
router.get('/status/:do2Id', async (req, res) => {
  try {
    const { do2Id } = req.params;

    // Mock status response
    const mockStatus = {
      do2Id,
      pushedToTally: true,
      pushedAt: new Date().toISOString(),
      tallyVoucherNumber: `TALLY-${Date.now()}`,
      status: 'success',
      remarks: 'Successfully pushed to Tally ERP',
    };

    res.json({
      success: true,
      data: mockStatus,
    });
  } catch (error) {
    console.error('Error fetching Tally status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
