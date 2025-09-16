import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { showInfo } from '../utils/toast';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DispatchCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  // Fetch pending DO2s
  const fetchPendingDO2s = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch calendar data from the new endpoint
      const response = await fetch(
        'http://localhost:5001/api/do2/calendar?status=pending'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }

      const data = await response.json();

      // Convert DO2s to calendar events
      const calendarEvents = data.data.do2s.map((do2) => {
        // Determine target dispatch date (from DO2 or fallback to creation date)
        const dispatchDate = do2.targetDispatchDate || do2.createdAt;

        return {
          id: do2.id,
          title: `${do2.productType} - ${do2.totalDispatchQuantity} units - ${do2.customerName}`,
          start: new Date(dispatchDate),
          end: new Date(dispatchDate),
          resource: do2,
          status: do2.status,
          calendarStatus: do2.calendarStatus,
          backgroundColor: do2.status === 'approved' ? '#10B981' : '#F59E0B',
          borderColor: do2.status === 'approved' ? '#059669' : '#D97706',
          textColor: '#FFFFFF',
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      setError('Error fetching dispatch data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDO2s();
  }, []);

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedEvent(event.resource);
    setShowEventDetails(true);
  };

  // Custom event component
  const EventComponent = ({ event }) => (
    <div
      className="p-1 text-xs font-medium rounded"
      style={{
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        color: event.textColor,
      }}
    >
      <div className="font-semibold">{event.title}</div>
      <div className="text-xs opacity-90">
        {event.status === 'approved' ? '✅ Approved' : '⏳ Pending'}
      </div>
    </div>
  );

  // Custom toolbar component
  const CustomToolbar = (toolbar) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const goToPrev = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToView = (view) => {
      toolbar.onView(view);
    };

    return (
      <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Today
          </button>
          <button
            onClick={goToPrev}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            ←
          </button>
          <button
            onClick={goToNext}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            →
          </button>
        </div>

        <div className="text-lg font-semibold text-gray-800">
          {toolbar.label}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => goToView('month')}
            className={`px-3 py-1 text-sm rounded ${
              toolbar.view === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => goToView('week')}
            className={`px-3 py-1 text-sm rounded ${
              toolbar.view === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => goToView('day')}
            className={`px-3 py-1 text-sm rounded ${
              toolbar.view === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Day
          </button>
        </div>
      </div>
    );
  };

  // Event details modal
  const EventDetailsModal = () => {
    if (!selectedEvent || !showEventDetails) return null;

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Dispatch Details
            </h3>
            <button
              onClick={() => setShowEventDetails(false)}
              className="text-gray-400 hover:text-gray-600"
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
                ></path>
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">DO2 Number:</span>
              <span className="ml-2 text-gray-900">
                {selectedEvent.do2Number}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">PO Number:</span>
              <span className="ml-2 text-gray-900">
                {selectedEvent.poNumber}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">Customer:</span>
              <span className="ml-2 text-gray-900">
                {selectedEvent.customerName}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">Customer Phone:</span>
              <span className="ml-2 text-gray-900">
                {selectedEvent.customerPhone}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">Product:</span>
              <span className="ml-2 text-gray-900">
                {selectedEvent.productType}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">
                Total Dispatch Quantity:
              </span>
              <span className="ml-2 text-gray-900">
                {selectedEvent.totalDispatchQuantity} units
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">Total Amount:</span>
              <span className="ml-2 text-gray-900">
                ₹{selectedEvent.totalAmount?.toLocaleString()}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span
                className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedEvent.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {selectedEvent.status === 'approved'
                  ? 'Approved'
                  : 'Pending Approval'}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">
                Target Dispatch Date:
              </span>
              <span className="ml-2 text-gray-900">
                {formatDate(selectedEvent.targetDispatchDate)}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-900">
                {formatDate(selectedEvent.createdAt)}
              </span>
            </div>

            {selectedEvent.remarks && (
              <div>
                <span className="font-medium text-gray-700">Remarks:</span>
                <span className="ml-2 text-gray-900">
                  {selectedEvent.remarks}
                </span>
              </div>
            )}

            {selectedEvent.items && selectedEvent.items.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">Items:</span>
                <div className="ml-2 mt-2 space-y-1">
                  {selectedEvent.items.map((item, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      <div>
                        <strong>{item.type}</strong> - {item.size} x{' '}
                        {item.thickness}mm
                      </div>
                      <div>
                        Qty: {item.remainingQuantity} units @ ₹{item.rate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => setShowEventDetails(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
            {selectedEvent.status === 'pending_approval' && (
              <button
                onClick={() => {
                  // TODO: Implement approval action
                  showInfo('Approval functionality to be implemented');
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
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
              <span className="text-lg text-gray-600">
                Loading dispatch calendar...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Calendar
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchPendingDO2s}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dispatch Calendar
          </h2>
          <p className="text-gray-600">
            View and manage pending dispatch orders (DO2s) on the calendar
          </p>
        </div>

        {/* Legend */}
        <div className="mb-6 flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-700">Pending Approval</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">
              Approved (Ready to Execute)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Total Events: {events.length}
            </span>
          </div>
        </div>

        {/* Calendar */}
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleEventClick}
            components={{
              event: EventComponent,
              toolbar: CustomToolbar,
            }}
            views={['month', 'week', 'day']}
            defaultView="month"
            selectable
            popup
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.backgroundColor,
                borderColor: event.borderColor,
                color: event.textColor,
              },
            })}
          />
        </div>

        {/* Event Details Modal */}
        <EventDetailsModal />
      </div>
    </div>
  );
};

export default DispatchCalendar;
