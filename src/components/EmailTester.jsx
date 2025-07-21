import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const EmailTester = () => {
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
      const response = await fetch(
        'http://localhost:5000/api/invoice/test-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setResult(responseData);
      } else {
        setError(responseData.message || 'Failed to send test email');
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
        Email Service Tester
      </h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Test Email Configuration
        </h3>
        <p className="text-gray-600 mb-4">
          This tool allows you to test the email service configuration. Enter an
          email address to send a test email.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Test Email Address
          </label>
          <input
            type="email"
            id="email"
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            })}
            placeholder="Enter email address to test"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
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
              Sending Test Email...
            </div>
          ) : (
            'Send Test Email'
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
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
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
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  <strong>Message:</strong> {result.message}
                </p>
                <p>
                  <strong>Message ID:</strong> {result.data?.messageId}
                </p>
                <p className="mt-2">
                  Please check your email inbox for the test message.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Configuration Info */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="text-sm font-medium text-gray-800 mb-2">
          Email Configuration
        </h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <strong>Service:</strong> Gmail SMTP
          </p>
          <p>
            <strong>From Email:</strong> your-email@gmail.com (configure in
            .env)
          </p>
          <p>
            <strong>From Name:</strong> Steel Tube Industries Ltd.
          </p>
          <p>
            <strong>Subject:</strong> Tax Invoice from Steel Tube Industries
            Ltd. - [Invoice Number]
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Note: Update EMAIL_USER and EMAIL_PASS environment variables with
            your Gmail credentials. Use Gmail App Password for security.
          </p>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Setup Instructions
        </h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p>1. Create a Gmail App Password:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Go to Google Account settings</li>
            <li>Enable 2-factor authentication</li>
            <li>Generate an App Password for "Mail"</li>
          </ul>
          <p>2. Set environment variables:</p>
          <code className="block bg-blue-100 p-2 rounded text-xs">
            EMAIL_USER=your-email@gmail.com
            <br />
            EMAIL_PASS=your-app-password
          </code>
          <p>3. Restart the server after setting environment variables</p>
        </div>
      </div>
    </div>
  );
};

export default EmailTester;
