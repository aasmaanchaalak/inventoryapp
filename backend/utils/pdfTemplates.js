/**
 * Shared PDF Template Library for Vikash Steel Tubes.
 *
 * This module provides standardized PDF formatting functions for:
 * - Company branding and headers
 * - Document layouts and styling
 * - Common elements like tables, totals, and footers
 * - Consistent styling across all business documents
 */

/**
 * Company information and branding constants
 */
const COMPANY_INFO = {
  name: 'Vikash Steel Tubes.',
  tagline: 'Industrial Steel Tube Manufacturer',
  gst: '06XXXXX1234X1Z5',
  email: 'orders@steeltubes.com',
  phone: '+91-XXXXX-XXXXX',
  dispatchEmail: 'dispatch@steeltubes.com',
};

/**
 * Standard PDF styling constants
 */
const STYLES = {
  margin: 50,
  colors: {
    primary: '#1f2937',
    secondary: '#6b7280',
    accent: '#3b82f6',
    success: '#10b981',
    text: '#374151',
  },
  fonts: {
    title: { size: 24, font: 'Helvetica-Bold' },
    subtitle: { size: 20, font: 'Helvetica-Bold' },
    heading: { size: 14, font: 'Helvetica-Bold' },
    body: { size: 12, font: 'Helvetica' },
    small: { size: 10, font: 'Helvetica' },
    tableHeader: { size: 10, font: 'Helvetica-Bold' },
    tableBody: { size: 9, font: 'Helvetica' },
  },
  spacing: {
    section: 30,
    paragraph: 20,
    line: 15,
  },
};

/**
 * Add company header to PDF document
 * @param {PDFDocument} doc - The PDF document
 * @param {number} yStart - Starting Y position (default: 50)
 * @returns {number} - Next available Y position
 */
function addCompanyHeader(doc, yStart = 50) {
  // Company name
  doc
    .fontSize(STYLES.fonts.title.size)
    .font(STYLES.fonts.title.font)
    .text(COMPANY_INFO.name, STYLES.margin, yStart);

  // Company details
  doc
    .fontSize(STYLES.fonts.small.size)
    .font(STYLES.fonts.small.font)
    .text(COMPANY_INFO.tagline, STYLES.margin, yStart + 30)
    .text(`GST: ${COMPANY_INFO.gst}`, STYLES.margin, yStart + 45)
    .text(
      `Email: ${COMPANY_INFO.email} | Phone: ${COMPANY_INFO.phone}`,
      STYLES.margin,
      yStart + 60
    );

  return yStart + 90;
}

/**
 * Add document title
 * @param {PDFDocument} doc - The PDF document
 * @param {string} title - Document title
 * @param {number} yPosition - Y position for title
 * @returns {number} - Next available Y position
 */
function addDocumentTitle(doc, title, yPosition) {
  doc
    .fontSize(STYLES.fonts.subtitle.size)
    .font(STYLES.fonts.subtitle.font)
    .text(title, STYLES.margin, yPosition);

  return yPosition + STYLES.spacing.section;
}

/**
 * Add document details section
 * @param {PDFDocument} doc - The PDF document
 * @param {Object} details - Object with key-value pairs of details
 * @param {number} yPosition - Starting Y position
 * @returns {number} - Next available Y position
 */
function addDocumentDetails(doc, details, yPosition) {
  doc.fontSize(STYLES.fonts.body.size).font(STYLES.fonts.body.font);

  Object.entries(details).forEach(([key, value], index) => {
    doc.text(
      `${key}: ${value}`,
      STYLES.margin,
      yPosition + index * STYLES.spacing.line
    );
  });

  return (
    yPosition +
    Object.keys(details).length * STYLES.spacing.line +
    STYLES.spacing.section
  );
}

/**
 * Add customer details section
 * @param {PDFDocument} doc - The PDF document
 * @param {Object} customer - Customer information
 * @param {number} yPosition - Starting Y position
 * @param {number} xPosition - X position (default: 50)
 * @returns {number} - Next available Y position
 */
