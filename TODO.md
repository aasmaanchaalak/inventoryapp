# TODO

## Database
- [x] Setup MongoDB for database

## Critical Bug Fixes (Immediate Priority)
- [x] Fix inventory API connection failures - investigate backend inventory endpoint
- [x] Fix inventory dashboard showing all zeros and infinite loading

- [x] **Implement lead deduplication logic to remove duplicate entries in dropdowns**
  - **Files to modify:** `src/components/POGenerator.jsx`, `src/components/QuotationForm.jsx`
  - **Issue:** Lead dropdowns show multiple duplicate entries for same customers
  - **Solution:** 
    - Add deduplication logic in `useEffect` hooks that fetch leads
    - Use `Array.filter()` with `findIndex()` to remove duplicates based on unique identifier (`_id`)
    - Alternatively, fix at backend level in `/api/leads` endpoint to return distinct results
  - **Testing:** Use Playwright to verify dropdown only shows unique leads
  - **Acceptance criteria:** Each lead appears only once in all dropdown menus

- [x] **Add proper error handling for failed API calls across the application**
  - **Files modified:** `src/hooks/useApi.js`, `src/components/InventoryDashboard.jsx`, `src/components/POGenerator.jsx`, `src/components/QuotationForm.jsx`, `src/components/LeadCreationForm.js`
  - **Completed:**
    - ✅ Created reusable `useApi` hook with comprehensive error handling
    - ✅ Implemented retry mechanisms with exponential backoff (3 retries max)
    - ✅ Added loading states with 10-second timeout handling
    - ✅ Wrapped all `fetch()` calls in try-catch blocks with AbortController
    - ✅ Added user-friendly error messages and fallback UI
    - ✅ Updated 4 core components to use new error handling system
  - **Features implemented:**
    - Automatic retry for network failures (500-level errors, fetch failures)
    - Timeout handling with proper cleanup
    - Consistent error state management across components
    - Loading indicators and retry buttons in UI
    - Error categorization (network, timeout, server, client errors)
  - **Testing:** Network failure simulation completed successfully

## High Priority Bug Fixes

- [ ] **Fix inventory items flickering bug on Inventory Dashboard page**
  - **File to modify:** `src/components/InventoryDashboard.jsx`
  - **Issue:** Inventory items section flickers during data loading
  - **Root cause:** Multiple re-renders during API calls or state updates
  - **Solution:**
    - Add proper loading state management
    - Use `useMemo` or `useCallback` to prevent unnecessary re-renders
    - Implement debouncing for filter changes
    - Add skeleton loading UI instead of showing/hiding content
  - **Testing:** Navigate to Inventory Dashboard and verify smooth loading without flicker
  - **Acceptance criteria:** No visual flickering during data loading or filtering

- [x] **Update product categories from generic to steel tube industry specific + Fix enum consistency**
  - **Files modified:** `src/config/productCategories.js`, `src/components/LeadCreationForm.js`, `src/components/QuotationForm.jsx`, `src/components/InventoryDashboard.jsx`, `backend/migrations/migrate-product-categories.js`, `backend/models/Lead.js`, `backend/models/PurchaseOrder.js`, `backend/models/Quotation.js`, `backend/models/DO1.js`, `backend/models/DO2.js`, `backend/models/Inventory.js`
  - **Completed:**
    - ✅ Created centralized product categories configuration (`src/config/productCategories.js`)
    - ✅ Updated LeadCreationForm.js with new steel tube categories
    - ✅ Updated QuotationForm.jsx to include "Custom Steel Products" category
    - ✅ Updated InventoryDashboard.jsx product type filter
    - ✅ Updated form validation to enforce new category values
    - ✅ Created comprehensive data migration script
    - ✅ **FIXED ENUM CONSISTENCY**: Updated all backend models to use consistent long-form enum values
    - ✅ Standardized Lead, PurchaseOrder, Quotation, DO1, DO2, Inventory models to use same format
    - ✅ Prevents validation errors when data flows between workflow steps
  - **New categories implemented:**
    - "Square Tubes" (value: square-tubes, shortValue: square)
    - "Rectangular Tubes" (value: rectangular-tubes, shortValue: rectangular) 
    - "Round Tubes" (value: round-tubes, shortValue: round)
    - "Oval Tubes" (value: oval-tubes, shortValue: oval)
    - "Custom Steel Products" (value: custom-steel-products, shortValue: custom)
  - **Data migration:** 
    - Migration script created: `backend/migrations/migrate-product-categories.js`
    - Maps all legacy categories (Electronics, Clothing, etc.) → "Custom Steel Products"
    - Includes dry-run and verification capabilities
    - Run with: `node backend/migrations/migrate-product-categories.js migrate --execute`
  - **Consistency:** All product dropdowns now use centralized configuration for consistency

