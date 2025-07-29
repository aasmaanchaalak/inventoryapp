import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from 'react-router-dom';
import './App.css';
import LeadCreationForm from './components/LeadCreationForm';
import QuotationForm from './components/QuotationForm';
import POGenerator from './components/POGenerator';
import DO1Generator from './components/DO1Generator';
import InventoryDashboard from './components/InventoryDashboard';
import TallyPush from './components/TallyPush';
import InvoiceGenerator from './components/InvoiceGenerator';
import InvoiceViewer from './components/InvoiceViewer';
import InvoiceDashboard from './components/InvoiceDashboard';
import DOTimeline from './components/DOTimeline';
import DispatchCalendar from './components/DispatchCalendar';
import EmailTester from './components/EmailTester';
import SMSTester from './components/SMSTester';
import ReportsDashboard from './components/ReportsDashboard';
import AuditTrailViewer from './components/AuditTrailViewer';
import InvoiceAuditTrail from './components/InvoiceAuditTrail';
import InventoryAddForm from './components/InventoryAddForm';

// Main Dashboard Component
function Dashboard() {
  const [activeForm, setActiveForm] = useState('inventory');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items organized by category
  const navigationGroups = [
    {
      title: 'Core Workflow',
      items: [
        { key: 'leads', label: 'Lead Creation', icon: '👥' },
        { key: 'quotations', label: 'Quotation Form', icon: '📋' },
        { key: 'pos', label: 'PO Generator', icon: '📄' },
        { key: 'do1', label: 'DO1 Generator', icon: '📦' },
      ],
    },
    {
      title: 'Inventory & Reports',
      items: [
        { key: 'inventory', label: 'Inventory Dashboard', icon: '📊' },
        { key: 'inventoryAdd', label: 'Add Inventory', icon: '➕' },
        { key: 'reports', label: 'Reports Dashboard', icon: '📈' },
      ],
    },
    {
      title: 'Invoicing',
      items: [
        { key: 'invoice', label: 'Invoice Generator', icon: '🧾' },
        { key: 'invoiceViewer', label: 'Invoice Viewer', icon: '👁️' },
        { key: 'invoiceDashboard', label: 'Invoice Dashboard', icon: '📋' },
      ],
    },
    {
      title: 'Tracking & Audit',
      items: [
        { key: 'timeline', label: 'DO Timeline', icon: '📅' },
        { key: 'calendar', label: 'Dispatch Calendar', icon: '🗓️' },
        { key: 'auditTrail', label: 'Audit Trail Viewer', icon: '🔍' },
        { key: 'invoiceAuditTrail', label: 'Invoice Audit Trail', icon: '📝' },
      ],
    },
    {
      title: 'Integration & Testing',
      items: [
        { key: 'tally', label: 'Tally Integration', icon: '🔗' },
        { key: 'emailTester', label: 'Email Tester', icon: '📧' },
        { key: 'smsTester', label: 'SMS Tester', icon: '💬' },
      ],
    },
  ];

  const NavButton = ({ item, onClick, isActive }: any) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors flex items-center space-x-3 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      provided... Remove this comment to see the full error message
      <span className="text-lg">{item.icon}</span>
      provided... Remove this comment to see the full error message
      <span>{item.label}</span>
    </button>
  );

  return (
    <div className="App">
      provided... Remove this comment to see the full error message
      <div className="min-h-screen bg-gray-100 py-4 md:py-8">
        provided... Remove this comment to see the full error message
        <div className="container mx-auto px-4">
          {/* Navigation */}
          is provided... Remove this comment to see the full error message
          <div className="mb-8">
            flag is provided... Remove this comment to see the full error
            message
            <nav className="bg-white shadow-md rounded-lg">
              {/* Mobile Header */}
              flag is provided... Remove this comment to see the full error
              message
              <div className="md:hidden flex items-center justify-between p-4 border-b">
                flag is provided... Remove this comment to see the full error
                message
                <div>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <h1 className="text-lg font-bold text-gray-900">
                    Steel Tube ERP
                  </h1>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <p className="text-sm text-gray-600">
                    {navigationGroups
                      .flatMap((g) => g.items)
                      .find((item) => item.key === activeForm)?.label ||
                      'Dashboard'}
                  </p>
                </div>
                flag is provided... Remove this comment to see the full error
                message
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {/* Desktop Navigation - Horizontal Scrollable Groups */}
              flag is provided... Remove this comment to see the full error
              message
              <div className="hidden md:block p-4">
                flag is provided... Remove this comment to see the full error
                message
                <div className="relative">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <div className="flex overflow-x-auto space-x-6 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {navigationGroups.map((group) => (
                      <div key={group.title} className="flex-shrink-0">
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                          {group.title}
                        </h3>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <div className="flex space-x-2">
                          {group.items.map((item) => (
                            <button
                              key={item.key}
                              onClick={() => setActiveForm(item.key)}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center space-x-2 ${
                                activeForm === item.key
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                              }`}
                            >
                              unless the '--jsx' flag is provided... Remove this
                              comment to see the full error message
                              <span className="text-base">{item.icon}</span>
                              unless the '--jsx' flag is provided... Remove this
                              comment to see the full error message
                              <span className="hidden lg:inline">
                                {item.label}
                              </span>
                              unless the '--jsx' flag is provided... Remove this
                              comment to see the full error message
                              <span className="lg:hidden">
                                {item.label.split(' ')[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Scroll hint */}
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white to-transparent pointer-events-none opacity-50"></div>
                </div>
              </div>
              {/* Mobile Navigation - Collapsible */}
              flag is provided... Remove this comment to see the full error
              message
              <div
                className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
              >
                flag is provided... Remove this comment to see the full error
                message
                <div className="px-4 py-2 space-y-4 max-h-96 overflow-y-auto">
                  {navigationGroups.map((group) => (
                    <div key={group.title}>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1">
                        {group.title}
                      </h3>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <NavButton
                            key={item.key}
                            item={item}
                            onClick={() => {
                              setActiveForm(item.key);
                              setIsMobileMenuOpen(false);
                            }}
                            isActive={activeForm === item.key}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </nav>
          </div>
          {/* Form Content */}
          is provided... Remove this comment to see the full error message
          {activeForm === 'leads' && <LeadCreationForm />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'quotations' && <QuotationForm />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'pos' && <POGenerator />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'do1' && <DO1Generator />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'inventory' && <InventoryDashboard />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'inventoryAdd' && <InventoryAddForm />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'tally' && <TallyPush />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'invoice' && <InvoiceGenerator />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'invoiceViewer' && <InvoiceViewer />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'invoiceDashboard' && <InvoiceDashboard />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'timeline' && <DOTimeline />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'calendar' && <DispatchCalendar />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'emailTester' && <EmailTester />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'smsTester' && <SMSTester />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'reports' && <ReportsDashboard />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'auditTrail' && <AuditTrailViewer />}
          is provided... Remove this comment to see the full error message
          {activeForm === 'invoiceAuditTrail' && <InvoiceAuditTrail />}
        </div>
      </div>
    </div>
  );
}

// Individual Page Components
function LeadDetailPage() {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      provided... Remove this comment to see the full error message
      <div className="container mx-auto">
        provided... Remove this comment to see the full error message
        <div className="bg-white shadow-md rounded-lg p-6">
          is provided... Remove this comment to see the full error message
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Lead Details
          </h1>
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600">Lead ID: {id}</p>
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600 mt-2">
            This page would show detailed lead information.
          </p>
          is provided... Remove this comment to see the full error message
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function QuotationDetailPage() {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      provided... Remove this comment to see the full error message
      <div className="container mx-auto">
        provided... Remove this comment to see the full error message
        <div className="bg-white shadow-md rounded-lg p-6">
          is provided... Remove this comment to see the full error message
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Quotation Details
          </h1>
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600">Quotation ID: {id}</p>
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600 mt-2">
            This page would show detailed quotation information.
          </p>
          is provided... Remove this comment to see the full error message
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function PODetailPage() {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      provided... Remove this comment to see the full error message
      <div className="container mx-auto">
        provided... Remove this comment to see the full error message
        <div className="bg-white shadow-md rounded-lg p-6">
          is provided... Remove this comment to see the full error message
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Purchase Order Details
          </h1>
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600">PO ID: {id}</p>
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600 mt-2">
            This page would show detailed PO information.
          </p>
          is provided... Remove this comment to see the full error message
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function DO1DetailPage() {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      provided... Remove this comment to see the full error message
      <div className="container mx-auto">
        provided... Remove this comment to see the full error message
        <div className="bg-white shadow-md rounded-lg p-6">
          is provided... Remove this comment to see the full error message
          <h1 className="text-2xl font-bold text-gray-900 mb-4">DO1 Details</h1>
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600">DO1 ID: {id}</p>
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600 mt-2">
            This page would show detailed DO1 information.
          </p>
          is provided... Remove this comment to see the full error message
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function InvoiceDetailPage() {
  const { do2Id } = useParams();
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      provided... Remove this comment to see the full error message
      <div className="container mx-auto">
        provided... Remove this comment to see the full error message
        <div className="bg-white shadow-md rounded-lg p-6">
          is provided... Remove this comment to see the full error message
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invoice Details
          </h1>
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600">DO2 ID: {do2Id}</p>
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600 mt-2">
            This page would show detailed invoice information.
          </p>
          is provided... Remove this comment to see the full error message
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      provided... Remove this comment to see the full error message
      <Routes>
        provided... Remove this comment to see the full error message
        <Route path="/" element={<Dashboard />} />
        provided... Remove this comment to see the full error message
        <Route path="/leads/:id" element={<LeadDetailPage />} />
        provided... Remove this comment to see the full error message
        <Route path="/quotations/:id" element={<QuotationDetailPage />} />
        provided... Remove this comment to see the full error message
        <Route path="/pos/:id" element={<PODetailPage />} />
        provided... Remove this comment to see the full error message
        <Route path="/do1/:id" element={<DO1DetailPage />} />
        provided... Remove this comment to see the full error message
        <Route path="/invoice/:do2Id" element={<InvoiceDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
