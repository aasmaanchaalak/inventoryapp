import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useApi } from '../hooks/useApi';
import { STEEL_TUBE_CATEGORIES } from '../config/productCategories';
import { FormError } from './common';

// Validation schema
const schema = yup
  .object({
    productType: yup
      .string()
      .required('Product type is required')
      .oneOf(
        STEEL_TUBE_CATEGORIES.map((cat) => cat.value),
        'Please select a valid product type'
      ),
    size: yup
      .string()
      .required('Size is required')
      .max(50, 'Size cannot be more than 50 characters'),
    thickness: yup
      .number()
      .typeError('Thickness is required')
      .required('Thickness is required')
      .min(0.1, 'Thickness must be at least 0.1mm')
      .max(50, 'Thickness cannot exceed 50mm'),
    availableQty: yup
      .number()
      .typeError('Available quantity is required')
      .required('Available quantity is required')
      .min(0.1, 'Quantity must be at least 0.1 tons')
      .max(10000, 'Quantity cannot exceed 10,000 tons'),
    rate: yup
      .number()
      .typeError('Rate must be a valid number')
      .min(1, 'Rate must be at least ₹1')
      .max(1000000, 'Rate cannot exceed ₹10,00,000'),
    hsnCode: yup.string().max(8, 'HSN code cannot be more than 8 characters'),
    minStockLevel: yup
      .number()
      .typeError('Minimum stock level must be a valid number')
      .min(0, 'Minimum stock level cannot be negative'),
    maxStockLevel: yup
      .number()
      .typeError('Maximum stock level must be a valid number')
      .min(0, 'Maximum stock level cannot be negative'),
    warehouseName: yup
      .string()
      .max(100, 'Warehouse name cannot be more than 100 characters'),
    warehouseSection: yup
      .string()
      .max(100, 'Warehouse section cannot be more than 100 characters'),
    supplierName: yup
      .string()
      .max(100, 'Supplier name cannot be more than 100 characters'),
    supplierContact: yup
      .string()
      .max(20, 'Supplier contact cannot be more than 20 characters'),
  })
  .required();