- [x] **Fix tax rate to 12% GST for steel tubes instead of 18%**
  - **Files modified:** `src/config/taxRates.js`, `src/components/QuotationForm.jsx`, `src/components/DO1Generator.jsx`, `src/components/InvoiceViewer.jsx`, `src/components/TallyPush.jsx`
  - **Completed:**
    - ✅ Created comprehensive tax rate configuration system (`src/config/taxRates.js`)
    - ✅ Changed default tax rate from 18% to 12% for all steel tube products
    - ✅ Updated QuotationForm.jsx to use 12% GST with smart product-based calculation
    - ✅ Updated DO1Generator.jsx to use correct 12% tax rate
    - ✅ Updated InvoiceViewer.jsx to use steel tube tax rate
    - ✅ Updated TallyPush.jsx documentation to reflect 12% GST (6% CGST + 6% SGST)
    - ✅ Enhanced form validation to enforce valid GST rates (0%, 5%, 12%, 18%, 28%)
    - ✅ Implemented configurable tax rates per product type
  - **Tax rate configuration features:**
    - Default 12% GST for all steel tube categories (square, rectangular, round, oval, custom)
    - Product-type aware tax calculation with fallback mechanisms
    - Helper functions for tax calculation, formatting, and validation
    - Support for standard GST rates as per Indian tax regulations
    - HSN code mapping for steel tubes (7306, 7307, 7308)
  - **Testing verified:** Tax calculation works correctly (₹10,000 → ₹1,200 tax → ₹11,200 total)
  - **Acceptance criteria met:** All steel tube products now use 12% GST by default with proper calculation logic

- [x] **Fix navigation overflow - implement responsive navigation**
  - **File modified:** `src/App.js`, `RESPONSIVE_NAVIGATION.md`
  - **Completed:**
    - ✅ Implemented hamburger menu for mobile/tablet screens (< 768px)
    - ✅ Added horizontal scrollable grouped navigation for desktop
    - ✅ Created logical grouping of 16 navigation items into 5 categories
    - ✅ Added responsive breakpoints with proper screen size handling
    - ✅ Implemented current page indicators and visual enhancements
    - ✅ Added compressed labels for tablet view and full labels for desktop
  - **Navigation organization:**
    - **Core Workflow** (4 items): Lead Creation, Quotation Form, PO Generator, DO1 Generator
    - **Inventory & Reports** (2 items): Inventory Dashboard, Reports Dashboard
    - **Invoicing** (3 items): Invoice Generator, Invoice Viewer, Invoice Dashboard
    - **Tracking & Audit** (4 items): DO Timeline, Dispatch Calendar, Audit Trail Viewer, Invoice Audit Trail
    - **Integration & Testing** (3 items): Tally Integration, Email Tester, SMS Tester
  - **Responsive features:**
    - Mobile (< 768px): Hamburger menu with collapsible grouped navigation
    - Tablet (768px-1023px): Horizontal scrolling with compressed button labels
    - Desktop (≥ 1024px): Full grouped layout with complete labels and scroll hints
    - Works down to 320px width with all navigation items accessible
  - **Testing verified:** All 16 navigation buttons accessible on all screen sizes from mobile to desktop
  - **Acceptance criteria met:** Complete responsive navigation solution with improved UX and accessibility

