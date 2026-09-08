"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import myFamiliiHeaderLogo from "@/app/admin/assets/2026-03-06 NEW MyFamilii Header - ONLY Logo Black TAG line CROP.png";
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

  return (
    <div className="h-screen max-h-screen w-full bg-white flex flex-col justify-between overflow-hidden py-3 px-4 sm:px-6 lg:px-8">
      {/* 1. Header + Banner (Pinned at top) */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center shrink-0">
        {/* Header / MyFamilii Branding */}
        <div className="w-full flex items-center justify-center pt-1 pb-3">
          <div className="relative w-[240px] sm:w-[320px] md:w-[360px] max-w-full">
            <Image
              src={myFamiliiHeaderLogo}
              alt="MyFamilii - Together Every Day"
              priority
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="w-full max-w-4xl mb-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
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
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* "Create Premium Subscription" Banner */}
        <div className="w-full max-w-4xl bg-gradient-to-r from-[#dcfce7]/80 via-[#e0f2fe]/80 to-[#dbeafe]/80 rounded-2xl py-3 px-6 text-center shadow-2xs border border-teal-100/50 mb-2">
          <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#0f3d56] tracking-tight">
            {t("Create Premium Subscription", "Create Premium Subscription")}
          </h1>
        </div>
      </div>

      {/* 2. Premium Features Area (2 Columns) - Scrollable Content Div */}
      <div className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto px-2 sm:px-4 py-2 my-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* LEFT COLUMN */}
          <div className="flex flex-col space-y-6">
            {/* Feature 1: All Freemium Features */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 text-sky-600 mt-1">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight leading-snug">
                  {t("All Freemium Features", "All Freemium Features")}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-0.5">
                  {t(
                    "All Calendar functions – Month overview, Week activitylist, Pocket Money – and more",
                    "All Calendar functions – Month overview, Week activitylist, Pocket Money – and more"
                  )}
                </p>
              </div>
            </div>

            {/* Feature 2: Import Appointments-multiple calendar */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 text-sky-600 mt-1">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight leading-snug">
                  {t(
                    "Import Appointments-multiple calendar",
                    "Import Appointments-multiple calendar"
                  )}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-0.5">
                  {t(
                    "Sync appointments from multiple external calendars into own MyFamilii calendar – iPhone, Outlook, Google, Sportmember etc.",
                    "Sync appointments from multiple external calendars into own MyFamilii calendar – iPhone, Outlook, Google, Sportmember etc."
                  )}
                </p>
              </div>
            </div>

            {/* Feature 3: To-Do Lists */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 text-sky-600 mt-1">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight leading-snug">
                  {t("To-Do Lists", "To-Do Lists")}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-0.5">
                  {t("Organize tasks for everyone.", "Organize tasks for everyone.")}
                </p>
              </div>
            </div>

            {/* Feature 4: Shared Calendars */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 text-sky-600 mt-1">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight leading-snug">
                  {t("Shared Calendars", "Shared Calendars")}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-0.5">
                  {t(
                    "Connect individual calendars across different MyFamilii families.",
                    "Connect individual calendars across different MyFamilii families."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col space-y-6">
            {/* Feature 5: School / Work Schedule */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 text-sky-600 mt-1">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight leading-snug">
                  {t("School / Work Schedule", "School / Work Schedule")}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-0.5">
                  {t("Weekly routines made visible.", "Weekly routines made visible.")}
                </p>
              </div>
            </div>

            {/* Feature 6: Web-Platform */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 text-sky-600 mt-1">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight leading-snug">
                  {t("Web-Platform", "Web-Platform")}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-0.5">
                  <span className="font-bold text-[#111827]">
                    {t("View, Create & Edit", "View, Create & Edit")}
                  </span>{" "}
                  {t(
                    "all Appointments and Tasks in Browser on Tablets & PC.",
                    "all Appointments and Tasks in Browser on Tablets & PC."
                  )}
                </p>
              </div>
            </div>

            {/* Feature 7: More Premium Features */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 text-sky-600 mt-1">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight leading-snug">
                  {t("More Premium Features", "More Premium Features")}
                </h2>
                <div className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-0.5">
                  <span className="font-bold text-[#111827] block">
                    {t(
                      "Find-My-Family, Advanced Search,",
                      "Find-My-Family, Advanced Search,"
                    )}
                  </span>
                  <span>
                    {t(
                      "Export MyFamilii Calendar to Outlook & Google Calendar.",
                      "Export MyFamilii Calendar to Outlook & Google Calendar."
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Monthly / Yearly Subscription Buttons Area (Pinned at bottom) */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 pb-2 shrink-0">
        {/* Monthly Button */}
        <button
          type="button"
          onClick={() => handleSubscribe(1)}
          disabled={loading !== null}
          className="w-full bg-gradient-to-r from-[#dcfce7]/85 via-[#e0f2fe]/85 to-[#dbeafe]/85 hover:from-[#d1fae5] hover:to-[#bfdbfe] active:scale-[0.99] border border-teal-200/60 rounded-2xl py-3.5 sm:py-4 px-6 text-center shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          <span className="text-base sm:text-lg md:text-xl font-extrabold text-[#0f3d56] tracking-tight">
            {loading === 1
              ? t("Redirecting to Stripe...", "Redirecting to Stripe...")
              : `${t("Monthly Subscription:", "Monthly Subscription:")} ${planConfig.currencySymbol} ${planConfig.monthlyDisplayPrice}`}
          </span>
        </button>

        {/* Yearly Button */}
        <button
          type="button"
          onClick={() => handleSubscribe(12)}
          disabled={loading !== null}
          className="w-full bg-gradient-to-r from-[#dcfce7]/85 via-[#e0f2fe]/85 to-[#dbeafe]/85 hover:from-[#d1fae5] hover:to-[#bfdbfe] active:scale-[0.99] border border-teal-200/60 rounded-2xl py-3.5 sm:py-4 px-6 text-center shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          <span className="text-base sm:text-lg md:text-xl font-extrabold text-[#0f3d56] tracking-tight">
            {loading === 12
              ? t("Redirecting to Stripe...", "Redirecting to Stripe...")
              : `${t("Yearly Subscription:", "Yearly Subscription:")} ${planConfig.currencySymbol} ${planConfig.yearlyDisplayPrice}`}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPage;
