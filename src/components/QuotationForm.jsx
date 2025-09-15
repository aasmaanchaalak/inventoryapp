import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useApi } from '../hooks/useApi';
import { STEEL_TUBE_CATEGORIES } from '../config/productCategories';
import {
  STEEL_TUBE_TAX_RATE,
  getTaxRateForProduct,
  calculateTaxAmount,
  getAllowedTaxRates,
} from '../config/taxRates';
import { FormError } from './common';

// Validation schema
const schema = yup
  .object({
    leadId: yup.string().required('Please select a lead'),
    validity: yup
      .number()
      .typeError('Quotation validity is required')
      .required('Quotation validity is required')
      .min(1, 'Validity must be at least 1 day')
      .max(365, 'Validity cannot exceed 365 days'),
    deliveryTerms: yup.string().required('Delivery terms are required'),
    items: yup
      .array()
      .of(
        yup.object({
          type: yup
            .string()
            .required('Item type is required')
            .oneOf(
              STEEL_TUBE_CATEGORIES.map((cat) => cat.value),
              'Please select a valid steel tube type'
            ),
          size: yup.string().required('Size is required'),
          thickness: yup
            .number()
            .typeError('Thickness is required')
            .required('Thickness is required')
            .min(0.1, 'Thickness must be at least 0.1mm')
            .max(50, 'Thickness cannot exceed 50mm'),
          quantity: yup
            .number()
            .typeError('Quantity is required')
            .required('Quantity is required')
            .min(0.1, 'Quantity must be at least 0.1 tons')
            .max(10000, 'Quantity cannot exceed 10,000 tons'),
          rate: yup
            .number()
            .typeError('Rate is required')
            .required('Rate is required')
            .min(1, 'Rate must be at least ₹1')
            .max(1000000, 'Rate cannot exceed ₹10,00,000'),
          tax: yup
            .number()
            .typeError('Tax percentage is required')
            .required('Tax percentage is required')
            .min(0, 'Tax percentage cannot be negative')
            .max(100, 'Tax percentage cannot exceed 100%')
            .oneOf(
              getAllowedTaxRates(),
              'Please use a valid GST rate (0%, 5%, 12%, 18%, or 28%)'
            ),
        })
      )
      .min(1, 'At least one item is required'),
  })
  .required();

