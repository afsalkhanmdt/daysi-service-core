'use client';

import React from 'react';
import Link from 'next/link';

const CancelPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center dark:bg-gray-800">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Payment Cancelled</h2>
        <p className="text-gray-600 mb-6 dark:text-gray-400">
          Your subscription process was cancelled. No charges were made.
        </p>
        <div className="space-y-4">
          <Link
            href="/subscription"
            className="inline-block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/admin/family-view"
            className="inline-block w-full px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;
