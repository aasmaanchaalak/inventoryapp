import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const AuditTrailViewer = () => {
  const [invoiceId, setInvoiceId] = useState('');
  const [auditTrail, setAuditTrail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddEntry, setShowAddEntry] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const fetchAuditTrail = async (id: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/invoices/${id}/audit-trail`);
      const result = await response.json();

      if (result.success) {
        setAuditTrail(result.data);
      } else {
        setError(result.message || 'Failed to fetch audit trail');
      }
    } catch (error) {
      // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      setError('Network error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: any) => {
    fetchAuditTrail(data.invoiceId);
  };

  const addAuditEntry = async (entryData: any) => {
    if (!auditTrail) return;

    try {
      const response = await fetch(
        // @ts-expect-error TS(2339): Property 'invoiceId' does not exist on type 'never... Remove this comment to see the full error message
        `/api/invoices/${auditTrail.invoiceId}/audit-entry`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryData),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Refresh audit trail
        // @ts-expect-error TS(2339): Property 'invoiceId' does not exist on type 'never... Remove this comment to see the full error message
        fetchAuditTrail(auditTrail.invoiceId);
        setShowAddEntry(false);
        reset();
      } else {
        setError(result.message || 'Failed to add audit entry');
      }
    } catch (error) {
      // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      setError('Network error: ' + error.message);
    }
  };

  const getEventColor = (event: any) => {
    const colors = {
      generated: 'bg-blue-100 text-blue-800',
      downloaded: 'bg-green-100 text-green-800',
      emailed: 'bg-purple-100 text-purple-800',
      tally_push: 'bg-orange-100 text-orange-800',
      tally_push_success: 'bg-green-100 text-green-800',
      tally_push_failed: 'bg-red-100 text-red-800',
      viewed: 'bg-gray-100 text-gray-800',
      modified: 'bg-yellow-100 text-yellow-800',
      deleted: 'bg-red-100 text-red-800',
    };
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return colors[event] || 'bg-gray-100 text-gray-800';
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

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className="max-w-6xl mx-auto p-6">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <div className="bg-white shadow-md rounded-lg">
        {/* Header */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className="px-6 py-4 border-b border-gray-200">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <h2 className="text-2xl font-bold text-gray-900">
            Invoice Audit Trail Viewer
          </h2>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <p className="text-gray-600 mt-1">
            View and manage audit trails for invoices
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

        {/* Audit Trail Display */}
        {auditTrail && (
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div className="p-6">
            {/* Invoice Info */}
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Invoice Information
              </h3>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <div>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <span className="font-medium">Invoice Number:</span>{' '}
                  // @ts-expect-error TS(2339): Property 'invoiceNumber' does not exist on type 'n... Remove this comment to see the full error message
                  {auditTrail.invoiceNumber}
                </div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <div>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <span className="font-medium">DO2 ID:</span>{' '}
                  // @ts-expect-error TS(2339): Property 'do2Id' does not exist on type 'never'.
                  {auditTrail.do2Id}
                </div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <div>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <span className="font-medium">Total Events:</span>{' '}
                  // @ts-expect-error TS(2339): Property 'totalEvents' does not exist on type 'nev... Remove this comment to see the full error message
                  {auditTrail.totalEvents}
                </div>
              </div>
            </div>

            {/* Audit Summary */}
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="mb-6">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Audit Summary
              </h3>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                // @ts-expect-error TS(2339): Property 'auditSummary' does not exist on type 'ne... Remove this comment to see the full error message
                {Object.entries(auditTrail.auditSummary).map(
                  ([event, summary]) => (
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <div
                      key={event}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                      <div className="flex items-center justify-between mb-2">
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventColor(event)}`}
                        >
                          {event.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <span className="text-sm font-medium text-gray-900">
                          // @ts-expect-error TS(2571): Object is of type 'unknown'.
                          {summary.count}
                        </span>
                      </div>
                      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                      <div className="text-xs text-gray-600">
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <p>
                          Last:{' '}
                          // @ts-expect-error TS(2571): Object is of type 'unknown'.
                          {summary.lastOccurrence
                            // @ts-expect-error TS(2571): Object is of type 'unknown'.
                            ? formatTimestamp(summary.lastOccurrence)
                            : 'Never'}
                        </p>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <p>By: {summary.performedBy.join(', ')}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Add Entry Button */}
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="mb-6">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <button
                onClick={() => setShowAddEntry(!showAddEntry)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {showAddEntry ? 'Cancel' : 'Add Audit Entry'}
              </button>
            </div>

            {/* Add Entry Form */}
            {showAddEntry && (
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Add Audit Entry
                </h4>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <form
                  onSubmit={handleSubmit(addAuditEntry)}
                  className="space-y-4"
                >
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <div>
                      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Type
                      </label>
                      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                      <select
                        {...register('event', {
                          required: 'Event is required',
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <option value="">Select Event</option>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <option value="viewed">Viewed</option>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <option value="downloaded">Downloaded</option>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <option value="emailed">Emailed</option>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <option value="modified">Modified</option>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <option value="tally_push">Tally Push</option>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <option value="tally_push_success">
                          Tally Push Success
                        </option>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <option value="tally_push_failed">
                          Tally Push Failed
                        </option>
                      </select>
                    </div>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <div>
                      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Performed By
                      </label>
                      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                      <input
                        type="text"
                        {...register('performedBy')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="system"
                      />
                    </div>
                  </div>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <div>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <textarea
                      {...register('notes')}
                      // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'number'.
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional notes about this event"
                    />
                  </div>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <div className="flex space-x-4">
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Entry
                    </button>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <button
                      type="button"
                      onClick={() => setShowAddEntry(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Audit Trail List */}
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Audit Trail Events
              </h3>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div className="space-y-4">
                // @ts-expect-error TS(2339): Property 'auditTrail' does not exist on type 'neve... Remove this comment to see the full error message
                {auditTrail.auditTrail.map((entry: any, index: any) => (
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <div className="flex items-start justify-between">
                      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                      <div className="flex-1">
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <div className="flex items-center space-x-3 mb-2">
                          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventColor(entry.event)}`}
                          >
                            {entry.event.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                          <span className="text-sm text-gray-600">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                          <span className="text-sm text-gray-600">
                            by {entry.performedBy}
                          </span>
                        </div>
                        {entry.notes && (
                          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                          <p className="text-sm text-gray-700 mb-2">
                            {entry.notes}
                          </p>
                        )}
                        {entry.metadata &&
                          Object.keys(entry.metadata).length > 0 && (
                            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                            <div className="text-xs text-gray-600">
                              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                              <details>
                                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                                <summary className="cursor-pointer font-medium">
                                  Metadata
                                </summary>
                                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                                <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                                  {JSON.stringify(entry.metadata, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrailViewer;
