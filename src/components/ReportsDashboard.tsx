import React, { useState, useEffect } from 'react';
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

const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState('weekly-do');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportsData, setReportsData] = useState({
    weeklyDO: [],
    topClients: [],
    topProducts: [],
    lowStock: [],
  });

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

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all reports data
      const [weeklyDO, topClients, topProducts, lowStock] = await Promise.all([
        fetch('/api/reports/weekly-do-summary').then((res) => res.json()),
        fetch('/api/reports/top-clients').then((res) => res.json()),
        fetch('/api/reports/top-products').then((res) => res.json()),
        fetch('/api/reports/low-stock').then((res) => res.json()),
      ]);

      setReportsData({
        weeklyDO: weeklyDO.success ? weeklyDO.data : [],
        topClients: topClients.success ? topClients.data : [],
        topProducts: topProducts.success ? topProducts.data : [],
        lowStock: lowStock.success ? lowStock.data : [],
      });
    } catch (error) {
      setError('Failed to fetch reports data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderWeeklyDOSummary = () => (
    <div className="space-y-6">
      provided... Remove this comment to see the full error message
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        provided... Remove this comment to see the full error message
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-blue-900">Total DOs</h3>
          is provided... Remove this comment to see the full error message
          <p className="text-2xl font-bold text-blue-600">
            type 'never'... Remove this comment to see the full error message
            {reportsData.weeklyDO.reduce((sum, item) => sum + item.totalDOs, 0)}
          </p>
        </div>
        provided... Remove this comment to see the full error message
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-green-900">Total Volume</h3>
          is provided... Remove this comment to see the full error message
          <p className="text-2xl font-bold text-green-600">
            {reportsData.weeklyDO.reduce(
              (sum, item) => sum + item.totalVolume,
              0
            )}{' '}
            tons
          </p>
        </div>
        provided... Remove this comment to see the full error message
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-purple-900">Total Value</h3>
          is provided... Remove this comment to see the full error message
          <p className="text-2xl font-bold text-purple-600">
            ₹
            {reportsData.weeklyDO
              .reduce((sum, item) => sum + item.totalValue, 0)
              .toLocaleString()}
          </p>
        </div>
        provided... Remove this comment to see the full error message
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-orange-900">
            Avg. DO Value
          </h3>
          is provided... Remove this comment to see the full error message
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
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly DO Volume Trend
        </h3>
        provided... Remove this comment to see the full error message
        <ResponsiveContainer width="100%" height={400}>
          is provided... Remove this comment to see the full error message
          <BarChart data={reportsData.weeklyDO}>
            flag is provided... Remove this comment to see the full error
            message
            <CartesianGrid strokeDasharray="3 3" />
            flag is provided... Remove this comment to see the full error
            message
            <XAxis dataKey="week" />
            flag is provided... Remove this comment to see the full error
            message
            <YAxis />
            flag is provided... Remove this comment to see the full error
            message
            <Tooltip
              formatter={(value, name) => [
                name === 'totalDOs' ? value : `${value} tons`,
                name === 'totalDOs' ? 'DOs' : 'Volume',
              ]}
            />
            flag is provided... Remove this comment to see the full error
            message
            <Legend />
            flag is provided... Remove this comment to see the full error
            message
            <Bar dataKey="totalDOs" fill="#0088FE" name="DOs" />
            flag is provided... Remove this comment to see the full error
            message
            <Bar dataKey="totalVolume" fill="#00C49F" name="Volume (tons)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly DO Value Trend
        </h3>
        provided... Remove this comment to see the full error message
        <ResponsiveContainer width="100%" height={400}>
          is provided... Remove this comment to see the full error message
          <LineChart data={reportsData.weeklyDO}>
            flag is provided... Remove this comment to see the full error
            message
            <CartesianGrid strokeDasharray="3 3" />
            flag is provided... Remove this comment to see the full error
            message
            <XAxis dataKey="week" />
            flag is provided... Remove this comment to see the full error
            message
            <YAxis />
            flag is provided... Remove this comment to see the full error
            message
            <Tooltip
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
            />
            flag is provided... Remove this comment to see the full error
            message
            <Legend />
            flag is provided... Remove this comment to see the full error
            message
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
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 Clients by Volume
        </h3>
        provided... Remove this comment to see the full error message
        <ResponsiveContainer width="100%" height={400}>
          is provided... Remove this comment to see the full error message
          <BarChart data={reportsData.topClients} layout="horizontal">
            flag is provided... Remove this comment to see the full error
            message
            <CartesianGrid strokeDasharray="3 3" />
            flag is provided... Remove this comment to see the full error
            message
            <XAxis type="number" />
            flag is provided... Remove this comment to see the full error
            message
            <YAxis dataKey="clientName" type="category" width={150} />
            flag is provided... Remove this comment to see the full error
            message
            <Tooltip formatter={(value, name) => [`${value} tons`, 'Volume']} />
            flag is provided... Remove this comment to see the full error
            message
            <Bar dataKey="totalVolume" fill="#0088FE" name="Volume (tons)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Client Details Table
        </h3>
        provided... Remove this comment to see the full error message
        <div className="overflow-x-auto">
          is provided... Remove this comment to see the full error message
          <table className="min-w-full divide-y divide-gray-200">
            flag is provided... Remove this comment to see the full error
            message
            <thead className="bg-gray-50">
              flag is provided... Remove this comment to see the full error
              message
              <tr>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Volume (tons)
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value (₹)
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DO Count
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Order Value
                </th>
              </tr>
            </thead>
            flag is provided... Remove this comment to see the full error
            message
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsData.topClients.map((client, index) => (
                <tr key={client.clientId} className="hover:bg-gray-50">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    exist on type 'neve... Remove this comment to see the full
                    error message
                    {client.clientName}
                  </td>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    not exist on type 'nev... Remove this comment to see the
                    full error message
                    {client.totalVolume.toLocaleString()}
                  </td>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    exist on type 'neve... Remove this comment to see the full
                    error message ₹{client.totalValue.toLocaleString()}
                  </td>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    exist on type 'never'.
                    {client.doCount}
                  </td>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
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
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 Products by Dispatch Volume
        </h3>
        provided... Remove this comment to see the full error message
        <ResponsiveContainer width="100%" height={400}>
          is provided... Remove this comment to see the full error message
          <BarChart data={reportsData.topProducts} layout="horizontal">
            flag is provided... Remove this comment to see the full error
            message
            <CartesianGrid strokeDasharray="3 3" />
            flag is provided... Remove this comment to see the full error
            message
            <XAxis type="number" />
            flag is provided... Remove this comment to see the full error
            message
            <YAxis dataKey="productName" type="category" width={200} />
            flag is provided... Remove this comment to see the full error
            message
            <Tooltip formatter={(value, name) => [`${value} tons`, 'Volume']} />
            flag is provided... Remove this comment to see the full error
            message
            <Bar dataKey="totalVolume" fill="#00C49F" name="Volume (tons)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Performance
        </h3>
        provided... Remove this comment to see the full error message
        <ResponsiveContainer width="100%" height={400}>
          is provided... Remove this comment to see the full error message
          <PieChart>
            flag is provided... Remove this comment to see the full error
            message
            <Pie
              data={reportsData.topProducts}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
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
            flag is provided... Remove this comment to see the full error
            message
            <Tooltip formatter={(value) => [`${value} tons`, 'Volume']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Details Table
        </h3>
        provided... Remove this comment to see the full error message
        <div className="overflow-x-auto">
          is provided... Remove this comment to see the full error message
          <table className="min-w-full divide-y divide-gray-200">
            flag is provided... Remove this comment to see the full error
            message
            <thead className="bg-gray-50">
              flag is provided... Remove this comment to see the full error
              message
              <tr>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume (tons)
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value (₹)
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispatch Count
                </th>
              </tr>
            </thead>
            flag is provided... Remove this comment to see the full error
            message
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsData.topProducts.map((product, index) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    not exist on type 'nev... Remove this comment to see the
                    full error message
                    {product.productName}
                  </td>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    on type 'never'.
                    {product.type}
                  </td>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    on type 'never'.
                    {product.size}
                  </td>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    not exist on type 'nev... Remove this comment to see the
                    full error message
                    {product.totalVolume.toLocaleString()}
                  </td>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    exist on type 'neve... Remove this comment to see the full
                    error message ₹{product.totalValue.toLocaleString()}
                  </td>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    not exist on type 'n... Remove this comment to see the full
                    error message
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
      provided... Remove this comment to see the full error message
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        provided... Remove this comment to see the full error message
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-red-900">
            Critical Stock Items
          </h3>
          is provided... Remove this comment to see the full error message
          <p className="text-2xl font-bold text-red-600">
            {
              reportsData.lowStock.filter(
                (item) => item.stockLevel < item.minThreshold * 0.5
              ).length
            }
          </p>
        </div>
        provided... Remove this comment to see the full error message
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-yellow-900">
            Low Stock Items
          </h3>
          is provided... Remove this comment to see the full error message
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
        provided... Remove this comment to see the full error message
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-blue-900">Total Alerts</h3>
          is provided... Remove this comment to see the full error message
          <p className="text-2xl font-bold text-blue-600">
            {reportsData.lowStock.length}
          </p>
        </div>
      </div>
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Stock Level vs Threshold
        </h3>
        provided... Remove this comment to see the full error message
        <ResponsiveContainer width="100%" height={400}>
          is provided... Remove this comment to see the full error message
          <BarChart data={reportsData.lowStock}>
            flag is provided... Remove this comment to see the full error
            message
            <CartesianGrid strokeDasharray="3 3" />
            flag is provided... Remove this comment to see the full error
            message
            <XAxis
              dataKey="productName"
              angle={-45}
              textAnchor="end"
              height={100}
            />
            flag is provided... Remove this comment to see the full error
            message
            <YAxis />
            flag is provided... Remove this comment to see the full error
            message
            <Tooltip
              formatter={(value, name) => [
                value,
                name === 'stockLevel' ? 'Current Stock' : 'Min Threshold',
              ]}
            />
            flag is provided... Remove this comment to see the full error
            message
            <Legend />
            flag is provided... Remove this comment to see the full error
            message
            <Bar dataKey="stockLevel" fill="#FF6B6B" name="Current Stock" />
            flag is provided... Remove this comment to see the full error
            message
            <Bar dataKey="minThreshold" fill="#4ECDC4" name="Min Threshold" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Low Stock Alerts Table
        </h3>
        provided... Remove this comment to see the full error message
        <div className="overflow-x-auto">
          is provided... Remove this comment to see the full error message
          <table className="min-w-full divide-y divide-gray-200">
            flag is provided... Remove this comment to see the full error
            message
            <thead className="bg-gray-50">
              flag is provided... Remove this comment to see the full error
              message
              <tr>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Threshold
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            flag is provided... Remove this comment to see the full error
            message
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsData.lowStock.map((item) => {
                const isCritical = item.stockLevel < item.minThreshold * 0.5;
                const isLow =
                  item.stockLevel >= item.minThreshold * 0.5 &&
                  item.stockLevel < item.minThreshold;

                return (
                  <tr key={item.productId} className="hover:bg-gray-50">
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      not exist on type 'nev... Remove this comment to see the
                      full error message
                      {item.productName}
                    </td>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      exist on type 'never'.
                      {item.type}
                    </td>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      exist on type 'never'.
                      {item.size}
                    </td>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      not exist on type 'neve... Remove this comment to see the
                      full error message
                      {item.stockLevel.toLocaleString()} tons
                    </td>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      not exist on type 'ne... Remove this comment to see the
                      full error message
                      {item.minThreshold.toLocaleString()} tons
                    </td>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap">
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
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
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      not exist on type 'nev... Remove this comment to see the
                      full error message
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
      provided... Remove this comment to see the full error message
      <div className="bg-white shadow-md rounded-lg">
        {/* Header */}
        provided... Remove this comment to see the full error message
        <div className="px-6 py-4 border-b border-gray-200">
          is provided... Remove this comment to see the full error message
          <h2 className="text-2xl font-bold text-gray-900">
            Reports Dashboard
          </h2>
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600 mt-1">
            Comprehensive business analytics and insights
          </p>
        </div>
        {/* Tabs */}
        provided... Remove this comment to see the full error message
        <div className="px-6 py-4 border-b border-gray-200">
          is provided... Remove this comment to see the full error message
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
                flag is provided... Remove this comment to see the full error
                message
                <span>{tab.icon}</span>
                flag is provided... Remove this comment to see the full error
                message
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
        {/* Content */}
        provided... Remove this comment to see the full error message
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              flag is provided... Remove this comment to see the full error
              message
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              flag is provided... Remove this comment to see the full error
              message
              <span className="ml-3 text-gray-600">Loading reports...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              flag is provided... Remove this comment to see the full error
              message
              <div className="flex">
                flag is provided... Remove this comment to see the full error
                message
                <div className="flex-shrink-0">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                flag is provided... Remove this comment to see the full error
                message
                <div className="ml-3">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <button
                    onClick={fetchReportsData}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Try again
                  </button>
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
