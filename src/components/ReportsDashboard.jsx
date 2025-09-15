import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApi } from '../hooks/useApi';

const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState('weekly-do');
  const [reportsData, setReportsData] = useState({
    weeklyDO: [],
    topClients: [],
    topProducts: [],
    lowStock: [],
  });

  // Initialize API hooks for each endpoint
  const weeklyDOApi = useApi();
  const topClientsApi = useApi();
  const topProductsApi = useApi();
  const lowStockApi = useApi();

  // Combined loading state
  const isLoading =
    weeklyDOApi.isLoading ||
    topClientsApi.isLoading ||
    topProductsApi.isLoading ||
    lowStockApi.isLoading;

  // Combined error state
  const error =
    weeklyDOApi.error ||
    topClientsApi.error ||
    topProductsApi.error ||
    lowStockApi.error;

  // Color palette for charts
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
    '#FFC658',
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
  ];

  const fetchReportsData = useCallback(async () => {
    try {
      // Fetch all reports data using useApi hooks
      const [weeklyDO, topClients, topProducts, lowStock] = await Promise.all([
        weeklyDOApi.get('http://localhost:5001/api/reports/weekly-do-summary'),
        topClientsApi.get('http://localhost:5001/api/reports/top-clients'),
        topProductsApi.get('http://localhost:5001/api/reports/top-products'),
        lowStockApi.get('http://localhost:5001/api/reports/low-stock'),
      ]);

      setReportsData({
        weeklyDO: weeklyDO?.success ? weeklyDO.data : [],
        topClients: topClients?.success ? topClients.data : [],
        topProducts: topProducts?.success ? topProducts.data : [],
        lowStock: lowStock?.success ? lowStock.data : [],
      });
    } catch (error) {
      // Error handling is now managed by useApi hooks
      console.error('Error fetching reports data:', error);
    }
  }, []); // Remove unstable API dependencies to prevent infinite loops

  useEffect(() => {
    fetchReportsData();
  }, []); // Remove unstable fetchReportsData dependency

  const renderWeeklyDOSummary = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900">Total DOs</h3>
          <p className="text-2xl font-bold text-blue-600">
            {reportsData.weeklyDO.reduce((sum, item) => sum + item.totalDOs, 0)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900">Total Volume</h3>
          <p className="text-2xl font-bold text-green-600">
            {reportsData.weeklyDO.reduce(
              (sum, item) => sum + item.totalVolume,
              0
            )}{' '}
            tons
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900">Total Value</h3>
          <p className="text-2xl font-bold text-purple-600">
            ₹
            {reportsData.weeklyDO
              .reduce((sum, item) => sum + item.totalValue, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-900">
            Avg. DO Value
          </h3>
          <p className="text-2xl font-bold text-orange-600">
            ₹
            {reportsData.weeklyDO.length > 0
              ? (
                  reportsData.weeklyDO.reduce(
                    (sum, item) => sum + item.totalValue,
                    0
                  ) /
                  reportsData.weeklyDO.reduce(
                    (sum, item) => sum + item.totalDOs,
                    0
                  )
                ).toLocaleString()
              : 0}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly DO Volume Trend
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={reportsData.weeklyDO}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                name === 'totalDOs' ? value : `${value} tons`,
                name === 'totalDOs' ? 'DOs' : 'Volume',
              ]}
            />
            <Legend />
            <Bar dataKey="totalDOs" fill="#0088FE" name="DOs" />
            <Bar dataKey="totalVolume" fill="#00C49F" name="Volume (tons)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly DO Value Trend
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={reportsData.weeklyDO}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalValue"
              stroke="#8884D8"
              strokeWidth={2}
              name="Value (₹)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderTopClients = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 Clients by Volume
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={reportsData.topClients} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="clientName" type="category" width={150} />
            <Tooltip formatter={(value) => [`${value} tons`, 'Volume']} />
            <Bar dataKey="totalVolume" fill="#0088FE" name="Volume (tons)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Client Details Table
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Volume (tons)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value (₹)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DO Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Order Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsData.topClients.map((client, index) => (
                <tr key={client.clientId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.totalVolume.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{client.totalValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.doCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹
                    {Math.round(
                      client.totalValue / client.doCount
                    ).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTopProducts = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 Products by Dispatch Volume
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={reportsData.topProducts} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="productName" type="category" width={200} />
            <Tooltip formatter={(value) => [`${value} tons`, 'Volume']} />
            <Bar dataKey="totalVolume" fill="#00C49F" name="Volume (tons)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Performance
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={reportsData.topProducts}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ productName, percent }) =>
                `${productName} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="totalVolume"
            >
              {reportsData.topProducts.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} tons`, 'Volume']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Details Table
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume (tons)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value (₹)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispatch Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsData.topProducts.map((product, index) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.totalVolume.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{product.totalValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.dispatchCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLowStockAlerts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-900">
            Critical Stock Items
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {
              reportsData.lowStock.filter(
                (item) => item.stockLevel < item.minThreshold * 0.5
              ).length
            }
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900">
            Low Stock Items
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {
              reportsData.lowStock.filter(
                (item) =>
                  item.stockLevel >= item.minThreshold * 0.5 &&
                  item.stockLevel < item.minThreshold
              ).length
            }
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900">Total Alerts</h3>
          <p className="text-2xl font-bold text-blue-600">
            {reportsData.lowStock.length}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Stock Level vs Threshold
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={reportsData.lowStock}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="productName"
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                value,
                name === 'stockLevel' ? 'Current Stock' : 'Min Threshold',
              ]}
            />
            <Legend />
            <Bar dataKey="stockLevel" fill="#FF6B6B" name="Current Stock" />
            <Bar dataKey="minThreshold" fill="#4ECDC4" name="Min Threshold" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Low Stock Alerts Table
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsData.lowStock.map((item) => {
                const isCritical = item.stockLevel < item.minThreshold * 0.5;
                const isLow =
                  item.stockLevel >= item.minThreshold * 0.5 &&
                  item.stockLevel < item.minThreshold;

                return (
                  <tr key={item.productId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.stockLevel.toLocaleString()} tons
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.minThreshold.toLocaleString()} tons
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isCritical
                            ? 'bg-red-100 text-red-800'
                            : isLow
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {isCritical ? 'CRITICAL' : isLow ? 'LOW' : 'OK'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'weekly-do', name: 'Weekly DO Summary', icon: '📊' },
    { id: 'top-clients', name: 'Top 10 Clients', icon: '👥' },
    { id: 'top-products', name: 'Top 10 Products', icon: '📦' },
    { id: 'low-stock', name: 'Low Stock Alerts', icon: '⚠️' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Reports Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive business analytics and insights
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading reports...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error.message || error || 'An unexpected error occurred'}
                    {error.isTimeout && (
                      <div className="mt-1 text-xs text-red-600">
                        Request timed out. Please check your connection.
                      </div>
                    )}
                  </div>
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={fetchReportsData}
                      className="text-sm text-red-600 hover:text-red-500 underline"
                    >
                      Try again
                    </button>
                    {(weeklyDOApi.isError || weeklyDOApi.isTimeout) && (
                      <button
                        onClick={() =>
                          weeklyDOApi.retry(
                            'http://localhost:5001/api/reports/weekly-do-summary'
                          )
                        }
                        className="text-sm text-red-600 hover:text-red-500 underline"
                      >
                        Retry Weekly DO
                      </button>
                    )}
                    {(topClientsApi.isError || topClientsApi.isTimeout) && (
                      <button
                        onClick={() =>
                          topClientsApi.retry(
                            'http://localhost:5001/api/reports/top-clients'
                          )
                        }
                        className="text-sm text-red-600 hover:text-red-500 underline"
                      >
                        Retry Top Clients
                      </button>
                    )}
                    {(topProductsApi.isError || topProductsApi.isTimeout) && (
                      <button
                        onClick={() =>
                          topProductsApi.retry(
                            'http://localhost:5001/api/reports/top-products'
                          )
                        }
                        className="text-sm text-red-600 hover:text-red-500 underline"
                      >
                        Retry Top Products
                      </button>
                    )}
                    {(lowStockApi.isError || lowStockApi.isTimeout) && (
                      <button
                        onClick={() =>
                          lowStockApi.retry(
                            'http://localhost:5001/api/reports/low-stock'
                          )
                        }
                        className="text-sm text-red-600 hover:text-red-500 underline"
                      >
                        Retry Low Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {activeTab === 'weekly-do' && renderWeeklyDOSummary()}
              {activeTab === 'top-clients' && renderTopClients()}
              {activeTab === 'top-products' && renderTopProducts()}
              {activeTab === 'low-stock' && renderLowStockAlerts()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
