"use client";

import React, { useState, useEffect, useMemo } from "react";
import SchoolScheduleView from "./SchoolScheduleView";
import AdvancedScheduleView, { WeekBlock } from "./AdvancedScheduleView";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useTranslation } from "react-i18next";

dayjs.extend(isoWeek);

interface ScheduleViewProps {
  data?: any;
  currentUserId?: string;
  scheduleDataResponse?: any;
}

// Helper to extract a member's schedule container from various response shapes
function getMemberScheduleContainer(scheduleDataResponse: any, memberId: string): any {
  if (!scheduleDataResponse || !memberId) return null;

  let membersArray: any[] = [];
  if (
    scheduleDataResponse.MemberSchedules &&
    Array.isArray(scheduleDataResponse.MemberSchedules)
  ) {
    membersArray = scheduleDataResponse.MemberSchedules;
  } else if (Array.isArray(scheduleDataResponse)) {
    membersArray = scheduleDataResponse;
  } else if (typeof scheduleDataResponse === "object") {
    if (scheduleDataResponse[memberId]) {
      return scheduleDataResponse[memberId];
    }
    membersArray = Object.values(scheduleDataResponse);
  }

  const found = membersArray.find(
    (m: any) =>
      m?.FamilyMemberId === memberId ||
      m?.familyMemberId === memberId ||
      m?.MemberId === memberId ||
      m?.memberId === memberId
  );

  return found || null;
}

// Helper to extract the list of schedule items for a member
function getMemberSchedulesList(scheduleDataResponse: any, memberId: string): any[] {
  const container = getMemberScheduleContainer(scheduleDataResponse, memberId);
  if (!container) return [];

  if (Array.isArray(container)) return container;
  if (Array.isArray(container.Schedules)) return container.Schedules;
  if (Array.isArray(container.schedules)) return container.schedules;
  if (Array.isArray(container.Transactions)) return container.Transactions;
  if (Array.isArray(container.transactions)) return container.transactions;
  if (Array.isArray(container.SHTrans)) return container.SHTrans;
  if (Array.isArray(container.MasterSchedules)) return container.MasterSchedules;
  if (Array.isArray(container.masterSchedules)) return container.masterSchedules;

  return [];
}

// Helper to format time strings (e.g. "08:00:00" -> "08:00")
function formatTimePart(t: string | undefined | null): string {
  if (!t) return "";
  const parts = String(t).trim().split(":");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return String(t).trim();
}

