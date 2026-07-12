"use client";

import React from "react";
import ScheduleCard from "./ScheduleCard";

interface SchoolScheduleViewProps {
  scheduleData: Record<string, any[]>;
}

const dayMapping = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
] as const;

export default function SchoolScheduleView({ scheduleData }: SchoolScheduleViewProps) {
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
    <div className="flex flex-col h-full">
      {/* Main schedule layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6">
        {dayMapping.map((day) => {
          const lessons = scheduleData[day.key] || [];
          return (
            <div
              key={day.key}
              className="flex flex-col bg-gray-50/50 rounded-2xl p-4 border border-gray-100/80 min-h-[350px]"
            >
              <h3 className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider mb-4 border-b border-gray-200/50 pb-2 text-center">
                {day.label}
              </h3>
              <div className="flex flex-col gap-3 flex-grow justify-start">
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
                    No classes scheduled
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
