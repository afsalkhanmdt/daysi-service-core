"use client";

import React from "react";

interface ScheduleCardProps {
  title: string;
  time?: string;
  color?: string;
}

export default function ScheduleCard({ title, time, color }: ScheduleCardProps) {
  // Pastel colors default: if color is provided, use it.
  // Otherwise, default to a generic soft violet slate pattern if not specified.
  const cardColorClass = color || (title.toLowerCase() === "lunch"
    ? "bg-amber-50 text-amber-800 border border-amber-100"
    : "bg-indigo-50 text-indigo-800 border border-indigo-150");

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-lg text-center shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-md cursor-pointer ${cardColorClass}`}
    >
      <span className="font-semibold text-sm sm:text-base tracking-tight leading-tight">
        {title}
      </span>
      {time && (
        <span className="text-xs font-medium opacity-80 mt-1">
          {time}
        </span>
      )}
    </div>
  );
}
