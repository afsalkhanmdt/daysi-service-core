"use client";

import React from "react";

interface ScheduleCardProps {
  id?: string | number;
  title: string;
  time?: string;
  icon?: string;
  note?: string;
  color?: string;
}

export default function ScheduleCard({
  title,
  time,
  icon,
  note,
  color,
}: ScheduleCardProps) {
  const cardColorClass =
    color ||
    (title?.toLowerCase()?.includes("lunch")
      ? "bg-amber-100/80 text-amber-900 border border-amber-200"
      : "bg-indigo-100/80 text-indigo-900 border border-indigo-200");

  return (
    <div
      className={`flex flex-col items-start text-left p-2.5 sm:p-3 rounded-xl shadow-xs transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer ${cardColorClass}`}
    >
      <div className="flex items-center gap-2 w-full">
        {icon ? (
          <div className="w-6 h-6 shrink-0 rounded-md bg-white/80 flex items-center justify-center p-0.5 border border-black/5 shadow-2xs">
            <img
              src={icon}
              alt=""
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          </div>
        ) : null}
        <span className="font-semibold text-xs sm:text-sm tracking-tight leading-snug break-words flex-1">
          {title}
        </span>
      </div>

      {time && (
        <span className="text-[11px] font-medium opacity-80 mt-1.5 flex items-center gap-1">
          <svg
            className="w-3 h-3 opacity-70 shrink-0 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {time}
        </span>
      )}

      {note && (
        <span className="text-[10px] text-gray-500 font-medium italic mt-1 line-clamp-2">
          {note}
        </span>
      )}
    </div>
  );
}

