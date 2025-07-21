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

  const fetchAuditTrail = async (id) => {
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
      setError('Network error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data) => {
    fetchAuditTrail(data.invoiceId);
  };

  const addAuditEntry = async (entryData) => {
    if (!auditTrail) return;

    try {
      const response = await fetch(
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
        fetchAuditTrail(auditTrail.invoiceId);
        setShowAddEntry(false);
        reset();
      } else {
        setError(result.message || 'Failed to add audit entry');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    }
  };

  const getEventColor = (event) => {
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
    return colors[event] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp) => {
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Invoice Audit Trail Viewer
          </h2>
          <p className="text-gray-600 mt-1">
            View and manage audit trails for invoices
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

        {/* Audit Trail Display */}
        {auditTrail && (
          <div className="p-6">
            {/* Invoice Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Invoice Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Invoice Number:</span>{' '}
                  {auditTrail.invoiceNumber}
                </div>
                <div>
                  <span className="font-medium">DO2 ID:</span>{' '}
                  {auditTrail.do2Id}
                </div>
                <div>
                  <span className="font-medium">Total Events:</span>{' '}
                  {auditTrail.totalEvents}
                </div>
              </div>
            </div>

            {/* Audit Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Audit Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(auditTrail.auditSummary).map(
                  ([event, summary]) => (
                    <div
                      key={event}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventColor(event)}`}
                        >
                          {event.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {summary.count}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>
                          Last:{' '}
                          {summary.lastOccurrence
                            ? formatTimestamp(summary.lastOccurrence)
                            : 'Never'}
                        </p>
                        <p>By: {summary.performedBy.join(', ')}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Add Entry Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowAddEntry(!showAddEntry)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {showAddEntry ? 'Cancel' : 'Add Audit Entry'}
              </button>
            </div>

            {/* Add Entry Form */}
            {showAddEntry && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Add Audit Entry
                </h4>
                <form
                  onSubmit={handleSubmit(addAuditEntry)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Type
                      </label>
                      <select
                        {...register('event', {
                          required: 'Event is required',
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Event</option>
                        <option value="viewed">Viewed</option>
                        <option value="downloaded">Downloaded</option>
                        <option value="emailed">Emailed</option>
                        <option value="modified">Modified</option>
                        <option value="tally_push">Tally Push</option>
                        <option value="tally_push_success">
                          Tally Push Success
                        </option>
                        <option value="tally_push_failed">
                          Tally Push Failed
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Performed By
                      </label>
                      <input
                        type="text"
                        {...register('performedBy')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="system"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional notes about this event"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Entry
                    </button>
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Audit Trail Events
              </h3>
              <div className="space-y-4">
                {auditTrail.auditTrail.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventColor(entry.event)}`}
                          >
                            {entry.event.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                          <span className="text-sm text-gray-600">
                            by {entry.performedBy}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-gray-700 mb-2">
                            {entry.notes}
                          </p>
                        )}
                        {entry.metadata &&
                          Object.keys(entry.metadata).length > 0 && (
                            <div className="text-xs text-gray-600">
                              <details>
                                <summary className="cursor-pointer font-medium">
                                  Metadata
                                </summary>
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
