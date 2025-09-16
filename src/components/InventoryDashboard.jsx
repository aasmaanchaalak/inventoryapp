import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import { STEEL_TUBE_CATEGORIES } from '../config/productCategories';

const InventoryDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({});
  const [stockByType, setStockByType] = useState([]);

  // Use the authenticated API hook for comprehensive error handling
  const {
    get: fetchInventoryData,
    status,
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

  const { register, watch } = useForm({
    defaultValues: {
      productType: '',
      size: '',
      thickness: '',
      stockStatus: '',
    },
  });

  const watchedFilters = watch();

  // Fetch inventory data with proper error handling
  const fetchInventory = useCallback(
    async (filterParams = {}) => {
      // Don't fetch if not authenticated
      if (!isAuthenticated || authLoading) {
        return;
      }

      try {
        const queryParams = new URLSearchParams(filterParams).toString();
        const data = await fetchInventoryData(
          `http://localhost:5001/api/inventory/summary?${queryParams}`
        );

        if (data && data.success) {
          setInventory(data.data.inventory || []);
          setSummary(data.data.summary || {});
          setStockByType(data.data.stockByType || []);
        } else {
          // Handle API-level errors
          setInventory([]);
          setSummary({});
          setStockByType([]);
        }
      } catch (error) {
        // Error is already handled by useApi hook
        // Reset to empty state
        setInventory([]);
        setSummary({});
        setStockByType([]);
      }
    },
    [authLoading, isAuthenticated, fetchInventoryData]
  );

  // Retry handler that refetches current filters
  const handleRetry = useCallback(() => {
    const filterParams = {};
    Object.entries(watchedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        filterParams[key] = value;
      }
    });
    // Call fetchInventory directly without dependency to avoid infinite loops
    fetchInventory(filterParams);
  }, [watchedFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch inventory on component mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchInventory();
    }
  }, [isAuthenticated, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply filters when they change (debounced to avoid infinite requests)
  useEffect(() => {
    // Don't apply filters if not authenticated
    if (!isAuthenticated || authLoading) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const filterParams = {};
      Object.entries(watchedFilters).forEach(([key, value]) => {
        if (value && value !== '') {
          filterParams[key] = value;
        }
      });

      // Only fetch if there are actual filter values and we're authenticated
      const hasActualFilters = Object.keys(filterParams).length > 0;
      if (hasActualFilters) {
        fetchInventory(filterParams);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedFilters, isAuthenticated, authLoading]); // Add auth dependencies for safety

  // Get stock status badge
  const getStockStatusBadge = (item) => {
    const statusColors = {
      low: 'bg-red-100 text-red-800',
      normal: 'bg-yellow-100 text-yellow-800',
      high: 'bg-green-100 text-green-800',
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[item.stockStatus]}`}
      >
        {item.stockStatus.toUpperCase()}
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

  // Calculate total value
  const calculateTotalValue = (item) => {
    return item.availableQty * item.rate;
  };

  // Skeleton loading components
  const SkeletonCard = () => (
    <div className="bg-gray-50 p-6 rounded-lg animate-pulse">
      <div className="flex items-center">
        <div className="p-3 bg-gray-200 rounded-full">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
        <div className="ml-4">
          <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-12"></div>
        </div>
      </div>
    </div>
  );

  const SkeletonTableRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
          <div className="ml-4">
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
        <div className="h-3 bg-gray-300 rounded w-12"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-300 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
        <div className="h-3 bg-gray-300 rounded w-12"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-300 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
        <div className="h-3 bg-gray-300 rounded w-16"></div>
      </td>
    </tr>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        Inventory Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          // Skeleton loading for summary cards
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {summary.totalItems || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">
                    Total Stock
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {(summary.totalStock || 0).toFixed(1)} tons
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {formatCurrency(summary.totalValue || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-600">
                    Low Stock Items
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {summary.lowStockItems || 0}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stock by Type Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Stock by Product Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            // Skeleton loading for stock by type
            <>
              <div className="bg-gray-50 p-4 rounded-lg animate-pulse">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-3 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg animate-pulse">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-3 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-28"></div>
              </div>
            </>
          ) : (
            stockByType.map((type) => (
              <div key={type._id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {type._id}
                  </span>
                  <span className="text-xs text-gray-500">
                    {type.count} items
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {type.totalStock.toFixed(1)} tons
                </div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(type.totalValue)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="productType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Type
            </label>
            <select
              id="productType"
              {...register('productType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {STEEL_TUBE_CATEGORIES.map((category) => (
                <option key={category.shortValue} value={category.shortValue}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="size"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Size
            </label>
            <input
              type="text"
              id="size"
              {...register('size')}
              placeholder="e.g., 50x50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="thickness"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Thickness (mm)
            </label>
            <input
              type="number"
              id="thickness"
              {...register('thickness')}
              placeholder="e.g., 2.5"
              step="0.1"
              min="0.1"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="stockStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stock Level
            </label>
            <select
              id="stockStatus"
              {...register('stockStatus')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Levels</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal Stock</option>
              <option value="high">High Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Inventory Items
          </h3>
        </div>

        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <SkeletonTableRow />
                <SkeletonTableRow />
                <SkeletonTableRow />
                <SkeletonTableRow />
                <SkeletonTableRow />
              </tbody>
            </table>
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
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isTimeout ? 'Request Timed Out' : 'Failed to Load Inventory'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {isTimeout
                  ? 'The request took too long to complete. Please check your connection and try again.'
                  : error?.message ||
                    'Unable to load inventory data. Please try again.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setInventory([]);
                    setSummary({});
                    setStockByType([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                >
                  Clear Data
                </button>
              </div>
              {status && (
                <div className="mt-2 text-xs text-gray-500">
                  Status: {status} {isTimeout && '(timeout after 10s)'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {item.productType.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {item.productType} Tube
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.size} × {item.thickness}mm
                            </div>
                            <div className="text-xs text-gray-400">
                              HSN: {item.hsnCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.availableQty.toFixed(1)} tons
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.stockPercentage}% of max
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStockStatusBadge(item)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.rate)}
                        </div>
                        <div className="text-xs text-gray-500">per ton</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(calculateTotalValue(item))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.formattedLastUpdated}
                        </div>
                        {item.lastTransaction && (
                          <div className="text-xs text-gray-500">
                            Last: {item.lastTransaction.type}{' '}
                            {item.lastTransaction.quantity} tons
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.location.warehouse}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.location.section}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {inventory.map((item) => (
                <div
                  key={item._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {item.productType.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {item.productType} Tube
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.size} × {item.thickness}mm
                        </div>
                      </div>
                    </div>
                    {getStockStatusBadge(item)}
                  </div>

                  {/* HSN Code */}
                  <div className="text-xs text-gray-400 mb-3">
                    HSN: {item.hsnCode}
                  </div>

                  {/* Stock Information */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">
                        Available Stock
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.availableQty.toFixed(1)} tons
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.stockPercentage}% of max
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Rate per ton</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.rate)}
                      </div>
                    </div>
                  </div>

                  {/* Value and Location */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Total Value</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(calculateTotalValue(item))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.location.warehouse}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.location.section}
                      </div>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">Last Updated</div>
                    <div className="text-sm text-gray-900">
                      {item.formattedLastUpdated}
                    </div>
                    {item.lastTransaction && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last: {item.lastTransaction.type}{' '}
                        {item.lastTransaction.quantity} tons
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!isLoading && inventory.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No inventory items found matching the current filters.
          </div>
        )}
      </div>

      {/* Dispatch Summary */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Dispatch Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Today's Dispatches
                </p>
                <p className="text-lg font-bold text-gray-900">0 items</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Dispatched
                </p>
                <p className="text-lg font-bold text-gray-900">0 tons</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full">
                <svg
                  className="w-4 h-4 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Pending DO2s
                </p>
                <p className="text-lg font-bold text-gray-900">0 orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
