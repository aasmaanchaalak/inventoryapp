import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormError } from './common';

const InvoiceGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Open PDF in new window/tab
      const pdfUrl = `http://localhost:5000/api/invoice/${data.do2Id}/pdf`;
      window.open(pdfUrl, '_blank');
    } catch (error) {
      // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      setError('Error generating invoice: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = async (do2Id: any) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/invoice/${do2Id}/pdf`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${do2Id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to download invoice');
      }
    } catch (error) {
      // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      setError('Network error: ' + error.message);
    }
  };

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Invoice Generator
      </h2>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="mb-8">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Generate GST Invoice
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <p className="text-gray-600 mb-4">
          Enter a DO2 ID to generate a GST-compliant invoice PDF. The invoice
          will include buyer information, product details, tax calculations, and
          digital signature fields.
        </p>
      </div>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="mb-6">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <label
            htmlFor="do2Id"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            DO2 ID
          </label>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
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
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          {errors.do2Id && <FormError error={errors.do2Id} />}
        </div>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="flex space-x-4">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div className="flex items-center justify-center">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating Invoice...
              </div>
            ) : (
              'View Invoice'
            )}
          </button>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <button
            type="button"
            onClick={() => {
              // @ts-expect-error TS(2531): Object is possibly 'null'.
              const do2Id = document.getElementById('do2Id').value;
              if (do2Id) {
                downloadInvoice(do2Id);
              }
            }}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download PDF
          </button>
        </div>
      </form>
      {error && (
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <div className="flex">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <div className="flex-shrink-0">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <div className="ml-3">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="bg-blue-50 p-6 rounded-lg">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Invoice Features
          </h3>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <ul className="space-y-2 text-sm text-blue-800">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>✅ GST-compliant format</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>✅ Buyer information from Lead</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>✅ Product table with HSN codes</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>✅ Tax breakdown (CGST/SGST)</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>✅ Company GSTIN and PAN</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>✅ Digital signature fields</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>✅ Amount in words</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>✅ Terms and conditions</li>
          </ul>
        </div>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="bg-green-50 p-6 rounded-lg">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            Requirements
          </h3>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <ul className="space-y-2 text-sm text-green-800">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>• DO2 must be in executed status</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>• Valid DO2 ObjectId required</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>• Lead data must be available</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>• Product details with HSN codes</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>• Customer GSTIN and PAN</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>• Company information configured</li>
          </ul>
        </div>
      </div>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-sm font-medium text-gray-800 mb-2">
          Invoice Structure
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="text-sm text-gray-700 space-y-1">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <strong>Header:</strong> Company name, address, GSTIN, PAN
          </p>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <strong>Invoice Details:</strong> Invoice number, date, DO2/PO
            references
          </p>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <strong>Buyer Info:</strong> Customer details from Lead data
          </p>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <strong>Product Table:</strong> Description, HSN, Qty, Rate, Amount,
            GST%
          </p>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <strong>Totals:</strong> Subtotal, CGST (9%), SGST (9%), Grand Total
          </p>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <strong>Footer:</strong> Amount in words, terms, signatures
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
