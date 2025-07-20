# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Start Development Environment
```bash
# Start both frontend and backend concurrently
npm run dev

# Start frontend only (port 3000)
npm start

# Start backend only (port 5000)
npm run server
```

### Testing and Building
```bash
# Run tests
npm test

# Build production frontend
npm run build
```

### Individual Testing
```bash
# Test specific API endpoints using curl or Postman
curl http://localhost:5000/api/health

# Test SMS functionality
curl -X POST http://localhost:5000/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "message": "Test message"}'
```

## Architecture Overview

### Full-Stack MERN Application
- **Frontend**: React 19 with React Router for SPA navigation
- **Backend**: Express.js API server with RESTful endpoints
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS with custom components
- **Forms**: React Hook Form with Yup validation

### Key Application Domains

#### 1. Lead Management Flow
- **Lead Creation** → **Quotations** → **Purchase Orders** → **DO1 (Delivery Order 1)** → **DO2 (Delivery Order 2)** → **Invoicing**
- Each stage has dedicated components and API endpoints
- Full audit trail tracking for all operations

#### 2. Inventory Management
- Real-time inventory tracking with MongoDB
- Integration with Tally ERP for accounting
- Automatic inventory updates during DO2 execution

#### 3. Document Generation
- PDF generation using PDFKit for invoices, POs, and delivery orders
- Template-based document creation with company branding
- Audit trail logging for all document operations

#### 4. Communication Systems
- **Email**: Nodemailer integration for automated notifications
- **SMS**: MSG91 integration for dispatch notifications
- Automatic notifications triggered during DO2 execution

### Core Components Architecture

#### Frontend (src/components/)
- **Dashboard Navigation**: Single-page tabbed interface in App.js
- **Form Components**: React Hook Form with Yup validation
- **Viewers**: Dedicated components for viewing invoices, audit trails
- **Data Visualization**: Recharts for reports and analytics
- **Calendar Integration**: react-big-calendar for dispatch scheduling

#### Backend (backend/)
- **Models**: Mongoose schemas for all business entities (Lead, Quotation, PO, DO1, DO2, Invoice, Inventory)
- **Routes**: RESTful API endpoints organized by domain
- **Services**: Email and SMS service abstractions
- **Server**: Express application with CORS, MongoDB connection, and graceful shutdown

### Database Schema Relationships
- Lead → Quotation → PurchaseOrder → DO1 → DO2 → Invoice
- Inventory items linked to POs and DOs for stock tracking
- Audit trails maintained for Invoice and other critical operations

### Environment Configuration
- `.env` file required for MongoDB URI, MSG91 SMS credentials, email settings
- Default MongoDB: `mongodb://localhost:27017/inventoryapp`
- Backend port: 5000, Frontend port: 3000

### External Integrations

#### SMS (MSG91)
- Requires MSG91_API_KEY, MSG91_SENDER_ID, MSG91_TEMPLATE_ID
- Automatic SMS on DO2 execution
- Test interface available in SMS Tester component
- See SMS_SETUP.md for detailed configuration

#### Tally ERP
- Data synchronization for accounting
- Inventory updates push to Tally
- TallyPush component for manual sync operations

### Critical Workflows

#### Invoice Generation and Audit
- InvoiceGenerator creates invoices with line items
- InvoiceAuditTrail tracks all changes with event filtering
- Color-coded event types for visual distinction
- Real-time audit trail updates during operations

#### Inventory Operations
- InventoryDashboard shows real-time stock levels
- Automatic deduction during DO2 execution
- Integration with purchase orders for stock replenishment

#### Reporting System
- ReportsDashboard with multiple report types
- Data visualization using Recharts
- Export capabilities for business intelligence

### Error Handling Patterns
- Consistent API response format with success/error states
- Frontend error boundaries for component isolation
- Database operation error handling with rollback capabilities
- SMS/Email failures don't block core business operations

### Authentication & Security Notes
- No authentication system currently implemented
- Environment variables used for sensitive credentials
- API endpoints are currently open (suitable for internal systems)
- Input validation using Yup schemas on frontend and backend