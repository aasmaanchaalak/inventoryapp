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
  const fetchTimelineData = async (identifier: any, type: any) => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (type === 'lead') {
        response = await fetch(
          `http://localhost:5000/api/leads/timeline/${identifier}`
        );
      } else {
        response = await fetch(
          `http://localhost:5000/api/pos/timeline/${identifier}`
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
  const onSubmit = (data: any) => {
    if (data.leadId) {
      fetchTimelineData(data.leadId, 'lead');
    } else if (data.poId) {
      fetchTimelineData(data.poId, 'po');
    }
  };

  // Get status icon
  const getStatusIcon = (data: any, isCompleted: any) => {
    if (!data) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          is provided... Remove this comment to see the full error message
          <span className="text-gray-400 text-sm">?</span>
        </div>
      );
    }

    if (isCompleted) {
      return (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          is provided... Remove this comment to see the full error message
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            flag is provided... Remove this comment to see the full error
            message
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
        provided... Remove this comment to see the full error message
        <svg
          className="w-5 h-5 text-yellow-600 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          is provided... Remove this comment to see the full error message
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
  const formatDate = (dateString: any) => {
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
  const navigateToLead = (leadId: any) => {
    if (leadId) {
      navigate(`/leads/${leadId}`);
    }
  };

  const navigateToQuotation = (quotationId: any) => {
    if (quotationId) {
      navigate(`/quotations/${quotationId}`);
    }
  };

  const navigateToPO = (poId: any) => {
    if (poId) {
      navigate(`/pos/${poId}`);
    }
  };

  const navigateToDO1 = (do1Id: any) => {
    if (do1Id) {
      navigate(`/do1/${do1Id}`);
    }
  };

  const navigateToDO2 = (do2Id: any) => {
    if (do2Id) {
      navigate(`/invoice/${do2Id}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      provided... Remove this comment to see the full error message
      <h2 className="text-3xl font-bold text-gray-900 mb-6">DO Timeline</h2>
      provided... Remove this comment to see the full error message
      <div className="mb-8">
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Track Process Journey
        </h3>
        provided... Remove this comment to see the full error message
        <p className="text-gray-600 mb-4">
          Enter a Lead ID or PO ID to view the complete timeline from lead
          creation to invoice generation.
        </p>
      </div>
      provided... Remove this comment to see the full error message
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        provided... Remove this comment to see the full error message
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          is provided... Remove this comment to see the full error message
          <div>
            flag is provided... Remove this comment to see the full error
            message
            <label
              htmlFor="leadId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lead ID
            </label>
            flag is provided... Remove this comment to see the full error
            message
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
          is provided... Remove this comment to see the full error message
          <div>
            flag is provided... Remove this comment to see the full error
            message
            <label
              htmlFor="poId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              PO ID
            </label>
            flag is provided... Remove this comment to see the full error
            message
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
        provided... Remove this comment to see the full error message
        <button
          type="submit"
          disabled={isLoading || (!watchedLeadId && !watchedPoId)}
          className="mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              flag is provided... Remove this comment to see the full error
              message
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                flag is provided... Remove this comment to see the full error
                message
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                flag is provided... Remove this comment to see the full error
                message
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
          is provided... Remove this comment to see the full error message
          <div className="flex">
            flag is provided... Remove this comment to see the full error
            message
            <div className="flex-shrink-0">
              flag is provided... Remove this comment to see the full error
              message
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                flag is provided... Remove this comment to see the full error
                message
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
              flag is provided... Remove this comment to see the full error
              message
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              flag is provided... Remove this comment to see the full error
              message
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      {timelineData && (
        <div className="mt-8">
          is provided... Remove this comment to see the full error message
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Process Timeline
          </h3>
          is provided... Remove this comment to see the full error message
          <div className="relative">
            {/* Timeline Line */}
            flag is provided... Remove this comment to see the full error
            message
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            flag is provided... Remove this comment to see the full error
            message
            <div className="space-y-8">
              {/* Step 1: Lead Created */}
              flag is provided... Remove this comment to see the full error
              message
              <div className="relative flex items-start">
                flag is provided... Remove this comment to see the full error
                message
                <div className="absolute left-0 top-0">
                  on type 'never'.
                  {getStatusIcon(timelineData.lead, true)}
                </div>
                flag is provided... Remove this comment to see the full error
                message
                <div className="ml-12 flex-1">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <div
                    className={`bg-blue-50 p-6 rounded-lg border border-blue-200 ${timelineData.lead?._id ? 'cursor-pointer hover:bg-blue-100 transition-colors' : ''}`}
                    onClick={() =>
                      timelineData.lead?._id &&
                      navigateToLead(timelineData.lead._id)
                    }
                  >
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div className="flex items-center justify-between mb-2">
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <h4 className="text-lg font-semibold text-blue-900 flex items-center">
                        'lead' does not exist on type 'never'.
                        {timelineData.lead?._id && (
                          <svg
                            className="ml-2 w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            the '--jsx' flag is provided... Remove this comment
                            to see the full error message
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                          </svg>
                        )}
                      </h4>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <span className="text-sm text-blue-600 font-medium">
                        Step 1
                      </span>
                    </div>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div className="space-y-2 text-sm text-blue-800">
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        Property 'lead' does not exist on type 'never'.
                        {timelineData.lead?.customerName || 'N/A'}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        Property 'lead' does not exist on type 'never'.
                        {timelineData.lead?._id || 'N/A'}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        Property 'lead' does not exist on type 'never'.
                        {formatDate(timelineData.lead?.createdAt)}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <strong>Status:</strong>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <span className="ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          exist on type 'never'.
                          {timelineData.lead ? 'ACTIVE' : 'NOT FOUND'}
                        </span>
                      </p>
                      exist on type 'never'.
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
              flag is provided... Remove this comment to see the full error
              message
              <div className="relative flex items-start">
                flag is provided... Remove this comment to see the full error
                message
                <div className="absolute left-0 top-0">
                  {getStatusIcon(
                    timelineData.quotation,
                    !!timelineData.quotation
                  )}
                </div>
                flag is provided... Remove this comment to see the full error
                message
                <div className="ml-12 flex-1">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <div
                    className={`p-6 rounded-lg border ${timelineData.quotation ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} ${timelineData.quotation?._id ? 'cursor-pointer hover:bg-green-100 transition-colors' : ''}`}
                    onClick={() =>
                      timelineData.quotation?._id &&
                      navigateToQuotation(timelineData.quotation._id)
                    }
                  >
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div className="flex items-center justify-between mb-2">
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <h4
                        className={`text-lg font-semibold ${timelineData.quotation ? 'text-green-900' : 'text-gray-700'} flex items-center`}
                      >
                        'quotation' does not exist on type 'never... Remove this
                        comment to see the full error message
                        {timelineData.quotation?._id && (
                          <svg
                            className="ml-2 w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            the '--jsx' flag is provided... Remove this comment
                            to see the full error message
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                          </svg>
                        )}
                      </h4>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <span
                        className={`text-sm font-medium ${timelineData.quotation ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        Step 2
                      </span>
                    </div>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div
                      className={`space-y-2 text-sm ${timelineData.quotation ? 'text-green-800' : 'text-gray-600'}`}
                    >
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        TS(2339): Property 'quotation' does not exist on type
                        'never... Remove this comment to see the full error
                        message
                        {timelineData.quotation?._id || 'N/A'}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        TS(2339): Property 'quotation' does not exist on type
                        'never... Remove this comment to see the full error
                        message
                        {timelineData.quotation?.quotationNumber || 'N/A'}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        Property 'quotation' does not exist on type 'never...
                        Remove this comment to see the full error message
                        {formatDate(timelineData.quotation?.createdAt)}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <strong>Status:</strong>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <span
                          className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            timelineData.quotation
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          does not exist on type 'never... Remove this comment
                          to see the full error message
                          {timelineData.quotation ? 'ISSUED' : 'NOT FOUND'}
                        </span>
                      </p>
                      not exist on type 'never... Remove this comment to see the
                      full error message
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
              flag is provided... Remove this comment to see the full error
              message
              <div className="relative flex items-start">
                flag is provided... Remove this comment to see the full error
                message
                <div className="absolute left-0 top-0">
                  type 'never'.
                  {getStatusIcon(timelineData.po, !!timelineData.po)}
                </div>
                flag is provided... Remove this comment to see the full error
                message
                <div className="ml-12 flex-1">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <div
                    className={`p-6 rounded-lg border ${timelineData.po ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'} ${timelineData.po?._id ? 'cursor-pointer hover:bg-purple-100 transition-colors' : ''}`}
                    onClick={() =>
                      timelineData.po?._id && navigateToPO(timelineData.po._id)
                    }
                  >
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div className="flex items-center justify-between mb-2">
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <h4
                        className={`text-lg font-semibold ${timelineData.po ? 'text-purple-900' : 'text-gray-700'} flex items-center`}
                      >
                        does not exist on type 'never'.
                        {timelineData.po?._id && (
                          <svg
                            className="ml-2 w-4 h-4 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            the '--jsx' flag is provided... Remove this comment
                            to see the full error message
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                          </svg>
                        )}
                      </h4>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <span
                        className={`text-sm font-medium ${timelineData.po ? 'text-purple-600' : 'text-gray-500'}`}
                      >
                        Step 3
                      </span>
                    </div>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div
                      className={`space-y-2 text-sm ${timelineData.po ? 'text-purple-800' : 'text-gray-600'}`}
                    >
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <strong>PO ID:</strong> {timelineData.po?._id || 'N/A'}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        TS(2339): Property 'po' does not exist on type 'never'.
                        {timelineData.po?.poNumber || 'N/A'}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        TS(2339): Property 'po' does not exist on type 'never'.
                        {formatDate(timelineData.po?.createdAt)}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <strong>Status:</strong>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <span
                          className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            timelineData.po
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          exist on type 'never'.
                          {timelineData.po
                              timelineData.po.status.toUpperCase()
                            : 'NOT FOUND'}
                        </span>
                      </p>
                      on type 'never'.
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
              flag is provided... Remove this comment to see the full error
              message
              <div className="relative flex items-start">
                flag is provided... Remove this comment to see the full error
                message
                <div className="absolute left-0 top-0">
                  type 'never'.
                  {getStatusIcon(timelineData.do1, !!timelineData.do1)}
                </div>
                flag is provided... Remove this comment to see the full error
                message
                <div className="ml-12 flex-1">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <div
                    className={`p-6 rounded-lg border ${timelineData.do1 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'} ${timelineData.do1?._id ? 'cursor-pointer hover:bg-orange-100 transition-colors' : ''}`}
                    onClick={() =>
                      timelineData.do1?._id &&
                      navigateToDO1(timelineData.do1._id)
                    }
                  >
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div className="flex items-center justify-between mb-2">
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <h4
                        className={`text-lg font-semibold ${timelineData.do1 ? 'text-orange-900' : 'text-gray-700'} flex items-center`}
                      >
                        'do1' does not exist on type 'never'.
                        {timelineData.do1?._id && (
                          <svg
                            className="ml-2 w-4 h-4 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            the '--jsx' flag is provided... Remove this comment
                            to see the full error message
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                          </svg>
                        )}
                      </h4>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <span
                        className={`text-sm font-medium ${timelineData.do1 ? 'text-orange-600' : 'text-gray-500'}`}
                      >
                        Step 4
                      </span>
                    </div>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div
                      className={`space-y-2 text-sm ${timelineData.do1 ? 'text-orange-800' : 'text-gray-600'}`}
                    >
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        Property 'do1' does not exist on type 'never'.
                        {timelineData.do1?._id || 'N/A'}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        TS(2339): Property 'do1' does not exist on type 'never'.
                        {timelineData.do1?.do1Number || 'N/A'}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        Property 'do1' does not exist on type 'never'.
                        {formatDate(timelineData.do1?.createdAt)}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <strong>Status:</strong>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <span
                          className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            timelineData.do1
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          exist on type 'never'.
                          {timelineData.do1
                              timelineData.do1.status.toUpperCase()
                            : 'NOT FOUND'}
                        </span>
                      </p>
                      exist on type 'never'.
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
              flag is provided... Remove this comment to see the full error
              message
              <div className="relative flex items-start">
                flag is provided... Remove this comment to see the full error
                message
                <div className="absolute left-0 top-0">
                  type 'never'.
                  {getStatusIcon(timelineData.do2, !!timelineData.do2)}
                </div>
                flag is provided... Remove this comment to see the full error
                message
                <div className="ml-12 flex-1">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <div
                    className={`p-6 rounded-lg border ${timelineData.do2 ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'} ${timelineData.do2?._id ? 'cursor-pointer hover:bg-indigo-100 transition-colors' : ''}`}
                    onClick={() =>
                      timelineData.do2?._id &&
                      navigateToDO2(timelineData.do2._id)
                    }
                  >
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div className="flex items-center justify-between mb-2">
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <h4
                        className={`text-lg font-semibold ${timelineData.do2 ? 'text-indigo-900' : 'text-gray-700'} flex items-center`}
                      >
                        TS(2339): Property 'do2' does not exist on type 'never'.
                        {timelineData.do2?._id && (
                          <svg
                            className="ml-2 w-4 h-4 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            the '--jsx' flag is provided... Remove this comment
                            to see the full error message
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                          </svg>
                        )}
                      </h4>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <span
                        className={`text-sm font-medium ${timelineData.do2 ? 'text-indigo-600' : 'text-gray-500'}`}
                      >
                        Step 5
                      </span>
                    </div>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div
                      className={`space-y-2 text-sm ${timelineData.do2 ? 'text-indigo-800' : 'text-gray-600'}`}
                    >
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        Property 'do2' does not exist on type 'never'.
                        {timelineData.do2?._id || 'N/A'}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        TS(2339): Property 'do2' does not exist on type 'never'.
                        {timelineData.do2?.do2Number || 'N/A'}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        Property 'do2' does not exist on type 'never'.
                        {formatDate(timelineData.do2?.createdAt)}
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <strong>Status:</strong>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <span
                          className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            timelineData.do2
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          exist on type 'never'.
                          {timelineData.do2
                              timelineData.do2.status.toUpperCase()
                            : 'NOT FOUND'}
                        </span>
                      </p>
                      exist on type 'never'.
                      {timelineData.invoice && (
                        <div className="mt-3 pt-3 border-t border-indigo-200">
                          the '--jsx' flag is provided... Remove this comment to
                          see the full error message
                          <p>
                            the '--jsx' flag is provided... Remove this comment
                            to see the full error message
                            TS(2339): Property 'invoice' does not exist on type
                            'never'.
                            {timelineData.invoice.invoiceNumber}
                          </p>
                          the '--jsx' flag is provided... Remove this comment to
                          see the full error message
                          <p>
                            the '--jsx' flag is provided... Remove this comment
                            to see the full error message
                            <strong>Invoice Generated:</strong> //
                            @ts-expect-error TS(2339): Property 'invoice' does
                            not exist on type 'never'.
                            {formatDate(timelineData.invoice.generatedAt)}
                          </p>
                          the '--jsx' flag is provided... Remove this comment to
                          see the full error message
                          <p>
                            the '--jsx' flag is provided... Remove this comment
                            to see the full error message
                            <strong>Tally Push:</strong>
                            the '--jsx' flag is provided... Remove this comment
                            to see the full error message
                            <span
                              className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                timelineData.invoice.pushedToTally
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              does not exist on type 'never'.
                              {timelineData.invoice.pushedToTally
                                ? 'PUSHED'
                                : 'PENDING'}
                            </span>
                          </p>
                        </div>
                      )}
                      exist on type 'never'.
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
      provided... Remove this comment to see the full error message
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        provided... Remove this comment to see the full error message
        <h3 className="text-sm font-medium text-gray-800 mb-2">How to use</h3>
        provided... Remove this comment to see the full error message
        <ul className="text-sm text-gray-700 space-y-1">
          is provided... Remove this comment to see the full error message
          <li>
            • Enter either a Lead ID or PO ID to view the complete timeline
          </li>
          is provided... Remove this comment to see the full error message
          <li>• Green checkmarks indicate completed steps</li>
          is provided... Remove this comment to see the full error message
          <li>• Yellow spinners indicate in-progress steps</li>
          is provided... Remove this comment to see the full error message
          <li>• Gray question marks indicate steps not yet started</li>
          is provided... Remove this comment to see the full error message
          <li>• Each step shows relevant IDs, timestamps, and status</li>
        </ul>
      </div>
    </div>
  );
};

export default DOTimeline;