- [x] **Clean up database schema warnings (duplicate indexes)**
  - **Files modified:** All model files in `backend/models/` directory
  - **Completed:**
    - ✅ Identified duplicate index definitions in 5 model files
    - ✅ Removed explicit `schema.index()` calls for fields already marked with `unique: true`
    - ✅ Fixed Quotation.js: Removed duplicate quotationNumber index (line 178)
    - ✅ Fixed PurchaseOrder.js: Removed duplicate poNumber index (line 176)
    - ✅ Fixed DO1.js: Removed duplicate doNumber index (line 182)
    - ✅ Fixed DO2.js: Removed duplicate do2Number index (line 212)
    - ✅ Fixed Invoice.js: Removed duplicate invoiceNumber and do2Id indexes (lines 154-155)
    - ✅ Verified Lead.js has no duplicate indexes (only compound index present)
  - **Root cause resolved:** Indexes were defined both in schema field options (`unique: true`) AND via separate `schema.index()` calls
  - **Solution applied:** Kept `unique: true` field constraints and removed redundant explicit index calls
  - **Testing verified:** Server starts successfully without duplicate index warnings
  - **Acceptance criteria met:** No Mongoose duplicate index warnings on server startup

## Medium Priority Bug Fixes

- [ ] **Implement proper loading states with timeout handling for inventory dashboard**
  - **File to modify:** `src/components/InventoryDashboard.jsx`
  - **Issue:** Dashboard shows "Loading..." indefinitely when API fails
  - **Requirements:**
    - Add 10-second timeout for all API calls
    - Show different states: loading, success, error, timeout
    - Implement retry button for failed requests
    - Add skeleton loading UI for better UX
  - **Implementation:**
    - Use `setTimeout` to abort requests after 10 seconds
    - Add loading state management with enum: 'idle', 'loading', 'success', 'error', 'timeout'
    - Create retry mechanism that resets state and attempts request again
  - **Testing:** Simulate slow/failed API responses and verify timeout behavior
  - **Acceptance criteria:** Dashboard never shows infinite loading state

- [ ] **Fix MongoDB driver deprecation warnings**
  - **File to modify:** `backend/server.js` or MongoDB connection setup
  - **Issue:** Warnings about deprecated options: useNewUrlParser, useUnifiedTopology
  - **Current warnings:**
    ```
    useNewUrlParser is a deprecated option
    useUnifiedTopology is a deprecated option
    ```
  - **Solution:** Remove these options from mongoose.connect() call
  - **Code change:** Update connection from:
    ```js
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    ```
    To:
    ```js
    mongoose.connect(uri)
    ```
  - **Testing:** Start server and verify no deprecation warnings
  - **Acceptance criteria:** No MongoDB driver warnings in console

- [ ] **General bug fixes and code cleanup**
  - **Scope:** Application-wide minor issues
  - **Tasks:**
    - Fix any TypeScript/PropTypes warnings
    - Remove unused imports and variables
    - Fix console warnings and errors
    - Update any outdated syntax or patterns
    - Ensure consistent code formatting
  - **Files:** Review all components for common issues
  - **Testing:** Run application and check console for any warnings/errors
  - **Acceptance criteria:** Clean console with no warnings or errors

## UI/UX Improvements

