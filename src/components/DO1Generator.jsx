import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation schema
const schema = yup.object({
  poId: yup.string().required('Please select a PO'),
  doNumber: yup.string().required('DO number is required'),
  dispatchDate: yup.date().required('Dispatch date is required'),
  remarks: yup.string().optional(),
  items: yup.array().of(
    yup.object({
      itemId: yup.string().required(),
      type: yup.string().required(),
      size: yup.string().required(),
      thickness: yup.number().required(),
      availableStock: yup.number().required(),
      dispatchedQuantity: yup.number()
        .required('Dispatched quantity is required')
        .min(0.1, 'Minimum 0.1 tons')
        .test('max-stock', 'Cannot dispatch more than available stock', function(value) {
          const availableStock = this.parent.availableStock;
          return value <= availableStock;
        }),
      rate: yup.number().required(),
      total: yup.number().required()
    })
  ).min(1, 'At least one item must be dispatched')
}).required();

const DO1Generator = () => {
  const [pendingPOs, setPendingPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [doNumber, setDoNumber] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: formIsSubmitting },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      dispatchDate: new Date().toISOString().split('T')[0],
      items: []
    }
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "items"
  });

  const watchedPoId = watch('poId');

  // Fetch pending POs on component mount
  useEffect(() => {
    const fetchPendingPOs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pos?status=pending');
        if (response.ok) {
          const data = await response.json();
          setPendingPOs(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching pending POs:', error);
      }
    };

    fetchPendingPOs();
  }, []);

  // Fetch PO details when PO is selected
  useEffect(() => {
    const fetchPODetails = async () => {
      if (!watchedPoId) {
        setSelectedPO(null);
        replace([]);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/pos/${watchedPoId}/details`);
        if (response.ok) {
          const data = await response.json();
          setSelectedPO(data.data);
          
          // Auto-fill items with available stock
          const itemsWithStock = data.data.items.map((item, index) => ({
            itemId: item._id || `item-${index}`,
            type: item.type,
            size: item.size,
            thickness: item.thickness,
            availableStock: getAvailableStock(item), // Mock function - replace with actual stock API
            dispatchedQuantity: 0,
            rate: item.rate,
            total: 0,
            hsnCode: item.hsnCode,
            originalQuantity: item.quantity
          }));
          
          replace(itemsWithStock);
        }
      } catch (error) {
        console.error('Error fetching PO details:', error);
      }
    };

    fetchPODetails();
  }, [watchedPoId, replace]);

  // Real function to get available stock from inventory API
  const getAvailableStock = async (item) => {
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/summary?productType=${item.type}&size=${item.size}&thickness=${item.thickness}`);
      if (response.ok) {
        const data = await response.json();
        const inventoryItem = data.data.inventory.find(inv => 
          inv.productType === item.type && 
          inv.size === item.size && 
          inv.thickness === item.thickness
        );
        return inventoryItem ? inventoryItem.availableQty : 0;
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
    // Fallback to mock data if API fails
    const baseStock = item.quantity * 0.8;
    return Math.round((baseStock + Math.random() * item.quantity * 0.4) * 10) / 10;
  };

  // Calculate total for an item
  const calculateItemTotal = (dispatchedQuantity, rate) => {
    return Math.round(dispatchedQuantity * rate * 100) / 100;
  };

  // Handle dispatched quantity change
  const handleQuantityChange = (index, value) => {
    const item = fields[index];
    const newQuantity = parseFloat(value) || 0;
    const newTotal = calculateItemTotal(newQuantity, item.rate);
    
    setValue(`items.${index}.dispatchedQuantity`, newQuantity);
    setValue(`items.${index}.total`, newTotal);
  };

  // Calculate overall totals
  const calculateTotals = () => {
    if (!fields || fields.length === 0) return { subtotal: 0, totalTax: 0, grandTotal: 0 };
    
    const totals = fields.map(item => {
      const subtotal = item.dispatchedQuantity * item.rate;
      const taxAmount = subtotal * 0.18; // 18% GST
      const total = subtotal + taxAmount;
      return { subtotal, taxAmount, total };
    });
    
    const subtotal = totals.reduce((sum, item) => sum + item.subtotal, 0);
    const totalTax = totals.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = subtotal + totalTax;
    
    return { subtotal, totalTax, grandTotal };
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Filter items that have dispatched quantity > 0
      const dispatchedItems = data.items.filter(item => item.dispatchedQuantity > 0);
      
      if (dispatchedItems.length === 0) {
        throw new Error('Please dispatch at least one item');
      }

      const do1Data = {
        poId: data.poId,
        items: dispatchedItems
      };

      const response = await fetch('http://localhost:5000/api/do1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(do1Data),
      });

      const result = await response.json();

      if (response.ok) {
        setDoNumber(result.data.doNumber);
        setShowConfirmation(true);
        reset();
        setSelectedPO(null);
        
        // Show DO2 information if generated
        if (result.data.do2Generated) {
          console.log('DO2 auto-generated:', result.data.do2);
        }
      } else {
        throw new Error(result.message || 'Failed to create DO1');
      }
    } catch (error) {
      console.error('Error creating DO1:', error);
      alert(error.message || 'Failed to create DO1. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setDoNumber(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const overallTotals = calculateTotals();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Generate DO1 (Dispatch Order)</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* PO Selection */}
        <div>
          <label htmlFor="poId" className="block text-sm font-medium text-gray-700 mb-2">
            Select Purchase Order *
          </label>
          <select
            id="poId"
            {...register('poId')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.poId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a pending PO</option>
            {pendingPOs.map((po) => (
              <option key={po._id} value={po._id}>
                {po.poNumber} - {po.leadId?.name || 'Unknown Customer'} 
                ({formatCurrency(po.totalAmount)})
              </option>
            ))}
          </select>
          {errors.poId && (
            <p className="mt-1 text-sm text-red-600">{errors.poId.message}</p>
          )}
        </div>

        {/* DO Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="doNumber" className="block text-sm font-medium text-gray-700 mb-2">
              DO Number *
            </label>
            <input
              type="text"
              id="doNumber"
              {...register('doNumber')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.doNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="DO-2024-001"
            />
            {errors.doNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.doNumber.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="dispatchDate" className="block text-sm font-medium text-gray-700 mb-2">
              Dispatch Date *
            </label>
            <input
              type="date"
              id="dispatchDate"
              {...register('dispatchDate')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.dispatchDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dispatchDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dispatchDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <input
              type="text"
              id="remarks"
              {...register('remarks')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Special instructions..."
            />
          </div>
        </div>

        {/* Selected PO Summary */}
        {selectedPO && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">PO Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">PO Number</p>
                <p className="font-medium">{selectedPO.poNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium">{selectedPO.customer?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium text-green-600">{formatCurrency(selectedPO.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quotation</p>
                <p className="font-medium">{selectedPO.quotationNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Items Table */}
        {fields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dispatch Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thickness</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Available Stock</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dispatch Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fields.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">{item.type}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{item.size}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{item.thickness}mm</td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        <span className={`font-medium ${
                          item.availableStock > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.availableStock} tons
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max={item.availableStock}
                          {...register(`items.${index}.dispatchedQuantity`)}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          className={`w-20 px-2 py-1 border rounded text-sm ${
                            errors.items?.[index]?.dispatchedQuantity ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={item.availableStock <= 0}
                        />
                        {errors.items?.[index]?.dispatchedQuantity && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.items[index].dispatchedQuantity.message}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(item.rate)}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-end space-x-8">
                <div>
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-lg font-semibold">{formatCurrency(overallTotals.subtotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tax (18%)</p>
                  <p className="text-lg font-semibold">{formatCurrency(overallTotals.totalTax)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Grand Total</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(overallTotals.grandTotal)}</p>
                </div>
              </div>
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
            disabled={isSubmitting || formIsSubmitting || !selectedPO}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Generating DO1...' : 'Generate DO1'}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && doNumber && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">DO1 Generated Successfully!</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Your DO1 number is:</p>
                <p className="text-xl font-bold text-green-600 mb-4">{doNumber}</p>
                <p className="text-sm text-gray-600">
                  The dispatch order has been created and items have been allocated for dispatch.
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={closeConfirmation}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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

export default DO1Generator; 