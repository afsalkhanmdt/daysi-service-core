"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const SuccessPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [dashboardUrl, setDashboardUrl] = useState("/admin/family-view");

  useEffect(() => {
    // Retrieve stored IDs for the dashboard link
    const familyId = localStorage.getItem("familyId");
    const memberId = localStorage.getItem("memberId");
    
    if (familyId && memberId) {
      setDashboardUrl(`/admin/family-view?familyId=${familyId}&memberId=${memberId}`);
    }

    // Clear family details cache to force a fresh fetch with Premium status
    localStorage.removeItem("familyDetailsCache");

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center dark:bg-gray-800">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
          Subscription Successful!
        </h2>
        <p className="text-gray-600 mb-6 dark:text-gray-400">
          Thank you for upgrading to Premium. Your account is being updated.
        </p>
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-500">Updating your profile...</p>
          </div>
        ) : (
          <Link
            href={dashboardUrl}
            className="inline-block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
};

const SuccessPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;
