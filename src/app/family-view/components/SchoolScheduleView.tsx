"use client";

import React from "react";
import ScheduleCard from "./ScheduleCard";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface SchoolScheduleViewProps {
  scheduleData: Record<string, any[]>;
  dateRange: string[];
}

export default function SchoolScheduleView({ scheduleData, dateRange }: SchoolScheduleViewProps) {
  const { t } = useTranslation();
  
  // Helper to determine pastel color based on period / subject
  const getCardColor = (title: string) => {
    const lowerTitle = (title || "").toString().toLowerCase();
    if (lowerTitle.includes("lunch")) {
      return "bg-amber-100/70 text-amber-800 border border-amber-200";
    }
    if (
      lowerTitle.includes("period 1") ||
      lowerTitle === "math" ||
      lowerTitle === "english" ||
      lowerTitle === "calculus"
    ) {
      return "bg-sky-100/70 text-sky-800 border border-sky-200";
    }
    if (
      lowerTitle.includes("period 2") ||
      lowerTitle === "science" ||
      lowerTitle === "physics" ||
      lowerTitle === "chemistry"
    ) {
      return "bg-purple-100/70 text-purple-800 border border-purple-200";
    }
    if (
      lowerTitle.includes("period 3") ||
      lowerTitle === "sports" ||
      lowerTitle === "gym" ||
      lowerTitle === "athletics"
    ) {
      return "bg-emerald-100/70 text-emerald-800 border border-emerald-200";
    }
    if (
      lowerTitle.includes("period 4") ||
      lowerTitle === "art" ||
      lowerTitle === "music" ||
      lowerTitle === "drama"
    ) {
      return "bg-rose-100/70 text-rose-800 border border-rose-200";
    }
    return "bg-indigo-100/70 text-indigo-850 border border-indigo-200";
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0">
      {/* 7-column grid layout that scrolls vertically instead of horizontally */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 lg:gap-2 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 pb-4">
        {dateRange.map((dateStr) => {
          const lessons = scheduleData[dateStr] || [];
          const dateObj = dayjs(dateStr);
          const dayLabel = dateObj.format("dddd");
          const dateLabel = dateObj.format("MMM D, YYYY");

          return (
            <div
              key={dateStr}
              className="flex flex-col bg-gray-50/50 rounded-2xl p-2 xl:p-3 border border-gray-100/80 min-h-[300px] h-full"
            >
              <div className="text-center mb-3 border-b border-gray-200/50 pb-2 shrink-0">
                <h3 className="text-[10px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  {dayLabel}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1">{dateLabel}</p>
              </div>
              <div className="flex flex-col gap-2 flex-1 justify-start overflow-y-auto min-h-0 pr-1 custom-scrollbar">
                {lessons.length > 0 ? (
                  lessons.map((lesson) => (
                    <ScheduleCard
                      key={lesson.id}
                      title={lesson.title}
                      time={lesson.time}
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
