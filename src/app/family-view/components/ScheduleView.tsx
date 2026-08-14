"use client";

import React, { useState, useEffect, useMemo } from "react";
import SchoolScheduleView from "./SchoolScheduleView";
import WorkScheduleView from "./WorkScheduleView";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

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

  const [activeSchedule, setActiveSchedule] = useState<"school" | "work">("school");
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

  // Auto-switch active schedule tab ("school" vs "work") based on selected member's schedule types
  useEffect(() => {
    if (activeUserId && scheduleDataResponse) {
      const list = getMemberSchedulesList(scheduleDataResponse, activeUserId);
      if (list.length > 0) {
        let hasSchool = false;
        let hasWork = false;
        for (const item of list) {
          const sType = item.ScheduleType ?? item.scheduleType;
          if (String(sType) === "1") {
            hasWork = true;
          } else {
            hasSchool = true;
          }
        }
        if (hasWork && !hasSchool) {
          setActiveSchedule("work");
        } else if (hasSchool && !hasWork) {
          setActiveSchedule("school");
        }
      }
    }
  }, [activeUserId, scheduleDataResponse]);

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

  // Generate 7 days for the selected week (Monday = index 0 .. Sunday = index 6)
  const { dateRange, parsedSchoolScheduleData, parsedWorkScheduleData } = useMemo(() => {
    const range: string[] = [];
    const schoolMap: Record<string, any[]> = {};
    const workMap: Record<string, any[]> = {};

    let curr = dayjs(currentDateStart).startOf("day");
    for (let i = 0; i < 7; i++) {
      const dStr = curr.format("YYYY-MM-DD");
      range.push(dStr);
      schoolMap[dStr] = [];
      workMap[dStr] = [];
      curr = curr.add(1, "day");
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

        // 1. School Schedule (ScheduleType 0): weekly recurring timetable mapped by Weekday
        if (transScheduleType === 0) {
          if (transWeekday !== undefined && transWeekday >= 0 && transWeekday < range.length) {
            schoolMap[range[transWeekday]].push(eventCard);
          } else if (!isDummyDate && schoolMap[dateStr]) {
            schoolMap[dateStr].push(eventCard);
          }
        }
        // 2. Work Schedule (ScheduleType 1): specific dated rotation or fallback by Weekday
        else if (transScheduleType === 1) {
          if (!isDummyDate && workMap[dateStr]) {
            workMap[dateStr].push(eventCard);
          } else if (isDummyDate && transWeekday !== undefined && transWeekday >= 0 && transWeekday < range.length) {
            workMap[range[transWeekday]].push(eventCard);
          }
        }
      });

      // Sort items on each day chronologically by startTime
      Object.keys(schoolMap).forEach((dStr) => {
        schoolMap[dStr].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
      });
      Object.keys(workMap).forEach((dStr) => {
        workMap[dStr].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
      });
    }

    return {
      dateRange: range,
      parsedSchoolScheduleData: schoolMap,
      parsedWorkScheduleData: workMap,
    };
  }, [currentDateStart, scheduleDataResponse, activeUserId]);

  const isSchool = activeSchedule === "school";
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
                  className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${isActive ? "bg-gray-700" : "bg-gray-100"} ring-2 ${isActive ? "ring-gray-800" : "ring-white"}`}
                >
                  {member.ResourceUrl ? (
                    <img
                      src={member.ResourceUrl}
                      alt={member.FirstName || member.MemberName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span
                      className={`text-xs font-bold ${isActive ? "text-white" : "text-gray-500"}`}
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
            {t(
              "Switch between school classes and work rotations",
              "Switch between school classes and work rotations",
            )}
          </p>
        </div>

        {/* Sliding Segmented Toggle Control */}
        <div className="relative flex p-1 bg-gray-100/80 rounded-2xl border border-gray-200/40 w-full sm:w-auto">
          {/* Animated active background block */}
          <div
            className={`absolute top-1 bottom-1 rounded-xl bg-white shadow-md transition-all duration-300 ease-out ${
              isSchool
                ? "left-1 w-[calc(50%-4px)] sm:w-[150px]"
                : "left-[50%] w-[calc(50%-4px)] sm:left-[154px] sm:w-[150px]"
            }`}
          />

          {/* School Schedule Button */}
          <button
            onClick={() => setActiveSchedule("school")}
            className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors duration-300 w-1/2 sm:w-[150px] ${
              isSchool ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
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
            <span>{t("School Schedule", "School Schedule")}</span>
          </button>

          {/* Work Schedule Button */}
          <button
            onClick={() => setActiveSchedule("work")}
            className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors duration-300 w-1/2 sm:w-[150px] ${
              !isSchool ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
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
            <span>{t("Work Schedule", "Work Schedule")}</span>
          </button>
        </div>
      </div>

      {/* Main Content Card with Layout Headers */}
      <div className="flex-1 bg-white rounded-lg p-5 sm:p-6 md:p-8 shadow-sm flex flex-col justify-start min-h-0">
        {/* Dynamic Inner Layout Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-gray-100 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
              {isSchool
                ? t("Work School Schedule", "Work School Schedule")
                : t("Hybrid Work Schedule", "Hybrid Work Schedule")}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              {t("Active Range", "Active Range")}
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
                {isSchool
                  ? t("School Term", "School Term")
                  : t("Work Rotation", "Work Rotation")}
              </span>
            </div>
          </div>
        </div>

        {/* Content Container with Animation Key */}
        <div
          key={isSchool ? "school" : "work"}
          className="animate-week-change flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar"
        >
          {isSchool ? (
            <SchoolScheduleView
              scheduleData={parsedSchoolScheduleData}
              dateRange={dateRange}
            />
          ) : (
            <WorkScheduleView
              scheduleData={parsedWorkScheduleData}
              dateRange={dateRange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

