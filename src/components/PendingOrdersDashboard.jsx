import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const PendingOrdersDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    customer: '',
    dateRange: 'all', // all, today, week, month
    urgency: 'all', // all, high, medium, low
    status: 'all', // all, pending, partial, overdue
    orderType: 'all', // all, quotation, do, po
  });

  const { get: fetchData } = useApi();

  useEffect(() => {
    loadPendingOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pendingOrders, filters]);

  const loadPendingOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all quotations, POs and DOs to identify pending ones
      const [quotationsResponse, posResponse, do1Response, leadsResponse] =
        await Promise.all([
          fetchData('http://localhost:5001/api/quotations'),
          fetchData('http://localhost:5001/api/pos'),
          fetchData('http://localhost:5001/api/do1'),
          fetchData('http://localhost:5001/api/leads'),
        ]);

      const leads = leadsResponse.success ? leadsResponse.data : [];
      const quotations = quotationsResponse.success
        ? quotationsResponse.data
        : [];
      const pos = posResponse.success ? posResponse.data : [];
      const dos = do1Response.success ? do1Response.data : [];

      // Process pending orders
      const pending = [];

      // Add pending quotations (not converted to PO)
      quotations.forEach((quotation) => {
        const lead = leads.find((l) => l._id === quotation.leadId);
        const relatedPO = pos.find((p) => p.quotationId === quotation._id);

        // Only show quotations that haven't been converted to PO yet or are still pending
        if (!relatedPO || quotation.status !== 'converted') {
          const totalItems =
            quotation.items?.reduce(
              (sum, item) => sum + (item.quantity || 0),
              0
            ) || 0;

          pending.push({
            id: quotation._id,
            type: 'QUOTATION',
            number: quotation.quotationNumber,
            customerName: lead?.name || 'Unknown',
            customerPhone: lead?.phone || '',
            product: lead?.product || '',
            totalAmount: quotation.totalAmount || 0,
            totalOrdered: totalItems,
            totalFulfilled: relatedPO ? totalItems : 0, // If PO exists, consider it fulfilled
            status: getOrderStatus(
              quotation.status,
              relatedPO ? totalItems : 0,
              totalItems
            ),
            urgency: calculateUrgency(
              quotation.createdAt,
              quotation.validUntil
            ),
            createdAt: quotation.createdAt,
            expectedDelivery: quotation.validUntil,
            leadId: quotation.leadId,
            rawData: quotation,
          });
        }
      });

      // Add pending DOs (not fully dispatched)
      dos.forEach((doItem) => {
        const lead = leads.find((l) => l._id === doItem.leadId);
        const po = pos.find((p) => p._id === doItem.poId);

        const totalOrdered =
          doItem.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ||
          0;
        const totalDispatched =
          doItem.items?.reduce(
            (sum, item) => sum + (item.dispatchQuantity || 0),
            0
          ) || 0;

        if (totalDispatched < totalOrdered || doItem.status !== 'completed') {
          pending.push({
            id: doItem._id,
            type: 'DO',
            number: doItem.do1Number,
            customerName: lead?.name || 'Unknown',
            customerPhone: lead?.phone || '',
            product: lead?.product || '',
            totalAmount: po?.totalAmount || 0,
            totalOrdered,
            totalDispatched,
            status: getOrderStatus(
              doItem.status,
              totalDispatched,
              totalOrdered
            ),
            urgency: calculateUrgency(
              doItem.createdAt,
              doItem.expectedDelivery
            ),
            createdAt: doItem.createdAt,
            expectedDelivery: doItem.expectedDelivery,
            leadId: doItem.leadId,
            poId: doItem.poId,
            rawData: doItem,
          });
        }
      });

      // Add pending POs (without corresponding DOs or incomplete DOs)
      pos.forEach((po) => {
        const lead = leads.find((l) => l._id === po.leadId);
        const relatedDO = dos.find((d) => d.poId === po._id);

        if (!relatedDO || po.status !== 'completed') {
          const totalOrdered =
            po.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
          const totalFulfilled = relatedDO
            ? relatedDO.items?.reduce(
                (sum, item) => sum + (item.dispatchQuantity || 0),
                0
              ) || 0
            : 0;

          pending.push({
            id: po._id,
            type: 'PO',
            number: po.poNumber,
            customerName: lead?.name || 'Unknown',
            customerPhone: lead?.phone || '',
            product: lead?.product || '',
            totalAmount: po.totalAmount || 0,
            totalOrdered,
            totalFulfilled,
            status: getOrderStatus(po.status, totalFulfilled, totalOrdered),
            urgency: calculateUrgency(po.createdAt, po.deliveryDate),
            createdAt: po.createdAt,
            expectedDelivery: po.deliveryDate,
            leadId: po.leadId,
            rawData: po,
          });
        }
      });

      // Sort by urgency and creation date
      pending.sort((a, b) => {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      setPendingOrders(pending);
    } catch (error) {
      setError('Failed to load pending orders: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderStatus = (rawStatus, fulfilled, total) => {
    if (rawStatus === 'completed') return 'completed';
    if (fulfilled === 0) return 'pending';
    if (fulfilled < total) return 'partial';
    return rawStatus || 'pending';
  };

  const calculateUrgency = (createdAt, expectedDelivery) => {
    if (!expectedDelivery) return 'medium';

    const now = new Date();
    const delivery = new Date(expectedDelivery);
    const daysUntilDelivery = Math.ceil(
      (delivery - now) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDelivery < 0) return 'high'; // Overdue
    if (daysUntilDelivery <= 3) return 'high';
    if (daysUntilDelivery <= 7) return 'medium';
    return 'low';
  };

  const applyFilters = () => {
    let filtered = [...pendingOrders];

    // Customer filter
    if (filters.customer) {
      filtered = filtered.filter(
        (order) =>
          order.customerName
            .toLowerCase()
            .includes(filters.customer.toLowerCase()) ||
          order.customerPhone.includes(filters.customer)
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          // No cutoff for 'all' case
          break;
      }

      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= cutoffDate
      );
    }

    // Urgency filter
    if (filters.urgency !== 'all') {
      filtered = filtered.filter((order) => order.urgency === filters.urgency);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((order) => order.status === filters.status);
    }

    // Order type filter
    if (filters.orderType !== 'all') {
      filtered = filtered.filter(
        (order) => order.type.toLowerCase() === filters.orderType.toLowerCase()
      );
    }

    setFilteredOrders(filtered);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleQuickAction = (action, order) => {
    switch (action) {
      case 'continue_do':
        // Open DO generation workflow
        window.open(`/?workflow=${order.leadId}&step=do`, '_blank');
        break;
      case 'create_po':
        // Open PO creation workflow (step 2)
        window.open(`/?workflow=${order.leadId}&step=po`, '_blank');
        break;
      case 'view_po':
        // Open PO details
        window.open(`/?workflow=${order.leadId}&step=po`, '_blank');
        break;
      case 'view_lead':
        // Open lead details
        window.open(`/?open=${order.leadId}`, '_blank');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading pending orders...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pending Orders Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage pending deliveries and purchase orders
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Pending</p>
            <p className="text-2xl font-bold text-blue-600">
              {filteredOrders.length}
            </p>
          </div>
          <button
            onClick={loadPendingOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Customer Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <input
              type="text"
              placeholder="Search customer..."
              value={filters.customer}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, customer: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgency
            </label>
            <select
              value={filters.urgency}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, urgency: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Urgency</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.orderType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, orderType: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="quotation">Quotations</option>
              <option value="po">Purchase Orders</option>
              <option value="do">Delivery Orders</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(filters.customer ||
          filters.dateRange !== 'all' ||
          filters.urgency !== 'all' ||
          filters.status !== 'all' ||
          filters.orderType !== 'all') && (
          <div className="mt-4">
            <button
              onClick={() =>
                setFilters({
                  customer: '',
                  dateRange: 'all',
                  urgency: 'all',
                  status: 'all',
                  orderType: 'all',
                })
              }
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Urgency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Delivery
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    {pendingOrders.length === 0
                      ? 'No pending orders found.'
                      : 'No orders match your current filters.'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={`${order.type}-${order.id}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {order.type === 'DO'
                            ? '📦'
                            : order.type === 'QUOTATION'
                              ? '📋'
                              : '📄'}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.type} #{order.number}
                          </div>
                          <div className="text-sm text-gray-500">
                            ₹{order.totalAmount?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerPhone}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.product}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      {order.type === 'DO' ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {order.totalDispatched} / {order.totalOrdered}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(order.totalDispatched / order.totalOrdered) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : order.type === 'QUOTATION' ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {order.totalFulfilled > 0 ? 'Converted' : 'Pending'}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-600 h-2 rounded-full"
                              style={{
                                width: `${order.totalFulfilled > 0 ? 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-900">
                            {order.totalFulfilled} / {order.totalOrdered}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${(order.totalFulfilled / order.totalOrdered) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(order.urgency)}`}
                    >
                      {order.urgency.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order.expectedDelivery)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {order.type === 'DO' ? (
                        <button
                          onClick={() =>
                            handleQuickAction('continue_do', order)
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Continue DO
                        </button>
                      ) : order.type === 'QUOTATION' ? (
                        <button
                          onClick={() => handleQuickAction('create_po', order)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Create PO
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickAction('view_po', order)}
                          className="text-green-600 hover:text-green-900"
                        >
                          View PO
                        </button>
                      )}
                      <button
                        onClick={() => handleQuickAction('view_lead', order)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View Lead
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingOrdersDashboard;
