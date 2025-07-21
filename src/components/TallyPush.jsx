import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const TallyPush = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/tally/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          do2Id: data.do2Id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setResult(result);
      } else {
        setError(result.message || 'Failed to push to Tally');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Tally Integration
      </h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Push DO2 to Tally
        </h3>
        <p className="text-gray-600 mb-4">
          Enter a DO2 ID to push the executed dispatch order data to Tally ERP
          system. The system will generate XML and JSON payloads formatted for
          Tally integration.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="mb-6">
          <label
            htmlFor="do2Id"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            DO2 ID
          </label>
          <input
            type="text"
            id="do2Id"
            {...register('do2Id', {
              required: 'DO2 ID is required',
              pattern: {
                value: /^[0-9a-fA-F]{24}$/,
                message: 'Please enter a valid MongoDB ObjectId',
              },
            })}
            placeholder="Enter DO2 ObjectId (24 characters)"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.do2Id && (
            <p className="mt-1 text-sm text-red-600">{errors.do2Id.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              Pushing to Tally...
            </div>
          ) : (
            'Push to Tally'
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

      {result && (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                <div className="mt-2 text-sm text-green-700">
                  {result.message}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Push Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">DO2 Number</p>
                <p className="text-lg font-semibold text-gray-900">
                  {result.data.do2Number}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Customer</p>
                <p className="text-lg font-semibold text-gray-900">
                  {result.data.customerName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-lg font-semibold text-gray-900">
                  {result.data.totalItems}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Subtotal</p>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{result.data.subtotal}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tax</p>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{result.data.totalTax}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Grand Total</p>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{result.data.grandTotal}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Generated Payloads
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  XML Format
                </h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-xs">
                  <pre>{result.data.formats.xml}</pre>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  JSON Format
                </h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-xs">
                  <pre>{JSON.stringify(result.data.formats.json, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How it works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Enter a valid DO2 ID (must be executed status)</li>
          <li>• System fetches DO2 data with customer and item details</li>
          <li>• Calculates GST (12% - 6% CGST + 6% SGST for steel tubes)</li>
          <li>• Generates Tally-compatible XML and JSON payloads</li>
          <li>
            • Includes HSN codes, product names, quantities, rates, and taxes
          </li>
          <li>• Mock push logs the payloads to console for testing</li>
        </ul>
      </div>
    </div>
  );
};

export default TallyPush;