function addCustomerDetails(
  doc,
  customer,
  yPosition,
  xPosition = STYLES.margin
) {
  // Section heading
  doc
    .fontSize(STYLES.fonts.heading.size)
    .font(STYLES.fonts.heading.font)
    .text('Customer Details:', xPosition, yPosition);

  // Customer information
  doc
    .fontSize(STYLES.fonts.body.size)
    .font(STYLES.fonts.body.font)
    .text(`Name: ${customer.name}`, xPosition, yPosition + 25)
    .text(`Phone: ${customer.phone}`, xPosition, yPosition + 40)
    .text(`Product: ${customer.product}`, xPosition, yPosition + 55);

  return yPosition + 80;
}

/**
 * Add summary section (for totals, statistics, etc.)
 * @param {PDFDocument} doc - The PDF document
 * @param {string} title - Section title
 * @param {Object} summary - Summary data
 * @param {number} yPosition - Starting Y position
 * @param {number} xPosition - X position (default: 300)
 * @returns {number} - Next available Y position
 */
function addSummarySection(doc, title, summary, yPosition, xPosition = 300) {
  // Section heading
  doc
    .fontSize(STYLES.fonts.heading.size)
    .font(STYLES.fonts.heading.font)
    .text(title, xPosition, yPosition);

  // Summary information
  doc.fontSize(STYLES.fonts.body.size).font(STYLES.fonts.body.font);

  Object.entries(summary).forEach(([key, value], index) => {
    doc.text(
      `${key}: ${value}`,
      xPosition,
      yPosition + 25 + index * STYLES.spacing.line
    );
  });

  return (
    yPosition +
    25 +
    Object.keys(summary).length * STYLES.spacing.line +
    STYLES.spacing.section
  );
}

/**
 * Create a standardized items table
 * @param {PDFDocument} doc - The PDF document
 * @param {string} tableTitle - Title for the table
 * @param {Array} headers - Array of table headers
 * @param {Array} columnWidths - Array of column widths
 * @param {Array} items - Array of data rows
 * @param {Function} dataMapper - Function to map item data to display format
 * @param {number} yPosition - Starting Y position
 * @returns {number} - Next available Y position
 */
function addItemsTable(
  doc,
  tableTitle,
  headers,
  columnWidths,
  items,
  dataMapper,
  yPosition
) {
  // Table title
  doc
    .fontSize(STYLES.fonts.heading.size)
    .font(STYLES.fonts.heading.font)
    .text(tableTitle, STYLES.margin, yPosition);

  yPosition += STYLES.spacing.section;

  // Table headers
  let xPosition = STYLES.margin;
  doc
    .fontSize(STYLES.fonts.tableHeader.size)
    .font(STYLES.fonts.tableHeader.font);

  headers.forEach((header, index) => {
    doc.text(header, xPosition, yPosition, { width: columnWidths[index] });
    xPosition += columnWidths[index];
  });

  // Header line
  yPosition += 20;
  doc.moveTo(STYLES.margin, yPosition).lineTo(520, yPosition).stroke();
  yPosition += 10;

  // Table rows
  doc.fontSize(STYLES.fonts.tableBody.size).font(STYLES.fonts.tableBody.font);

  items.forEach((item) => {
    xPosition = STYLES.margin;
    const rowData = dataMapper(item);

    rowData.forEach((data, index) => {
      doc.text(data, xPosition, yPosition, { width: columnWidths[index] });
      xPosition += columnWidths[index];
    });

    yPosition += 20;
  });

  // Footer line
  doc.moveTo(STYLES.margin, yPosition).lineTo(520, yPosition).stroke();
  yPosition += STYLES.spacing.line;

  return yPosition;
}

/**
 * Add totals section at the end of tables
 * @param {PDFDocument} doc - The PDF document
 * @param {Object} totals - Object with total calculations
 * @param {number} yPosition - Starting Y position
 * @param {number} xPosition - X position (default: 400)
 * @returns {number} - Next available Y position
 */
