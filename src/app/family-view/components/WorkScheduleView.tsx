"use client";

import React from "react";

interface WorkScheduleViewProps {
  scheduleData: Record<string, string>;
  selectedWorkWeek: number;
  setSelectedWorkWeek: (week: number) => void;
}

const weekdayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  "Onsite": {
    bg: "bg-purple-100/70",
    text: "text-purple-800",
    border: "border-purple-200",
  },
  "Work from home": {
    bg: "bg-pink-100/70",
    text: "text-pink-800",
    border: "border-pink-200",
  },
  "OFF": {
    bg: "bg-[#FAF7F2]/80",
    text: "text-amber-800/80",
    border: "border-amber-250/30",
  },
};

export default function WorkScheduleView({
  scheduleData,
  selectedWorkWeek,
  setSelectedWorkWeek,
}: WorkScheduleViewProps) {
  // Pre-generate data for all 4 weeks to render the full rotation table
  const allWeeksData = [
    scheduleData,
    scheduleData,
    scheduleData,
    scheduleData,
  ];

  // Calculate statistics for the active week's scheduleData
  const activeStats = Object.values(scheduleData).reduce(
    (acc, status) => {
      if (status === "Onsite") acc.onsite++;
      else if (status === "Work from home") acc.wfh++;
      else if (status === "OFF") acc.off++;
      return acc;
    },
    { onsite: 0, wfh: 0, off: 0 }
  );

  // Normalize selectedWorkWeek for the 4-week grid highlighting (values 1 to 4)
  const highlightedWeekColumn = ((selectedWorkWeek - 1) % 4) + 1;

  return (
    <div className="flex flex-col h-full gap-6">
      {/* 4-Week Toggle Buttons Grid */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((wk) => (
          <button
            key={wk}
            onClick={() => setSelectedWorkWeek(wk)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all duration-300 ${
              highlightedWeekColumn === wk
                ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100 scale-[1.02]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            Week {wk}
          </button>
        ))}
      </div>

      {/* Stats row for the active week */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Onsite Stat */}
        <div className="flex items-center justify-between p-4 bg-purple-50/50 border border-purple-100/60 rounded-2xl transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-purple-400"></span>
            <span className="text-xs sm:text-sm font-semibold text-purple-900">Onsite Days</span>
          </div>
          <span className="text-lg font-extrabold text-purple-800">{activeStats.onsite}</span>
        </div>

        {/* WFH Stat */}
        <div className="flex items-center justify-between p-4 bg-pink-50/50 border border-pink-100/60 rounded-2xl transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-pink-400"></span>
            <span className="text-xs sm:text-sm font-semibold text-pink-900">Work from Home</span>
          </div>
          <span className="text-lg font-extrabold text-pink-800">{activeStats.wfh}</span>
        </div>

        {/* OFF Stat */}
        <div className="flex items-center justify-between p-4 bg-[#FAF7F2]/50 border border-amber-200/30 rounded-2xl transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-400/80"></span>
            <span className="text-xs sm:text-sm font-semibold text-amber-900">OFF Days</span>
          </div>
          <span className="text-lg font-extrabold text-amber-800">{activeStats.off}</span>
        </div>
      </div>

      {/* Main 4-Week Schedule Table Grid */}
      <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-left">
          <thead className="bg-gray-50/70">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Day
              </th>
              {[1, 2, 3, 4].map((wk) => (
                <th
                  key={wk}
                  className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-center transition-all duration-300 ${
                    highlightedWeekColumn === wk
                      ? "text-purple-700 bg-purple-50/40 font-extrabold"
                      : "text-gray-500"
                  }`}
                >
                  Week {wk}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {weekdayNames.map((day) => (
              <tr key={day} className="hover:bg-gray-50/30 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                  {day}
                </td>
                {[1, 2, 3, 4].map((wk) => {
                  const weekData = allWeeksData[wk - 1];
                  const status = weekData[day] || "OFF";
                  const style = statusStyles[status] || {
                    bg: "bg-gray-100",
                    text: "text-gray-800",
                    border: "border-gray-250",
                  };
                  const isHighlighted = highlightedWeekColumn === wk;

                  return (
                    <td
                      key={wk}
                      className={`px-6 py-3 whitespace-nowrap text-center transition-all duration-300 ${
                        isHighlighted ? "bg-purple-50/20" : ""
                      }`}
                    >
                      <div
                        className={`inline-block w-full max-w-[160px] px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold tracking-tight shadow-sm border transition-all duration-300 ${
                          isHighlighted
                            ? `${style.bg} ${style.text} ${style.border} ring-2 ring-purple-400/50 scale-[1.05]`
                            : `${style.bg} ${style.text} ${style.border} opacity-50`
                        }`}
                      >
                        {status}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
