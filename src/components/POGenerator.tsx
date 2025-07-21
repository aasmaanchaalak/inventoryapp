import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useApi } from '../hooks/useApi';
import { FormError } from './common';

// Validation schema
const schema = yup
  .object({
    leadId: yup.string().required('Please select a lead'),
    quotationId: yup.string().required('Please select a quotation'),
    poDate: yup.date().required('PO date is required'),
    remarks: yup.string().optional(),
  })
  .required();

const POGenerator = () => {
  const [leads, setLeads] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [poNumber, setPoNumber] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // API hooks for different operations
  const {
    get: fetchLeadsData,
    isLoading: isLoadingLeads,
    error: leadsError,
  } = useApi();

  const { get: fetchQuotationsData } = useApi();

  const { post: createPO, isLoading: isCreatingPO } = useApi();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'Date'.
      poDate: new Date().toISOString().split('T')[0], // Default to today
    },
  });

  const watchedLeadId = watch('leadId');
  const watchedQuotationId = watch('quotationId');

  // Fetch leads on component mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await fetchLeadsData('http://localhost:5000/api/leads');
        if (data.success) {
          const allLeads = data.data || [];

          // Deduplicate leads based on name and normalized phone number
          const uniqueLeads = allLeads.filter(
            (lead: any, index: any, self: any) => {
              // Normalize phone number by removing all non-digits
              const normalizePhone = (phone: any) => phone.replace(/\D/g, '');
              const currentPhone = normalizePhone(lead.phone);
              const currentName = lead.name.toLowerCase().trim();

              // Find the first occurrence of this name+phone combination
              return (
                index ===
                self.findIndex(
                  (l: any) =>
                    l.name.toLowerCase().trim() === currentName &&
                    normalizePhone(l.phone) === currentPhone
                )
              );
            }
          );

          setLeads(uniqueLeads);
        }
      } catch (error) {
        // Error already handled by useApi hook
        setLeads([]);
      }
    };

    fetchLeads();
  }, []); // Remove fetchLeadsData dependency to prevent infinite re-renders

  // Fetch quotations when lead is selected
  useEffect(() => {
    const fetchQuotations = async () => {
      if (!watchedLeadId) {
        setQuotations([]);
        return;
      }

      try {
        const data = await fetchQuotationsData(
          `http://localhost:5000/api/quotations?leadId=${watchedLeadId}`
        );
        if (data.success) {
          setQuotations(data.data || []);
        }
      } catch (error) {
        // Error already handled by useApi hook
        setQuotations([]);
      }
    };

    fetchQuotations();
  }, [watchedLeadId]); // Remove fetchQuotationsData dependency to prevent infinite re-renders

  // Update selected quotation when quotation is selected
  useEffect(() => {
    if (watchedQuotationId) {
      // @ts-expect-error TS(2339): Property '_id' does not exist on type 'never'.
      const quotation = quotations.find((q) => q._id === watchedQuotationId);
      // @ts-expect-error TS(2345): Argument of type 'undefined' is not assignable to ... Remove this comment to see the full error message
      setSelectedQuotation(quotation);
    } else {
      setSelectedQuotation(null);
    }
  }, [watchedQuotationId, quotations]);

  const onSubmit = async (data: any) => {
    try {
      const poData = {
        quotationId: watchedQuotationId,
        leadId: watchedLeadId,
        remarks: data.remarks || '',
      };

      // @ts-expect-error TS(2345): Argument of type '{ quotationId: string; leadId: s... Remove this comment to see the full error message
      const result = await createPO('http://localhost:5000/api/pos', poData);

      if (result.success) {
        setPoNumber(result.data.poNumber);
        setShowConfirmation(true);
        reset();
        setSelectedQuotation(null);
      } else {
        // Handle API-level errors
        alert(result.message || 'Failed to create PO. Please try again.');
      }
    } catch (error) {
      // Error already handled by useApi hook with toast notification
      // Additional user feedback if needed
      console.error('PO creation failed:', error);
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setPoNumber(null);
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Generate Purchase Order
      </h2>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Lead Selection */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <label
            htmlFor="leadId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Lead *
          </label>
          {leadsError ? (
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <p className="text-sm text-red-500 mb-2">
                // @ts-expect-error TS(2339): Property 'message' does not exist
                on type 'never'. Failed to load leads:{' '}
                {leadsError?.message || 'Unknown error'}
              </p>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm text-red-700 underline hover:text-red-900"
              >
                Retry
              </button>
            </div>
          ) : (
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <select
              id="leadId"
              {...register('leadId')}
              disabled={isLoadingLeads}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.leadId ? 'border-red-500' : 'border-gray-300'
              } ${isLoadingLeads ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <option value="">
                {isLoadingLeads ? 'Loading leads...' : 'Select a lead'}
              </option>
              {leads.map((lead) => (
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <option key={lead._id} value={lead._id}>
                  // @ts-expect-error TS(2339): Property 'name' does not exist
                  on type 'never'.
                  {lead.name} - {lead.phone} ({lead.product})
                </option>
              ))}
            </select>
          )}
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          {errors.leadId && <FormError error={errors.leadId} />}
        </div>
        {/* Quotation Selection */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <label
            htmlFor="quotationId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Quotation *
          </label>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <select
            id="quotationId"
            {...register('quotationId')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.quotationId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={!watchedLeadId}
          >
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <option value="">
              {watchedLeadId
                ? 'Select a quotation'
                : 'Please select a lead first'}
            </option>
            {quotations.map((quotation) => (
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <option key={quotation._id} value={quotation._id}>
                // @ts-expect-error TS(2339): Property 'quotationNumber' does
                not exist on type ... Remove this comment to see the full error
                message
                {quotation.quotationNumber} - // @ts-expect-error TS(2339):
                Property 'totalAmount' does not exist on type 'nev... Remove
                this comment to see the full error message
                {formatCurrency(quotation.totalAmount)}( // @ts-expect-error
                TS(2339): Property 'createdAt' does not exist on type 'never...
                Remove this comment to see the full error message
                {quotation.createdAt
                  ? // @ts-expect-error TS(2339): Property 'createdAt' does not exist on type 'never... Remove this comment to see the full error message
                    new Date(quotation.createdAt).toLocaleDateString()
                  : 'N/A'}
                )
              </option>
            ))}
          </select>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          {errors.quotationId && <FormError error={errors.quotationId} />}
        </div>
        {/* PO Date */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <label
            htmlFor="poDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            PO Date *
          </label>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <input
            type="date"
            id="poDate"
            {...register('poDate')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.poDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          {errors.poDate && <FormError error={errors.poDate} />}
        </div>
        {/* Remarks */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <label
            htmlFor="remarks"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Remarks
          </label>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <textarea
            id="remarks"
            rows={3}
            {...register('remarks')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter any additional remarks for this PO..."
          />
        </div>
        {/* Selected Quotation Summary */}
        {selectedQuotation && (
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div className="bg-gray-50 p-4 rounded-lg">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Quotation Summary
            </h3>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p className="text-sm text-gray-600">Quotation Number</p>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p className="font-medium">
                  // @ts-expect-error TS(2339): Property 'quotationNumber' does
                  not exist on type ... Remove this comment to see the full
                  error message
                  {selectedQuotation.quotationNumber}
                </p>
              </div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p className="text-sm text-gray-600">Total Amount</p>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p className="font-medium text-green-600">
                  // @ts-expect-error TS(2339): Property 'totalAmount' does not
                  exist on type 'nev... Remove this comment to see the full
                  error message
                  {formatCurrency(selectedQuotation.totalAmount)}
                </p>
              </div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p className="text-sm text-gray-600">Valid Until</p>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p className="font-medium">
                  // @ts-expect-error TS(2339): Property 'formattedValidUntil'
                  does not exist on t... Remove this comment to see the full
                  error message
                  {selectedQuotation.formattedValidUntil}
                </p>
              </div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p className="text-sm text-gray-600">Status</p>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    // @ts-expect-error TS(2339): Property 'status' does not exist on type 'never'.
                    selectedQuotation.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : // @ts-expect-error TS(2339): Property 'status' does not exist on type 'never'.
                        selectedQuotation.status === 'sent'
                        ? 'bg-blue-100 text-blue-800'
                        : // @ts-expect-error TS(2339): Property 'status' does not exist on type 'never'.
                          selectedQuotation.status === 'draft'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                  }`}
                >
                  // @ts-expect-error TS(2339): Property 'status' does not exist
                  on type 'never'.
                  {selectedQuotation.status.toUpperCase()}
                </span>
              </div>
            </div>
            {/* Items Table */}
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <div className="overflow-x-auto">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <table className="min-w-full divide-y divide-gray-200">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <thead className="bg-gray-100">
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <tr>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Size
                    </th>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Thickness
                    </th>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Rate
                    </th>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <tbody className="bg-white divide-y divide-gray-200">
                  // @ts-expect-error TS(2339): Property 'items' does not exist
                  on type 'never'.
                  {selectedQuotation.items?.map((item: any, index: any) => (
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <tr key={index} className="hover:bg-gray-50">
                      // @ts-expect-error TS(17004): Cannot use JSX unless the
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {item.type}
                      </td>
                      // @ts-expect-error TS(17004): Cannot use JSX unless the
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {item.size}
                      </td>
                      // @ts-expect-error TS(17004): Cannot use JSX unless the
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {item.thickness}mm
                      </td>
                      // @ts-expect-error TS(17004): Cannot use JSX unless the
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {item.quantity} tons
                      </td>
                      // @ts-expect-error TS(17004): Cannot use JSX unless the
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {formatCurrency(item.rate)}
                      </td>
                      // @ts-expect-error TS(17004): Cannot use JSX unless the
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Submit Button */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="flex justify-end space-x-4">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            Reset Form
          </button>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <button
            type="submit"
            disabled={isCreatingPO || isSubmitting || !selectedQuotation}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingPO ? 'Generating PO...' : 'Generate Purchase Order'}
          </button>
        </div>
      </form>
      {/* Confirmation Modal */}
      {showConfirmation && poNumber && (
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <div className="mt-3 text-center">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Purchase Order Generated Successfully!
              </h3>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <div className="mt-4">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p className="text-sm text-gray-600 mb-2">Your PO number is:</p>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p className="text-xl font-bold text-blue-600 mb-4">
                  {poNumber}
                </p>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p className="text-sm text-gray-600">
                  The PO has been created and linked to quotation //
                  @ts-expect-error TS(2339): Property 'quotationNumber' does not
                  exist on type ... Remove this comment to see the full error
                  message
                  {selectedQuotation?.quotationNumber}.
                </p>
              </div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <div className="mt-6">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <button
                  onClick={closeConfirmation}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POGenerator;
