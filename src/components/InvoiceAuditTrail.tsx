import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const InvoiceAuditTrail = () => {
  const [auditTrail, setAuditTrail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredTrail, setFilteredTrail] = useState([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const fetchAuditTrail = async (invoiceId: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/audit-trail`);
      const result = await response.json();

      if (result.success) {
        setAuditTrail(result.data);
        setFilteredTrail(result.data.auditTrail);
      } else {
        setError(result.message || 'Failed to fetch audit trail');
        setAuditTrail(null);
        setFilteredTrail([]);
      }
    } catch (error) {
      setError('Network error: ' + error.message);
      setAuditTrail(null);
      setFilteredTrail([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: any) => {
    fetchAuditTrail(data.invoiceId);
  };

  // Filter audit trail by event type
  useEffect(() => {
    if (auditTrail && auditTrail.auditTrail) {
      if (selectedEventFilter === 'all') {
        setFilteredTrail(auditTrail.auditTrail);
      } else {
        const filtered = auditTrail.auditTrail.filter(
          (entry: any) => entry.event === selectedEventFilter
        );
        setFilteredTrail(filtered);
      }
    }
  }, [selectedEventFilter, auditTrail]);

  const getEventColor = (event: any) => {
    const colors = {
      generated: 'bg-blue-100 text-blue-800 border-blue-200',
      downloaded: 'bg-green-100 text-green-800 border-green-200',
      emailed: 'bg-purple-100 text-purple-800 border-purple-200',
      tally_push: 'bg-orange-100 text-orange-800 border-orange-200',
      tally_push_success: 'bg-green-100 text-green-800 border-green-200',
      tally_push_failed: 'bg-red-100 text-red-800 border-red-200',
      viewed: 'bg-gray-100 text-gray-800 border-gray-200',
      modified: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      deleted: 'bg-red-100 text-red-800 border-red-200',
    };

    return colors[event] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatTimestamp = (timestamp: any) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getUniqueEvents = () => {
    if (!auditTrail || !auditTrail.auditTrail) return [];
    const events = [
      ...new Set(auditTrail.auditTrail.map((entry: any) => entry.event)),
    ];
    return events.sort();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg">
        {/* Header */}

        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Invoice Audit Trail
          </h2>

          <p className="text-gray-600 mt-1">
            View detailed audit logs for invoice activities
          </p>
        </div>

        {/* Search Form */}

        <div className="px-6 py-4 border-b border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice ID
              </label>

              <input
                type="text"
                {...register('invoiceId', {
                  required: 'Invoice ID is required',
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Invoice ID"
              />
              {errors.invoiceId && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.invoiceId.message}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'View Audit Trail'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border border-red-200 rounded-md mx-6 mt-4">
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

                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Info */}
        {auditTrail && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">
                  Invoice Number:
                </span>

                <span className="ml-2 text-gray-900">
                  {auditTrail.invoiceNumber}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">DO2 ID:</span>

                <span className="ml-2 text-gray-900">{auditTrail.do2Id}</span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Total Events:</span>

                <span className="ml-2 text-gray-900">
                  {auditTrail.totalEvents}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">
                  Filtered Events:
                </span>

                <span className="ml-2 text-gray-900">
                  {filteredTrail.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        {auditTrail && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Filter by Event:
              </label>

              <select
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Events</option>
                {getUniqueEvents().map((event) => (
                  <option key={event} value={event}>
                    {event.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Audit Trail Table */}
        {auditTrail && (
          <div className="px-6 py-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performed By
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTrail.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No audit events found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTrail.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getEventColor(entry.event)}`}
                          >
                            {entry.event.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTimestamp(entry.timestamp)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-medium">
                            {entry.performedBy}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-md">
                            <p className="text-gray-900">{entry.notes}</p>

                            {entry.metadata &&
                              Object.keys(entry.metadata).length > 0 && (
                                <details className="mt-2">
                                  <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                                    View Metadata
                                  </summary>

                                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                    {JSON.stringify(entry.metadata, null, 2)}
                                  </pre>
                                </details>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="px-6 py-8 text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>

                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading audit trail...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceAuditTrail;
