import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import LeadCreationForm from './LeadCreationForm';
import LeadDetailPanel from './LeadDetailPanel';
import LeadWorkflowView from './LeadWorkflowView';

const LeadsDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showWorkflowView, setShowWorkflowView] = useState(false);
  const [workflowLeadId, setWorkflowLeadId] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  const { get: fetchLeads } = useApi();

  // Fetch leads on component mount
  useEffect(() => {
    loadLeads();
  }, []);

  // Handle deep linking - check URL parameters for open lead
  useEffect(() => {
    const openLeadId = searchParams.get('open');
    if (openLeadId && leads.length > 0) {
      // Check if the lead exists in our current leads list
      const leadExists = leads.find((lead) => lead._id === openLeadId);
      if (leadExists) {
        setSelectedLeadId(openLeadId);
        setShowDetailPanel(true);
      }
    }
  }, [searchParams, leads]);

  // Filter leads when search term or filters change
  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, sourceFilter]);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchLeads('http://localhost:5001/api/leads');

      if (response.success) {
        setLeads(response.data || []);
      } else {
        setError('Failed to load leads');
      }
    } catch (err) {
      setError('Error loading leads: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phone?.includes(searchTerm) ||
          lead.product?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.source === sourceFilter);
    }

    setFilteredLeads(filtered);
  };

  const handleAddLeadSuccess = () => {
    setShowAddLeadModal(false);
    loadLeads(); // Refresh the leads list
  };

  const handleLeadClick = (leadId, event) => {
    // Check if it's a Ctrl/Cmd + click for new tab behavior
    if (event.ctrlKey || event.metaKey) {
      // Open in new tab/window with deep link
      window.open(`/?open=${leadId}`, '_blank');
      return;
    }

    setSelectedLeadId(leadId);
    setShowDetailPanel(true);
    // Update URL with deep link parameter
    setSearchParams({ open: leadId });
  };

  const handleCloseDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedLeadId(null);
    // Remove the open parameter from URL
    setSearchParams({});
  };

  const handleOpenWorkflow = (leadId, event) => {
    event.stopPropagation(); // Prevent row click
    setWorkflowLeadId(leadId);
    setShowWorkflowView(true);
  };

  const handleCloseWorkflow = () => {
    setShowWorkflowView(false);
    setWorkflowLeadId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading leads...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your sales leads
          </p>
        </div>
        <button
          onClick={() => setShowAddLeadModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <span className="text-xl mr-2">➕</span>
          Add Lead
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Leads
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name, email, phone, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Source Filter */}
          <div>
            <label
              htmlFor="source-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Source
            </label>
            <select
              id="source-filter"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="social-media">Social Media</option>
              <option value="trade-show">Trade Show</option>
              <option value="cold-call">Cold Call</option>
              <option value="advertisement">Advertisement</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredLeads.length} of {leads.length} leads
          </p>
          {(searchTerm || sourceFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSourceFilter('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company/Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Interest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    {searchTerm || sourceFilter !== 'all'
                      ? 'No leads match your current filters.'
                      : 'No leads found. Click "Add Lead" to create your first lead.'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr
                  key={lead._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => handleLeadClick(lead._id, e)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {lead.email || 'No email'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.address
                          ? lead.address.substring(0, 50) + '...'
                          : 'No address'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.product || 'Not specified'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {lead.source || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.updatedAt || lead.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => handleOpenWorkflow(lead._id, e)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Open Workflow
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleLeadClick(lead._id, e);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add New Lead
              </h3>
              <button
                onClick={() => setShowAddLeadModal(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Lead Creation Form in Modal */}
            <div className="max-h-96 overflow-y-auto">
              <LeadCreationForm onSuccess={handleAddLeadSuccess} />
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Panel */}
      <LeadDetailPanel
        leadId={selectedLeadId}
        isOpen={showDetailPanel}
        onClose={handleCloseDetailPanel}
      />

      {/* Lead Workflow View */}
      {showWorkflowView && (
        <LeadWorkflowView
          leadId={workflowLeadId}
          onClose={handleCloseWorkflow}
        />
      )}
    </div>
  );
};

export default LeadsDashboard;
