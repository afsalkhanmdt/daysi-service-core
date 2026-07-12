"use client";

import React, { useState } from "react";
import SchoolScheduleView from "./SchoolScheduleView";
import WorkScheduleView from "./WorkScheduleView";
import {
  getWeekRange,
} from "../utils";
import { useFetch } from "@/app/hooks/useFetch";

interface ScheduleViewProps {
  data?: any;
  currentUserId?: string;
  scheduleDataResponse?: any;
}

export default function ScheduleView({
  data,
  currentUserId,
  scheduleDataResponse,
}: ScheduleViewProps) {
  const familyId = data?.Family?.FamilyId;

  const [activeSchedule, setActiveSchedule] = useState<"school" | "work">(
    "school",
  );

  // React state for school and work week navigations
  const [currentSchoolWeek, setCurrentSchoolWeek] = useState(1); // 1-based indexing for user visibility
  const [selectedWorkWeek, setSelectedWorkWeek] = useState(1);

  // Fetch current date ranges based on active weeks
  const schoolDateRange = getWeekRange(currentSchoolWeek - 1);
  const workDateRange = getWeekRange(selectedWorkWeek - 1);

  // Parse scheduleDataResponse for School and Work schedules
  const parsedSchoolScheduleData: Record<string, any[]> = {
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
  };
  const parsedWorkScheduleData: Record<string, string> = {
    Monday: "OFF", Tuesday: "OFF", Wednesday: "OFF", Thursday: "OFF", Friday: "OFF", Saturday: "OFF", Sunday: "OFF"
  };

  const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const capDayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (scheduleDataResponse) {
    // Determine the structure of scheduleDataResponse (array vs object mapping)
    let allTrans: any[] = [];
    if (Array.isArray(scheduleDataResponse)) {
      allTrans = scheduleDataResponse;
    } else if (typeof scheduleDataResponse === "object") {
      // If grouped by memberId, flatten it for the current user or generally
      Object.values(scheduleDataResponse).forEach((memberSchedules: any) => {
         if (Array.isArray(memberSchedules)) allTrans.push(...memberSchedules);
      });
    }

    allTrans.forEach((trans: any) => {
       const dayIndex = trans.weekday !== undefined ? trans.weekday : new Date(trans.date).getDay();
       const dayStr = dayMap[dayIndex] || "monday";
       const capDayStr = capDayMap[dayIndex] || "Monday";
       
       // Naive split between school and work based on activeSchedule toggle or keywords
       if (activeSchedule === "school") {
         parsedSchoolScheduleData[dayStr].push({
           id: trans.shTransId || trans.id || Math.random(),
           title: trans.description || trans.title || trans.note || "Scheduled Event",
           time: `${trans.startTime || ""} - ${trans.endTime || ""}`,
         });
       } else {
         // Work view expects a simple string "Onsite" | "Work from home" | "OFF"
         let status = "Onsite";
         if (trans.description?.toLowerCase().includes("home") || trans.note?.toLowerCase().includes("home")) {
           status = "Work from home";
         }
         parsedWorkScheduleData[capDayStr] = status;
       }
    });
  }

  // Use parsed API data for schedules
  const schoolScheduleData = parsedSchoolScheduleData;
  const workScheduleData = parsedWorkScheduleData;

  // Nav actions for School Schedule
  const prevSchoolWeek = () => {
    if (currentSchoolWeek > 1) {
      setCurrentSchoolWeek((prev) => prev - 1);
    }
  };

  const nextSchoolWeek = () => {
    setCurrentSchoolWeek((prev) => prev + 1);
  };

  // Nav actions for Work Schedule (Restricted 1 to 4)
  const prevWorkWeek = () => {
    if (selectedWorkWeek > 1) {
      setSelectedWorkWeek((prev) => prev - 1);
    }
  };

  const nextWorkWeek = () => {
    if (selectedWorkWeek < 4) {
      setSelectedWorkWeek((prev) => prev + 1);
    }
  };

  // Setup active values based on toggle state
  const isSchool = activeSchedule === "school";
  const activeWeekLabel = isSchool
    ? `Week ${currentSchoolWeek}`
    : `Week ${selectedWorkWeek}`;
  const activeDateRange = isSchool ? schoolDateRange : workDateRange;
  const isPrevDisabled = isSchool
    ? currentSchoolWeek <= 1
    : selectedWorkWeek <= 1;
  const isNextDisabled = isSchool ? false : selectedWorkWeek >= 4;

  const handlePrev = isSchool ? prevSchoolWeek : prevWorkWeek;
  const handleNext = isSchool ? nextSchoolWeek : nextWorkWeek;

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 md:p-8 rounded-3xl min-h-[650px]">
      {/* Inline styles for smooth custom fade/slide transition */}
      <style>{`
        @keyframes fadeInSlide {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-week-change {
          animation: fadeInSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Sticky Navigation / Toggle Header */}
      <div className="sticky top-0 z-10 bg-gray-50/95 rounded-lg backdrop-blur-md p-4 mb-6 border-b border-gray-200/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Family Schedule
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Switch between school classes and work rotations
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
            <span>School Schedule</span>
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
            <span>Work Schedule</span>
          </button>
        </div>
      </div>

      {/* Main Content Card with Layout Headers */}
      <div className="flex-1 bg-white rounded-lg p-5 sm:p-6 md:p-8 shadow-sm flex flex-col justify-start">
        {/* Dynamic Inner Layout Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
              {isSchool ? "Work School Schedule" : "Hybrid Work Schedule"}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              Weekly
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Previous / Next Arrow Control Box */}
            <div className="flex items-center bg-gray-100/70 border border-gray-200/40 rounded-xl p-1 w-fit">
              {/* Previous Button */}
              <button
                disabled={isPrevDisabled}
                onClick={handlePrev}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isPrevDisabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-white hover:shadow-sm"
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
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>

              {/* Current Week Label */}
              <span className="px-4 text-xs sm:text-sm font-bold text-gray-800 select-none min-w-[70px] text-center">
                {activeWeekLabel}
              </span>

              {/* Next Button */}
              <button
                disabled={isNextDisabled}
                onClick={handleNext}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isNextDisabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-white hover:shadow-sm"
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
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>

            {/* Displayed Date Range & Subtitle */}
            <div className="flex flex-col text-left sm:text-right">
              <span className="text-xs sm:text-sm font-bold text-purple-600/90 tracking-wide">
                {activeDateRange.startDate} - {activeDateRange.endDate}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                {isSchool ? "Session 2024-2025" : "4-Week rotation"}
              </span>
            </div>
          </div>
        </div>

        {/* Content Container with Animation Key */}
        <div
          key={
            isSchool
              ? `school-${currentSchoolWeek}`
              : `work-${selectedWorkWeek}`
          }
          className="animate-week-change flex-grow"
        >
          {isSchool ? (
            <SchoolScheduleView scheduleData={schoolScheduleData} />
          ) : (
            <WorkScheduleView
              scheduleData={workScheduleData}
              selectedWorkWeek={selectedWorkWeek}
              setSelectedWorkWeek={setSelectedWorkWeek}
            />
          )}
        </div>
      </div>
    </div>
  );
}
