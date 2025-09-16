import React, { useState, useEffect } from 'react';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import { STEEL_TUBE_CATEGORIES } from '../config/productCategories';
import { LEAD_SOURCES } from '../config/leadSources';
import LeadCreationForm from './LeadCreationForm';

const LeadsDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState({
    leadSource: '',
    status: '',
    dateRange: '',
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Use the authenticated API hook for comprehensive error handling
  const {
    get: fetchLeadsData,
    isLoading,
    isError,
    isTimeout,
    error,
    isAuthenticated,
    authLoading,
  } = useAuthenticatedApi({
    timeout: 10000,
    retries: 3,
    showToast: true,
  });

  // Simple fetch function without complex dependencies
  const loadLeads = async (filterParams = {}) => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    try {
      const queryParams = new URLSearchParams(filterParams).toString();
      console.log(
        'Loading leads with params:',
        filterParams,
        'Query string:',
        queryParams
      );
      const data = await fetchLeadsData(
        `http://localhost:5001/api/leads/dashboard?${queryParams}`
      );

      if (data && data.success) {
        console.log('Received leads data:', data.data);
        setLeads(data.data.leads || []);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  // Load leads when component mounts or auth changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);

    // Apply filters immediately
    const activeFilters = {};
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val && val !== '') {
        activeFilters[key] = val;
      }
    });

    loadLeads(activeFilters);
  };

  // Get lead status badge
  const getLeadStatusBadge = (status) => {
    const statusColors = {
      new: 'bg-blue-100 text-blue-800',
      quotation: 'bg-yellow-100 text-yellow-800',
      'po received': 'bg-purple-100 text-purple-800',
      'do1 generated': 'bg-orange-100 text-orange-800',
      'do sent': 'bg-green-100 text-green-800',
      invoiced: 'bg-gray-100 text-gray-800',
    };

    const statusLabels = {
      new: 'NEW',
      quotation: 'QUOTATION',
      'po received': 'PO RECEIVED',
      'do1 generated': 'DO1 GENERATED',
      'do sent': 'DO SENT',
      invoiced: 'INVOICED',
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[status] || statusColors.new
        }`}
      >
        {statusLabels[status] || 'NEW'}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get lead source label
  const getLeadSourceLabel = (value) => {
    const source = LEAD_SOURCES.find((s) => s.value === value);
    return source ? source.label : value;
  };

  // Get product interest label
  const getProductInterestLabel = (value) => {
    const product = STEEL_TUBE_CATEGORIES.find((p) => p.value === value);
    return product ? product.label : value;
  };

  // Handle lead actions
  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setShowViewModal(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  };

  const handleAddLead = () => {
    setShowAddModal(true);
  };

  // Handle modal close
  const closeModals = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedLead(null);
  };

  // Handle successful lead creation/update
  const handleLeadSuccess = () => {
    closeModals();
    loadLeads(); // Refresh the leads list
  };

  // Show authentication loading state
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Show authentication required state
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please sign in to access the leads dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Leads Dashboard</h2>
        <button
          onClick={handleAddLead}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="leadSource"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lead Source
            </label>
            <select
              id="leadSource"
              value={filters.leadSource}
              onChange={(e) => handleFilterChange('leadSource', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sources</option>
              {LEAD_SOURCES.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lead Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="quotation">Quotation</option>
              <option value="po received">PO Received</option>
              <option value="do1 generated">DO1 Generated</option>
              <option value="do sent">DO Sent</option>
              <option value="invoiced">Invoiced</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="dateRange"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date Range
            </label>
            <select
              id="dateRange"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Leads List</h3>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leads...</p>
          </div>
        ) : isError || isTimeout ? (
          <div className="p-6 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-center h-12 w-12 mx-auto mb-4 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isTimeout ? 'Request Timed Out' : 'Failed to Load Leads'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {isTimeout
                  ? 'The request took too long to complete. Please check your connection and try again.'
                  : error?.message ||
                    'Unable to load leads data. Please try again.'}
              </p>
              <button
                onClick={() => loadLeads()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {lead.customerName?.charAt(0).toUpperCase() ||
                                lead.name?.charAt(0).toUpperCase() ||
                                'L'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {lead.customerName || lead.name}
                          </div>
                          {lead.gstin && (
                            <div className="text-xs text-gray-400">
                              GSTIN: {lead.gstin}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.phone}</div>
                      {lead.email && (
                        <div className="text-sm text-gray-500">
                          {lead.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getLeadStatusBadge(lead.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getLeadSourceLabel(lead.leadSource || lead.source)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewLead(lead)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditLead(lead)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && leads.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No leads found matching the current filters.
          </div>
        )}
      </div>

      {/* Add New Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Lead</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <LeadCreationForm onSuccess={handleLeadSuccess} />
          </div>
        </div>
      )}

      {/* View Lead Modal */}
      {showViewModal && selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Lead Details</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLead.customerName || selectedLead.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLead.phone}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLead.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div className="mt-1">
                    {getLeadStatusBadge(selectedLead.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Interest
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {getProductInterestLabel(
                      selectedLead.productInterest || selectedLead.product
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Lead Source
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {getLeadSourceLabel(
                      selectedLead.leadSource || selectedLead.source
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    GSTIN
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLead.gstin || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Created Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedLead.createdAt)}
                  </p>
                </div>
              </div>
              {selectedLead.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLead.address}
                  </p>
                </div>
              )}
              {selectedLead.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLead.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Lead</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <LeadCreationForm
              leadData={selectedLead}
              isEdit={true}
              onSuccess={handleLeadSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsDashboard;
