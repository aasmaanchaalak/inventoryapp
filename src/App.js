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

  const NavButton = ({ item, onClick, isActive }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors flex items-center space-x-3 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      <span className="text-lg">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );

  return (
    <div className="App">
      <div className="min-h-screen bg-gray-100 py-4 md:py-8">
        <div className="container mx-auto px-4">
          {/* Navigation */}
          <div className="mb-8">
            <nav className="bg-white shadow-md rounded-lg">
              {/* Mobile Header */}
              <div className="md:hidden flex items-center justify-between p-4 border-b">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Steel Tube ERP
                  </h1>
                  <p className="text-sm text-gray-600">
                    {navigationGroups
                      .flatMap((g) => g.items)
                      .find((item) => item.key === activeForm)?.label ||
                      'Dashboard'}
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  aria-label="Toggle navigation menu"
                >
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
              <div className="hidden md:block p-4">
                <div className="relative">
                  <div className="flex overflow-x-auto space-x-6 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {navigationGroups.map((group) => (
                      <div key={group.title} className="flex-shrink-0">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                          {group.title}
                        </h3>
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
                              <span className="text-base">{item.icon}</span>
                              <span className="hidden lg:inline">
                                {item.label}
                              </span>
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
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white to-transparent pointer-events-none opacity-50"></div>
                </div>
              </div>

              {/* Mobile Navigation - Collapsible */}
              <div
                className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
              >
                <div className="px-4 py-2 space-y-4 max-h-96 overflow-y-auto">
                  {navigationGroups.map((group) => (
                    <div key={group.title}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1">
                        {group.title}
                      </h3>
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
          {activeForm === 'leads' && <LeadCreationForm />}
          {activeForm === 'quotations' && <QuotationForm />}
          {activeForm === 'pos' && <POGenerator />}
          {activeForm === 'do1' && <DO1Generator />}
          {activeForm === 'inventory' && <InventoryDashboard />}
          {activeForm === 'inventoryAdd' && <InventoryAddForm />}
          {activeForm === 'tally' && <TallyPush />}
          {activeForm === 'invoice' && <InvoiceGenerator />}
          {activeForm === 'invoiceViewer' && <InvoiceViewer />}
          {activeForm === 'invoiceDashboard' && <InvoiceDashboard />}
          {activeForm === 'timeline' && <DOTimeline />}
          {activeForm === 'calendar' && <DispatchCalendar />}
          {activeForm === 'emailTester' && <EmailTester />}
          {activeForm === 'smsTester' && <SMSTester />}
          {activeForm === 'reports' && <ReportsDashboard />}
          {activeForm === 'auditTrail' && <AuditTrailViewer />}
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
      <div className="container mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Lead Details
          </h1>
          <p className="text-gray-600">Lead ID: {id}</p>
          <p className="text-gray-600 mt-2">
            This page would show detailed lead information.
          </p>
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
      <div className="container mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Quotation Details
          </h1>
          <p className="text-gray-600">Quotation ID: {id}</p>
          <p className="text-gray-600 mt-2">
            This page would show detailed quotation information.
          </p>
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
      <div className="container mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Purchase Order Details
          </h1>
          <p className="text-gray-600">PO ID: {id}</p>
          <p className="text-gray-600 mt-2">
            This page would show detailed PO information.
          </p>
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
      <div className="container mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">DO1 Details</h1>
          <p className="text-gray-600">DO1 ID: {id}</p>
          <p className="text-gray-600 mt-2">
            This page would show detailed DO1 information.
          </p>
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
      <div className="container mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invoice Details
          </h1>
          <p className="text-gray-600">DO2 ID: {do2Id}</p>
          <p className="text-gray-600 mt-2">
            This page would show detailed invoice information.
          </p>
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
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
        <Route path="/quotations/:id" element={<QuotationDetailPage />} />
        <Route path="/pos/:id" element={<PODetailPage />} />
        <Route path="/do1/:id" element={<DO1DetailPage />} />
        <Route path="/invoice/:do2Id" element={<InvoiceDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
