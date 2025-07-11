import React, { useState, useEffect } from 'react';
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
    formState: { errors }
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

  const fetchInvoiceData = async (do2Id) => {
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

  const downloadInvoice = async (do2Id) => {
    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/invoice/${do2Id}/pdf`);
      
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
          await fetch(`http://localhost:5000/api/invoices/${do2Id}/audit-entry`, {
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
                userAgent: navigator.userAgent
              }
            }),
          });
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

  const viewInvoice = async (do2Id) => {
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
            userAgent: navigator.userAgent
          }
        }),
      });
    } catch (auditError) {
      console.error('Failed to add audit entry:', auditError);
    }
  };

  // Calculate invoice totals
  const calculateTotals = (items) => {
    if (!items || items.length === 0) return null;

    const subtotal = items.reduce((sum, item) => sum + (item.dispatchedQuantity * item.rate), 0);
    const gstRate = 18;
    const totalTax = (subtotal * gstRate) / 100;
    const grandTotal = subtotal + totalTax;

    return {
      subtotal,
      totalTax,
      grandTotal,
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.dispatchedQuantity, 0)
    };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      executed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Invoice Viewer</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">View Invoice Summary</h3>
        <p className="text-gray-600 mb-4">
          Enter a DO2 ID to view the invoice summary and download the GST-compliant invoice PDF.
        </p>
      </div>

      <form className="mb-8">
        <div className="mb-6">
          <label htmlFor="do2Id" className="block text-sm font-medium text-gray-700 mb-2">
            DO2 ID
          </label>
          <input
            type="text"
            id="do2Id"
            {...register('do2Id', { 
              pattern: {
                value: /^[0-9a-fA-F]{24}$/,
                message: 'Please enter a valid MongoDB ObjectId'
              }
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
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading invoice data...
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {invoiceData && (
        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Invoice Summary</h3>
                <p className="text-blue-700">DO2 Number: {invoiceData.do2Number}</p>
                <p className="text-blue-700">Status: {getStatusBadge(invoiceData.status)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">Created: {new Date(invoiceData.createdAt).toLocaleDateString()}</p>
                <p className="text-sm text-blue-600">Last Updated: {new Date(invoiceData.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {invoiceData.poId?.customerName || 'N/A'}</p>
                <p><span className="font-medium">Address:</span> {invoiceData.poId?.customerAddress || 'N/A'}</p>
                <p><span className="font-medium">GSTIN:</span> {invoiceData.poId?.customerGstin || 'N/A'}</p>
                <p><span className="font-medium">PAN:</span> {invoiceData.poId?.customerPan || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {invoiceData.companyInfo?.name || 'Steel Tube Industries Ltd.'}</p>
                <p><span className="font-medium">Address:</span> {invoiceData.companyInfo?.address || 'N/A'}</p>
                <p><span className="font-medium">GSTIN:</span> {invoiceData.companyInfo?.gstin || 'N/A'}</p>
                <p><span className="font-medium">PAN:</span> {invoiceData.companyInfo?.pan || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          {invoiceData.items && invoiceData.items.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900">Invoice Items</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        HSN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty (tons)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoiceData.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Tube {item.size} × {item.thickness}mm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.hsnCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.dispatchedQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.rate)}
                        </td>
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
          {invoiceData.items && (
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-green-900 mb-4">Invoice Totals</h4>
              {(() => {
                const totals = calculateTotals(invoiceData.items);
                if (!totals) return <p className="text-green-700">No items to calculate</p>;
                
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Items</p>
                      <p className="text-lg font-bold text-green-900">{totals.totalItems}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Quantity</p>
                      <p className="text-lg font-bold text-green-900">{totals.totalQuantity.toFixed(1)} tons</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600">Subtotal</p>
                      <p className="text-lg font-bold text-green-900">{formatCurrency(totals.subtotal)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600">Grand Total</p>
                      <p className="text-lg font-bold text-green-900">{formatCurrency(totals.grandTotal)}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => viewInvoice(invoiceData._id)}
              disabled={invoiceData.status !== 'executed'}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              View Invoice
            </button>

            <button
              onClick={() => downloadInvoice(invoiceData._id)}
              disabled={invoiceData.status !== 'executed' || isDownloading}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download Invoice PDF
                </>
              )}
            </button>
          </div>

          {/* Status Warning */}
          {invoiceData.status !== 'executed' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Invoice Not Ready</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Invoice PDF can only be generated for executed DO2 orders. Current status: <strong>{invoiceData.status}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="text-sm font-medium text-gray-800 mb-2">How to use</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Enter a valid DO2 ID to view the invoice summary</li>
          <li>• The summary shows customer details, items, and totals</li>
          <li>• View Invoice: Opens PDF in new browser tab</li>
          <li>• Download PDF: Saves the invoice to your device</li>
          <li>• Only executed DO2 orders can generate invoices</li>
        </ul>
      </div>
    </div>
  );
};

export default InvoiceViewer; 