import React, { useState, useEffect } from 'react';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import QuotationForm from './QuotationForm';
import SimplePOReviewModal from './SimplePOReviewModal';

const QuotationsDashboard = () => {
  const [quotations, setQuotations] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    total: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPOReviewModal, setShowPOReviewModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  // Use the authenticated API hook for comprehensive error handling
  const {
    get: fetchQuotationsData,
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

  // API hook for PO creation
  const { post: createPO } = useAuthenticatedApi({
    timeout: 15000,
    retries: 2,
    showToast: true,
  });

  // Simple fetch function without complex dependencies
  const loadQuotations = async (filterParams = {}) => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    try {
      const queryParams = new URLSearchParams(filterParams).toString();
      const data = await fetchQuotationsData(
        `http://localhost:5001/api/quotations?${queryParams}`
      );

      if (data && data.success) {
        setQuotations(data.data || []);
        setPagination(data.pagination || {});
      }
    } catch (error) {
      console.error('Error loading quotations:', error);
    }
  };

  // Load quotations when component mounts or auth changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadQuotations({ page: filters.page, status: filters.status });
    } // eslint-disable-next-line
  }, [isAuthenticated, authLoading]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    if (filterName !== 'page') {
      newFilters.page = 1; // Reset to first page when filtering
    }
    setFilters(newFilters);

    // Apply filters immediately
    const activeFilters = {};
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val && val !== '') {
        activeFilters[key] = val;
      }
    });

    loadQuotations(activeFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    handleFilterChange('page', newPage);
  };

  // Get quotation status badge
  const getQuotationStatusBadge = (status) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[status] || statusColors.draft
        }`}
      >
        {status ? status.toUpperCase() : 'DRAFT'}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
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

  // Handle Convert to PO button click
  const handleConvertToPO = (quotation) => {
    setSelectedQuotation(quotation);
    setShowPOReviewModal(true);
  };

  // Handle PO conversion
  const handlePOConversion = async (quotationData, remarks = '') => {
    setIsConverting(true);
    try {
      const poData = {
        quotationId: quotationData._id,
        leadId: quotationData.leadId._id || quotationData.leadId,
        remarks: remarks,
      };

      const result = await createPO('http://localhost:5001/api/pos', poData);

      if (result && result.success) {
        alert('Purchase Order created successfully!');
        setShowPOReviewModal(false);
        setSelectedQuotation(null);
        // Refresh quotations list
        loadQuotations({ page: filters.page, status: filters.status });
      } else {
        alert(result?.message || 'Failed to create Purchase Order');
      }
    } catch (error) {
      console.error('Error creating PO:', error);
      alert('Error creating Purchase Order. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  // Close modals
  const closeModals = () => {
    setShowCreateModal(false);
    setShowPOReviewModal(false);
    setSelectedQuotation(null);
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
            Please sign in to access the quotations dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Quotations Dashboard
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
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
          <span>Create Quotation</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Quotations List
          </h3>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quotations...</p>
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
                {isTimeout ? 'Request Timed Out' : 'Failed to Load Quotations'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {isTimeout
                  ? 'The request took too long to complete. Please check your connection and try again.'
                  : error?.message ||
                    'Unable to load quotations data. Please try again.'}
              </p>
              <button
                onClick={() =>
                  loadQuotations({ page: filters.page, status: filters.status })
                }
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
                    Quotation #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotations.map((quotation) => (
                  <tr key={quotation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {quotation.quotationNumber ||
                          `QT-${quotation._id.slice(-6)}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {quotation.leadId?.name
                                ?.charAt(0)
                                .toUpperCase() || 'Q'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {quotation.leadId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quotation.leadId?.phone || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getQuotationStatusBadge(quotation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(quotation.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(quotation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quotation.validity} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Edit
                        </button>
                        <button className="text-purple-600 hover:text-purple-900">
                          PDF
                        </button>
                        <button
                          onClick={() => handleConvertToPO(quotation)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Convert to PO
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && quotations.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No quotations found matching the current filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {pagination.currentPage} of {pagination.totalPages} (
            {pagination.total} total quotations)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Quotation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Create New Quotation
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
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
            <div className="max-h-96 overflow-y-auto">
              <QuotationForm
                onSuccess={() => {
                  setShowCreateModal(false);
                  loadQuotations({
                    page: filters.page,
                    status: filters.status,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* PO Review Modal */}
      {showPOReviewModal && selectedQuotation && (
        <SimplePOReviewModal
          quotation={selectedQuotation}
          isConverting={isConverting}
          onConvert={handlePOConversion}
          onClose={closeModals}
        />
      )}
    </div>
  );
};

export default QuotationsDashboard;
