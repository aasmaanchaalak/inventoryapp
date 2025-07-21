import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useApi } from '../hooks/useApi';
import { STEEL_TUBE_CATEGORIES } from '../config/productCategories';
import { LEAD_SOURCES } from '../config/leadSources';
import { FormError } from './common';

// Validation schema
const schema = yup.object({
  customerName: yup.string()
    .required('Customer name is required')
    .max(100, 'Customer name cannot be more than 100 characters'),
  phone: yup.string()
    .required('Phone number is required')
    .max(20, 'Phone number cannot be more than 20 characters')
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  email: yup.string()
    .email('Please enter a valid email address')
    .max(100, 'Email cannot be more than 100 characters'),
  address: yup.string()
    .max(500, 'Address cannot be more than 500 characters'),
  gstin: yup.string()
    .max(15, 'GSTIN cannot be more than 15 characters'),
  pan: yup.string()
    .max(10, 'PAN cannot be more than 10 characters'),
  productInterest: yup.string()
    .required('Please select a product interest')
    .oneOf(
      STEEL_TUBE_CATEGORIES.map(cat => cat.value),
      'Please select a valid steel tube product category'
    ),
  leadSource: yup.string()
    .required('Please select a lead source')
    .oneOf(
      LEAD_SOURCES.map(source => source.value),
      'Please select a valid lead source'
    ),
  notes: yup.string()
    .max(1000, 'Notes cannot be more than 1000 characters'),
}).required();

const LeadCreationForm = () => {
  // API hook for creating leads
  const { 
    post: createLead, 
    isLoading: isCreatingLead
  } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await createLead('http://localhost:5000/api/leads', data);

      if (result.success) {
        alert(result.message || 'Lead created successfully!');
        reset();
      } else {
        // Handle API-level errors
        alert(result.message || 'Failed to create lead. Please try again.');
      }
    } catch (error) {
      // Error already handled by useApi hook with toast notification
      // Additional user feedback if needed
      console.error('Lead creation failed:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Lead</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Name */}
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name *
          </label>
          <input
            type="text"
            id="customerName"
            {...register('customerName')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.customerName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter customer name"
          />
          {errors.customerName && (
            <FormError error={errors.customerName} />
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            {...register('phone')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <FormError error={errors.phone} />
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <FormError error={errors.email} />
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            id="address"
            {...register('address')}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter address"
          />
          {errors.address && (
            <FormError error={errors.address} />
          )}
        </div>

        {/* GSTIN and PAN in same row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 mb-2">
              GSTIN
            </label>
            <input
              type="text"
              id="gstin"
              {...register('gstin')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.gstin ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter GSTIN"
            />
            {errors.gstin && (
              <FormError error={errors.gstin} />
            )}
          </div>

          <div>
            <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-2">
              PAN
            </label>
            <input
              type="text"
              id="pan"
              {...register('pan')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.pan ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter PAN"
            />
            {errors.pan && (
              <FormError error={errors.pan} />
            )}
          </div>
        </div>

        {/* Product Interest */}
        <div>
          <label htmlFor="productInterest" className="block text-sm font-medium text-gray-700 mb-2">
            Product Interest *
          </label>
          <select
            id="productInterest"
            {...register('productInterest')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.productInterest ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a product</option>
            {STEEL_TUBE_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.productInterest && (
            <FormError error={errors.productInterest} />
          )}
        </div>

        {/* Lead Source */}
        <div>
          <label htmlFor="leadSource" className="block text-sm font-medium text-gray-700 mb-2">
            Lead Source *
          </label>
          <select
            id="leadSource"
            {...register('leadSource')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.leadSource ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a lead source</option>
            {LEAD_SOURCES.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
          {errors.leadSource && (
            <FormError error={errors.leadSource} />
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter any additional notes about the lead..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isCreatingLead || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingLead ? 'Creating Lead...' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadCreationForm; 