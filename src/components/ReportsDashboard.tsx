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
      // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      setError('Failed to fetch reports data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderWeeklyDOSummary = () => (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className="space-y-6">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-blue-900">Total DOs</h3>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p className="text-2xl font-bold text-blue-600">
            // @ts-expect-error TS(2339): Property 'totalDOs' does not exist on
            type 'never'... Remove this comment to see the full error message
            {reportsData.weeklyDO.reduce((sum, item) => sum + item.totalDOs, 0)}
          </p>
        </div>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-green-900">Total Volume</h3>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p className="text-2xl font-bold text-green-600">
            {reportsData.weeklyDO.reduce(
              // @ts-expect-error TS(2339): Property 'totalVolume' does not exist on type 'nev... Remove this comment to see the full error message
              (sum, item) => sum + item.totalVolume,
              0
            )}{' '}
            tons
          </p>
        </div>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-purple-900">Total Value</h3>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p className="text-2xl font-bold text-purple-600">
            ₹
            {reportsData.weeklyDO
              // @ts-expect-error TS(2339): Property 'totalValue' does not exist on type 'neve... Remove this comment to see the full error message
              .reduce((sum, item) => sum + item.totalValue, 0)
              .toLocaleString()}
          </p>
        </div>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-orange-900">
            Avg. DO Value
          </h3>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p className="text-2xl font-bold text-orange-600">
            ₹
            {reportsData.weeklyDO.length > 0
              ? (
                  reportsData.weeklyDO.reduce(
                    // @ts-expect-error TS(2339): Property 'totalValue' does not exist on type 'neve... Remove this comment to see the full error message
                    (sum, item) => sum + item.totalValue,
                    0
                  ) /
                  reportsData.weeklyDO.reduce(
                    // @ts-expect-error TS(2339): Property 'totalDOs' does not exist on type 'never'... Remove this comment to see the full error message
                    (sum, item) => sum + item.totalDOs,
                    0
                  )
                ).toLocaleString()
              : 0}
          </p>
        </div>
      </div>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly DO Volume Trend
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <ResponsiveContainer width="100%" height={400}>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <BarChart data={reportsData.weeklyDO}>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <CartesianGrid strokeDasharray="3 3" />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <XAxis dataKey="week" />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <YAxis />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Tooltip
              formatter={(value, name) => [
                name === 'totalDOs' ? value : `${value} tons`,
                name === 'totalDOs' ? 'DOs' : 'Volume',
              ]}
            />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Legend />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Bar dataKey="totalDOs" fill="#0088FE" name="DOs" />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Bar dataKey="totalVolume" fill="#00C49F" name="Volume (tons)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly DO Value Trend
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <ResponsiveContainer width="100%" height={400}>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <LineChart data={reportsData.weeklyDO}>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <CartesianGrid strokeDasharray="3 3" />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <XAxis dataKey="week" />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <YAxis />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Tooltip
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
            />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Legend />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
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
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className="space-y-6">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 Clients by Volume
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <ResponsiveContainer width="100%" height={400}>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <BarChart data={reportsData.topClients} layout="horizontal">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <CartesianGrid strokeDasharray="3 3" />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <XAxis type="number" />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <YAxis dataKey="clientName" type="category" width={150} />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Tooltip formatter={(value, name) => [`${value} tons`, 'Volume']} />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Bar dataKey="totalVolume" fill="#0088FE" name="Volume (tons)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Client Details Table
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="overflow-x-auto">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <table className="min-w-full divide-y divide-gray-200">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <thead className="bg-gray-50">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <tr>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Volume (tons)
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value (₹)
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DO Count
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Order Value
                </th>
              </tr>
            </thead>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsData.topClients.map((client, index) => (
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <tr key={client.clientId} className="hover:bg-gray-50">
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    // @ts-expect-error TS(2339): Property 'clientName' does not
                    exist on type 'neve... Remove this comment to see the full
                    error message
                    {client.clientName}
                  </td>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    // @ts-expect-error TS(2339): Property 'totalVolume' does
                    not exist on type 'nev... Remove this comment to see the
                    full error message
                    {client.totalVolume.toLocaleString()}
                  </td>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    // @ts-expect-error TS(2339): Property 'totalValue' does not
                    exist on type 'neve... Remove this comment to see the full
                    error message ₹{client.totalValue.toLocaleString()}
                  </td>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    // @ts-expect-error TS(2339): Property 'doCount' does not
                    exist on type 'never'.
                    {client.doCount}
                  </td>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹
                    {Math.round(
                      // @ts-expect-error TS(2339): Property 'totalValue' does not exist on type 'neve... Remove this comment to see the full error message
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
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className="space-y-6">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 Products by Dispatch Volume
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <ResponsiveContainer width="100%" height={400}>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <BarChart data={reportsData.topProducts} layout="horizontal">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <CartesianGrid strokeDasharray="3 3" />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <XAxis type="number" />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <YAxis dataKey="productName" type="category" width={200} />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Tooltip formatter={(value, name) => [`${value} tons`, 'Volume']} />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Bar dataKey="totalVolume" fill="#00C49F" name="Volume (tons)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Performance
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <ResponsiveContainer width="100%" height={400}>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <PieChart>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Pie
              data={reportsData.topProducts}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                // @ts-expect-error TS(2532): Object is possibly 'undefined'.
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="totalVolume"
            >
              {reportsData.topProducts.map((entry, index) => (
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Tooltip formatter={(value) => [`${value} tons`, 'Volume']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Details Table
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="overflow-x-auto">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <table className="min-w-full divide-y divide-gray-200">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <thead className="bg-gray-50">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <tr>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume (tons)
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value (₹)
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispatch Count
                </th>
              </tr>
            </thead>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsData.topProducts.map((product, index) => (
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <tr key={product.productId} className="hover:bg-gray-50">
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    // @ts-expect-error TS(2339): Property 'productName' does
                    not exist on type 'nev... Remove this comment to see the
                    full error message
                    {product.productName}
                  </td>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    // @ts-expect-error TS(2339): Property 'type' does not exist
                    on type 'never'.
                    {product.type}
                  </td>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    // @ts-expect-error TS(2339): Property 'size' does not exist
                    on type 'never'.
                    {product.size}
                  </td>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    // @ts-expect-error TS(2339): Property 'totalVolume' does
                    not exist on type 'nev... Remove this comment to see the
                    full error message
                    {product.totalVolume.toLocaleString()}
                  </td>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    // @ts-expect-error TS(2339): Property 'totalValue' does not
                    exist on type 'neve... Remove this comment to see the full
                    error message ₹{product.totalValue.toLocaleString()}
                  </td>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    // @ts-expect-error TS(2339): Property 'dispatchCount' does
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
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className="space-y-6">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-red-900">
            Critical Stock Items
          </h3>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p className="text-2xl font-bold text-red-600">
            {
              reportsData.lowStock.filter(
                // @ts-expect-error TS(2339): Property 'stockLevel' does not exist on type 'neve... Remove this comment to see the full error message
                (item) => item.stockLevel < item.minThreshold * 0.5
              ).length
            }
          </p>
        </div>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-yellow-900">
            Low Stock Items
          </h3>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p className="text-2xl font-bold text-yellow-600">
            {
              reportsData.lowStock.filter(
                (item) =>
                  // @ts-expect-error TS(2339): Property 'stockLevel' does not exist on type 'neve... Remove this comment to see the full error message
                  item.stockLevel >= item.minThreshold * 0.5 &&
                  // @ts-expect-error TS(2339): Property 'stockLevel' does not exist on type 'neve... Remove this comment to see the full error message
                  item.stockLevel < item.minThreshold
              ).length
            }
          </p>
        </div>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-blue-900">Total Alerts</h3>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p className="text-2xl font-bold text-blue-600">
            {reportsData.lowStock.length}
          </p>
        </div>
      </div>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Stock Level vs Threshold
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <ResponsiveContainer width="100%" height={400}>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <BarChart data={reportsData.lowStock}>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <CartesianGrid strokeDasharray="3 3" />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <XAxis
              dataKey="productName"
              angle={-45}
              textAnchor="end"
              height={100}
            />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <YAxis />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Tooltip
              formatter={(value, name) => [
                value,
                name === 'stockLevel' ? 'Current Stock' : 'Min Threshold',
              ]}
            />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Legend />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Bar dataKey="stockLevel" fill="#FF6B6B" name="Current Stock" />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <Bar dataKey="minThreshold" fill="#4ECDC4" name="Min Threshold" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="bg-white p-6 rounded-lg shadow-md">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Low Stock Alerts Table
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="overflow-x-auto">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <table className="min-w-full divide-y divide-gray-200">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <thead className="bg-gray-50">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <tr>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Threshold
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsData.lowStock.map((item) => {
                // @ts-expect-error TS(2339): Property 'stockLevel' does not exist on type 'neve... Remove this comment to see the full error message
                const isCritical = item.stockLevel < item.minThreshold * 0.5;
                const isLow =
                  // @ts-expect-error TS(2339): Property 'stockLevel' does not exist on type 'neve... Remove this comment to see the full error message
                  item.stockLevel >= item.minThreshold * 0.5 &&
                  // @ts-expect-error TS(2339): Property 'stockLevel' does not exist on type 'neve... Remove this comment to see the full error message
                  item.stockLevel < item.minThreshold;

                return (
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <tr key={item.productId} className="hover:bg-gray-50">
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      // @ts-expect-error TS(2339): Property 'productName' does
                      not exist on type 'nev... Remove this comment to see the
                      full error message
                      {item.productName}
                    </td>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      // @ts-expect-error TS(2339): Property 'type' does not
                      exist on type 'never'.
                      {item.type}
                    </td>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      // @ts-expect-error TS(2339): Property 'size' does not
                      exist on type 'never'.
                      {item.size}
                    </td>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      // @ts-expect-error TS(2339): Property 'stockLevel' does
                      not exist on type 'neve... Remove this comment to see the
                      full error message
                      {item.stockLevel.toLocaleString()} tons
                    </td>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      // @ts-expect-error TS(2339): Property 'minThreshold' does
                      not exist on type 'ne... Remove this comment to see the
                      full error message
                      {item.minThreshold.toLocaleString()} tons
                    </td>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap">
                      // @ts-expect-error TS(17004): Cannot use JSX unless the
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
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      // @ts-expect-error TS(2339): Property 'lastUpdated' does
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
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className="max-w-7xl mx-auto p-6">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="bg-white shadow-md rounded-lg">
        {/* Header */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="px-6 py-4 border-b border-gray-200">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <h2 className="text-2xl font-bold text-gray-900">
            Reports Dashboard
          </h2>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600 mt-1">
            Comprehensive business analytics and insights
          </p>
        </div>
        {/* Tabs */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="px-6 py-4 border-b border-gray-200">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <span>{tab.icon}</span>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
        {/* Content */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="p-6">
          {isLoading ? (
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="flex items-center justify-center py-12">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <span className="ml-3 text-gray-600">Loading reports...</span>
            </div>
          ) : error ? (
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <div className="flex">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <div className="flex-shrink-0">
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <div className="ml-3">
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
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
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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
