import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation schema
const schema = yup.object({
  customerName: yup.string().required('Customer name is required'),
  phone: yup.string().required('Phone number is required'),
  productInterest: yup.string().required('Please select a product interest'),
  leadSource: yup.string().required('Please select a lead source'),
  notes: yup.string().optional(),
}).required();

const LeadCreationForm = () => {
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
      const response = await fetch('http://localhost:5000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || 'Lead created successfully!');
        reset();
      } else {
        throw new Error(result.message || 'Failed to create lead');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      alert(error.message || 'Failed to create lead. Please try again.');
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
            <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
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
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
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
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home-garden">Home & Garden</option>
            <option value="sports">Sports & Outdoors</option>
            <option value="books">Books & Media</option>
            <option value="automotive">Automotive</option>
            <option value="health-beauty">Health & Beauty</option>
            <option value="toys-games">Toys & Games</option>
          </select>
          {errors.productInterest && (
            <p className="mt-1 text-sm text-red-600">{errors.productInterest.message}</p>
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
            <option value="website">Website</option>
            <option value="social-media">Social Media</option>
            <option value="referral">Referral</option>
            <option value="cold-call">Cold Call</option>
            <option value="email-campaign">Email Campaign</option>
            <option value="trade-show">Trade Show</option>
            <option value="advertising">Advertising</option>
            <option value="other">Other</option>
          </select>
          {errors.leadSource && (
            <p className="mt-1 text-sm text-red-600">{errors.leadSource.message}</p>
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
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Lead...' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadCreationForm; 