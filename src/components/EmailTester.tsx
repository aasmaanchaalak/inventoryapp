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

  const onSubmit = async (data: any) => {
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
      // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      setError('Network error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Email Service Tester
      </h2>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="mb-8">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Test Email Configuration
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <p className="text-gray-600 mb-4">
          This tool allows you to test the email service configuration. Enter an
          email address to send a test email.
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
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Test Email Address
          </label>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
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
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
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
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
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
      {result && (
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
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
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
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
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
              flag is provided... Remove this comment to see the full error
              message
              <div className="mt-2 text-sm text-green-700">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <strong>Message:</strong> {result.message}
                </p>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p>
                  // @ts-expect-error TS(17004): Cannot use JSX unless the
                  '--jsx' flag is provided... Remove this comment to see the
                  full error message
                  <strong>Message ID:</strong> {result.data?.messageId}
                </p>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
                flag is provided... Remove this comment to see the full error
                message
                <p className="mt-2">
                  Please check your email inbox for the test message.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Email Configuration Info */}
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-sm font-medium text-gray-800 mb-2">
          Email Configuration
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
            <strong>Service:</strong> Gmail SMTP
          </p>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <strong>From Email:</strong> your-email@gmail.com (configure in
            .env)
          </p>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <strong>From Name:</strong> Steel Tube Industries Ltd.
          </p>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <strong>Subject:</strong> Tax Invoice from Steel Tube Industries
            Ltd. - [Invoice Number]
          </p>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p className="mt-2 text-xs text-gray-500">
            Note: Update EMAIL_USER and EMAIL_PASS environment variables with
            your Gmail credentials. Use Gmail App Password for security.
          </p>
        </div>
      </div>
      {/* Setup Instructions */}
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
      provided... Remove this comment to see the full error message
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Setup Instructions
        </h3>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <div className="text-sm text-blue-700 space-y-2">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p>1. Create a Gmail App Password:</p>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <ul className="list-disc list-inside ml-4 space-y-1">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>Go to Google Account settings</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>Enable 2-factor authentication</li>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            <li>Generate an App Password for "Mail"</li>
          </ul>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p>2. Set environment variables:</p>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <code className="block bg-blue-100 p-2 rounded text-xs">
            EMAIL_USER=your-email@gmail.com // @ts-expect-error TS(17004):
            Cannot use JSX unless the '--jsx' flag is provided... Remove this
            comment to see the full error message
            <br />
            EMAIL_PASS=your-app-password
          </code>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag
          is provided... Remove this comment to see the full error message
          <p>3. Restart the server after setting environment variables</p>
        </div>
      </div>
    </div>
  );
};

export default EmailTester;
