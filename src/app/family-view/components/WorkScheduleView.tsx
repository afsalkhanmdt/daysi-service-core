"use client";

import React from "react";
import ScheduleCard from "./ScheduleCard";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface WorkScheduleViewProps {
  scheduleData: Record<string, any[]>;
  dateRange: string[];
}

export default function WorkScheduleView({ scheduleData, dateRange }: WorkScheduleViewProps) {
  const { t } = useTranslation();

  // Helper to determine pastel color based on title or default for work
  const getCardColor = (title: string) => {
    const lowerTitle = (title || "").toString().toLowerCase();
    if (lowerTitle.includes("home") || lowerTitle.includes("remote")) {
      return "bg-pink-100/70 text-pink-800 border border-pink-200";
    }
    if (lowerTitle.includes("meeting") || lowerTitle.includes("sync")) {
      return "bg-amber-100/70 text-amber-800 border border-amber-200";
    }
    return "bg-purple-100/70 text-purple-800 border border-purple-200";
  };

  return (
    <div className="w-full">
      {/* 7-column grid layout that scrolls vertically instead of horizontally */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 lg:gap-2 pb-4">
        {dateRange.map((dateStr) => {
          const tasks = scheduleData[dateStr] || [];
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
              <div className="flex flex-col gap-2 flex-1 justify-start">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <ScheduleCard
                      key={task.id}
                      title={task.title}
                      time={task.time}
                      color={getCardColor(task.title)}
                    />
                  ))
                ) : (
                  <div className="text-xs text-gray-400 text-center py-8">
                    {t("No work scheduled", "No work scheduled")}
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
