import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
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

// Main Dashboard Component
function Dashboard() {
  const [activeForm, setActiveForm] = useState('inventory');
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="App">
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto">
          {/* Navigation */}
          <div className="mb-8">
            <nav className="bg-white shadow-md rounded-lg p-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveForm('leads')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'leads'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Lead Creation
                </button>
                <button
                  onClick={() => setActiveForm('quotations')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'quotations'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Quotation Form
                </button>
                <button
                  onClick={() => setActiveForm('pos')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'pos'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  PO Generator
                </button>
                <button
                  onClick={() => setActiveForm('do1')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'do1'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  DO1 Generator
                </button>
                <button
                  onClick={() => setActiveForm('inventory')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'inventory'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Inventory Dashboard
                </button>
                <button
                  onClick={() => setActiveForm('tally')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'tally'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Tally Integration
                </button>
                <button
                  onClick={() => setActiveForm('invoice')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'invoice'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Invoice Generator
                </button>
                <button
                  onClick={() => setActiveForm('invoiceViewer')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'invoiceViewer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Invoice Viewer
                </button>
                <button
                  onClick={() => setActiveForm('invoiceDashboard')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'invoiceDashboard'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Invoice Dashboard
                </button>
                <button
                  onClick={() => setActiveForm('timeline')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'timeline'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  DO Timeline
                </button>
                <button
                  onClick={() => setActiveForm('calendar')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'calendar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Dispatch Calendar
                </button>
                <button
                  onClick={() => setActiveForm('emailTester')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'emailTester'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Email Tester
                </button>
                <button
                  onClick={() => setActiveForm('smsTester')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'smsTester'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  SMS Tester
                </button>
                <button
                  onClick={() => setActiveForm('reports')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'reports'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Reports Dashboard
                </button>
                <button
                  onClick={() => setActiveForm('auditTrail')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'auditTrail'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Audit Trail Viewer
                </button>
                <button
                  onClick={() => setActiveForm('invoiceAuditTrail')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === 'invoiceAuditTrail'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Invoice Audit Trail
                </button>
              </div>
            </nav>
          </div>

          {/* Form Content */}
          {activeForm === 'leads' && <LeadCreationForm />}
          {activeForm === 'quotations' && <QuotationForm />}
          {activeForm === 'pos' && <POGenerator />}
          {activeForm === 'do1' && <DO1Generator />}
          {activeForm === 'inventory' && <InventoryDashboard />}
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lead Details</h1>
          <p className="text-gray-600">Lead ID: {id}</p>
          <p className="text-gray-600 mt-2">This page would show detailed lead information.</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quotation Details</h1>
          <p className="text-gray-600">Quotation ID: {id}</p>
          <p className="text-gray-600 mt-2">This page would show detailed quotation information.</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Purchase Order Details</h1>
          <p className="text-gray-600">PO ID: {id}</p>
          <p className="text-gray-600 mt-2">This page would show detailed PO information.</p>
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
          <p className="text-gray-600 mt-2">This page would show detailed DO1 information.</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Details</h1>
          <p className="text-gray-600">DO2 ID: {do2Id}</p>
          <p className="text-gray-600 mt-2">This page would show detailed invoice information.</p>
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
