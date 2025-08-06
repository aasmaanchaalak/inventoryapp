import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const LeadDetailPanel = ({ leadId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lead, setLead] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState({});
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [quotations, setQuotations] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [documents, setDocuments] = useState([]);

  const { get: fetchData, post: postData, put: updateData } = useApi();

  // Load lead details when panel opens
  useEffect(() => {
    if (isOpen && leadId) {
      loadLeadDetails();
      loadRelatedData();
    }
  }, [isOpen, leadId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const loadLeadDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchData(
        `http://localhost:5001/api/leads/${leadId}`
      );

      if (response.success) {
        setLead(response.data);
        setEditedLead(response.data);
        // Load notes if available
        setNotes(response.data.notes || []);
      } else {
        setError('Failed to load lead details');
      }
    } catch (err) {
      setError('Error loading lead details: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedData = async () => {
    try {
      // Load quotations for this lead
      const quotationsResponse = await fetchData(
        `http://localhost:5001/api/quotations`
      );
      if (quotationsResponse.success) {
        // Filter quotations by leadId
        const leadQuotations = (quotationsResponse.data || []).filter(
          (q) => q.leadId === leadId
        );
        setQuotations(leadQuotations);
      }

      // Load purchase orders for this lead
      const posResponse = await fetchData(`http://localhost:5001/api/pos`);
      if (posResponse.success) {
        // Filter POs by leadId
        const leadPOs = (posResponse.data || []).filter(
          (po) => po.leadId === leadId
        );
        setPurchaseOrders(leadPOs);
      }

      // Combine all documents for Orders tab
      const leadQuotations = (quotationsResponse.data || []).filter(
        (q) => q.leadId === leadId
      );
      const leadPOs = (posResponse.data || []).filter(
        (po) => po.leadId === leadId
      );

      const allDocs = [
        ...leadQuotations.map((doc) => ({
          ...doc,
          type: 'Quotation',
          number: doc.quotationNumber,
          amount: doc.totalAmount,
        })),
        ...leadPOs.map((doc) => ({
          ...doc,
          type: 'Purchase Order',
          number: doc.poNumber,
          amount: doc.totalAmount,
        })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setDocuments(allDocs);
    } catch (err) {
      console.error('Error loading related data:', err);
    }
  };

  const handleSave = async () => {
    try {
      const response = await updateData(
        `http://localhost:5001/api/leads/${leadId}`,
        editedLead
      );

      if (response.success) {
        setLead(response.data);
        setIsEditing(false);
      } else {
        setError('Failed to update lead');
      }
    } catch (err) {
      setError('Error updating lead: ' + err.message);
    }
  };

  const handleCancel = () => {
    setEditedLead(lead);
    setIsEditing(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const noteData = {
        text: newNote,
        timestamp: new Date().toISOString(),
        user: 'Current User', // Replace with actual user
      };

      // Optimistic update
      const updatedNotes = [noteData, ...notes];
      setNotes(updatedNotes);
      setNewNote('');

      // API call to save note
      const response = await postData(
        `http://localhost:5001/api/leads/${leadId}/notes`,
        noteData
      );

      if (!response.success) {
        // Rollback on error
        setNotes(notes);
        setError('Failed to add note');
      }
    } catch (err) {
      // Rollback on error
      setNotes(notes);
      setError('Error adding note: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'issued':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-1/2 min-w-96 max-w-2xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {lead?.name || 'Lead Details'}
              </h2>
              <p className="text-sm text-gray-500">
                {lead?.phone} • {lead?.email || 'No email'}
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

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🗂️ Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📦 Orders
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Lead Info Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Lead Information
                        </h3>
                        {!isEditing ? (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            ✏️ Edit
                          </button>
                        ) : (
                          <div className="space-x-2">
                            <button
                              onClick={handleSave}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedLead.name || ''}
                              onChange={(e) =>
                                setEditedLead({
                                  ...editedLead,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">
                              {lead?.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedLead.phone || ''}
                              onChange={(e) =>
                                setEditedLead({
                                  ...editedLead,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">
                              {lead?.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={editedLead.email || ''}
                              onChange={(e) =>
                                setEditedLead({
                                  ...editedLead,
                                  email: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">
                              {lead?.email || 'No email'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Interest
                          </label>
                          <p className="text-sm text-gray-900">
                            {lead?.product}
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          {isEditing ? (
                            <textarea
                              value={editedLead.address || ''}
                              onChange={(e) =>
                                setEditedLead({
                                  ...editedLead,
                                  address: e.target.value,
                                })
                              }
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">
                              {lead?.address || 'No address'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Notes
                      </h3>

                      {/* Add Note */}
                      <div className="mb-4">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add Note
                          </button>
                        </div>
                      </div>

                      {/* Notes List */}
                      <div className="space-y-3">
                        {notes.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">
                            No notes yet.
                          </p>
                        ) : (
                          notes.map((note, index) => (
                            <div
                              key={index}
                              className="bg-white border rounded-lg p-3"
                            >
                              <p className="text-sm text-gray-900">
                                {note.text}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {note.user} • {formatDate(note.timestamp)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Pending Quotations */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Pending Quotations
                      </h3>
                      {quotations.filter((q) => q.status !== 'converted')
                        .length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          No pending quotations.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {quotations
                            .filter((q) => q.status !== 'converted')
                            .map((quotation) => (
                              <div
                                key={quotation._id}
                                className="flex items-center justify-between p-3 bg-white border rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-sm">
                                    {quotation.quotationNumber}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatCurrency(quotation.totalAmount)} •{' '}
                                    {formatDate(quotation.createdAt)}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quotation.status)}`}
                                  >
                                    {quotation.status?.toUpperCase() || 'DRAFT'}
                                  </span>
                                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                                    View
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Pending POs */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Pending Purchase Orders
                      </h3>
                      {purchaseOrders.filter((po) => po.status !== 'completed')
                        .length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          No pending purchase orders.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {purchaseOrders
                            .filter((po) => po.status !== 'completed')
                            .map((po) => (
                              <div
                                key={po._id}
                                className="flex items-center justify-between p-3 bg-white border rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-sm">
                                    {po.poNumber}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatCurrency(po.totalAmount)} •{' '}
                                    {formatDate(po.createdAt)}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(po.status)}`}
                                  >
                                    {po.status?.toUpperCase() || 'PENDING'}
                                  </span>
                                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                                    View
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Document History
                    </h3>

                    {documents.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        No documents found for this lead.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div
                            key={`${doc.type}-${doc._id}`}
                            className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">
                                  {doc.type === 'Quotation' ? '📋' : '📄'}
                                </span>
                                <div>
                                  <p className="font-medium text-sm">
                                    {doc.number}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {doc.type} • {formatCurrency(doc.amount)} •{' '}
                                    {formatDate(doc.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}
                              >
                                {doc.status?.toUpperCase() || 'DRAFT'}
                              </span>
                              <button className="text-blue-600 hover:text-blue-800 text-sm">
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadDetailPanel;