- [ ] **Improve error message styling and positioning consistency across all forms**
  - **Files to modify:** All form components (`LeadCreation.jsx`, `QuotationForm.jsx`, `POGenerator.jsx`, etc.)
  - **Issue:** Inconsistent error message display across different forms
  - **Requirements:**
    - Standardize error message styling (color, font size, positioning)
    - Ensure errors appear below their respective form fields
    - Add consistent red color (#ef4444) and small font size (text-sm)
    - Use consistent margin/padding for error messages
  - **Implementation:**
    - Create shared CSS classes or styled components for error messages
    - Update all form validation error displays to use consistent styling
    - Ensure proper spacing and alignment
  - **Testing:** Test form validation on all forms and verify consistent appearance
  - **Acceptance criteria:** All error messages look identical across the application

- [ ] **Implement responsive design for better mobile compatibility**
  - **Files to modify:** `src/App.js`, all major component files, `src/index.css`
  - **Issue:** Application not optimized for mobile/tablet devices
  - **Requirements:**
    - Support screen sizes from 320px to 1920px
    - Implement mobile-first responsive design
    - Use Tailwind CSS responsive utilities (sm:, md:, lg:, xl:)
    - Ensure forms are usable on mobile devices
    - Optimize navigation for smaller screens
  - **Key breakpoints:**
    - Mobile: 320px - 767px
    - Tablet: 768px - 1023px  
    - Desktop: 1024px+
  - **Testing:** Test on multiple device sizes using Playwright browser resizing
  - **Acceptance criteria:** Application fully functional on all screen sizes

- [ ] **Implement toast notifications for user feedback**
  - **Implementation:** Add react-toastify or similar library
  - **Files to modify:** `package.json`, `src/App.js`, all components with user actions
  - **Requirements:**
    - Success toast for completed actions (green)
    - Error toast for failures (red)
    - Info toast for general notifications (blue)
    - Warning toast for non-critical issues (yellow)
  - **Setup steps:**
    1. Install: `npm install react-toastify`
    2. Import and configure ToastContainer in App.js
    3. Replace alert() calls with toast notifications
    4. Add toasts for form submissions, API responses, etc.
  - **Testing:** Trigger various actions and verify appropriate toasts appear
  - **Acceptance criteria:** All user actions provide visual feedback via toasts

- [ ] **Make tax rate configurable instead of defaulting to 18%**
  - **Files to modify:** `src/components/QuotationForm.jsx`, any component with tax calculations
  - **Issue:** Tax rate is hardcoded and not easily configurable
  - **Requirements:**
    - Create configuration file or environment variable for tax rates
    - Allow different tax rates for different product types
    - Add admin interface to modify tax rates (optional)
    - Update all calculation logic to use configurable rates
  - **Implementation:**
    - Create `src/config/taxRates.js` with product-specific rates
    - Update calculation logic to reference configuration
    - Default steel tubes to 12% GST as per business requirements
  - **Testing:** Verify tax calculations use correct rates for different products
  - **Acceptance criteria:** Tax rates can be changed without code modifications

- [ ] **Implement comprehensive error boundaries for better user experience**
  - **Files to create:** `src/components/ErrorBoundary.jsx`
  - **Files to modify:** `src/App.js`, major component files
  - **Requirements:**
    - Catch JavaScript errors anywhere in component tree
    - Display user-friendly error messages instead of blank screen
    - Log errors for debugging purposes
    - Provide recovery options (refresh page, go back, etc.)
  - **Implementation:**
    - Create ErrorBoundary class component with componentDidCatch
    - Wrap main application sections with error boundaries
    - Design fallback UI for error states
    - Add error reporting mechanism
  - **Testing:** Intentionally trigger errors and verify graceful handling
  - **Acceptance criteria:** Application never shows blank screen or unhandled errors

## Features

- [ ] **Implement PDF generation for Invoice Generation**
  - **Files to modify:** `src/components/InvoiceGenerator.jsx`, `backend/routes/invoices.js`
  - **Requirements:** Generate professional PDF invoices using company format
  - **Libraries needed:** 
    - Frontend: `jspdf` or `react-pdf` for client-side generation
    - Backend: `pdfkit` (already mentioned in architecture) for server-side generation
  - **PDF Requirements:**
    - Company letterhead with Steel Tube Industries Ltd. branding
    - Invoice number, date, customer details
    - Itemized list with quantities, rates, tax calculations
    - Total amount with tax breakdown
    - Payment terms and bank details
    - Professional formatting with proper spacing and alignment
  - **Implementation:**
    - Create PDF template matching existing invoice format
    - Add "Download PDF" button to invoice viewer
    - Store generated PDFs on server or generate on-demand
    - Include invoice data from database (items, totals, customer info)
  - **Testing:** Generate sample invoices and verify PDF format matches requirements
  - **Acceptance criteria:** Professional PDF invoices generated with all required information

- [ ] **Implement DO2 data fetching and integration**
  - **Files to investigate:** Components that generate or consume DO2 data
  - **Issue:** DO2 data needs to be fetched from its generation source
  - **Requirements:**
    - Identify where DO2 records are created
    - Implement proper API endpoints for DO2 data retrieval
    - Update components to fetch and display DO2 information
    - Ensure data consistency between DO1 → DO2 → Invoice workflow
  - **Investigation needed:**
    - Find DO2 generation logic in codebase
    - Identify API endpoints for DO2 operations
    - Map data flow from DO2 to dependent components
  - **Implementation:**
    - Create/update DO2 API endpoints if missing
    - Add DO2 data fetching to relevant components
    - Implement proper error handling for DO2 operations
  - **Testing:** Test complete workflow from DO1 creation through DO2 to invoicing
  - **Acceptance criteria:** DO2 data correctly flows through the system

- [ ] **Add dropdowns for Size and Thickness instead of manual input**
  - **Files to modify:** `src/components/QuotationForm.jsx`, any component with size/thickness inputs
  - **Issue:** Currently uses text input for size and number input for thickness
  - **Requirements:**
    - Create predefined lists of common sizes and thickness values
    - Implement dropdown/select components for better data consistency
    - Still allow custom values via "Other" option with text input
    - Ensure validation works with new dropdown approach
  - **Size options for steel tubes:**
    - Square: 20x20mm, 25x25mm, 30x30mm, 40x40mm, 50x50mm, 60x60mm, 80x80mm, 100x100mm
    - Rectangular: 20x40mm, 25x50mm, 30x60mm, 40x80mm, 50x100mm, 60x120mm
    - Round: 20mm, 25mm, 32mm, 40mm, 50mm, 63mm, 75mm, 90mm, 110mm
    - Custom option for non-standard sizes
  - **Thickness options:** 1.5mm, 2.0mm, 2.5mm, 3.0mm, 4.0mm, 5.0mm, 6.0mm (common steel tube thicknesses)
  - **Implementation:**
    - Replace text/number inputs with select dropdowns
    - Add "Custom" option that shows text input when selected
    - Update form validation to handle both dropdown and custom values
    - Ensure consistency across all forms using size/thickness
  - **Testing:** Test dropdown functionality and custom value input
  - **Acceptance criteria:** Users can select from predefined values or enter custom sizes/thickness

## Technical Debt & Maintenance

- [ ] **Update deprecated Node.js code**
  - **Files to search:** All JavaScript files in project
  - **Issue:** Usage of deprecated `fs.F_OK`, should use `fs.constants.F_OK`
  - **Warning message:** `[DEP0176] DeprecationWarning: fs.F_OK is deprecated`
  - **Solution:**
    - Search codebase for `fs.F_OK` usage
    - Replace with `fs.constants.F_OK`
    - Update any other deprecated fs constants (R_OK, W_OK, X_OK)
  - **Search command:** `grep -r "fs\.F_OK" .` and `grep -r "fs\.R_OK" .`
  - **Testing:** Start application and verify no deprecation warnings
  - **Acceptance criteria:** No fs deprecation warnings in console

- [ ] **Fix webpack dev server deprecation warnings**
  - **Files to investigate:** `package.json`, webpack configuration, `react-scripts` version
  - **Issues:** 
    - `onAfterSetupMiddleware` option is deprecated
    - `onBeforeSetupMiddleware` option is deprecated
  - **Root cause:** Likely outdated react-scripts or webpack configuration
  - **Solutions:**
    - Update react-scripts to latest version: `npm update react-scripts`
    - If using custom webpack config, update to use `setupMiddlewares` option
    - Check if any custom webpack configuration needs updating
  - **Testing:** Start dev server and verify no middleware deprecation warnings
  - **Acceptance criteria:** Clean dev server startup without deprecation warnings

- [ ] **Update deprecated dependencies for future compatibility**
  - **Files to modify:** `package.json`, potentially `package-lock.json`
  - **Process:**
    1. Run `npm audit` to identify vulnerable/deprecated packages
    2. Use `npm outdated` to see packages with newer versions
    3. Update packages one by one, testing after each update
    4. Focus on security updates first, then feature updates
  - **High priority updates:** 
    - react-scripts (if outdated)
    - mongoose (ensure latest stable)
    - express (ensure latest stable)
  - **Testing:** Run full application test suite after each major update
  - **Acceptance criteria:** All dependencies on supported versions, no security vulnerabilities

- [ ] **Improve overall UX consistency across the application**
  - **Scope:** Application-wide user experience standardization
  - **Areas to standardize:**
    - Button styles and hover states
    - Form input styling and focus states
    - Loading states and spinners
    - Color scheme and typography
    - Spacing and padding consistency
    - Modal and popup styling
  - **Implementation:**
    - Create design system documentation
    - Extract common styles into reusable Tailwind components
    - Standardize spacing using Tailwind utilities consistently
    - Ensure all interactive elements have proper focus/hover states
  - **Testing:** Navigate through entire application and verify consistent styling
  - **Acceptance criteria:** Uniform look and feel across all application pages

## Testing & Quality Assurance

- [ ] **Add automated tests for inventory API endpoints**
  - **Files to create:** `backend/tests/inventory.test.js` or similar
  - **Testing framework:** Jest with Supertest for API testing
  - **Endpoints to test:**
    - GET `/api/inventory` - fetch all inventory items
    - POST `/api/inventory` - create new inventory item
    - PUT `/api/inventory/:id` - update inventory item
    - DELETE `/api/inventory/:id` - delete inventory item
  - **Test cases:**
    - Valid requests return correct status codes and data
    - Invalid requests return appropriate error messages
    - Authentication/authorization if applicable
    - Edge cases (missing fields, invalid IDs, etc.)
  - **Setup:**
    - Install testing dependencies: `jest`, `supertest`
    - Create test database configuration
    - Add npm script: `"test:api": "jest backend/tests"`
  - **Acceptance criteria:** All inventory API endpoints have comprehensive test coverage

- [ ] **Implement retry mechanisms for failed network requests**
  - **Files to modify:** All components making API calls, or create centralized API utility
  - **Requirements:**
    - Automatic retry for network failures (3 attempts max)
    - Exponential backoff between retries (1s, 2s, 4s)
    - Only retry on specific error types (network errors, 5xx responses)
    - Don't retry on 4xx client errors
  - **Implementation:**
    - Create `src/utils/apiRetry.js` utility function
    - Wrap existing fetch calls with retry logic
    - Add retry indicators in UI (optional)
    - Log retry attempts for debugging
  - **Error types to retry:**
    - Network errors (Failed to fetch)
    - Server errors (500, 502, 503, 504)
    - Timeout errors
  - **Testing:** Simulate network failures and verify retry behavior
  - **Acceptance criteria:** Failed requests automatically retry before showing error to user

- [ ] **Add end-to-end tests for critical user workflows**
  - **Testing framework:** Playwright (already available via MCP)
  - **Critical workflows to test:**
    1. Lead Creation → View in dropdown
    2. Lead → Quotation Creation → PDF generation
    3. Quotation → Purchase Order creation
    4. PO → DO1 generation
    5. DO1 → DO2 creation
    6. DO2 → Invoice generation
    7. Complete flow: Lead to Invoice
  - **Test implementation:**
    - Create test data fixtures
    - Implement page object pattern for maintainable tests
    - Add assertions for data persistence between steps
    - Include screenshot comparisons for UI regression testing
  - **Files to create:**
    - `tests/e2e/critical-workflows.spec.js`
    - `tests/e2e/helpers/` for page objects and utilities
  - **Acceptance criteria:** All critical business workflows have automated end-to-end test coverage