const QuotationForm = () => {
  const [leads, setLeads] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // API hooks for different operations
  const {
    get: fetchLeadsData,
    isLoading: isLoadingLeads,
    isError: isLeadsError,
    error: leadsError,
  } = useApi();

  const { post: createQuotation, isLoading: isCreatingQuotation } = useApi();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      items: [
        {
          type: '',
          size: '',
          thickness: '',
          quantity: '',
          rate: '',
          tax: STEEL_TUBE_TAX_RATE,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch form values for calculations
  const watchedItems = watch('items');

  // Fetch leads on component mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await fetchLeadsData('http://localhost:5001/api/leads');
        if (data.success) {
          const allLeads = data.data || [];

          // Deduplicate leads based on name and normalized phone number
          const uniqueLeads = allLeads.filter((lead, index, self) => {
            // Normalize phone number by removing all non-digits
            const normalizePhone = (phone) => phone.replace(/\D/g, '');
            const currentPhone = normalizePhone(lead.phone);
            const currentName = lead.name.toLowerCase().trim();

            // Find the first occurrence of this name+phone combination
            return (
              index ===
              self.findIndex(
                (l) =>
                  l.name.toLowerCase().trim() === currentName &&
                  normalizePhone(l.phone) === currentPhone
              )
            );
          });

          setLeads(uniqueLeads);
        }
      } catch (error) {
        // Error already handled by useApi hook
        setLeads([]);
      }
    };

    fetchLeads();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate totals for each row and overall
  const calculateRowTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const taxRate = parseFloat(item.tax) || getTaxRateForProduct(item.type);

    const subtotal = quantity * rate;
    const calculation = calculateTaxAmount(subtotal, taxRate, item.type);

    return {
      subtotal: calculation.subtotal,
      taxAmount: calculation.taxAmount,
      total: calculation.total,
      taxRate: calculation.taxRate,
    };
  };

  const calculateOverallTotal = () => {
    if (!watchedItems) return { subtotal: 0, totalTax: 0, grandTotal: 0 };

    const totals = watchedItems.map((item) => calculateRowTotal(item));
    const subtotal = totals.reduce((sum, item) => sum + item.subtotal, 0);
    const totalTax = totals.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = subtotal + totalTax;

    return { subtotal, totalTax, grandTotal };
  };

  const onSubmit = async (data) => {
    try {
      // Calculate totals for each item
      const itemsWithTotals = data.items.map((item) => {
        const totals = calculateRowTotal(item);
        return {
          ...item,
          ...totals,
        };
      });

      const overallTotals = calculateOverallTotal();

      const quotationData = {
        ...data,
        items: itemsWithTotals,
        totalAmount: overallTotals.grandTotal,
      };

      const result = await createQuotation(
        'http://localhost:5001/api/quotations',
        quotationData
      );

      if (result.success) {
        alert(result.message || 'Quotation created successfully!');
        reset();
      } else {
        // Handle API-level errors
        alert(
          result.message || 'Failed to create quotation. Please try again.'
        );
      }
    } catch (error) {
      // Error already handled by useApi hook with toast notification
      // Additional user feedback if needed
      console.error('Quotation creation failed:', error);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // This would typically call a PDF generation service
      // For now, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('PDF generation feature will be implemented here');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const addProductRow = () => {
    append({
      type: '',
      size: '',
      thickness: '',
      quantity: '',
      rate: '',
      tax: STEEL_TUBE_TAX_RATE,
    });
  };

  const removeProductRow = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const overallTotals = calculateOverallTotal();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Create Quotation
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Lead Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="leadId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Lead *
            </label>
            {isLeadsError ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-500 mb-2">
                  Failed to load leads: {leadsError?.message || 'Unknown error'}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-sm text-red-700 underline hover:text-red-900"
                >
                  Retry
                </button>
              </div>
            ) : (
              <select
                id="leadId"
                {...register('leadId')}
                disabled={isLoadingLeads}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.leadId ? 'border-red-500' : 'border-gray-300'
                } ${isLoadingLeads ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {isLoadingLeads ? 'Loading leads...' : 'Select a lead'}
                </option>
                {leads.map((lead) => (
                  <option key={lead._id} value={lead._id}>
                    {lead.name} - {lead.phone} ({lead.product})
                  </option>
                ))}
              </select>
            )}
            {errors.leadId && <FormError error={errors.leadId} />}
          </div>

          <div>
            <label
              htmlFor="validity"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Quotation Validity (Days) *
            </label>
            <input
              type="number"
              id="validity"
              {...register('validity')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.validity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="30"
              min="1"
              max="365"
            />
            {errors.validity && <FormError error={errors.validity} />}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Items</h3>
            <button
              type="button"
              onClick={addProductRow}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              + Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type *
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size *
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thickness (mm) *
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity (tons) *
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate (₹) *
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax % *
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal (₹)
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax (₹)
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total (₹)
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fields.map((field, index) => {
                  const item = watchedItems?.[index] || {};
                  const totals = calculateRowTotal(item);

                  return (
                    <tr key={field.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <select
                          {...register(`items.${index}.type`)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.items?.[index]?.type
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select type</option>
                          {STEEL_TUBE_CATEGORIES.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          {...register(`items.${index}.size`)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.items?.[index]?.size
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          placeholder="100x100mm"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          {...register(`items.${index}.thickness`)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.items?.[index]?.thickness
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          placeholder="2.0"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          {...register(`items.${index}.quantity`)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.items?.[index]?.quantity
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          placeholder="10.0"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.rate`)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.items?.[index]?.rate
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          placeholder="50000"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.tax`)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.items?.[index]?.tax
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          placeholder="12"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{totals.subtotal.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{totals.taxAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₹{totals.total.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProductRow(index)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {errors.items && <FormError error={errors.items} />}
        </div>

        {/* Totals Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Quotation Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="text-xl font-semibold text-gray-900">
                ₹{overallTotals.subtotal.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Tax</p>
              <p className="text-xl font-semibold text-gray-900">
                ₹{overallTotals.totalTax.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Grand Total</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{overallTotals.grandTotal.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Terms */}
        <div>
          <label
            htmlFor="deliveryTerms"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Delivery Terms *
          </label>
          <textarea
            id="deliveryTerms"
            rows={4}
            {...register('deliveryTerms')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.deliveryTerms ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter delivery terms and conditions..."
          />
          {errors.deliveryTerms && <FormError error={errors.deliveryTerms} />}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            Reset Form
          </button>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="px-6 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? 'Generating PDF...' : 'Generate Quotation PDF'}
            </button>

            <button
              type="submit"
              disabled={isCreatingQuotation || isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingQuotation
                ? 'Creating Quotation...'
                : 'Create Quotation'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;
