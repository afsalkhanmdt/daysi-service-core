"use client";

import React, { useState } from "react";
import SchoolScheduleView from "./SchoolScheduleView";
import WorkScheduleView from "./WorkScheduleView";
import dayjs from "dayjs";
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

  const [currentDateStart, setCurrentDateStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  });
  
  const [hasInitializedDate, setHasInitializedDate] = useState(false);

  React.useEffect(() => {
    if (scheduleDataResponse && activeUserId && !hasInitializedDate) {
      let memberData: any = null;
      let membersArray: any[] = [];
      
      if (scheduleDataResponse.MemberSchedules && Array.isArray(scheduleDataResponse.MemberSchedules)) {
        membersArray = scheduleDataResponse.MemberSchedules;
      } else if (Array.isArray(scheduleDataResponse)) {
        membersArray = scheduleDataResponse;
      } else if (typeof scheduleDataResponse === "object") {
        membersArray = Object.values(scheduleDataResponse);
      }

      memberData = membersArray.find((m: any) => m.memberId === activeUserId || m.familyMemberId === activeUserId || m.FamilyMemberId === activeUserId);
      if (!memberData) {
        memberData = membersArray.filter((t: any) => t.memberId === activeUserId || t.familyMemberId === activeUserId || t.FamilyMemberId === activeUserId);
      }

      let startDate: Date | null = null;
      if (memberData && !Array.isArray(memberData)) {
        if (memberData.scheduleStartDate || memberData.createStartDate || memberData.ScheduleStartDate) {
          startDate = new Date(memberData.scheduleStartDate || memberData.createStartDate || memberData.ScheduleStartDate);
        }
      }
      
      // If we couldn't find a start date, look at transactions
      if (!startDate || isNaN(startDate.getTime())) {
        startDate = null;
        let allT: any[] = [];
        if (Array.isArray(memberData)) allT = memberData;
        else if (memberData && typeof memberData === "object") {
          if (Array.isArray(memberData.Schedules)) allT = memberData.Schedules;
          else if (Array.isArray(memberData.schedules)) allT = memberData.schedules;
          else if (Array.isArray(memberData.Transactions)) allT = memberData.Transactions;
          else if (Array.isArray(memberData.transactions)) allT = memberData.transactions;
          else if (Array.isArray(memberData.SHTrans)) allT = memberData.SHTrans;
        } else if (!memberData && membersArray.length > 0) {
          allT = membersArray;
        }
        
        if (allT.length > 0) {
          const dates = allT.map((t) => (t.Date ? new Date(t.Date).getTime() : t.date ? new Date(t.date).getTime() : NaN)).filter((t) => !isNaN(t));
          if (dates.length > 0) {
            startDate = new Date(Math.min(...dates));
          }
        }
      }

      if (startDate) {
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(startDate.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);
        setCurrentDateStart(weekStart);
      }
      setHasInitializedDate(true);
    }
  }, [scheduleDataResponse, activeUserId, hasInitializedDate]);

  const prevWeek = () => {
    setCurrentDateStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const prevMonth = () => {
    setCurrentDateStart((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      const day = newDate.getDay();
      const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
      newDate.setDate(diff);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDateStart((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      const day = newDate.getDay();
      const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
      newDate.setDate(diff);
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

  const jumpToToday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    setCurrentDateStart(start);
  };

  // Parse scheduleDataResponse for School and Work schedules
  const parsedSchoolScheduleData: Record<string, any[]> = {};
  const parsedWorkScheduleData: Record<string, any[]> = {};
  const dateRange: string[] = [];

  if (scheduleDataResponse && activeUserId) {
    let memberData: any = null;
    let membersArray: any[] = [];
    
    // 1. Extract member data
    if (scheduleDataResponse.MemberSchedules && Array.isArray(scheduleDataResponse.MemberSchedules)) {
      membersArray = scheduleDataResponse.MemberSchedules;
    } else if (Array.isArray(scheduleDataResponse)) {
      membersArray = scheduleDataResponse;
    } else if (typeof scheduleDataResponse === "object") {
      membersArray = Object.values(scheduleDataResponse);
    }

    memberData = membersArray.find((m: any) => m.memberId === activeUserId || m.familyMemberId === activeUserId || m.FamilyMemberId === activeUserId);
    if (!memberData) {
      memberData = membersArray.filter((t: any) => t.memberId === activeUserId || t.familyMemberId === activeUserId || t.FamilyMemberId === activeUserId);
    }

    // 2. Extract transactions
    let allTrans: any[] = [];
    if (Array.isArray(memberData)) {
      allTrans = memberData;
    } else if (memberData && typeof memberData === "object") {
      if (Array.isArray(memberData.Schedules)) allTrans = memberData.Schedules;
      else if (Array.isArray(memberData.schedules)) allTrans = memberData.schedules;
      else if (Array.isArray(memberData.Transactions)) allTrans = memberData.Transactions;
      else if (Array.isArray(memberData.transactions)) allTrans = memberData.transactions;
      else if (Array.isArray(memberData.SHTrans)) allTrans = memberData.SHTrans;
      else allTrans = [memberData]; 
    } else if (!memberData && Array.isArray(scheduleDataResponse)) {
      allTrans = scheduleDataResponse;
    }

    // 3. Generate the 7 days of the currently selected week
    let curr = dayjs(currentDateStart).startOf('day');
    for (let i = 0; i < 7; i++) {
      const dStr = curr.format("YYYY-MM-DD");
      dateRange.push(dStr);
      parsedSchoolScheduleData[dStr] = [];
      parsedWorkScheduleData[dStr] = [];
      curr = curr.add(1, 'day');
    }

    // 4. Group transactions by date
    allTrans.forEach((trans: any) => {
      const transDate = trans.Date || trans.date;
      if (!transDate) return;
      
      // Ensure we don't suffer from timezone shifts if backend sends ISO strings
      const dStr = typeof transDate === "string" ? transDate.substring(0, 10) : dayjs(transDate).format("YYYY-MM-DD");

      // Only push if it falls in our current viewing week, OR if you want to allow them out of range
      // We will only render what's in dateRange, but we can safely populate the object
      if (parsedSchoolScheduleData[dStr] === undefined) {
        // If it's outside the week, we can just ignore it for rendering efficiency
        return; 
      }

      const transId = trans.ShTransId || trans.shTransId || trans.Id || trans.id || Math.random();
      const transTitle = trans.Description || trans.description || trans.Title || trans.title || trans.Note || trans.note || "Scheduled Event";
      const transStartTime = trans.StartTime || trans.startTime || "";
      const transEndTime = trans.EndTime || trans.endTime || "";
      const transScheduleType = trans.ScheduleType !== undefined ? trans.ScheduleType : trans.scheduleType !== undefined ? trans.scheduleType : memberData?.ScheduleType !== undefined ? memberData.ScheduleType : memberData?.scheduleType;

      const eventCard = {
        id: transId,
        title: transTitle,
        time: `${transStartTime} - ${transEndTime}`,
        startTime: transStartTime,
      };

      if (String(transScheduleType) === "0") {
        parsedSchoolScheduleData[dStr].push(eventCard);
      } else if (String(transScheduleType) === "1") {
        parsedWorkScheduleData[dStr].push(eventCard);
      }
    });

    // 5. Sort by StartTime ascending
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
        <div className="flex flex-nowrap overflow-x-auto gap-3 py-3 mb-4 hide-scrollbar items-center border-b border-gray-100">
          {members.map((member: any) => {
            const isActive = activeUserId === member.MemberId;
            return (
              <button
                key={member.MemberId}
                onClick={() => setSelectedMemberId(member.MemberId)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-gray-900 text-white shadow-md border-transparent"
                    : "bg-white text-gray-600 border-gray-200 border hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                }`}
              >
                <div className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${isActive ? "bg-gray-700" : "bg-gray-100"} ring-2 ${isActive ? "ring-gray-800" : "ring-white"}`}>
                  {member.ResourceUrl ? (
                    <img src={member.ResourceUrl} alt={member.MemberName} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className={`text-xs font-bold ${isActive ? "text-white" : "text-gray-500"}`}>{member.MemberName?.charAt(0) || "U"}</span>
                  )}
                </div>
                <span className="text-sm font-semibold pr-1">
                  {member.MemberName}
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
            <div className="flex items-center bg-gray-100/70 border border-gray-200/40 rounded-xl p-1 w-fit">
              {/* Previous Month */}
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm"
                title="Previous Month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                </svg>
              </button>
              
              {/* Previous Week */}
              <button
                onClick={prevWeek}
                className="p-2 rounded-lg transition-all duration-200 text-gray-700 hover:bg-white hover:shadow-sm"
                title="Previous Week"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Jump to Current Week */}
              <button
                onClick={jumpToToday}
                className="px-3 sm:px-4 text-xs sm:text-sm font-bold text-gray-800 hover:text-purple-600 transition-colors select-none min-w-[90px] text-center"
              >
                Current Week
              </button>

              {/* Next Week */}
              <button
                onClick={nextWeek}
                className="p-2 rounded-lg transition-all duration-200 text-gray-700 hover:bg-white hover:shadow-sm"
                title="Next Week"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              {/* Next Month */}
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm"
                title="Next Month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l-7.5 7.5 7.5 7.5" />
                </svg>
              </button>
            </div>

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
