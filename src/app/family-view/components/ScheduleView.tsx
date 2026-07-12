"use client";

import React, { useState } from "react";
import SchoolScheduleView from "./SchoolScheduleView";
import WorkScheduleView from "./WorkScheduleView";
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

  const [activeSchedule, setActiveSchedule] = useState<"school" | "work">("school");
  
  const members = data?.Members || [];
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  React.useEffect(() => {
    if (members.length > 0 && !selectedMemberId && scheduleDataResponse) {
      let defaultId = members[0].MemberId;
      for (const m of members) {
        const id = m.MemberId;
        let hasSchedules = false;
        if (Array.isArray(scheduleDataResponse)) {
          hasSchedules = scheduleDataResponse.some((t: any) => t.memberId === id || t.familyMemberId === id);
        } else if (typeof scheduleDataResponse === "object") {
          const mData = scheduleDataResponse[id];
          if (mData) {
             if (Array.isArray(mData)) {
                if (mData.length > 0) hasSchedules = true;
             } else if (mData.schedules?.length > 0 || mData.transactions?.length > 0 || mData.SHTrans?.length > 0) {
                hasSchedules = true;
             }
          }
        }
        if (hasSchedules) {
          defaultId = id;
          break;
        }
      }
      setSelectedMemberId(defaultId);
    }
  }, [members, scheduleDataResponse, selectedMemberId]);

  const activeUserId = selectedMemberId || currentUserId;

  // Parse scheduleDataResponse for School and Work schedules
  const parsedSchoolScheduleData: Record<string, any[]> = {};
  const parsedWorkScheduleData: Record<string, any[]> = {};
  const dateRange: string[] = [];

  if (scheduleDataResponse && activeUserId) {
    let memberData: any = null;
    
    // 1. Extract member data
    if (typeof scheduleDataResponse === "object" && !Array.isArray(scheduleDataResponse)) {
      memberData = scheduleDataResponse[activeUserId];
    } else if (Array.isArray(scheduleDataResponse)) {
      memberData = scheduleDataResponse.find((m: any) => m.memberId === activeUserId || m.familyMemberId === activeUserId);
      if (!memberData) {
        memberData = scheduleDataResponse.filter((t: any) => t.memberId === activeUserId || t.familyMemberId === activeUserId);
      }
    }

    // 2. Extract transactions and dates
    let allTrans: any[] = [];
    let scheduleStartDate: Date | null = null;
    let scheduleEndDate: Date | null = null;

    if (Array.isArray(memberData)) {
      allTrans = memberData;
    } else if (memberData && typeof memberData === "object") {
      if (Array.isArray(memberData.schedules)) allTrans = memberData.schedules;
      else if (Array.isArray(memberData.transactions)) allTrans = memberData.transactions;
      else if (Array.isArray(memberData.SHTrans)) allTrans = memberData.SHTrans;
      else allTrans = [memberData]; // fallback
      
      if (memberData.scheduleStartDate || memberData.createStartDate) {
        scheduleStartDate = new Date(memberData.scheduleStartDate || memberData.createStartDate);
      }
      if (memberData.scheduleEndDate || memberData.createEndDate) {
        scheduleEndDate = new Date(memberData.scheduleEndDate || memberData.createEndDate);
      }
    } else if (!memberData && Array.isArray(scheduleDataResponse)) {
      allTrans = scheduleDataResponse; // fallback to everything if we couldn't filter
    }

    // 3. Compute dates if missing
    if (!scheduleStartDate || !scheduleEndDate) {
      if (allTrans.length > 0) {
        const dates = allTrans
          .map((t) => (t.date ? new Date(t.date).getTime() : NaN))
          .filter((t) => !isNaN(t));
        if (dates.length > 0) {
          scheduleStartDate = new Date(Math.min(...dates));
          scheduleEndDate = new Date(Math.max(...dates));
        }
      }
    }

    if (!scheduleStartDate) scheduleStartDate = new Date();
    if (!scheduleEndDate) {
      scheduleEndDate = new Date(scheduleStartDate);
      scheduleEndDate.setDate(scheduleEndDate.getDate() + 6);
    }

    // 4. Generate all dates in range
    let curr = new Date(scheduleStartDate);
    curr.setHours(0, 0, 0, 0);
    const end = new Date(scheduleEndDate);
    end.setHours(0, 0, 0, 0);

    while (curr <= end) {
      const dStr = curr.toISOString().split("T")[0]; // YYYY-MM-DD
      dateRange.push(dStr);
      parsedSchoolScheduleData[dStr] = [];
      parsedWorkScheduleData[dStr] = [];
      curr.setDate(curr.getDate() + 1);
    }

    // 5. Group transactions by date
    allTrans.forEach((trans: any) => {
      const dateObj = trans.date ? new Date(trans.date) : null;
      if (!dateObj || isNaN(dateObj.getTime())) return;
      const dStr = dateObj.toISOString().split("T")[0];

      if (!parsedSchoolScheduleData[dStr]) {
        parsedSchoolScheduleData[dStr] = [];
        parsedWorkScheduleData[dStr] = [];
        if (!dateRange.includes(dStr)) {
           dateRange.push(dStr);
           dateRange.sort();
        }
      }

      const eventCard = {
        id: trans.shTransId || trans.id || Math.random(),
        title: trans.description || trans.title || trans.note || "Scheduled Event",
        time: `${trans.startTime || ""} - ${trans.endTime || ""}`,
        startTime: trans.startTime || "",
      };

      if (trans.scheduleType === 0) {
        parsedSchoolScheduleData[dStr].push(eventCard);
      } else if (trans.scheduleType === 1) {
        parsedWorkScheduleData[dStr].push(eventCard);
      }
    });

    // 6. Sort by StartTime ascending
    Object.keys(parsedSchoolScheduleData).forEach((dStr) => {
      parsedSchoolScheduleData[dStr].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    Object.keys(parsedWorkScheduleData).forEach((dStr) => {
      parsedWorkScheduleData[dStr].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
  }

  // Use parsed API data for schedules
  const schoolScheduleData = parsedSchoolScheduleData;
  const workScheduleData = parsedWorkScheduleData;

  // Setup active values based on toggle state
  const isSchool = activeSchedule === "school";
  
  // Format the overall date range for display
  const displayStartDate = dateRange.length > 0 ? dateRange[0] : "";
  const displayEndDate = dateRange.length > 0 ? dateRange[dateRange.length - 1] : "";

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

      {/* Member Switcher */}
      {members.length > 0 && (
        <div className="flex overflow-x-auto gap-4 py-4 mb-4 border-b border-gray-100 hide-scrollbar">
          {members.map((member: any) => (
            <button
              key={member.MemberId}
              onClick={() => setSelectedMemberId(member.MemberId)}
              className={`flex items-center gap-2 p-2 rounded-full transition-all border ${
                activeUserId === member.MemberId
                  ? "bg-purple-50 border-purple-200 ring-2 ring-purple-300"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                {member.ResourceUrl ? (
                  <img src={member.ResourceUrl} alt={member.MemberName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-gray-500">{member.MemberName?.charAt(0) || "U"}</span>
                )}
              </div>
              <span className={`text-sm font-semibold pr-2 whitespace-nowrap ${activeUserId === member.MemberId ? "text-purple-900" : "text-gray-600"}`}>
                {member.MemberName}
              </span>
            </button>
          ))}
        </div>
      )}

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
              Active Range
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Displayed Date Range & Subtitle */}
            <div className="flex flex-col text-left sm:text-right">
              <span className="text-xs sm:text-sm font-bold text-purple-600/90 tracking-wide">
                {displayStartDate} - {displayEndDate}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                {isSchool ? "School Term" : "Work Rotation"}
              </span>
            </div>
          </div>
        </div>

        {/* Content Container with Animation Key */}
        <div
          key={isSchool ? "school" : "work"}
          className="animate-week-change flex-grow"
        >
          {isSchool ? (
            <SchoolScheduleView scheduleData={schoolScheduleData} dateRange={dateRange} />
          ) : (
            <WorkScheduleView
              scheduleData={workScheduleData}
              dateRange={dateRange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
