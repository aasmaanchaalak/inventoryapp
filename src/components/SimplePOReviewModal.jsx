import React, { useState } from 'react';

const SimplePOReviewModal = ({
  quotation,
  isConverting,
  onConvert,
  onClose,
}) => {
  const [remarks, setRemarks] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const handleConvert = () => {
    onConvert(quotation, remarks);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Convert to Purchase Order
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isConverting}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Quotation Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Quotation Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Customer:
                </span>
                <p className="text-sm text-gray-900">
                  {quotation.leadId?.name || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Total Amount:
                </span>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(quotation.totalAmount)}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Items:
                </span>
                <p className="text-sm text-gray-900">
                  {quotation.items?.length || 0} items
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Validity:
                </span>
                <p className="text-sm text-gray-900">
                  {quotation.validity} days
                </p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label
              htmlFor="remarks"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Remarks for Purchase Order (Optional)
            </label>
            <textarea
              id="remarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks or special instructions for this PO..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isConverting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 flex items-center space-x-2"
          >
            {isConverting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>
              {isConverting ? 'Converting...' : 'Convert to Purchase Order'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimplePOReviewModal;
