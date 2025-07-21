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
      // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2339): Property 'auditTrail' does not exist on type 'neve... Remove this comment to see the full error message
    if (auditTrail && auditTrail.auditTrail) {
      if (selectedEventFilter === 'all') {
        // @ts-expect-error TS(2339): Property 'auditTrail' does not exist on type 'neve... Remove this comment to see the full error message
        setFilteredTrail(auditTrail.auditTrail);
      } else {
        // @ts-expect-error TS(2339): Property 'auditTrail' does not exist on type 'neve... Remove this comment to see the full error message
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
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2339): Property 'auditTrail' does not exist on type 'neve... Remove this comment to see the full error message
    if (!auditTrail || !auditTrail.auditTrail) return [];
    const events = [
      // @ts-expect-error TS(2339): Property 'auditTrail' does not exist on type 'neve... Remove this comment to see the full error message
      ...new Set(auditTrail.auditTrail.map((entry: any) => entry.event)),
    ];
    return events.sort();
  };

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className="max-w-7xl mx-auto p-6">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <div className="bg-white shadow-md rounded-lg">
        {/* Header */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className="px-6 py-4 border-b border-gray-200">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <h2 className="text-2xl font-bold text-gray-900">
            Invoice Audit Trail
          </h2>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <p className="text-gray-600 mt-1">
            View detailed audit logs for invoice activities
          </p>
        </div>

        {/* Search Form */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className="px-6 py-4 border-b border-gray-200">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-4">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="flex-1">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice ID
              </label>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <input
                type="text"
                {...register('invoiceId', {
                  required: 'Invoice ID is required',
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Invoice ID"
              />
              {errors.invoiceId && (
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <p className="text-red-600 text-sm mt-1">
                  // @ts-expect-error TS(2322): Type 'string | FieldError | Merge<FieldError, Fiel... Remove this comment to see the full error message
                  {errors.invoiceId.message}
                </p>
              )}
            </div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="flex items-end">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div className="px-6 py-4 bg-red-50 border border-red-200 rounded-md mx-6 mt-4">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="flex">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div className="flex-shrink-0">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div className="ml-3">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Info */}
        {auditTrail && (
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div className="px-6 py-4 border-b border-gray-200">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <span className="font-medium text-gray-700">
                  Invoice Number:
                </span>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <span className="ml-2 text-gray-900">
                  // @ts-expect-error TS(2339): Property 'invoiceNumber' does not exist on type 'n... Remove this comment to see the full error message
                  {auditTrail.invoiceNumber}
                </span>
              </div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <span className="font-medium text-gray-700">DO2 ID:</span>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <span className="ml-2 text-gray-900">{auditTrail.do2Id}</span>
              </div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <span className="font-medium text-gray-700">Total Events:</span>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <span className="ml-2 text-gray-900">
                  // @ts-expect-error TS(2339): Property 'totalEvents' does not exist on type 'nev... Remove this comment to see the full error message
                  {auditTrail.totalEvents}
                </span>
              </div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <span className="font-medium text-gray-700">
                  Filtered Events:
                </span>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <span className="ml-2 text-gray-900">
                  {filteredTrail.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        {auditTrail && (
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div className="px-6 py-4 border-b border-gray-200">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="flex items-center space-x-4">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <label className="text-sm font-medium text-gray-700">
                Filter by Event:
              </label>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <select
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <option value="all">All Events</option>
                {getUniqueEvents().map((event) => (
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <option key={event} value={event}>
                    // @ts-expect-error TS(2571): Object is of type 'unknown'.
                    {event.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Audit Trail Table */}
        {auditTrail && (
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div className="px-6 py-4">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="overflow-x-auto">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <table className="min-w-full divide-y divide-gray-200">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <thead className="bg-gray-50">
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <tr>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performed By
                    </th>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTrail.length === 0 ? (
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <tr>
                      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                      <td
                        // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'number'.
                        colSpan="4"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No audit events found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTrail.map((entry, index) => (
                      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                      <tr key={index} className="hover:bg-gray-50">
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <td className="px-6 py-4 whitespace-nowrap">
                          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                          <span
                            // @ts-expect-error TS(2339): Property 'event' does not exist on type 'never'.
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getEventColor(entry.event)}`}
                          >
                            // @ts-expect-error TS(2339): Property 'event' does not exist on type 'never'.
                            {entry.event.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          // @ts-expect-error TS(2339): Property 'timestamp' does not exist on type 'never... Remove this comment to see the full error message
                          {formatTimestamp(entry.timestamp)}
                        </td>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                          <span className="font-medium">
                            // @ts-expect-error TS(2339): Property 'performedBy' does not exist on type 'nev... Remove this comment to see the full error message
                            {entry.performedBy}
                          </span>
                        </td>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <td className="px-6 py-4 text-sm text-gray-900">
                          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                          <div className="max-w-md">
                            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                            <p className="text-gray-900">{entry.notes}</p>
                            // @ts-expect-error TS(2339): Property 'metadata' does not exist on type 'never'... Remove this comment to see the full error message
                            {entry.metadata &&
                              // @ts-expect-error TS(2339): Property 'metadata' does not exist on type 'never'... Remove this comment to see the full error message
                              Object.keys(entry.metadata).length > 0 && (
                                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                                <details className="mt-2">
                                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                                  <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                                    View Metadata
                                  </summary>
                                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                    // @ts-expect-error TS(2339): Property 'metadata' does not exist on type 'never'... Remove this comment to see the full error message
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
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div className="px-6 py-8 text-center">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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