const InventoryAddForm = () => {
  const { post: createInventoryItem, isLoading: isCreating } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      rate: 45000,
      hsnCode: '7306',
      minStockLevel: 0,
      maxStockLevel: 10000,
      warehouseName: 'Main Warehouse',
      warehouseSection: 'Steel Tubes',
      supplierName: 'Steel Tube Industries Ltd.',
      supplierContact: '+91-9876543210',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      // Transform data to match API structure
      const inventoryData = {
        productType: data.productType,
        size: data.size,
        thickness: data.thickness,
        availableQty: data.availableQty,
        rate: data.rate || 45000,
        hsnCode: data.hsnCode || '7306',
        minStockLevel: data.minStockLevel || 0,
        maxStockLevel: data.maxStockLevel || 10000,
        location: {
          warehouse: data.warehouseName || 'Main Warehouse',
          section: data.warehouseSection || 'Steel Tubes',
        },
        supplier: {
          name: data.supplierName || 'Steel Tube Industries Ltd.',
          contact: data.supplierContact || '+91-9876543210',
        },
      };

      const result = await createInventoryItem(
        'http://localhost:5000/api/inventory',
        // @ts-expect-error TS(2345): Argument of type '{ productType: any; size: any; t... Remove this comment to see the full error message
        inventoryData
      );

      if (result.success) {
        alert(result.message || 'Inventory item created successfully!');
        reset();
      } else {
        alert(
          result.message || 'Failed to create inventory item. Please try again.'
        );
      }
    } catch (error) {
      console.error('Inventory creation failed:', error);
    }
  };

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Add New Inventory Item
      </h2>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Type */}
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <label
              htmlFor="productType"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Product Type *
            </label>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <select
              id="productType"
              {...register('productType')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.productType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <option value="">Select a product type</option>
              {STEEL_TUBE_CATEGORIES.map((category) => (
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            {errors.productType && <FormError error={errors.productType} />}
          </div>
          {/* Size */}
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <label
              htmlFor="size"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Size *
            </label>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <input
              type="text"
              id="size"
              {...register('size')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.size ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 40x40, 25x50, 32"
            />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            {errors.size && <FormError error={errors.size} />}
          </div>
          {/* Thickness */}
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <label
              htmlFor="thickness"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Thickness (mm) *
            </label>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <input
              type="number"
              step="0.1"
              id="thickness"
              {...register('thickness')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.thickness ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 2.5"
            />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            {errors.thickness && <FormError error={errors.thickness} />}
          </div>
          {/* Available Quantity */}
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <label
              htmlFor="availableQty"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Available Quantity (tons) *
            </label>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <input
              type="number"
              step="0.1"
              id="availableQty"
              {...register('availableQty')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.availableQty ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 150.5"
            />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            {errors.availableQty && <FormError error={errors.availableQty} />}
          </div>
          {/* Rate */}
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <label
              htmlFor="rate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Rate (₹ per ton)
            </label>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <input
              type="number"
              id="rate"
              {...register('rate')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.rate ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="45000"
            />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            {errors.rate && <FormError error={errors.rate} />}
          </div>
          {/* HSN Code */}
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <label
              htmlFor="hsnCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              HSN Code
            </label>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <input
              type="text"
              id="hsnCode"
              {...register('hsnCode')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.hsnCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="7306"
            />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            {errors.hsnCode && <FormError error={errors.hsnCode} />}
          </div>
          {/* Min Stock Level */}
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <label
              htmlFor="minStockLevel"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Minimum Stock Level (tons)
            </label>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <input
              type="number"
              step="0.1"
              id="minStockLevel"
              {...register('minStockLevel')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.minStockLevel ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="10"
            />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            {errors.minStockLevel && <FormError error={errors.minStockLevel} />}
          </div>
          {/* Max Stock Level */}
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <label
              htmlFor="maxStockLevel"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Maximum Stock Level (tons)
            </label>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <input
              type="number"
              step="0.1"
              id="maxStockLevel"
              {...register('maxStockLevel')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.maxStockLevel ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="10000"
            />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            {errors.maxStockLevel && <FormError error={errors.maxStockLevel} />}
          </div>
        </div>
        {/* Location Section */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="border-t pt-6">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Location Information
          </h3>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Warehouse Name */}
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <label
                htmlFor="warehouseName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Warehouse Name
              </label>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <input
                type="text"
                id="warehouseName"
                {...register('warehouseName')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.warehouseName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Main Warehouse"
              />
              {errors.warehouseName && (
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <FormError error={errors.warehouseName} />
              )}
            </div>
            {/* Warehouse Section */}
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <label
                htmlFor="warehouseSection"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Warehouse Section
              </label>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <input
                type="text"
                id="warehouseSection"
                {...register('warehouseSection')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.warehouseSection ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Steel Tubes"
              />
              {errors.warehouseSection && (
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <FormError error={errors.warehouseSection} />
              )}
            </div>
          </div>
        </div>
        {/* Supplier Section */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="border-t pt-6">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Supplier Information
          </h3>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supplier Name */}
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <label
                htmlFor="supplierName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Supplier Name
              </label>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <input
                type="text"
                id="supplierName"
                {...register('supplierName')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.supplierName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Steel Tube Industries Ltd."
              />
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              {errors.supplierName && <FormError error={errors.supplierName} />}
            </div>
            {/* Supplier Contact */}
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <label
                htmlFor="supplierContact"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Supplier Contact
              </label>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <input
                type="text"
                id="supplierContact"
                {...register('supplierContact')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.supplierContact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+91-9876543210"
              />
              {errors.supplierContact && (
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <FormError error={errors.supplierContact} />
              )}
            </div>
          </div>
        </div>
        {/* Submit Buttons */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="flex justify-end space-x-4 pt-6 border-t">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            Reset
          </button>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <button
            type="submit"
            disabled={isCreating || isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Adding Item...' : 'Add Inventory Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryAddForm;
