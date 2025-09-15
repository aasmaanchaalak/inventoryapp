import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormError } from './common';

const SMSTester = () => {
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
      const response = await fetch('http://localhost:5001/api/sms/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: data.phone,
          message: data.message,
          clientName: data.clientName,
          do2Id: data.do2Id,
          companyName: data.companyName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setResult(result);
      } else {
        setError(result.message || 'Failed to send SMS');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testDO2Notification = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5001/api/sms/test-do2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: '9876543210', // Test phone number
          clientName: 'Test Customer',
          do2Id: 'DO2-2024-001',
          companyName: 'Steel Tubes Co.',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setResult(result);
      } else {
        setError(result.message || 'Failed to send DO2 notification');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          SMS Gateway Tester
        </h2>

        {/* Configuration Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Configuration
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Gateway:</strong> MSG91
            </p>
            <p>
              <strong>API URL:</strong> https://api.msg91.com/api/v5/flow/
            </p>
            <p>
              <strong>Environment Variables Required:</strong>
            </p>
            <ul className="ml-4 list-disc">
              <li>MSG91_API_KEY - Your MSG91 API key</li>
              <li>MSG91_SENDER_ID - Sender ID (e.g., INVENTORY)</li>
              <li>MSG91_TEMPLATE_ID - Template ID for dynamic messages</li>
              <li>COMPANY_NAME - Your company name for notifications</li>
            </ul>
          </div>
        </div>

        {/* Test Custom SMS */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Test Custom SMS
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'Invalid phone number format',
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9876543210 or +919876543210"
                />
                {errors.phone && <FormError error={errors.phone} />}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  {...register('clientName', {
                    required: 'Client name is required',
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
                {errors.clientName && <FormError error={errors.clientName} />}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DO2 ID
                </label>
                <input
                  type="text"
                  {...register('do2Id', { required: 'DO2 ID is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DO2-2024-001"
                />
                {errors.do2Id && <FormError error={errors.do2Id} />}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  {...register('companyName', {
                    required: 'Company name is required',
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Steel Tubes Co."
                />
                {errors.companyName && <FormError error={errors.companyName} />}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Message (Optional)
              </label>
              <textarea
                {...register('message')}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty to use default DO2 notification format"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Custom SMS'}
              </button>

              <button
                type="button"
                onClick={testDO2Notification}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Test DO2 Notification'}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              SMS Sent Successfully
            </h3>
            <div className="text-sm text-green-800 space-y-1">
              <p>
                <strong>Message ID:</strong> {result.messageId}
              </p>
              <p>
                <strong>Status:</strong> {result.success ? 'Success' : 'Failed'}
              </p>
              <p>
                <strong>Response:</strong>
              </p>
              <pre className="bg-white p-2 rounded text-xs overflow-auto">
                {JSON.stringify(result.response, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              SMS Failed
            </h3>
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-sm font-medium text-gray-800 mb-2">How to use</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Configure MSG91 API credentials in environment variables</li>
            <li>
              • Use "Test DO2 Notification" for standard dispatch notification
            </li>
            <li>• Use "Send Custom SMS" for custom messages</li>
            <li>• Phone numbers should include country code (+91 for India)</li>
            <li>• SMS will be sent automatically when DO2 is executed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SMSTester;
