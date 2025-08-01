import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation schema
const schema = yup.object({
  leadId: yup.string().required('Please select a lead'),
  quotationId: yup.string().required('Please select a quotation'),
  poDate: yup.date().required('PO date is required'),
  remarks: yup.string().optional(),
}).required();

const POGenerator = () => {
  const [leads, setLeads] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [poNumber, setPoNumber] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      poDate: new Date().toISOString().split('T')[0] // Default to today
    }
  });

  const watchedLeadId = watch('leadId');
  const watchedQuotationId = watch('quotationId');

  // Fetch leads on component mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/leads');
        if (response.ok) {
          const data = await response.json();
          setLeads(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
      }
    };

    fetchLeads();
  }, []);

  // Fetch quotations when lead is selected
  useEffect(() => {
    const fetchQuotations = async () => {
      if (!watchedLeadId) {
        setQuotations([]);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/quotations?leadId=${watchedLeadId}`);
        if (response.ok) {
          const data = await response.json();
          setQuotations(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching quotations:', error);
      }
    };

    fetchQuotations();
  }, [watchedLeadId]);

  // Update selected quotation when quotation is selected
  useEffect(() => {
    if (watchedQuotationId) {
      const quotation = quotations.find(q => q._id === watchedQuotationId);
      setSelectedQuotation(quotation);
    } else {
      setSelectedQuotation(null);
    }
  }, [watchedQuotationId, quotations]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const poData = {
        quotationId: watchedQuotationId,
        leadId: watchedLeadId,
        remarks: data.remarks || ''
      };

      const response = await fetch('http://localhost:5000/api/pos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(poData),
      });

      const result = await response.json();

      if (response.ok) {
        setPoNumber(result.data.poNumber);
        setShowConfirmation(true);
        reset();
        setSelectedQuotation(null);
      } else {
        throw new Error(result.message || 'Failed to create PO');
      }
    } catch (error) {
      console.error('Error creating PO:', error);
      alert(error.message || 'Failed to create PO. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setPoNumber(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Generate Purchase Order</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Lead Selection */}
        <div>
          <label htmlFor="leadId" className="block text-sm font-medium text-gray-700 mb-2">
            Select Lead *
          </label>
          <select
            id="leadId"
            {...register('leadId')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.leadId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a lead</option>
            {leads.map((lead) => (
              <option key={lead._id} value={lead._id}>
                {lead.name} - {lead.phone} ({lead.product})
              </option>
            ))}
          </select>
          {errors.leadId && (
            <p className="mt-1 text-sm text-red-600">{errors.leadId.message}</p>
          )}
        </div>

        {/* Quotation Selection */}
        <div>
          <label htmlFor="quotationId" className="block text-sm font-medium text-gray-700 mb-2">
            Select Quotation *
          </label>
          <select
            id="quotationId"
            {...register('quotationId')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.quotationId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={!watchedLeadId}
          >
            <option value="">
              {watchedLeadId ? 'Select a quotation' : 'Please select a lead first'}
            </option>
            {quotations.map((quotation) => (
              <option key={quotation._id} value={quotation._id}>
                {quotation.quotationNumber} - {formatCurrency(quotation.totalAmount)} 
                ({quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : 'N/A'})
              </option>
            ))}
          </select>
          {errors.quotationId && (
            <p className="mt-1 text-sm text-red-600">{errors.quotationId.message}</p>
          )}
        </div>

        {/* PO Date */}
        <div>
          <label htmlFor="poDate" className="block text-sm font-medium text-gray-700 mb-2">
            PO Date *
          </label>
          <input
            type="date"
            id="poDate"
            {...register('poDate')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.poDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.poDate && (
            <p className="mt-1 text-sm text-red-600">{errors.poDate.message}</p>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quotation Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Quotation Number</p>
                <p className="font-medium">{selectedQuotation.quotationNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium text-green-600">{formatCurrency(selectedQuotation.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valid Until</p>
                <p className="font-medium">{selectedQuotation.formattedValidUntil}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedQuotation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  selectedQuotation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  selectedQuotation.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedQuotation.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thickness</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedQuotation.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">{item.type}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{item.size}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{item.thickness}mm</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{item.quantity} tons</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(item.rate)}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            Reset Form
          </button>
          
          <button
            type="submit"
            disabled={isLoading || isSubmitting || !selectedQuotation}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating PO...' : 'Generate Purchase Order'}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && poNumber && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Purchase Order Generated Successfully!</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Your PO number is:</p>
                <p className="text-xl font-bold text-blue-600 mb-4">{poNumber}</p>
                <p className="text-sm text-gray-600">
                  The PO has been created and linked to quotation {selectedQuotation?.quotationNumber}.
                </p>
              </div>
              <div className="mt-6">
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