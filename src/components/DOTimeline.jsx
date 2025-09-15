import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const DOTimeline = () => {
  const [timelineData, setTimelineData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      leadId: '',
      poId: '',
    },
  });

  const watchedLeadId = watch('leadId');
  const watchedPoId = watch('poId');

  // Fetch timeline data
  const fetchTimelineData = async (identifier, type) => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (type === 'lead') {
        response = await fetch(
          `http://localhost:5001/api/leads/timeline/${identifier}`
        );
      } else {
        response = await fetch(
          `http://localhost:5001/api/pos/timeline/${identifier}`
        );
      }

      if (response.ok) {
        const data = await response.json();
        setTimelineData(data.data.timeline);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch timeline data');
        setTimelineData(null);
      }
    } catch (error) {
      setError('Network error: ' + error.message);
      setTimelineData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = (data) => {
    if (data.leadId) {
      fetchTimelineData(data.leadId, 'lead');
    } else if (data.poId) {
      fetchTimelineData(data.poId, 'po');
    }
  };

  // Get status icon
  const getStatusIcon = (data, isCompleted) => {
    if (!data) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">?</span>
        </div>
      );
    }

    if (isCompleted) {
      return (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-yellow-600 animate-spin"
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
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Navigation functions for each stage
  const navigateToLead = (leadId) => {
    if (leadId) {
      navigate(`/leads/${leadId}`);
    }
  };

  const navigateToQuotation = (quotationId) => {
    if (quotationId) {
      navigate(`/quotations/${quotationId}`);
    }
  };

  const navigateToPO = (poId) => {
    if (poId) {
      navigate(`/pos/${poId}`);
    }
  };

  const navigateToDO1 = (do1Id) => {
    if (do1Id) {
      navigate(`/do1/${do1Id}`);
    }
  };

  const navigateToDO2 = (do2Id) => {
    if (do2Id) {
      navigate(`/invoice/${do2Id}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">DO Timeline</h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Track Process Journey
        </h3>
        <p className="text-gray-600 mb-4">
          Enter a Lead ID or PO ID to view the complete timeline from lead
          creation to invoice generation.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="leadId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lead ID
            </label>
            <input
              type="text"
              id="leadId"
              {...register('leadId', {
                pattern: {
                  value: /^[0-9a-fA-F]{24}$/,
                  message: 'Please enter a valid MongoDB ObjectId',
                },
              })}
              placeholder="Enter Lead ObjectId (24 characters)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.leadId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.leadId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="poId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              PO ID
            </label>
            <input
              type="text"
              id="poId"
              {...register('poId', {
                pattern: {
                  value: /^[0-9a-fA-F]{24}$/,
                  message: 'Please enter a valid MongoDB ObjectId',
                },
              })}
              placeholder="Enter PO ObjectId (24 characters)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.poId && (
              <p className="mt-1 text-sm text-red-600">{errors.poId.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || (!watchedLeadId && !watchedPoId)}
          className="mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
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
              Loading Timeline...
            </div>
          ) : (
            'Load Timeline'
          )}
        </button>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
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

      {timelineData && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Process Timeline
          </h3>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-8">
              {/* Step 1: Lead Created */}
              <div className="relative flex items-start">
                <div className="absolute left-0 top-0">
                  {getStatusIcon(timelineData.lead, true)}
                </div>
                <div className="ml-12 flex-1">
                  <div
                    className={`bg-blue-50 p-6 rounded-lg border border-blue-200 ${timelineData.lead?._id ? 'cursor-pointer hover:bg-blue-100 transition-colors' : ''}`}
                    onClick={() =>
                      timelineData.lead?._id &&
                      navigateToLead(timelineData.lead._id)
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-blue-900 flex items-center">
                        Lead Created
                        {timelineData.lead?._id && (
                          <svg
                            className="ml-2 w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                          </svg>
                        )}
                      </h4>
                      <span className="text-sm text-blue-600 font-medium">
                        Step 1
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>
                        <strong>Customer:</strong>{' '}
                        {timelineData.lead?.customerName || 'N/A'}
                      </p>
                      <p>
                        <strong>Lead ID:</strong>{' '}
                        {timelineData.lead?._id || 'N/A'}
                      </p>
                      <p>
                        <strong>Created:</strong>{' '}
                        {formatDate(timelineData.lead?.createdAt)}
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span className="ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {timelineData.lead ? 'ACTIVE' : 'NOT FOUND'}
                        </span>
                      </p>
                      {timelineData.lead?._id && (
                        <p className="text-xs text-blue-600 mt-2">
                          Click to view lead details →
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Quotation Issued */}
              <div className="relative flex items-start">
                <div className="absolute left-0 top-0">
                  {getStatusIcon(
                    timelineData.quotation,
                    !!timelineData.quotation
                  )}
                </div>
                <div className="ml-12 flex-1">
                  <div
                    className={`p-6 rounded-lg border ${timelineData.quotation ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} ${timelineData.quotation?._id ? 'cursor-pointer hover:bg-green-100 transition-colors' : ''}`}
                    onClick={() =>
                      timelineData.quotation?._id &&
                      navigateToQuotation(timelineData.quotation._id)
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4
                        className={`text-lg font-semibold ${timelineData.quotation ? 'text-green-900' : 'text-gray-700'} flex items-center`}
                      >
                        Quotation Issued
                        {timelineData.quotation?._id && (
                          <svg
                            className="ml-2 w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                          </svg>
                        )}
                      </h4>
                      <span
                        className={`text-sm font-medium ${timelineData.quotation ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        Step 2
                      </span>
                    </div>
                    <div
                      className={`space-y-2 text-sm ${timelineData.quotation ? 'text-green-800' : 'text-gray-600'}`}
                    >
                      <p>
                        <strong>Quotation ID:</strong>{' '}
                        {timelineData.quotation?._id || 'N/A'}
                      </p>
                      <p>
                        <strong>Quotation Number:</strong>{' '}
                        {timelineData.quotation?.quotationNumber || 'N/A'}
                      </p>
                      <p>
                        <strong>Issued:</strong>{' '}
                        {formatDate(timelineData.quotation?.createdAt)}
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span
                          className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            timelineData.quotation
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {timelineData.quotation ? 'ISSUED' : 'NOT FOUND'}
                        </span>
                      </p>
                      {timelineData.quotation?._id && (
                        <p className="text-xs text-green-600 mt-2">
                          Click to view quotation details →
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: PO Generated */}
              <div className="relative flex items-start">
                <div className="absolute left-0 top-0">
                  {getStatusIcon(timelineData.po, !!timelineData.po)}
                </div>
                <div className="ml-12 flex-1">
                  <div
                    className={`p-6 rounded-lg border ${timelineData.po ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'} ${timelineData.po?._id ? 'cursor-pointer hover:bg-purple-100 transition-colors' : ''}`}
                    onClick={() =>
                      timelineData.po?._id && navigateToPO(timelineData.po._id)
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4
                        className={`text-lg font-semibold ${timelineData.po ? 'text-purple-900' : 'text-gray-700'} flex items-center`}
                      >
                        PO Generated
                        {timelineData.po?._id && (
                          <svg
                            className="ml-2 w-4 h-4 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                          </svg>
                        )}
                      </h4>
                      <span
                        className={`text-sm font-medium ${timelineData.po ? 'text-purple-600' : 'text-gray-500'}`}
                      >
                        Step 3
                      </span>
                    </div>
                    <div
                      className={`space-y-2 text-sm ${timelineData.po ? 'text-purple-800' : 'text-gray-600'}`}
                    >
                      <p>
                        <strong>PO ID:</strong> {timelineData.po?._id || 'N/A'}
                      </p>
                      <p>
                        <strong>PO Number:</strong>{' '}
                        {timelineData.po?.poNumber || 'N/A'}
                      </p>
                      <p>
                        <strong>Generated:</strong>{' '}
                        {formatDate(timelineData.po?.createdAt)}
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span
                          className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            timelineData.po
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {timelineData.po
                            ? timelineData.po.status.toUpperCase()
                            : 'NOT FOUND'}
                        </span>
                      </p>
                      {timelineData.po?._id && (
                        <p className="text-xs text-purple-600 mt-2">
                          Click to view PO details →
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: DO1 Executed */}
              <div className="relative flex items-start">
                <div className="absolute left-0 top-0">
                  {getStatusIcon(timelineData.do1, !!timelineData.do1)}
                </div>
                <div className="ml-12 flex-1">
                  <div
                    className={`p-6 rounded-lg border ${timelineData.do1 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'} ${timelineData.do1?._id ? 'cursor-pointer hover:bg-orange-100 transition-colors' : ''}`}
                    onClick={() =>
                      timelineData.do1?._id &&
                      navigateToDO1(timelineData.do1._id)
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4
                        className={`text-lg font-semibold ${timelineData.do1 ? 'text-orange-900' : 'text-gray-700'} flex items-center`}
                      >
                        DO1 Executed
                        {timelineData.do1?._id && (
                          <svg
                            className="ml-2 w-4 h-4 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                          </svg>
                        )}
                      </h4>
                      <span
                        className={`text-sm font-medium ${timelineData.do1 ? 'text-orange-600' : 'text-gray-500'}`}
                      >
                        Step 4
                      </span>
                    </div>
                    <div
                      className={`space-y-2 text-sm ${timelineData.do1 ? 'text-orange-800' : 'text-gray-600'}`}
                    >
                      <p>
                        <strong>DO1 ID:</strong>{' '}
                        {timelineData.do1?._id || 'N/A'}
                      </p>
                      <p>
                        <strong>DO1 Number:</strong>{' '}
                        {timelineData.do1?.do1Number || 'N/A'}
                      </p>
                      <p>
                        <strong>Executed:</strong>{' '}
                        {formatDate(timelineData.do1?.createdAt)}
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span
                          className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            timelineData.do1
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {timelineData.do1
                            ? timelineData.do1.status.toUpperCase()
                            : 'NOT FOUND'}
                        </span>
                      </p>
                      {timelineData.do1?._id && (
                        <p className="text-xs text-orange-600 mt-2">
                          Click to view DO1 details →
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5: DO2 Executed → Invoice Generated */}
              <div className="relative flex items-start">
                <div className="absolute left-0 top-0">
                  {getStatusIcon(timelineData.do2, !!timelineData.do2)}
                </div>
                <div className="ml-12 flex-1">
                  <div
                    className={`p-6 rounded-lg border ${timelineData.do2 ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'} ${timelineData.do2?._id ? 'cursor-pointer hover:bg-indigo-100 transition-colors' : ''}`}
                    onClick={() =>
                      timelineData.do2?._id &&
                      navigateToDO2(timelineData.do2._id)
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4
                        className={`text-lg font-semibold ${timelineData.do2 ? 'text-indigo-900' : 'text-gray-700'} flex items-center`}
                      >
                        DO2 Executed → Invoice Generated
                        {timelineData.do2?._id && (
                          <svg
                            className="ml-2 w-4 h-4 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                          </svg>
                        )}
                      </h4>
                      <span
                        className={`text-sm font-medium ${timelineData.do2 ? 'text-indigo-600' : 'text-gray-500'}`}
                      >
                        Step 5
                      </span>
                    </div>
                    <div
                      className={`space-y-2 text-sm ${timelineData.do2 ? 'text-indigo-800' : 'text-gray-600'}`}
                    >
                      <p>
                        <strong>DO2 ID:</strong>{' '}
                        {timelineData.do2?._id || 'N/A'}
                      </p>
                      <p>
                        <strong>DO2 Number:</strong>{' '}
                        {timelineData.do2?.do2Number || 'N/A'}
                      </p>
                      <p>
                        <strong>Executed:</strong>{' '}
                        {formatDate(timelineData.do2?.createdAt)}
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span
                          className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            timelineData.do2
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {timelineData.do2
                            ? timelineData.do2.status.toUpperCase()
                            : 'NOT FOUND'}
                        </span>
                      </p>
                      {timelineData.invoice && (
                        <div className="mt-3 pt-3 border-t border-indigo-200">
                          <p>
                            <strong>Invoice Number:</strong>{' '}
                            {timelineData.invoice.invoiceNumber}
                          </p>
                          <p>
                            <strong>Invoice Generated:</strong>{' '}
                            {formatDate(timelineData.invoice.generatedAt)}
                          </p>
                          <p>
                            <strong>Tally Push:</strong>
                            <span
                              className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                timelineData.invoice.pushedToTally
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {timelineData.invoice.pushedToTally
                                ? 'PUSHED'
                                : 'PENDING'}
                            </span>
                          </p>
                        </div>
                      )}
                      {timelineData.do2?._id && (
                        <p className="text-xs text-indigo-600 mt-2">
                          Click to view invoice details →
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="text-sm font-medium text-gray-800 mb-2">How to use</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>
            • Enter either a Lead ID or PO ID to view the complete timeline
          </li>
          <li>• Green checkmarks indicate completed steps</li>
          <li>• Yellow spinners indicate in-progress steps</li>
          <li>• Gray question marks indicate steps not yet started</li>
          <li>• Each step shows relevant IDs, timestamps, and status</li>
        </ul>
      </div>
    </div>
  );
};

export default DOTimeline;