export default function ScheduleView({
  data,
  currentUserId,
  scheduleDataResponse,
}: ScheduleViewProps) {
  const { t } = useTranslation();

  // Selector 1: "simple" (Simple Schedule) | Selector 2: "advanced" (Advanced Schedule)
  const [activeSchedule, setActiveSchedule] = useState<"simple" | "advanced">("simple");
  const members = data?.Members || [];
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  // Select initial member with schedules if available
  useEffect(() => {
    if (members.length > 0) {
      if (!selectedMemberId || !members.some((m: any) => m.MemberId === selectedMemberId)) {
        let defaultId = members[0].MemberId;
        for (const m of members) {
          const list = getMemberSchedulesList(scheduleDataResponse, m.MemberId);
          if (list && list.length > 0) {
            defaultId = m.MemberId;
            break;
          }
        }
        setSelectedMemberId(defaultId);
      }
    }
  }, [members, scheduleDataResponse, selectedMemberId]);

  const activeUserId = selectedMemberId || currentUserId || (members[0]?.MemberId ?? "");

  // Auto-switch selector ("simple" vs "advanced") based on member's schedule types if available
  useEffect(() => {
    if (activeUserId && scheduleDataResponse) {
      const list = getMemberSchedulesList(scheduleDataResponse, activeUserId);
      if (list.length > 0) {
        let hasSimple = false;
        let hasAdvanced = false;
        for (const item of list) {
          const sType = item.ScheduleType ?? item.scheduleType;
          if (String(sType) === "1") {
            hasAdvanced = true;
          } else {
            hasSimple = true;
          }
        }
        if (hasAdvanced && !hasSimple) {
          setActiveSchedule("advanced");
        } else if (hasSimple && !hasAdvanced) {
          setActiveSchedule("simple");
        }
      }
    }
  }, [activeUserId, scheduleDataResponse]);

  // Extract DaysPerPage from database / memberContainer (0: One day per col, 1: Multi 7-days per col)
  const dbDaysPerPage = useMemo(() => {
    if (!scheduleDataResponse || !activeUserId) return 0;
    const memberContainer = getMemberScheduleContainer(scheduleDataResponse, activeUserId);
    const memberObj = members.find((m: any) => m.MemberId === activeUserId);
    const val =
      memberContainer?.DaysPerPage ??
      memberContainer?.daysPerPage ??
      memberObj?.DaysPerPage ??
      memberObj?.daysPerPage ??
      0;
    return Number(val) === 1 ? 1 : 0;
  }, [scheduleDataResponse, activeUserId, members]);

  // Current view start date (Monday of the current week)
  const [currentDateStart, setCurrentDateStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  });

  const prevWeek = () => {
    setCurrentDateStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const nextWeek = () => {
    setCurrentDateStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const prevMonth = () => {
    setCurrentDateStart((prev) => {
      const m = dayjs(prev).subtract(1, "month").startOf("month");
      const day = m.day();
      const diff = m.date() - day + (day === 0 ? -6 : 1);
      const start = m.date(diff).toDate();
      start.setHours(0, 0, 0, 0);
      return start;
    });
  };

  const nextMonth = () => {
    setCurrentDateStart((prev) => {
      const m = dayjs(prev).add(1, "month").startOf("month");
      const day = m.day();
      const diff = m.date() - day + (day === 0 ? -6 : 1);
      const start = m.date(diff).toDate();
      start.setHours(0, 0, 0, 0);
      return start;
    });
  };

  const jumpToToday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    setCurrentDateStart(start);
  };

  // Generate date ranges and schedule maps
  // 1. Single 7-day range for Simple Schedule and Advanced Schedule (DaysPerPage = 0)
  // 2. Multi-week 7-day columns (4 weeks) for Advanced Schedule (DaysPerPage = 1)
  const {
    dateRange,
    parsedSimpleScheduleData,
    parsedAdvancedScheduleData,
    multiWeekBlocks,
  } = useMemo(() => {
    const singleWeekRange: string[] = [];
    const simpleMap: Record<string, any[]> = {};
    const advancedMap: Record<string, any[]> = {};

    let curr = dayjs(currentDateStart).startOf("day");
    for (let i = 0; i < 7; i++) {
      const dStr = curr.format("YYYY-MM-DD");
      singleWeekRange.push(dStr);
      simpleMap[dStr] = [];
      advancedMap[dStr] = [];
      curr = curr.add(1, "day");
    }

    // Build 4 consecutive 7-day weeks for Multi 7-days view (DaysPerPage = 1)
    const multiWeeks: WeekBlock[] = [];
    let multiWeekCursor = dayjs(currentDateStart).startOf("day");
    for (let w = 0; w < 4; w++) {
      const weekStartStr = multiWeekCursor.format("YYYY-MM-DD");
      const weekEndStr = multiWeekCursor.add(6, "day").format("YYYY-MM-DD");
      const weekDays: WeekBlock["days"] = [];

      for (let d = 0; d < 7; d++) {
        const dayObj = multiWeekCursor.add(d, "day");
        const dayStr = dayObj.format("YYYY-MM-DD");
        if (!advancedMap[dayStr]) {
          advancedMap[dayStr] = [];
        }
        weekDays.push({
          dateStr: dayStr,
          dayLabel: dayObj.format("dddd"),
          dateLabel: dayObj.format("MMM D"),
          shortDay: dayObj.format("ddd"),
          tasks: [],
        });
      }

      multiWeeks.push({
        weekNumber: multiWeekCursor.isoWeek(),
        startDate: weekStartStr,
        endDate: weekEndStr,
        days: weekDays,
      });

      multiWeekCursor = multiWeekCursor.add(7, "day");
    }

    if (scheduleDataResponse && activeUserId) {
      const memberContainer = getMemberScheduleContainer(scheduleDataResponse, activeUserId);
      const allTrans = getMemberSchedulesList(scheduleDataResponse, activeUserId);

      allTrans.forEach((trans: any, idx: number) => {
        const transId =
          trans.SHTransId ??
          trans.ShTransId ??
          trans.shTransId ??
          trans.sHTransId ??
          trans.Id ??
          trans.id ??
          trans.ShMasterId ??
          trans.shMasterId ??
          `trans-${idx}`;

        const transTitle = (
          trans.Description ??
          trans.description ??
          trans.Title ??
          trans.title ??
          trans.Subject ??
          trans.subject ??
          trans.Note ??
          trans.note ??
          "Scheduled Event"
        ).trim();

        const transRawStartTime = trans.StartTime ?? trans.startTime ?? "";
        const transRawEndTime = trans.EndTime ?? trans.endTime ?? "";

        const startTimeFormatted = formatTimePart(transRawStartTime);
        const endTimeFormatted = formatTimePart(transRawEndTime);
        const timeDisplay =
          startTimeFormatted && endTimeFormatted
            ? `${startTimeFormatted} - ${endTimeFormatted}`
            : startTimeFormatted || endTimeFormatted || "";

        const transIcon =
          trans.Icon ??
          trans.icon ??
          trans.IconUrl ??
          trans.iconUrl ??
          trans.ResourceUrl ??
          trans.resourceUrl ??
          "";

        const transNote = (trans.Note ?? trans.note ?? "").trim();

        const transWeekday =
          trans.Weekday !== undefined && trans.Weekday !== null
            ? Number(trans.Weekday)
            : trans.weekday !== undefined && trans.weekday !== null
              ? Number(trans.weekday)
              : trans.DayOfWeek !== undefined && trans.DayOfWeek !== null
                ? Number(trans.DayOfWeek)
                : undefined;

        const transScheduleType =
          trans.ScheduleType !== undefined && trans.ScheduleType !== null
            ? Number(trans.ScheduleType)
            : trans.scheduleType !== undefined && trans.scheduleType !== null
              ? Number(trans.scheduleType)
              : memberContainer?.ScheduleType !== undefined && memberContainer?.ScheduleType !== null
                ? Number(memberContainer.ScheduleType)
                : 0;

        const eventCard = {
          id: transId,
          title: transTitle,
          time: timeDisplay,
          startTime: transRawStartTime,
          icon: transIcon,
          note: transNote,
          weekday: transWeekday,
          scheduleType: transScheduleType,
        };

        const transDate = trans.Date ?? trans.date;
        const dateStr = transDate ? String(transDate).substring(0, 10) : "";
        const isDummyDate =
          !dateStr ||
          dateStr.startsWith("1990-") ||
          dateStr.startsWith("1970-") ||
          dateStr.startsWith("0001-");

        // 1. Simple Schedule (ScheduleType 0): weekly recurring timetable mapped by Weekday (Monday = index 0 .. Sunday = index 6)
        if (transScheduleType === 0) {
          if (transWeekday !== undefined && transWeekday >= 0 && transWeekday < singleWeekRange.length) {
            simpleMap[singleWeekRange[transWeekday]].push(eventCard);
          } else if (!isDummyDate && simpleMap[dateStr]) {
            simpleMap[dateStr].push(eventCard);
          }
        }
        // 2. Advanced Schedule (ScheduleType 1 or explicit advanced tasks):
        else {
          if (!isDummyDate) {
            if (advancedMap[dateStr]) {
              advancedMap[dateStr].push(eventCard);
            }
          } else if (transWeekday !== undefined && transWeekday >= 0) {
            if (transWeekday < singleWeekRange.length) {
              advancedMap[singleWeekRange[transWeekday]].push(eventCard);
            }
            // Also map to multi-week blocks for matching weekday
            multiWeeks.forEach((week) => {
              if (transWeekday < week.days.length) {
                const targetDayStr = week.days[transWeekday].dateStr;
                if (!advancedMap[targetDayStr]?.some((e) => e.id === eventCard.id)) {
                  advancedMap[targetDayStr]?.push(eventCard);
                }
              }
            });
          }
        }
      });

      // Sort items on each day chronologically by startTime
      Object.keys(simpleMap).forEach((dStr) => {
        simpleMap[dStr].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
      });
      Object.keys(advancedMap).forEach((dStr) => {
        advancedMap[dStr].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
      });

      // Populate multiWeek days with sorted tasks
      multiWeeks.forEach((week) => {
        week.days.forEach((day) => {
          day.tasks = advancedMap[day.dateStr] || [];
        });
      });
    }

    return {
      dateRange: singleWeekRange,
      parsedSimpleScheduleData: simpleMap,
      parsedAdvancedScheduleData: advancedMap,
      multiWeekBlocks: multiWeeks,
    };
  }, [currentDateStart, scheduleDataResponse, activeUserId]);

  const isSimple = activeSchedule === "simple";
  const displayStartDate = dateRange.length > 0 ? dateRange[0] : "";
  const displayEndDate = dateRange.length > 0 ? dateRange[dateRange.length - 1] : "";

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 md:p-8 rounded-3xl min-h-[650px]">
      <style>{`
        @keyframes fadeInSlide {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-week-change {
          animation: fadeInSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Member Switcher */}
      {members.length > 0 && (
        <div className="flex flex-nowrap overflow-x-auto gap-4 py-4 mb-4 hide-scrollbar items-center border-b border-gray-100 pb-5">
          {members.map((member: any) => {
            const isActive = activeUserId === member.MemberId;
            return (
              <button
                key={member.MemberId}
                onClick={() => setSelectedMemberId(member.MemberId)}
                className={`relative flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-gray-900 text-white shadow-md border-transparent"
                    : "bg-white text-gray-600 border-gray-200 border hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${
                    isActive ? "bg-gray-700" : "bg-gray-100"
                  } ring-2 ${isActive ? "ring-gray-800" : "ring-white"}`}
                >
                  {member.ResourceUrl ? (
                    <img
                      src={member.ResourceUrl}
                      alt={member.FirstName || member.MemberName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span
                      className={`text-xs font-bold ${
                        isActive ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {(member.FirstName || member.MemberName)?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold pr-2 tracking-wide">
                  {member.FirstName || member.MemberName}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sticky Navigation / Toggle Header */}
      <div className="sticky top-0 z-10 bg-gray-50/95 rounded-lg backdrop-blur-md p-4 mb-6 border-b border-gray-200/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {t("Family Schedule", "Family Schedule")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            {isSimple
              ? t("Simple 7-Day School & Routine Schedule", "Simple 7-Day School & Routine Schedule")
              : dbDaysPerPage === 1
                ? t("Advanced Schedule (Multiple 7-Days per Column)", "Advanced Schedule (Multiple 7-Days per Column)")
                : t("Advanced Schedule (1 Day per Column)", "Advanced Schedule (1 Day per Column)")}
          </p>
        </div>

        {/* Sliding Segmented Toggle Control: 1: Simple Schedule , 2: Advanced Schedule */}
        <div className="relative flex p-1 bg-gray-100/80 rounded-2xl border border-gray-200/40 w-full sm:w-auto">
          {/* Animated active background block */}
          <div
            className={`absolute top-1 bottom-1 rounded-xl bg-white shadow-md transition-all duration-300 ease-out ${
              isSimple
                ? "left-1 w-[calc(50%-4px)] sm:w-[170px]"
                : "left-[50%] w-[calc(50%-4px)] sm:left-[174px] sm:w-[170px]"
            }`}
          />

          {/* 1: Simple Schedule Button */}
          <button
            onClick={() => setActiveSchedule("simple")}
            className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors duration-300 w-1/2 sm:w-[170px] ${
              isSimple ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            <span>{t("Simple Schedule", "Simple Schedule")}</span>
          </button>

          {/* 2: Advanced Schedule Button */}
          <button
            onClick={() => setActiveSchedule("advanced")}
            className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors duration-300 w-1/2 sm:w-[170px] ${
              !isSimple ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3"
              />
            </svg>
            <span>{t("Advanced Schedule", "Advanced Schedule")}</span>
          </button>
        </div>
      </div>

      {/* Main Content Card with Layout Headers */}
      <div className="flex-1 bg-white rounded-lg p-5 sm:p-6 md:p-8 shadow-sm flex flex-col justify-start min-h-0">
        {/* Dynamic Inner Layout Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-gray-100 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
              {isSimple
                ? t("Simple Schedule", "Simple Schedule")
                : t("Advanced Schedule", "Advanced Schedule")}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              {isSimple
                ? t("1 Week (7 Days)", "1 Week (7 Days)")
                : dbDaysPerPage === 1
                  ? t("Multi 7-Days Columns", "Multi 7-Days Columns")
                  : t("1 Day / Column", "1 Day / Column")}
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center bg-gray-100/70 border border-gray-200/40 rounded-xl p-1 w-fit">
              {/* Previous Month */}
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm"
                title={t("Previous Month", "Previous Month")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
                  />
                </svg>
              </button>

              {/* Previous Week */}
              <button
                onClick={prevWeek}
                className="p-2 rounded-lg transition-all duration-200 text-gray-700 hover:bg-white hover:shadow-sm"
                title={t("Previous Week", "Previous Week")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>

              {/* Jump to Current Week */}
              <button
                onClick={jumpToToday}
                className="px-3 sm:px-4 text-xs sm:text-sm font-bold text-gray-800 hover:text-purple-600 transition-colors select-none min-w-[90px] text-center"
              >
                {t("Current Week", "Current Week")}
              </button>

              {/* Next Week */}
              <button
                onClick={nextWeek}
                className="p-2 rounded-lg transition-all duration-200 text-gray-700 hover:bg-white hover:shadow-sm"
                title={t("Next Week", "Next Week")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>

              {/* Next Month */}
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm"
                title={t("Next Month", "Next Month")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l-7.5 7.5 7.5 7.5"
                  />
                </svg>
              </button>
            </div>

            {/* Displayed Date Range & Subtitle */}
            <div className="flex flex-col text-left sm:text-right">
              <span className="text-xs sm:text-sm font-bold text-purple-600/90 tracking-wide">
                {displayStartDate && displayEndDate
                  ? `${dayjs(displayStartDate).format("MMM D")} - ${dayjs(displayEndDate).format("MMM D, YYYY")}`
                  : `${displayStartDate} - ${displayEndDate}`}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                {isSimple
                  ? t("1 Week 7 Days (Mon - Sun)", "1 Week 7 Days (Mon - Sun)")
                  : dbDaysPerPage === 1
                    ? t("Multiple 7-Days Columns", "Multiple 7-Days Columns")
                    : t("1 Day / Column", "1 Day / Column")}
              </span>
            </div>
          </div>
        </div>

        {/* Content Container with Animation Key */}
        <div
          key={isSimple ? "simple" : `advanced-${dbDaysPerPage}`}
          className="animate-week-change flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar"
        >
          {isSimple ? (
            <SchoolScheduleView
              scheduleData={parsedSimpleScheduleData}
              dateRange={dateRange}
            />
          ) : (
            <AdvancedScheduleView
              scheduleData={parsedAdvancedScheduleData}
              dateRange={dateRange}
              daysPerPage={dbDaysPerPage}
              multiWeekData={multiWeekBlocks}
            />
          )}
        </div>
      </div>
    </div>
  );
}
