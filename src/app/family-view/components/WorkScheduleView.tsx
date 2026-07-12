"use client";

import React from "react";
import ScheduleCard from "./ScheduleCard";
import dayjs from "dayjs";

interface WorkScheduleViewProps {
  scheduleData: Record<string, any[]>;
  dateRange: string[];
}

export default function WorkScheduleView({ scheduleData, dateRange }: WorkScheduleViewProps) {
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
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Main schedule layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        {dateRange.map((dateStr) => {
          const tasks = scheduleData[dateStr] || [];
          const dateObj = dayjs(dateStr);
          const dayLabel = dateObj.format("dddd");
          const dateLabel = dateObj.format("MMM D, YYYY");

          return (
            <div
              key={dateStr}
              className="flex flex-col bg-gray-50/50 rounded-2xl p-4 border border-gray-100/80 min-h-[350px]"
            >
              <div className="text-center mb-4 border-b border-gray-200/50 pb-2">
                <h3 className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">
                  {dayLabel}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{dateLabel}</p>
              </div>
              <div className="flex flex-col gap-3 flex-grow justify-start">
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
                    No work scheduled
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
