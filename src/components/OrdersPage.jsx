import React, { useState, useEffect } from 'react';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const {
    get: fetchOrdersData,
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

  // Load orders with filters and pagination
  const loadOrders = async (filterParams = {}, page = 1) => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        ...filterParams,
        page: page.toString(),
        limit: pagination.limit.toString(),
      }).toString();

      console.log('Loading orders with params:', queryParams);

      const data = await fetchOrdersData(
        `http://localhost:5001/api/pos?${queryParams}`
      );

      if (data && data.success) {
        console.log('Received orders data:', data);
        setOrders(data.data || []);
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // Load orders when component mounts or auth changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadOrders(filters, pagination.page);
    }
  }, [isAuthenticated, authLoading]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);

    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));

    // Apply filters immediately
    const activeFilters = {};
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val && val !== '') {
        activeFilters[key] = val;
      }
    });

    loadOrders(activeFilters, 1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));

    const activeFilters = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val && val !== '') {
        activeFilters[key] = val;
      }
    });

    loadOrders(activeFilters, newPage);
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[status] || statusColors.pending
        }`}
      >
        {status?.toUpperCase() || 'PENDING'}
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

  // Handle order actions
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleDownloadPDF = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/pos/${orderId}/pdf`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `purchase-order-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
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
            Please sign in to access the orders page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Purchase Orders</h2>
        <div className="text-sm text-gray-600">
          Total: {pagination.total} orders
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              From Date
            </label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              To Date
            </label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="sortBy"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sort By
            </label>
            <select
              id="sortBy"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt">Created Date</option>
              <option value="poDate">PO Date</option>
              <option value="totalAmount">Total Amount</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Purchase Orders List
          </h3>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
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
                {isTimeout ? 'Request Timed Out' : 'Failed to Load Orders'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {isTimeout
                  ? 'The request took too long to complete. Please check your connection and try again.'
                  : error?.message ||
                    'Unable to load orders data. Please try again.'}
              </p>
              <button
                onClick={() => loadOrders(filters, pagination.page)}
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
                    PO Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              PO
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {order.poNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Quotation: {order.quotationNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.leadId?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.leadId?.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{order.totalAmount?.toLocaleString('en-IN') || '0'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.poDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(order._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No purchase orders found matching the current filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(pagination.pages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  pagination.page === index + 1
                    ? 'bg-blue-600 text-white border border-blue-600'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Purchase Order Details - {selectedOrder.poNumber}
              </h3>
              <button
                onClick={closeModal}
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
            <div className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    PO Number
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.poNumber}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    PO Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedOrder.poDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Amount
                  </label>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    ₹{selectedOrder.totalAmount?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Customer Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Customer Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedOrder.leadId?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedOrder.leadId?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Items
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity} tons
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{item.rate?.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{item.total?.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              {selectedOrder.remarks && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
