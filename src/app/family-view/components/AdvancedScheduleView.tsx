"use client";

import React from "react";
import ScheduleCard from "./ScheduleCard";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useTranslation } from "react-i18next";

dayjs.extend(isoWeek);

export interface WeekBlock {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: {
    dateStr: string;
    dayLabel: string;
    dateLabel: string;
    shortDay: string;
    tasks: any[];
  }[];
}

interface AdvancedScheduleViewProps {
  scheduleData: Record<string, any[]>;
  dateRange: string[];
  daysPerPage?: number;
  multiWeekData?: WeekBlock[];
}

export default function AdvancedScheduleView({
  scheduleData,
  dateRange,
  daysPerPage = 0,
  multiWeekData = [],
}: AdvancedScheduleViewProps) {
  const { t } = useTranslation();

  // Helper to determine pastel color based on title or default for work/advanced
  const getCardColor = (title: string) => {
    const lowerTitle = (title || "").toString().toLowerCase();
    if (
      lowerTitle.includes("hospital") ||
      lowerTitle.includes("vagt") ||
      lowerTitle.includes("sygepleje") ||
      lowerTitle.includes("clinic")
    ) {
      return "bg-cyan-100/80 text-cyan-900 border border-cyan-200";
    }
    if (
      lowerTitle.includes("cafe") ||
      lowerTitle.includes("isbutik") ||
      lowerTitle.includes("restaurant") ||
      lowerTitle.includes("food") ||
      lowerTitle.includes("bar") ||
      lowerTitle.includes("tivoli")
    ) {
      return "bg-amber-100/80 text-amber-900 border border-amber-200";
    }
    if (
      lowerTitle.includes("home") ||
      lowerTitle.includes("remote") ||
      lowerTitle.includes("hjemmearbejde")
    ) {
      return "bg-pink-100/80 text-pink-900 border border-pink-200";
    }
    if (
      lowerTitle.includes("meeting") ||
      lowerTitle.includes("sync") ||
      lowerTitle.includes("møde")
    ) {
      return "bg-emerald-100/80 text-emerald-900 border border-emerald-200";
    }
    return "bg-purple-100/80 text-purple-900 border border-purple-200";
  };

  // ─────────────────────────────────────────────────────────────
  // Value = 1: Multi 7-Days Layout (Each column is a 7-day week)
  // ─────────────────────────────────────────────────────────────
  if (daysPerPage === 1) {
    const weeksToRender =
      multiWeekData.length > 0
        ? multiWeekData
        : [
            {
              weekNumber: dayjs(dateRange[0]).isoWeek(),
              startDate: dateRange[0],
              endDate: dateRange[dateRange.length - 1],
              days: dateRange.map((dStr) => {
                const dObj = dayjs(dStr);
                return {
                  dateStr: dStr,
                  dayLabel: dObj.format("dddd"),
                  dateLabel: dObj.format("MMM D"),
                  shortDay: dObj.format("ddd"),
                  tasks: scheduleData[dStr] || [],
                };
              }),
            },
          ];

    return (
      <div className="w-full">
        {/* Grid of 7-day week columns */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(weeksToRender.length, 4)} gap-4 pb-4`}>
          {weeksToRender.map((week, wIdx) => {
            const isCurrentWeek =
              dayjs().isAfter(dayjs(week.startDate).startOf("day")) &&
              dayjs().isBefore(dayjs(week.endDate).endOf("day"));

            return (
              <div
                key={`week-${week.weekNumber}-${wIdx}`}
                className={`flex flex-col rounded-2xl border p-3 min-h-[480px] h-full shadow-xs transition-all ${
                  isCurrentWeek
                    ? "bg-blue-50/40 border-blue-200 ring-1 ring-blue-300/60"
                    : "bg-gray-50/70 border-gray-200/80"
                }`}
              >
                {/* Column Header: 7-Day Week Summary */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-gray-900 text-white tracking-wide">
                      {t("Week", "Week")} {week.weekNumber}
                    </span>
                    {isCurrentWeek && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-full">
                        {t("Current", "Current")}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500">
                    {dayjs(week.startDate).format("MMM D")} - {dayjs(week.endDate).format("MMM D")}
                  </span>
                </div>

                {/* 7 Days Stacked Inside This Column */}
                <div className="flex flex-col gap-2.5 flex-1 justify-start">
                  {week.days.map((day) => {
                    const isToday = dayjs().format("YYYY-MM-DD") === day.dateStr;
                    return (
                      <div
                        key={day.dateStr}
                        className={`rounded-xl p-2 border transition-all ${
                          isToday
                            ? "bg-amber-50/60 border-amber-200 shadow-2xs"
                            : "bg-white border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-gray-100">
                          <span
                            className={`text-[11px] font-bold tracking-tight ${
                              isToday ? "text-amber-900 font-extrabold" : "text-gray-700"
                            }`}
                          >
                            {t(day.dayLabel, day.dayLabel)}
                          </span>
                          <span className="text-[10px] font-medium text-gray-400">
                            {day.dateLabel}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          {day.tasks.length > 0 ? (
                            day.tasks.map((task) => (
                              <ScheduleCard
                                key={task.id}
                                title={task.title}
                                time={task.time}
                                icon={task.icon}
                                note={task.note}
                                color={getCardColor(task.title)}
                              />
                            ))
                          ) : (
                            <span className="text-[10px] text-gray-300 italic py-0.5 block">
                              {t("No events", "No events")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Value = 0: Single Day per Column (7 columns: Mon -> Sun)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* 7-column grid layout (1 day in each column) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 lg:gap-2 pb-4">
        {dateRange.map((dateStr) => {
          const tasks = scheduleData[dateStr] || [];
          const dateObj = dayjs(dateStr);
          const dayLabel = dateObj.format("dddd");
          const dateLabel = dateObj.format("MMM D, YYYY");
          const isToday = dayjs().format("YYYY-MM-DD") === dateStr;

          return (
            <div
              key={dateStr}
              className={`flex flex-col rounded-2xl p-2.5 xl:p-3 border min-h-[320px] h-full ${
                isToday
                  ? "bg-amber-50/40 border-amber-200 ring-1 ring-amber-300"
                  : "bg-gray-50/60 border-gray-100/80"
              }`}
            >
              <div className="text-center mb-3 border-b border-gray-200/60 pb-2 shrink-0">
                <h3
                  className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                    isToday ? "text-amber-800" : "text-gray-700"
                  }`}
                >
                  {t(dayLabel, dayLabel)}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">
                  {dateLabel}
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-1 justify-start">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <ScheduleCard
                      key={task.id}
                      title={task.title}
                      time={task.time}
                      icon={task.icon}
                      note={task.note}
                      color={getCardColor(task.title)}
                    />
                  ))
                ) : (
                  <div className="text-xs text-gray-400 text-center py-8">
                    {t("No scheduled events", "No scheduled events")}
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
