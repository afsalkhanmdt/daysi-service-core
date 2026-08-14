"use client";

import React from "react";
import ScheduleCard from "./ScheduleCard";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface SchoolScheduleViewProps {
  scheduleData: Record<string, any[]>;
  dateRange: string[];
}

export default function SchoolScheduleView({
  scheduleData,
  dateRange,
}: SchoolScheduleViewProps) {
  const { t } = useTranslation();

  // Helper to determine pastel color based on period / subject
  const getCardColor = (title: string) => {
    const lowerTitle = (title || "").toString().toLowerCase();
    if (
      lowerTitle.includes("lunch") ||
      lowerTitle.includes("frokost") ||
      lowerTitle.includes("mad") ||
      lowerTitle.includes("cooking")
    ) {
      return "bg-amber-100/80 text-amber-900 border border-amber-200";
    }
    if (
      lowerTitle.includes("danish") ||
      lowerTitle.includes("dansk") ||
      lowerTitle.includes("math") ||
      lowerTitle.includes("matematik") ||
      lowerTitle.includes("english") ||
      lowerTitle.includes("engelsk") ||
      lowerTitle.includes("language") ||
      lowerTitle.includes("sprog")
    ) {
      return "bg-sky-100/80 text-sky-900 border border-sky-200";
    }
    if (
      lowerTitle.includes("science") ||
      lowerTitle.includes("natur") ||
      lowerTitle.includes("fysik") ||
      lowerTitle.includes("kemi") ||
      lowerTitle.includes("physics") ||
      lowerTitle.includes("chemistry") ||
      lowerTitle.includes("biology") ||
      lowerTitle.includes("biologi")
    ) {
      return "bg-purple-100/80 text-purple-900 border border-purple-200";
    }
    if (
      lowerTitle.includes("sport") ||
      lowerTitle.includes("idræt") ||
      lowerTitle.includes("gym") ||
      lowerTitle.includes("svøm") ||
      lowerTitle.includes("football")
    ) {
      return "bg-emerald-100/80 text-emerald-900 border border-emerald-200";
    }
    if (
      lowerTitle.includes("art") ||
      lowerTitle.includes("kreativ") ||
      lowerTitle.includes("creative") ||
      lowerTitle.includes("music") ||
      lowerTitle.includes("musik") ||
      lowerTitle.includes("drama") ||
      lowerTitle.includes("photo")
    ) {
      return "bg-rose-100/80 text-rose-900 border border-rose-200";
    }
    if (
      lowerTitle.includes("christ") ||
      lowerTitle.includes("religion") ||
      lowerTitle.includes("history") ||
      lowerTitle.includes("historie")
    ) {
      return "bg-teal-100/80 text-teal-900 border border-teal-200";
    }
    return "bg-indigo-100/80 text-indigo-900 border border-indigo-200";
  };

  return (
    <div className="w-full">
      {/* 7-column grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 lg:gap-2 pb-4">
        {dateRange.map((dateStr) => {
          const lessons = scheduleData[dateStr] || [];
          const dateObj = dayjs(dateStr);
          const dayLabel = dateObj.format("dddd");
          const dateLabel = dateObj.format("MMM D, YYYY");

          return (
            <div
              key={dateStr}
              className="flex flex-col bg-gray-50/60 rounded-2xl p-2.5 xl:p-3 border border-gray-100/80 min-h-[320px] h-full"
            >
              <div className="text-center mb-3 border-b border-gray-200/60 pb-2 shrink-0">
                <h3 className="text-[10px] sm:text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  {t(dayLabel, dayLabel)}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">
                  {dateLabel}
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-1 justify-start">
                {lessons.length > 0 ? (
                  lessons.map((lesson) => (
                    <ScheduleCard
                      key={lesson.id}
                      title={lesson.title}
                      time={lesson.time}
                      icon={lesson.icon}
                      note={lesson.note}
                      color={getCardColor(lesson.title)}
                    />
                  ))
                ) : (
                  <div className="text-xs text-gray-400 text-center py-8">
                    {t("No classes scheduled", "No classes scheduled")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

