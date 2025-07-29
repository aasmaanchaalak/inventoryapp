import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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
        'http://localhost:5000/api/do2/calendar?status=pending'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }

      const data = await response.json();

      // Convert DO2s to calendar events
      const calendarEvents = data.data.do2s.map((do2: any) => {
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
  const handleEventClick = (event: any) => {
    setSelectedEvent(event.resource);
    setShowEventDetails(true);
  };

  // Custom event component
  const EventComponent = ({ event }: any) => (
    <div
      className="p-1 text-xs font-medium rounded"
      style={{
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        color: event.textColor,
      }}
    >
      provided... Remove this comment to see the full error message
      <div className="font-semibold">{event.title}</div>
      provided... Remove this comment to see the full error message
      <div className="text-xs opacity-90">
        {event.status === 'approved' ? '✅ Approved' : '⏳ Pending'}
      </div>
    </div>
  );

  // Custom toolbar component
  const CustomToolbar = (toolbar: any) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const goToPrev = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToView = (view: any) => {
      toolbar.onView(view);
    };

    return (
      <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow-sm">
        provided... Remove this comment to see the full error message
        <div className="flex items-center space-x-2">
          is provided... Remove this comment to see the full error message
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Today
          </button>
          is provided... Remove this comment to see the full error message
          <button
            onClick={goToPrev}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            ←
          </button>
          is provided... Remove this comment to see the full error message
          <button
            onClick={goToNext}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            →
          </button>
        </div>
        provided... Remove this comment to see the full error message
        <div className="text-lg font-semibold text-gray-800">
          {toolbar.label}
        </div>
        provided... Remove this comment to see the full error message
        <div className="flex items-center space-x-2">
          is provided... Remove this comment to see the full error message
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
          is provided... Remove this comment to see the full error message
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
          is provided... Remove this comment to see the full error message
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

    const formatDate = (dateString: any) => {
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
        provided... Remove this comment to see the full error message
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
          is provided... Remove this comment to see the full error message
          <div className="flex items-center justify-between mb-4">
            flag is provided... Remove this comment to see the full error
            message
            <h3 className="text-lg font-semibold text-gray-900">
              Dispatch Details
            </h3>
            flag is provided... Remove this comment to see the full error
            message
            <button
              onClick={() => setShowEventDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              flag is provided... Remove this comment to see the full error
              message
              <svg
                className="w-6 h-6"
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
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          is provided... Remove this comment to see the full error message
          <div className="space-y-3">
            flag is provided... Remove this comment to see the full error
            message
            <div>
              flag is provided... Remove this comment to see the full error
              message
              <span className="font-medium text-gray-700">DO2 Number:</span>
              flag is provided... Remove this comment to see the full error
              message
              <span className="ml-2 text-gray-900">
                exist on type 'never... Remove this comment to see the full
                error message
                {selectedEvent.do2Number}
              </span>
            </div>
            flag is provided... Remove this comment to see the full error
            message
            <div>
              flag is provided... Remove this comment to see the full error
              message
              <span className="font-medium text-gray-700">PO Number:</span>
              flag is provided... Remove this comment to see the full error
              message
              <span className="ml-2 text-gray-900">
                on type 'never'... Remove this comment to see the full error
                message
                {selectedEvent.poNumber}
              </span>
            </div>
            flag is provided... Remove this comment to see the full error
            message
            <div>
              flag is provided... Remove this comment to see the full error
              message
              <span className="font-medium text-gray-700">Customer:</span>
              flag is provided... Remove this comment to see the full error
              message
              <span className="ml-2 text-gray-900">
                exist on type 'ne... Remove this comment to see the full error
                message
                {selectedEvent.customerName}
              </span>
            </div>
            flag is provided... Remove this comment to see the full error
            message
            <div>
              flag is provided... Remove this comment to see the full error
              message
              <span className="font-medium text-gray-700">Customer Phone:</span>
              flag is provided... Remove this comment to see the full error
              message
              <span className="ml-2 text-gray-900">
                exist on type 'n... Remove this comment to see the full error
                message
                {selectedEvent.customerPhone}
              </span>
            </div>
            flag is provided... Remove this comment to see the full error
            message
            <div>
              flag is provided... Remove this comment to see the full error
              message
              <span className="font-medium text-gray-700">Product:</span>
              flag is provided... Remove this comment to see the full error
              message
              <span className="ml-2 text-gray-900">
                exist on type 'nev... Remove this comment to see the full error
                message
                {selectedEvent.productType}
              </span>
            </div>
            flag is provided... Remove this comment to see the full error
            message
            <div>
              flag is provided... Remove this comment to see the full error
              message
              <span className="font-medium text-gray-700">
                Total Dispatch Quantity:
              </span>
              flag is provided... Remove this comment to see the full error
              message
              <span className="ml-2 text-gray-900">
                does not exist on... Remove this comment to see the full error
                message
                {selectedEvent.totalDispatchQuantity} units
              </span>
            </div>
            flag is provided... Remove this comment to see the full error
            message
            <div>
              flag is provided... Remove this comment to see the full error
              message
              <span className="font-medium text-gray-700">Total Amount:</span>
              flag is provided... Remove this comment to see the full error
              message
              <span className="ml-2 text-gray-900">
                exist on type 'nev... Remove this comment to see the full error
                message ₹{selectedEvent.totalAmount?.toLocaleString()}
              </span>
            </div>
            flag is provided... Remove this comment to see the full error
            message
            <div>
              flag is provided... Remove this comment to see the full error
              message
              <span className="font-medium text-gray-700">Status:</span>
              flag is provided... Remove this comment to see the full error
              message
              <span
                className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedEvent.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                on type 'never'.
                {selectedEvent.status === 'approved'
                  ? 'Approved'
                  : 'Pending Approval'}
              </span>
            </div>
            flag is provided... Remove this comment to see the full error
            message
            <div>
              flag is provided... Remove this comment to see the full error
              message
              <span className="font-medium text-gray-700">
                Target Dispatch Date:
              </span>
              flag is provided... Remove this comment to see the full error
              message
              <span className="ml-2 text-gray-900">
                not exist on ty... Remove this comment to see the full error
                message
                {formatDate(selectedEvent.targetDispatchDate)}
              </span>
            </div>
            flag is provided... Remove this comment to see the full error
            message
            <div>
              flag is provided... Remove this comment to see the full error
              message
              <span className="font-medium text-gray-700">Created:</span>
              flag is provided... Remove this comment to see the full error
              message
              <span className="ml-2 text-gray-900">
                exist on type 'never... Remove this comment to see the full
                error message
                {formatDate(selectedEvent.createdAt)}
              </span>
            </div>
            type 'never'.
            {selectedEvent.remarks && (
              <div>
                flag is provided... Remove this comment to see the full error
                message
                <span className="font-medium text-gray-700">Remarks:</span>
                flag is provided... Remove this comment to see the full error
                message
                <span className="ml-2 text-gray-900">
                  exist on type 'never'.
                  {selectedEvent.remarks}
                </span>
              </div>
            )}
            type 'never'.
            {selectedEvent.items && selectedEvent.items.length > 0 && (
              <div>
                flag is provided... Remove this comment to see the full error
                message
                <span className="font-medium text-gray-700">Items:</span>
                flag is provided... Remove this comment to see the full error
                message
                <div className="ml-2 mt-2 space-y-1">
                  on type 'never'.
                  {selectedEvent.items.map((item: any, index: any) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <div>
                        '--jsx' flag is provided... Remove this comment to see
                        the full error message
                        <strong>{item.type}</strong> - {item.size} x{' '}
                        {item.thickness}mm
                      </div>
                      '--jsx' flag is provided... Remove this comment to see the
                      full error message
                      <div>
                        Qty: {item.remainingQuantity} units @ ₹{item.rate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          is provided... Remove this comment to see the full error message
          <div className="mt-6 flex space-x-3">
            flag is provided... Remove this comment to see the full error
            message
            <button
              onClick={() => setShowEventDetails(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
            type 'never'.
            {selectedEvent.status === 'pending_approval' && (
              <button
                onClick={() => {
                  // TODO: Implement approval action
                  alert('Approval functionality to be implemented');
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
        provided... Remove this comment to see the full error message
        <div className="bg-white rounded-lg shadow-md p-6">
          is provided... Remove this comment to see the full error message
          <div className="flex items-center justify-center h-64">
            flag is provided... Remove this comment to see the full error
            message
            <div className="flex items-center space-x-2">
              flag is provided... Remove this comment to see the full error
              message
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
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
              flag is provided... Remove this comment to see the full error
              message
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
        provided... Remove this comment to see the full error message
        <div className="bg-white rounded-lg shadow-md p-6">
          is provided... Remove this comment to see the full error message
          <div className="text-center">
            flag is provided... Remove this comment to see the full error
            message
            <div className="text-red-600 mb-4">
              flag is provided... Remove this comment to see the full error
              message
              <svg
                className="w-12 h-12 mx-auto"
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
            </div>
            flag is provided... Remove this comment to see the full error
            message
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Calendar
            </h3>
            flag is provided... Remove this comment to see the full error
            message
            <p className="text-gray-600 mb-4">{error}</p>
            flag is provided... Remove this comment to see the full error
            message
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
      provided... Remove this comment to see the full error message
      <div className="bg-white rounded-lg shadow-md p-6">
        provided... Remove this comment to see the full error message
        <div className="mb-6">
          is provided... Remove this comment to see the full error message
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dispatch Calendar
          </h2>
          is provided... Remove this comment to see the full error message
          <p className="text-gray-600">
            View and manage pending dispatch orders (DO2s) on the calendar
          </p>
        </div>
        {/* Legend */}
        provided... Remove this comment to see the full error message
        <div className="mb-6 flex items-center space-x-6">
          is provided... Remove this comment to see the full error message
          <div className="flex items-center space-x-2">
            flag is provided... Remove this comment to see the full error
            message
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            flag is provided... Remove this comment to see the full error
            message
            <span className="text-sm text-gray-700">Pending Approval</span>
          </div>
          is provided... Remove this comment to see the full error message
          <div className="flex items-center space-x-2">
            flag is provided... Remove this comment to see the full error
            message
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            flag is provided... Remove this comment to see the full error
            message
            <span className="text-sm text-gray-700">
              Approved (Ready to Execute)
            </span>
          </div>
          is provided... Remove this comment to see the full error message
          <div className="flex items-center space-x-2">
            flag is provided... Remove this comment to see the full error
            message
            <span className="text-sm text-gray-500">
              Total Events: {events.length}
            </span>
          </div>
        </div>
        {/* Calendar */}
        provided... Remove this comment to see the full error message
        <div className="h-[600px]">
          is provided... Remove this comment to see the full error message
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
            eventPropGetter={(event: any) => ({
              style: {
                backgroundColor: event.backgroundColor,
                borderColor: event.borderColor,
                color: event.textColor,
              },
            })}
          />
        </div>
        {/* Event Details Modal */}
        provided... Remove this comment to see the full error message
        <EventDetailsModal />
      </div>
    </div>
  );
};

export default DispatchCalendar;
