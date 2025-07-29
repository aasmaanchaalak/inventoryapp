import React, { useState, useEffect } from 'react';
import { STEEL_TUBE_TAX_RATE } from '../config/taxRates';
import { useForm } from 'react-hook-form';

const InvoiceViewer = () => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const watchedDo2Id = watch('do2Id');

  // Fetch invoice data when DO2 ID changes
  useEffect(() => {
    if (watchedDo2Id && watchedDo2Id.length === 24) {
      fetchInvoiceData(watchedDo2Id);
    } else {
      setInvoiceData(null);
    }
  }, [watchedDo2Id]);

  const fetchInvoiceData = async (do2Id: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch DO2 data for invoice summary
      const response = await fetch(`http://localhost:5000/api/do2/${do2Id}`);

      if (response.ok) {
        const data = await response.json();
        setInvoiceData(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch invoice data');
        setInvoiceData(null);
      }
    } catch (error) {
      setError('Network error: ' + error.message);
      setInvoiceData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = async (do2Id: any) => {
    setIsDownloading(true);
    setError(null);

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

        // Add audit trail entry for download
        try {
          await fetch(
            `http://localhost:5000/api/invoices/${do2Id}/audit-entry`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                event: 'downloaded',
                performedBy: 'user',
                notes: 'Invoice PDF downloaded by user',
                metadata: {
                  do2Id: do2Id,
                  downloadMethod: 'browser',
                  userAgent: navigator.userAgent,
                },
              }),
            }
          );
        } catch (auditError) {
          console.error('Failed to add audit entry:', auditError);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to download invoice');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const viewInvoice = async (do2Id: any) => {
    const pdfUrl = `http://localhost:5000/api/invoice/${do2Id}/pdf`;
    window.open(pdfUrl, '_blank');

    // Add audit trail entry for viewing
    try {
      await fetch(`http://localhost:5000/api/invoices/${do2Id}/audit-entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'viewed',
          performedBy: 'user',
          notes: 'Invoice PDF viewed by user',
          metadata: {
            do2Id: do2Id,
            viewMethod: 'browser',
            userAgent: navigator.userAgent,
          },
        }),
      });
    } catch (auditError) {
      console.error('Failed to add audit entry:', auditError);
    }
  };

  // Calculate invoice totals
  const calculateTotals = (items: any) => {
    if (!items || items.length === 0) return null;

    const subtotal = items.reduce(
      (sum: any, item: any) => sum + item.dispatchedQuantity * item.rate,
      0
    );
    const gstRate = STEEL_TUBE_TAX_RATE;
    const totalTax = (subtotal * gstRate) / 100;
    const grandTotal = subtotal + totalTax;

    return {
      subtotal,
      totalTax,
      grandTotal,
      totalItems: items.length,
      totalQuantity: items.reduce(
        (sum: any, item: any) => sum + item.dispatchedQuantity,
        0
      ),
    };
  };

  // Format currency
  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Get status badge color
  const getStatusBadge = (status: any) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      executed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}
      >
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      provided... Remove this comment to see the full error message
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Invoice Viewer</h2>
      provided... Remove this comment to see the full error message
      <div className="mb-8">
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          View Invoice Summary
        </h3>
        provided... Remove this comment to see the full error message
        <p className="text-gray-600 mb-4">
          Enter a DO2 ID to view the invoice summary and download the
          GST-compliant invoice PDF.
        </p>
      </div>
      provided... Remove this comment to see the full error message
      <form className="mb-8">
        provided... Remove this comment to see the full error message
        <div className="mb-6">
          is provided... Remove this comment to see the full error message
          <label
            htmlFor="do2Id"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            DO2 ID
          </label>
          is provided... Remove this comment to see the full error message
          <input
            type="text"
            id="do2Id"
            {...register('do2Id', {
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
      </form>
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          is provided... Remove this comment to see the full error message
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
            flag is provided... Remove this comment to see the full error
            message
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              flag is provided... Remove this comment to see the full error
              message
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              flag is provided... Remove this comment to see the full error
              message
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading invoice data...
          </div>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          is provided... Remove this comment to see the full error message
          <div className="flex">
            flag is provided... Remove this comment to see the full error
            message
            <div className="flex-shrink-0">
              flag is provided... Remove this comment to see the full error
              message
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                flag is provided... Remove this comment to see the full error
                message
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            flag is provided... Remove this comment to see the full error
            message
            <div className="ml-3">
              flag is provided... Remove this comment to see the full error
              message
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              flag is provided... Remove this comment to see the full error
              message
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      {invoiceData && (
        <div className="space-y-6">
          {/* Invoice Header */}
          is provided... Remove this comment to see the full error message
          <div className="bg-blue-50 p-6 rounded-lg">
            flag is provided... Remove this comment to see the full error
            message
            <div className="flex justify-between items-start">
              flag is provided... Remove this comment to see the full error
              message
              <div>
                flag is provided... Remove this comment to see the full error
                message
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  Invoice Summary
                </h3>
                flag is provided... Remove this comment to see the full error
                message
                <p className="text-blue-700">
                  exist on type 'never... Remove this comment to see the full
                  error message DO2 Number: {invoiceData.do2Number}
                </p>
                flag is provided... Remove this comment to see the full error
                message
                <p className="text-blue-700">
                  on type 'never'. Status: {getStatusBadge(invoiceData.status)}
                </p>
              </div>
              flag is provided... Remove this comment to see the full error
              message
              <div className="text-right">
                flag is provided... Remove this comment to see the full error
                message
                <p className="text-sm text-blue-600">
                  does not exist on type 'never... Remove this comment to see
                  the full error message
                  {new Date(invoiceData.createdAt).toLocaleDateString()}
                </p>
                flag is provided... Remove this comment to see the full error
                message
                <p className="text-sm text-blue-600">
                  'updatedAt' does not exist on type 'never... Remove this
                  comment to see the full error message
                  {new Date(invoiceData.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          {/* Customer Information */}
          is provided... Remove this comment to see the full error message
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            flag is provided... Remove this comment to see the full error
            message
            <div className="bg-gray-50 p-6 rounded-lg">
              flag is provided... Remove this comment to see the full error
              message
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h4>
              flag is provided... Remove this comment to see the full error
              message
              <div className="space-y-2">
                flag is provided... Remove this comment to see the full error
                message
                <p>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  TS(2339): Property 'poId' does not exist on type 'never'.
                  {invoiceData.poId?.customerName || 'N/A'}
                </p>
                flag is provided... Remove this comment to see the full error
                message
                <p>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <span className="font-medium">Address:</span> //
                  @ts-expect-error TS(2339): Property 'poId' does not exist on
                  type 'never'.
                  {invoiceData.poId?.customerAddress || 'N/A'}
                </p>
                flag is provided... Remove this comment to see the full error
                message
                <p>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <span className="font-medium">GSTIN:</span> //
                  @ts-expect-error TS(2339): Property 'poId' does not exist on
                  type 'never'.
                  {invoiceData.poId?.customerGstin || 'N/A'}
                </p>
                flag is provided... Remove this comment to see the full error
                message
                <p>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  TS(2339): Property 'poId' does not exist on type 'never'.
                  {invoiceData.poId?.customerPan || 'N/A'}
                </p>
              </div>
            </div>
            flag is provided... Remove this comment to see the full error
            message
            <div className="bg-gray-50 p-6 rounded-lg">
              flag is provided... Remove this comment to see the full error
              message
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Company Information
              </h4>
              flag is provided... Remove this comment to see the full error
              message
              <div className="space-y-2">
                flag is provided... Remove this comment to see the full error
                message
                <p>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  TS(2339): Property 'companyInfo' does not exist on type
                  'nev... Remove this comment to see the full error message
                  {invoiceData.companyInfo?.name ||
                    'Steel Tube Industries Ltd.'}
                </p>
                flag is provided... Remove this comment to see the full error
                message
                <p>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <span className="font-medium">Address:</span> //
                  @ts-expect-error TS(2339): Property 'companyInfo' does not
                  exist on type 'nev... Remove this comment to see the full
                  error message
                  {invoiceData.companyInfo?.address || 'N/A'}
                </p>
                flag is provided... Remove this comment to see the full error
                message
                <p>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <span className="font-medium">GSTIN:</span> //
                  @ts-expect-error TS(2339): Property 'companyInfo' does not
                  exist on type 'nev... Remove this comment to see the full
                  error message
                  {invoiceData.companyInfo?.gstin || 'N/A'}
                </p>
                flag is provided... Remove this comment to see the full error
                message
                <p>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  TS(2339): Property 'companyInfo' does not exist on type
                  'nev... Remove this comment to see the full error message
                  {invoiceData.companyInfo?.pan || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          {/* Invoice Items */}
          'never'.
          {invoiceData.items && invoiceData.items.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              flag is provided... Remove this comment to see the full error
              message
              <div className="px-6 py-4 border-b border-gray-200">
                flag is provided... Remove this comment to see the full error
                message
                <h4 className="text-lg font-semibold text-gray-900">
                  Invoice Items
                </h4>
              </div>
              flag is provided... Remove this comment to see the full error
              message
              <div className="overflow-x-auto">
                flag is provided... Remove this comment to see the full error
                message
                <table className="min-w-full divide-y divide-gray-200">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <thead className="bg-gray-50">
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <tr>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        HSN
                      </th>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty (tons)
                      </th>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <tbody className="bg-white divide-y divide-gray-200">
                    exist on type 'never'.
                    {invoiceData.items.map((item: any, index: any) => (
                      <tr key={index} className="hover:bg-gray-50">
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)}{' '}
                          Tube {item.size} × {item.thickness}mm
                        </td>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.hsnCode}
                        </td>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.dispatchedQuantity}
                        </td>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.rate)}
                        </td>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.dispatchedQuantity * item.rate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Invoice Totals */}
          'never'.
          {invoiceData.items && (
            <div className="bg-green-50 p-6 rounded-lg">
              flag is provided... Remove this comment to see the full error
              message
              <h4 className="text-lg font-semibold text-green-900 mb-4">
                Invoice Totals
              </h4>
              {(() => {
                const totals = calculateTotals(invoiceData.items);
                if (!totals)
                  return (
                    <p className="text-green-700">No items to calculate</p>
                  );

                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p className="text-sm font-medium text-green-600">
                        Total Items
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p className="text-lg font-bold text-green-900">
                        {totals.totalItems}
                      </p>
                    </div>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p className="text-sm font-medium text-green-600">
                        Total Quantity
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p className="text-lg font-bold text-green-900">
                        {totals.totalQuantity.toFixed(1)} tons
                      </p>
                    </div>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p className="text-sm font-medium text-green-600">
                        Subtotal
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(totals.subtotal)}
                      </p>
                    </div>
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <div>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p className="text-sm font-medium text-green-600">
                        Grand Total
                      </p>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(totals.grandTotal)}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          {/* Action Buttons */}
          is provided... Remove this comment to see the full error message
          <div className="flex space-x-4">
            flag is provided... Remove this comment to see the full error
            message
            <button
              onClick={() => viewInvoice(invoiceData._id)}
              disabled={invoiceData.status !== 'executed'}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              flag is provided... Remove this comment to see the full error
              message
              <svg
                className="w-5 h-5 inline mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                flag is provided... Remove this comment to see the full error
                message
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
                flag is provided... Remove this comment to see the full error
                message
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                ></path>
              </svg>
              View Invoice
            </button>
            flag is provided... Remove this comment to see the full error
            message
            <button
              onClick={() => downloadInvoice(invoiceData._id)}
              disabled={invoiceData.status !== 'executed' || isDownloading}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <div className="flex items-center justify-center">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
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
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Downloading...
                </div>
              ) : (
                <>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <svg
                    className="w-5 h-5 inline mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  Download Invoice PDF
                </>
              )}
            </button>
          </div>
          {/* Status Warning */}
          'never'.
          {invoiceData.status !== 'executed' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              flag is provided... Remove this comment to see the full error
              message
              <div className="flex">
                flag is provided... Remove this comment to see the full error
                message
                <div className="flex-shrink-0">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                flag is provided... Remove this comment to see the full error
                message
                <div className="ml-3">
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <h3 className="text-sm font-medium text-yellow-800">
                    Invoice Not Ready
                  </h3>
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <div className="mt-2 text-sm text-yellow-700">
                    '--jsx' flag is provided... Remove this comment to see the
                    full error message
                    <p>
                      Invoice PDF can only be generated for executed DO2 orders.
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message Current status:{' '}
                      <strong>{invoiceData.status}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Instructions */}
      provided... Remove this comment to see the full error message
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        provided... Remove this comment to see the full error message
        <h3 className="text-sm font-medium text-gray-800 mb-2">How to use</h3>
        provided... Remove this comment to see the full error message
        <ul className="text-sm text-gray-700 space-y-1">
          is provided... Remove this comment to see the full error message
          <li>• Enter a valid DO2 ID to view the invoice summary</li>
          is provided... Remove this comment to see the full error message
          <li>• The summary shows customer details, items, and totals</li>
          is provided... Remove this comment to see the full error message
          <li>• View Invoice: Opens PDF in new browser tab</li>
          is provided... Remove this comment to see the full error message
          <li>• Download PDF: Saves the invoice to your device</li>
          is provided... Remove this comment to see the full error message
          <li>• Only executed DO2 orders can generate invoices</li>
        </ul>
      </div>
    </div>
  );
};

export default InvoiceViewer;
