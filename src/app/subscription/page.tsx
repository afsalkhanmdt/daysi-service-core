"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import SubscriptionHeader from "@/components/Subscription/SubscriptionHeader";
import logo from "@/app/admin/assets/DaysiEnLogo.png";
import { useTranslation } from "react-i18next";
import { getStripePlanForLocale, normalizeLocale } from "@/app/constants/stripePlans";

const SubscriptionPage = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    familyId: string;
    userId: string;
    locale: string;
  } | null>(null);

  useEffect(() => {
    const familyId = localStorage.getItem("familyId");
    const userId = localStorage.getItem("memberId");
    const storedLocale = localStorage.getItem("user_locale") || localStorage.getItem("i18nextLng");

    if (!familyId || !userId) {
      router.push("/admin/login");
    } else {
      setUserData({
        familyId,
        userId,
        locale: normalizeLocale(storedLocale || i18n.language),
      });
    }
  }, [router, i18n.language]);

  const activeLocale = useMemo(() => {
    return normalizeLocale(userData?.locale || i18n.language);
  }, [userData?.locale, i18n.language]);

  const planConfig = useMemo(() => {
    return getStripePlanForLocale(activeLocale);
  }, [activeLocale]);

  const handleSubscribe = async (months: number) => {
    const token = localStorage.getItem("access_token");
    if (!userData) {
      console.warn("[SubscriptionPage] No user data found");
      return;
    }

    setLoading(months);
    setError(null);

    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          familyId: parseInt(userData.familyId),
          userId: userData.userId,
          subscriptionMonths: months,
          locale: activeLocale,
          membersUpdatedOn: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error("[SubscriptionPage] Checkout failed:", data.error);
        throw new Error(data.error || "Failed to initiate checkout");
      }
    } catch (err: any) {
      console.error("[SubscriptionPage] Subscription Error:", err);
      setError(err.message);
      setLoading(null);
    }
  };

  const benefits = [
    t("Create, edit, and delete appointments", "Create, edit, and delete appointments"),
    t("Full access to Task management", "Full access to Task management"),
    t("Shared Family Calendar", "Shared Family Calendar"),
    t("Pocket Money tracking", "Pocket Money tracking"),
    t("No advertisements", "No advertisements"),
    t("Priority support", "Priority support"),
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <SubscriptionHeader
          title={t("Create Premium Subscription", "Create Premium Subscription")}
          description={t(
            "The Premium versions is needed, to Create & Edit Appointments and Tasks on the Web-platform",
            "The Premium versions is needed, to\nCreate & Edit Appointments and Tasks\non the Web-platform"
          )}
          logoUrl={logo.src}
        />

        {error && (
          <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4">
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
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* 1 Month Subscription */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col dark:bg-gray-800">
            <div className="px-6 py-8">
              <h3 className="text-2xl font-semibold text-gray-900 text-center dark:text-white">
                {t("Monthly Plan", "Monthly Plan")}
              </h3>
              <div className="mt-4 flex justify-center items-baseline text-6xl font-extrabold text-gray-900 dark:text-white">
                <span className="text-3xl font-medium text-gray-500 mr-1">
                  {planConfig.currencySymbol}
                </span>
                {planConfig.monthlyDisplayPrice}
                <span className="ml-1 text-2xl font-medium text-gray-500">
                  /{t("mo", "mo")}
                </span>
              </div>
            </div>
            <div className="px-6 pt-6 pb-8 flex-1 bg-gray-50 dark:bg-gray-700">
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-green-500"
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
                    <p className="ml-3 text-base text-gray-700 dark:text-gray-300">
                      {benefit}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button
                  onClick={() => handleSubscribe(1)}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading === 1
                    ? t("Redirecting to Stripe...", "Redirecting to Stripe...")
                    : t("Subscribe Monthly", "Subscribe Monthly")}
                </button>
              </div>
            </div>
          </div>

          {/* 12 Month Subscription */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-blue-500 flex flex-col dark:bg-gray-800">
            <div className="bg-blue-500 px-6 py-2">
              <p className="text-xs font-bold uppercase tracking-wide text-white text-center">
                {t("Best Value - Save 20%", "Best Value - Save 20%")}
              </p>
            </div>
            <div className="px-6 py-8">
              <h3 className="text-2xl font-semibold text-gray-900 text-center dark:text-white">
                {t("Annual Plan", "Annual Plan")}
              </h3>
              <div className="mt-4 flex justify-center items-baseline text-6xl font-extrabold text-gray-900 dark:text-white">
                <span className="text-3xl font-medium text-gray-500 mr-1">
                  {planConfig.currencySymbol}
                </span>
                {planConfig.yearlyDisplayPrice}
                <span className="ml-1 text-2xl font-medium text-gray-500">
                  /{t("yr", "yr")}
                </span>
              </div>
            </div>
            <div className="px-6 pt-6 pb-8 flex-1 bg-gray-50 dark:bg-gray-700">
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-green-500"
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
                    <p className="ml-3 text-base text-gray-700 dark:text-gray-300">
                      {benefit}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button
                  onClick={() => handleSubscribe(12)}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading === 12
                    ? t("Redirecting to Stripe...", "Redirecting to Stripe...")
                    : t("Subscribe Annually", "Subscribe Annually")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
