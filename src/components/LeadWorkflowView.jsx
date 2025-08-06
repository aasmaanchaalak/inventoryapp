import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const LeadWorkflowView = ({ leadId, onClose }) => {
  const [lead, setLead] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Workflow data states
  const [quotation, setQuotation] = useState(null);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [inventory, setInventory] = useState([]);

  // Form states
  const [quotationForm, setQuotationForm] = useState({
    items: [{ product: '', quantity: 0, rate: 0, tax: 18 }],
    validity: 30,
    deliveryTerms: '',
    paymentTerms: '',
    notes: '',
  });

  const [poForm, setPOForm] = useState({
    items: [],
    deliveryDate: '',
    paymentTerms: '',
    notes: '',
  });

  const [doForm, setDOForm] = useState({
    items: [],
    dispatchDate: '',
    transporterName: '',
    vehicleNumber: '',
    driverPhone: '',
    notes: '',
  });

  const { get: fetchData, post: postData, put: updateData } = useApi();

  // Load lead and related data
  useEffect(() => {
    if (leadId) {
      loadWorkflowData();
    }
  }, [leadId]);

  const loadWorkflowData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load lead details
      const leadResponse = await fetchData(
        `http://localhost:5001/api/leads/${leadId}`
      );
      if (leadResponse.success) {
        setLead(leadResponse.data);
      }

      // Load existing quotation
      const quotationsResponse = await fetchData(
        'http://localhost:5001/api/quotations'
      );
      if (quotationsResponse.success) {
        const leadQuotation = quotationsResponse.data?.find(
          (q) => q.leadId === leadId
        );
        if (leadQuotation) {
          setQuotation(leadQuotation);
          setQuotationForm({
            items: leadQuotation.items || [],
            validity: leadQuotation.validity || 30,
            deliveryTerms: leadQuotation.deliveryTerms || '',
            paymentTerms: leadQuotation.paymentTerms || '',
            notes: leadQuotation.notes || '',
          });
          setCurrentStep(2);
        }
      }

      // Load existing PO
      const posResponse = await fetchData('http://localhost:5001/api/pos');
      if (posResponse.success) {
        const leadPO = posResponse.data?.find((po) => po.leadId === leadId);
        if (leadPO) {
          setPurchaseOrder(leadPO);
          setPOForm({
            items: leadPO.items || [],
            deliveryDate: leadPO.deliveryDate || '',
            paymentTerms: leadPO.paymentTerms || '',
            notes: leadPO.notes || '',
          });
          setCurrentStep(3);
        }
      }

      // Load inventory
      const inventoryResponse = await fetchData(
        'http://localhost:5001/api/inventory'
      );
      if (inventoryResponse.success) {
        setInventory(inventoryResponse.data || []);
      }
    } catch (error) {
      setError('Failed to load workflow data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepClick = (step) => {
    if (step <= getCurrentMaxStep()) {
      setCurrentStep(step);
    }
  };

  const getCurrentMaxStep = () => {
    if (deliveryOrder) return 3;
    if (purchaseOrder) return 3;
    if (quotation) return 2;
    return 1;
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      const qty = item.orderedQuantity || item.quantity || 0;
      const subtotal = qty * (item.rate || 0);
      const taxAmount = subtotal * ((item.tax || 0) / 100);
      return total + subtotal + taxAmount;
    }, 0);
  };

  const addQuotationItem = () => {
    setQuotationForm((prev) => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 0, rate: 0, tax: 18 }],
    }));
  };

  const removeQuotationItem = (index) => {
    setQuotationForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateQuotationItem = (index, field, value) => {
    setQuotationForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmitQuotation = async () => {
    try {
      const quotationData = {
        leadId,
        ...quotationForm,
        totalAmount: calculateTotal(quotationForm.items),
      };

      const response = await postData(
        'http://localhost:5001/api/quotations',
        quotationData
      );
      if (response.success) {
        setQuotation(response.data);
        // Pre-populate PO form with quotation data
        setPOForm((prev) => ({
          ...prev,
          items: quotationForm.items.map((item) => ({
            ...item,
            orderedQuantity: item.quantity,
          })),
        }));
        setCurrentStep(2);
      }
    } catch (error) {
      setError('Failed to create quotation: ' + error.message);
    }
  };

  const handleSubmitPO = async () => {
    try {
      const poData = {
        leadId,
        quotationId: quotation._id,
        ...poForm,
        totalAmount: calculateTotal(poForm.items),
      };

      const response = await postData('http://localhost:5001/api/pos', poData);
      if (response.success) {
        setPurchaseOrder(response.data);
        // Pre-populate DO form with PO data
        setDOForm((prev) => ({
          ...prev,
          items: poForm.items.map((item) => ({ ...item, dispatchQuantity: 0 })),
        }));
        setCurrentStep(3);
      }
    } catch (error) {
      setError('Failed to create purchase order: ' + error.message);
    }
  };

  const handleSubmitDO = async () => {
    try {
      const doData = {
        leadId,
        poId: purchaseOrder._id,
        ...doForm,
        totalAmount: calculateTotal(doForm.items),
      };

      const response = await postData('http://localhost:5001/api/do1', doData);
      if (response.success) {
        setDeliveryOrder(response.data);
        // Workflow complete
        alert('Delivery Order created successfully!');
      }
    } catch (error) {
      setError('Failed to create delivery order: ' + error.message);
    }
  };

  const addPOItem = () => {
    setPOForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { product: '', quantity: 0, rate: 0, tax: 18, orderedQuantity: 0 },
      ],
    }));
  };

  const removePOItem = (index) => {
    setPOForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updatePOItem = (index, field, value) => {
    setPOForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateDOItem = (index, field, value) => {
    setDOForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const StepIndicator = ({
    step,
    title,
    isActive,
    isCompleted,
    isClickable,
  }) => (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-blue-50 border-blue-200'
          : isCompleted
            ? 'bg-green-50 border-green-200'
            : 'bg-gray-50 border-gray-200'
      } ${isClickable ? 'hover:bg-blue-50' : 'cursor-not-allowed opacity-50'}`}
      onClick={() => isClickable && handleStepClick(step)}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
          isActive
            ? 'bg-blue-600 text-white'
            : isCompleted
              ? 'bg-green-600 text-white'
              : 'bg-gray-300 text-gray-600'
        }`}
      >
        {isCompleted ? '✓' : step}
      </div>
      <span
        className={`font-medium ${
          isActive
            ? 'text-blue-900'
            : isCompleted
              ? 'text-green-900'
              : 'text-gray-600'
        }`}
      >
        {title}
      </span>
    </div>
  );

  const WorkflowSidebar = () => (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Workflow Summary
      </h3>

      {/* Lead Info */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
        <p className="text-sm text-gray-600">{lead?.name}</p>
        <p className="text-sm text-gray-600">{lead?.phone}</p>
        <p className="text-sm text-gray-600">{lead?.product}</p>
      </div>

      {/* Quotation Summary */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Quotation</h4>
        {quotation ? (
          <div>
            <p className="text-sm text-gray-600">
              #{quotation.quotationNumber}
            </p>
            <p className="text-lg font-semibold text-green-600">
              ₹{quotation.totalAmount?.toLocaleString()}
            </p>
            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
              Completed
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Not created yet</p>
        )}
      </div>

      {/* PO Summary */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Purchase Order</h4>
        {purchaseOrder ? (
          <div>
            <p className="text-sm text-gray-600">#{purchaseOrder.poNumber}</p>
            <p className="text-lg font-semibold text-blue-600">
              ₹{purchaseOrder.totalAmount?.toLocaleString()}
            </p>
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {purchaseOrder.status || 'Active'}
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Pending quotation</p>
        )}
      </div>

      {/* DO Summary */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Delivery Order</h4>
        {deliveryOrder ? (
          <div>
            <p className="text-sm text-gray-600">#{deliveryOrder.do1Number}</p>
            <p className="text-sm text-gray-600">
              Dispatched: {deliveryOrder.totalDispatched} /{' '}
              {deliveryOrder.totalOrdered}
            </p>
            <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
              {deliveryOrder.status || 'In Progress'}
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Pending PO</p>
        )}
      </div>

      {/* Available Stock */}
      <div className="bg-white rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Available Stock</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {inventory.slice(0, 5).map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.productName}</span>
              <span className="font-medium">{item.quantity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
      <div className="flex h-full">
        {/* Main Content Area */}
        <div className="flex-1 bg-white overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Lead Workflow
                </h1>
                <p className="text-gray-600">
                  {lead?.name} - {lead?.product}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Step Indicators */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex space-x-4">
                <StepIndicator
                  step={1}
                  title="Quotation"
                  isActive={currentStep === 1}
                  isCompleted={!!quotation}
                  isClickable={true}
                />
                <StepIndicator
                  step={2}
                  title="Purchase Order"
                  isActive={currentStep === 2}
                  isCompleted={!!purchaseOrder}
                  isClickable={!!quotation}
                />
                <StepIndicator
                  step={3}
                  title="Delivery Order"
                  isActive={currentStep === 3}
                  isCompleted={!!deliveryOrder}
                  isClickable={!!purchaseOrder}
                />
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Step 1: Quotation Form */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Create Quotation
                  </h2>

                  {/* Items */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Items
                    </label>
                    <div className="space-y-3">
                      {quotationForm.items.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-6 gap-3 p-3 border border-gray-200 rounded-lg"
                        >
                          <input
                            type="text"
                            placeholder="Product"
                            value={item.product}
                            onChange={(e) =>
                              updateQuotationItem(
                                index,
                                'product',
                                e.target.value
                              )
                            }
                            className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuotationItem(
                                index,
                                'quantity',
                                Number(e.target.value)
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Rate"
                            value={item.rate}
                            onChange={(e) =>
                              updateQuotationItem(
                                index,
                                'rate',
                                Number(e.target.value)
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Tax %"
                            value={item.tax}
                            onChange={(e) =>
                              updateQuotationItem(
                                index,
                                'tax',
                                Number(e.target.value)
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <button
                            onClick={() => removeQuotationItem(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addQuotationItem}
                      className="mt-3 px-4 py-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Item
                    </button>
                  </div>

                  {/* Other fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validity (days)
                      </label>
                      <input
                        type="number"
                        value={quotationForm.validity}
                        onChange={(e) =>
                          setQuotationForm((prev) => ({
                            ...prev,
                            validity: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Terms
                      </label>
                      <input
                        type="text"
                        value={quotationForm.paymentTerms}
                        onChange={(e) =>
                          setQuotationForm((prev) => ({
                            ...prev,
                            paymentTerms: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Terms
                    </label>
                    <textarea
                      value={quotationForm.deliveryTerms}
                      onChange={(e) =>
                        setQuotationForm((prev) => ({
                          ...prev,
                          deliveryTerms: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <div className="text-lg font-semibold">
                      Total: ₹
                      {calculateTotal(quotationForm.items).toLocaleString()}
                    </div>
                    <button
                      onClick={handleSubmitQuotation}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Create Quotation
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: PO Form */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Create Purchase Order
                  </h2>
                  <p className="text-sm text-gray-600">
                    Based on Quotation #{quotation?.quotationNumber}
                  </p>

                  {/* Items */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Items (from Quotation)
                    </label>
                    <div className="space-y-3">
                      {poForm.items.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-7 gap-3 p-3 border border-gray-200 rounded-lg"
                        >
                          <input
                            type="text"
                            placeholder="Product"
                            value={item.product}
                            onChange={(e) =>
                              updatePOItem(index, 'product', e.target.value)
                            }
                            className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Quoted Qty"
                            value={item.quantity}
                            readOnly
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                          />
                          <input
                            type="number"
                            placeholder="Order Qty"
                            value={item.orderedQuantity}
                            onChange={(e) =>
                              updatePOItem(
                                index,
                                'orderedQuantity',
                                Number(e.target.value)
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Rate"
                            value={item.rate}
                            onChange={(e) =>
                              updatePOItem(
                                index,
                                'rate',
                                Number(e.target.value)
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Tax %"
                            value={item.tax}
                            onChange={(e) =>
                              updatePOItem(index, 'tax', Number(e.target.value))
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <button
                            onClick={() => removePOItem(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addPOItem}
                      className="mt-3 px-4 py-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Item
                    </button>
                  </div>

                  {/* PO specific fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Date
                      </label>
                      <input
                        type="date"
                        value={poForm.deliveryDate}
                        onChange={(e) =>
                          setPOForm((prev) => ({
                            ...prev,
                            deliveryDate: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Terms
                      </label>
                      <input
                        type="text"
                        value={poForm.paymentTerms}
                        onChange={(e) =>
                          setPOForm((prev) => ({
                            ...prev,
                            paymentTerms: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g., 30 days net"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={poForm.notes}
                      onChange={(e) =>
                        setPOForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Additional instructions or notes"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <div className="text-lg font-semibold">
                      Total: ₹{calculateTotal(poForm.items).toLocaleString()}
                    </div>
                    <button
                      onClick={handleSubmitPO}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Create Purchase Order
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: DO Form */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Create Delivery Order
                  </h2>
                  <p className="text-sm text-gray-600">
                    Based on PO #{purchaseOrder?.poNumber}
                  </p>

                  {/* Items for Dispatch */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Items for Dispatch
                    </label>
                    <div className="space-y-3">
                      {doForm.items.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-6 gap-3 p-3 border border-gray-200 rounded-lg"
                        >
                          <input
                            type="text"
                            placeholder="Product"
                            value={item.product}
                            readOnly
                            className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                          />
                          <div className="px-3 py-2 text-sm text-gray-700">
                            <span className="text-xs text-gray-500">
                              Ordered:
                            </span>
                            <div className="font-medium">
                              {item.orderedQuantity || item.quantity}
                            </div>
                          </div>
                          <input
                            type="number"
                            placeholder="Dispatch Qty"
                            value={item.dispatchQuantity}
                            onChange={(e) =>
                              updateDOItem(
                                index,
                                'dispatchQuantity',
                                Number(e.target.value)
                              )
                            }
                            max={item.orderedQuantity || item.quantity}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <div className="px-3 py-2 text-sm text-gray-700">
                            <span className="text-xs text-gray-500">
                              Available:
                            </span>
                            <div className="font-medium text-green-600">
                              {inventory.find(
                                (inv) => inv.productName === item.product
                              )?.quantity || 0}
                            </div>
                          </div>
                          <div className="px-3 py-2 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                (item.dispatchQuantity || 0) <=
                                (inventory.find(
                                  (inv) => inv.productName === item.product
                                )?.quantity || 0)
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {(item.dispatchQuantity || 0) <=
                              (inventory.find(
                                (inv) => inv.productName === item.product
                              )?.quantity || 0)
                                ? 'In Stock'
                                : 'Low Stock'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dispatch Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dispatch Date
                      </label>
                      <input
                        type="date"
                        value={doForm.dispatchDate}
                        onChange={(e) =>
                          setDOForm((prev) => ({
                            ...prev,
                            dispatchDate: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transporter Name
                      </label>
                      <input
                        type="text"
                        value={doForm.transporterName}
                        onChange={(e) =>
                          setDOForm((prev) => ({
                            ...prev,
                            transporterName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Transporter company name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Number
                      </label>
                      <input
                        type="text"
                        value={doForm.vehicleNumber}
                        onChange={(e) =>
                          setDOForm((prev) => ({
                            ...prev,
                            vehicleNumber: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g., HR26-1234"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Driver Phone
                      </label>
                      <input
                        type="tel"
                        value={doForm.driverPhone}
                        onChange={(e) =>
                          setDOForm((prev) => ({
                            ...prev,
                            driverPhone: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Driver contact number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dispatch Notes
                    </label>
                    <textarea
                      value={doForm.notes}
                      onChange={(e) =>
                        setDOForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Special instructions, handling notes, etc."
                    />
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <div>
                        Total Items:{' '}
                        {doForm.items.reduce(
                          (sum, item) => sum + (item.dispatchQuantity || 0),
                          0
                        )}
                      </div>
                      <div>
                        Dispatch Value: ₹
                        {doForm.items
                          .reduce(
                            (sum, item) =>
                              sum +
                              (item.dispatchQuantity || 0) * (item.rate || 0),
                            0
                          )
                          .toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={handleSubmitDO}
                      className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Create Delivery Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <WorkflowSidebar />
      </div>
    </div>
  );
};

export default LeadWorkflowView;
