# TODO

## Database
- [x] Setup MongoDB for database

## Critical Bug Fixes (Immediate Priority)
- [ ] Fix inventory API connection failures - investigate backend inventory endpoint
- [ ] Fix inventory dashboard showing all zeros and infinite loading
- [ ] Implement lead deduplication logic to remove duplicate entries in dropdowns
- [ ] Add proper error handling for failed API calls across the application

## High Priority Bug Fixes
- [ ] Fix inventory items flickering bug on Inventory Dashboard page
- [ ] Update product categories from generic (Electronics, Clothing) to steel tube specific (Square Tubes, Rectangular Tubes, Round Tubes, Oval Tubes)
- [ ] Fix tax (12% GST) for steel tubes in product categories
- [ ] Fix navigation overflow - implement responsive navigation with dropdown or scrolling
- [ ] Clean up database schema warnings (duplicate indexes for quotationNumber, poNumber, doNumber, etc.)

## Medium Priority Bug Fixes
- [ ] Implement proper loading states with timeout handling for inventory dashboard
- [ ] Fix MongoDB driver deprecation warnings (remove useNewUrlParser, useUnifiedTopology)
- [ ] General bug fixes

## UI/UX Improvements
- [ ] Improve error message styling and positioning consistency across all forms
- [ ] Make tax rate configurable instead of defaulting to 18%
- [ ] Implement comprehensive error boundaries for better user experience

## Features
- [ ] Implement PDF generation - Invoice Generation using the format provided
- [ ] Fetch DO2 from where it is generated
- [ ] Add dropdowns instead of manual input for Size Thickness (mm)

## Technical Debt & Maintenance
- [ ] Update deprecated Node.js code (fs.F_OK to fs.constants.F_OK)
- [ ] Fix webpack dev server deprecation warnings
- [ ] Update deprecated dependencies for future compatibility
- [ ] Improve overall UX consistency across the application

## Testing & Quality Assurance
- [ ] Add automated tests for inventory API endpoints
- [ ] Implement retry mechanisms for failed network requests
- [ ] Add end-to-end tests for critical user workflows (Lead → Quotation → PO → DO1 → DO2 → Invoice)