function addTotalsSection(doc, totals, yPosition, xPosition = 400) {
  doc.fontSize(STYLES.fonts.body.size).font(STYLES.fonts.heading.font);

  Object.entries(totals).forEach(([key, value], index) => {
    const y = yPosition + index * 20;
    doc.text(`${key}: ${value}`, xPosition, y);
  });

  return yPosition + Object.keys(totals).length * 20 + STYLES.spacing.section;
}

/**
 * Add remarks section if remarks exist
 * @param {PDFDocument} doc - The PDF document
 * @param {string} remarks - Remarks text
 * @param {number} yPosition - Starting Y position
 * @returns {number} - Next available Y position
 */
function addRemarksSection(doc, remarks, yPosition) {
  if (!remarks) return yPosition;

  doc
    .fontSize(STYLES.fonts.heading.size)
    .font(STYLES.fonts.heading.font)
    .text('Remarks:', STYLES.margin, yPosition);

  doc
    .fontSize(STYLES.fonts.small.size)
    .font(STYLES.fonts.small.font)
    .text(remarks, STYLES.margin, yPosition + 20, { width: 500 });

  return yPosition + 60;
}

/**
 * Add important notes section
 * @param {PDFDocument} doc - The PDF document
 * @param {Array} notes - Array of note strings
 * @param {number} yPosition - Starting Y position
 * @returns {number} - Next available Y position
 */
function addNotesSection(doc, notes, yPosition) {
  doc
    .fontSize(STYLES.fonts.heading.size)
    .font(STYLES.fonts.heading.font)
    .text('Important Notes:', STYLES.margin, yPosition);

  doc.fontSize(STYLES.fonts.small.size).font(STYLES.fonts.small.font);

  notes.forEach((note, index) => {
    doc.text(`• ${note}`, STYLES.margin, yPosition + 20 + index * 15);
  });

  return yPosition + 20 + notes.length * 15 + STYLES.spacing.section;
}

/**
 * Add document footer
 * @param {PDFDocument} doc - The PDF document
 * @param {string} documentType - Type of document for footer text
 * @param {number} yPosition - Y position for footer (default: 750)
 */
function addDocumentFooter(doc, documentType, yPosition = 750) {
  doc
    .fontSize(STYLES.fonts.small.size)
    .font(STYLES.fonts.small.font)
    .text(`${COMPANY_INFO.name} - ${documentType}`, STYLES.margin, yPosition)
    .text(
      `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
      400,
      yPosition
    );
}

/**
 * Calculate GST tax breakdown
 * @param {number} amount - Base amount
 * @param {number} taxRate - Tax rate (default: 12% for steel tubes)
 * @returns {Object} - Tax breakdown with CGST, SGST, and total
 */
function calculateGSTBreakdown(amount, taxRate = 12) {
  const cgst = (amount * taxRate) / 200; // Half of GST rate
  const sgst = (amount * taxRate) / 200; // Half of GST rate
  return {
    cgst: cgst,
    sgst: sgst,
    total: cgst + sgst,
    rate: taxRate,
  };
}

/**
 * Format currency in Indian format
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format date in Indian format
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN');
}

/**
 * Create standardized PDF response headers
 * @param {Response} res - Express response object
 * @param {string} documentType - Type of document
 * @param {string} documentNumber - Document number/identifier
 */
function setPDFResponseHeaders(res, documentType, documentNumber) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${documentType}-${documentNumber}.pdf"`
  );
}

module.exports = {
  // Constants
  COMPANY_INFO,
  STYLES,

  // Template functions
  addCompanyHeader,
  addDocumentTitle,
  addDocumentDetails,
  addCustomerDetails,
  addSummarySection,
  addItemsTable,
  addTotalsSection,
  addRemarksSection,
  addNotesSection,
  addDocumentFooter,

  // Utility functions
  calculateGSTBreakdown,
  formatCurrency,
  formatDate,
  setPDFResponseHeaders,
};
