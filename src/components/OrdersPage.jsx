import React, { useState, useEffect } from 'react';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import POGenerator from './POGenerator';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    inventoryStatus: '',
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
  const [isDispatching, setIsDispatching] = useState(false);
  const [itemsStock, setItemsStock] = useState({});
  const [dispatchRecords, setDispatchRecords] = useState([]);
  const [showPOGeneratorModal, setShowPOGeneratorModal] = useState(false);

  const {
    get: fetchOrdersData,
    post: postData,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      dispatched: 'bg-purple-100 text-purple-800',
      'partial dispatch': 'bg-orange-100 text-orange-800',
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

  // Get inventory status badge styling
  const getInventoryStatusBadge = (inventoryStatus) => {
    const statusColors = {
      'Inventory Available': 'bg-green-100 text-green-800',
      'Partial Inventory': 'bg-yellow-100 text-yellow-800',
      'No Inventory': 'bg-red-100 text-red-800',
      'Not Checked': 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[inventoryStatus] || statusColors['Not Checked']
        }`}
      >
        {inventoryStatus || 'NOT CHECKED'}
      </span>
    );
  };

  // Get stock status badge styling
  const getStockStatusBadge = (stockStatus, availableQty) => {
    const statusColors = {
      normal: 'bg-green-100 text-green-800',
      low: 'bg-yellow-100 text-yellow-800',
      high: 'bg-blue-100 text-blue-800',
      'not-found': 'bg-red-100 text-red-800',
    };

    const statusText = {
      normal: 'Normal',
      low: 'Low Stock',
      high: 'High Stock',
      'not-found': 'Not Found',
    };

    return (
      <div className="flex flex-col">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            statusColors[stockStatus] || statusColors['not-found']
          }`}
        >
          {statusText[stockStatus] || 'Unknown'}
        </span>
        <span className="text-xs text-gray-600 mt-1">
          {availableQty} tons available
        </span>
      </div>
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

  // Check if there are remaining items with available inventory for dispatch
  const hasRemainingItemsWithInventory = (order,itemQuantities,itemsStock) => {
    if (!order.items || !itemQuantities || !itemsStock) return false;

    return order.items.some((item) => {
      const itemKey = `${item.type}-${item.size}-${item.thickness}`;
      const quantities = itemQuantities[itemKey];
      const stockInfo = itemsStock[itemKey];

      // Check if there's remaining quantity and available stock
      const hasRemainingQuantity = quantities && quantities.remainingQuantity > 0;
      const hasAvailableStock = stockInfo && stockInfo.availableQty > 0;

      return hasRemainingQuantity && hasAvailableStock;
    });
  };

  // Fetch DO1 records for a purchase order
  const fetchDispatchRecords = async (orderId) => {
    try {
      const response = await fetchOrdersData(
        `http://localhost:5001/api/do1?poId=${orderId}`
      );

      if (response && response.success) {
        setDispatchRecords(response.data || []);
      } else {
        setDispatchRecords([]);
      }
    } catch (error) {
      console.error('Error fetching dispatch records:', error);
      setDispatchRecords([]);
    }
  };

  // Calculate dispatched and remaining quantities for items
  const calculateItemQuantities = (originalItems, dispatchRecords) => {
    const itemQuantities = {};

    // Initialize with original quantities
    originalItems.forEach((item, index) => {
      const itemKey = `${item.type}-${item.size}-${item.thickness}`;
      itemQuantities[itemKey] = {
        originalQuantity: item.quantity,
        dispatchedQuantity: 0,
        remainingQuantity: item.quantity,
        itemIndex: index,
      };
    });

    // Add up dispatched quantities from DO1 records (including pending ones)
    dispatchRecords.forEach((do1) => {
      // Count all DO1 records that have dispatched items (pending, executed, dispatched)
      if (
        do1.status === 'pending' ||
        do1.status === 'executed' ||
        do1.status === 'dispatched'
      ) {
        do1.items.forEach((dispatchItem) => {
          const itemKey = `${dispatchItem.type}-${dispatchItem.size}-${dispatchItem.thickness}`;
          if (itemQuantities[itemKey]) {
            itemQuantities[itemKey].dispatchedQuantity +=
              dispatchItem.dispatchedQuantity;
            itemQuantities[itemKey].remainingQuantity =
              itemQuantities[itemKey].originalQuantity -
              itemQuantities[itemKey].dispatchedQuantity;
          }
        });
      }
    });

    return itemQuantities;
  };

  // Fetch stock information for order items
  const fetchItemsStock = async (items) => {
    if (!items || items.length === 0) return;

    try {
      const stockData = {};

      for (const item of items) {
        // Create a unique key for each item
        const itemKey = `${item.type}-${item.size}-${item.thickness}`;

        // Fetch inventory data for this specific item
        const queryParams = new URLSearchParams({
          productType: item.type,
          size: item.size,
          thickness: item.thickness.toString(),
          limit: '1',
        }).toString();

        const response = await fetchOrdersData(
          `http://localhost:5001/api/inventory/summary?${queryParams}`
        );

        if (
          response &&
          response.success &&
          response.data.inventory.length > 0
        ) {
          const inventoryItem = response.data.inventory[0];
          stockData[itemKey] = {
            availableQty: inventoryItem.availableQty,
            stockStatus: inventoryItem.stockStatus,
            unit: inventoryItem.unit,
          };
        } else {
          stockData[itemKey] = {
            availableQty: 0,
            stockStatus: 'not-found',
            unit: 'tons',
          };
        }
      }

      setItemsStock(stockData);
    } catch (error) {
      console.error('Error fetching items stock:', error);
      setItemsStock({});
    }
  };

  // Handle order actions
  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);

    // Fetch stock information for the order items
    if (order.items) {
      await fetchItemsStock(order.items);
    }

    // Fetch dispatch records if order has been dispatched
    if (order.status === 'dispatched' || order.status === 'partial dispatch') {
      await fetchDispatchRecords(order._id);
    }
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
    setItemsStock({}); // Clear stock data when modal closes
    setDispatchRecords([]); // Clear dispatch records when modal closes
  };

  // Handle dispatch functionality
  const handleDispatch = async (orderId, isPartial = false) => {
    if (isDispatching) return;

    try {
      setIsDispatching(true);

      const response = await postData(
        `http://localhost:5001/api/pos/dispatch/${orderId}`,
        { isPartial }
      );

      if (response && response.success) {
        alert(`Order ${isPartial ? 'partially ' : ''}dispatched successfully!`);

        // Refresh the orders list to show updated status
        const activeFilters = {};
        Object.entries(filters).forEach(([key, val]) => {
          if (val && val !== '') {
            activeFilters[key] = val;
          }
        });
        loadOrders(activeFilters, pagination.page);

        // Close the modal
        closeModal();
      }
    } catch (error) {
      console.error('Error dispatching order:', error);
      alert('Failed to dispatch order. Please try again.');
    } finally {
      setIsDispatching(false);
    }
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
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Total: {pagination.total} orders
          </div>
          <button
            onClick={() => setShowPOGeneratorModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Generate PO</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <option value="dispatched">Dispatched</option>
              <option value="partial dispatch">Partial Dispatch</option>
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
              htmlFor="inventoryStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Inventory Status
            </label>
            <select
              id="inventoryStatus"
              value={filters.inventoryStatus || ''}
              onChange={(e) =>
                handleFilterChange('inventoryStatus', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Inventory Status</option>
              <option value="Inventory Available">Inventory Available</option>
              <option value="Partial Inventory">Partial Inventory</option>
              <option value="No Inventory">No Inventory</option>
              <option value="Not Checked">Not Checked</option>
            </select>
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
              <option value="inventoryStatus">Inventory Status</option>
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
                    Inventory Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewOrder(order)}
                  >
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getInventoryStatusBadge(order.inventoryStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.poDate)}
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
                    Inventory Status
                  </label>
                  <div className="mt-1">
                    {getInventoryStatusBadge(selectedOrder.inventoryStatus)}
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
                {(selectedOrder.status === 'dispatched' ||
                  selectedOrder.status === 'partial dispatch') &&
                  selectedOrder.dispatchDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Dispatch Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedOrder.dispatchDate)}
                      </p>
                    </div>
                  )}
              </div>

              {/* Customer Details */}
              <div>
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
                        {(selectedOrder.status === 'dispatched' ||
                          selectedOrder.status === 'partial dispatch') && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Dispatched
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Remaining
                            </th>
                          </>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Current Stock
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
                          {(selectedOrder.status === 'dispatched' ||
                            selectedOrder.status === 'partial dispatch') && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {(() => {
                                  const itemQuantities =
                                    calculateItemQuantities(
                                      selectedOrder.items,
                                      dispatchRecords
                                    );
                                  const itemKey = `${item.type}-${item.size}-${item.thickness}`;
                                  const quantities = itemQuantities[itemKey];
                                  return quantities ? (
                                    <span className="font-medium text-green-600">
                                      {quantities.dispatchedQuantity} tons
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">
                                      0 tons
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {(() => {
                                  const itemQuantities =
                                    calculateItemQuantities(
                                      selectedOrder.items,
                                      dispatchRecords
                                    );
                                  const itemKey = `${item.type}-${item.size}-${item.thickness}`;
                                  const quantities = itemQuantities[itemKey];
                                  return quantities ? (
                                    <span
                                      className={`font-medium ${quantities.remainingQuantity > 0 ? 'text-orange-600' : 'text-gray-400'}`}
                                    >
                                      {quantities.remainingQuantity} tons
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">
                                      {item.quantity} tons
                                    </span>
                                  );
                                })()}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{item.rate?.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{item.total?.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(() => {
                              const itemKey = `${item.type}-${item.size}-${item.thickness}`;
                              const stockInfo = itemsStock[itemKey];

                              if (!stockInfo) {
                                return (
                                  <span className="text-gray-400 text-xs">
                                    Loading...
                                  </span>
                                );
                              }

                              return getStockStatusBadge(
                                stockInfo.stockStatus,
                                stockInfo.availableQty
                              );
                            })()}
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPDF(selectedOrder._id);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Download PDF</span>
                </button>

                {selectedOrder.inventoryStatus === 'Inventory Available' &&
                  selectedOrder.status !== 'dispatched' &&
                  selectedOrder.status !== 'partial dispatch' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDispatch(selectedOrder._id, false);
                      }}
                      disabled={isDispatching}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <span>
                        {isDispatching ? 'Dispatching...' : 'Dispatch'}
                      </span>
                    </button>
                  )}

                {selectedOrder.inventoryStatus === 'Partial Inventory' &&
                  selectedOrder.status !== 'dispatched' &&
                  selectedOrder.status !== 'partial dispatch' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDispatch(selectedOrder._id, true);
                      }}
                      disabled={isDispatching}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
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
                      <span>
                        {isDispatching ? 'Dispatching...' : 'Dispatch Partial'}
                      </span>
                    </button>
                  )}

                {selectedOrder.status === 'partial dispatch' && (
                  (() => {
                    const itemQuantities = calculateItemQuantities(
                      selectedOrder.items,
                      dispatchRecords
                    );
                    const canDispatchRemaining = hasRemainingItemsWithInventory(
                      selectedOrder,
                      itemQuantities,
                      itemsStock
                    );

                    return (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDispatch(selectedOrder._id, true);
                        }}
                        disabled={isDispatching || !canDispatchRemaining}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 flex items-center justify-center space-x-2"
                        title={
                          !canDispatchRemaining
                            ? 'No remaining items with available inventory'
                            : ''
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        <span>
                          {isDispatching ? 'Dispatching...' : 'Dispatch Remaining'}
                        </span>
                      </button>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PO Generator Modal */}
      {showPOGeneratorModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Generate Purchase Order
              </h3>
              <button
                onClick={() => setShowPOGeneratorModal(false)}
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
            <div className="p-4">
              <POGenerator />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
