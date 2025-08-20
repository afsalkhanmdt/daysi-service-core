"use client";

import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import EventCardUI from "@/app/admin/family-view/components/EventCard";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import dp from "@/app/admin/assets/MyFamilii Brand Guide (1)-2 1.png";
import calIcon from "@/app/admin/assets/calendar-minimalistic-svgrepo-com (4) 1.svg";
import { MemberResponse } from "@/app/types/familyMemberTypes";
import { FamilyData } from "../page";
import TodoEventUi from "./TodoEventsUi";

const calendarView = ({ data }: { data: FamilyData }) => {
  const calendarRef = useRef<any>(null);
  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [currentDate, setCurrentDate] = useState(dayjs());

  const resources = data.Members.map((member: any) => ({
    id: member.Id,
    title: member.FirstName,
    image: member.ResourceUrl,
  }));

  const events = data.Members.flatMap((member: any) =>
    member.Events.map((event: any) => {
      let start = new Date(Number(event.Start));
      let end = new Date(Number(event.End));

      if (event.IsAllDayEvent === 1) {
        const dayStart = new Date(start);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(start);
        dayEnd.setHours(23, 59, 59, 999);

        start = dayStart;
        end = dayEnd;
      }

      if (event.IsSpecialEvent === 0) {
        return {
          id: event.Id,
          resourceId: member.Id,
          title: event.Title,
          start,
          end,
          display: "block",
          extendedProps: {
            IsSpecialEvent: event.IsSpecialEvent,
            IsAllDayEvent: event.IsAllDayEvent,
          },
        };
      }

      return null;
    })
  ).filter(Boolean);

  // Generate all days in month
  const getDaysInMonth = (date: dayjs.Dayjs) => {
    const start = date.startOf("month");
    const end = date.endOf("month");
    const days: dayjs.Dayjs[] = [];
    for (
      let d = start;
      d.isBefore(end) || d.isSame(end, "day");
      d = d.add(1, "day")
    ) {
      days.push(d);
    }
    return days;
  };

  const [visibleDays, setVisibleDays] = useState(getDaysInMonth(currentDate));

  const scrollToDay = (date: dayjs.Dayjs) => {
    const key = date.format("YYYY-MM-DD");
    const el = dayRefs.current[key];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const handleDayClick = (date: dayjs.Dayjs) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.gotoDate(date.toDate());
    calendarApi?.changeView("resourceTimeGridDay");
    setCurrentDate(date);
    scrollToDay(date);
  };

  const goToMonth = (date: dayjs.Dayjs) => {
    const calendarApi = calendarRef.current?.getApi();
    const firstDay = date.startOf("month");
    calendarApi?.gotoDate(firstDay.toDate());
    calendarApi?.changeView("resourceTimeGridDay");
    setCurrentDate(firstDay);
    setVisibleDays(getDaysInMonth(date));
    setTimeout(() => scrollToDay(firstDay), 50);
  };

  const handleNextMonth = () => goToMonth(currentDate.add(1, "month"));
  const handlePrevMonth = () => goToMonth(currentDate.subtract(1, "month"));
  const handleToday = () => {
    const today = dayjs();
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.gotoDate(today.toDate());
    calendarApi?.changeView("resourceTimeGridDay");
    setCurrentDate(today);
    setVisibleDays(getDaysInMonth(today));
    setTimeout(() => scrollToDay(today), 50);
  };

  return (
    <div className="p-2.5 bg-slate-100 flex flex-col h-full rounded-xl">
      <div className="bg-white p-2.5 rounded-xl gap-4 grid mb-4">
        {/* Month Navigation */}
        <div className="w-full md:flex md:justify-between grid gap-1.5 place-items-center">
          <div className="flex gap-1.5">
            <Image
              src={calIcon.src}
              alt="calendar icon"
              width={20}
              height={20}
              priority
            />
            <div className="grid place-items-center text-xl font-semibold">
              family name
            </div>
          </div>

          <div className="grid place-items-center sm:flex sm:items-center gap-1.5">
            <button
              onClick={handleToday}
              className="ml-2 px-3 py-1.5 rounded-lg bg-emerald-400 text-white hover:bg-emerald-600 text-sm font-semibold"
            >
              Today
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="px-3 py-1.5 text-sm font-semibold rounded bg-slate-100 text-zinc-600 hover:bg-slate-300"
              >
                &lt;
              </button>
              <div className="font-semibold text-lg text-center">
                {currentDate.format("MMMM YYYY")}
              </div>
              <button
                onClick={handleNextMonth}
                className="px-3 py-1.5 text-sm font-semibold rounded bg-slate-100 text-zinc-600 hover:bg-slate-300"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Days Bar */}
        <div className="mb-2 flex gap-0.5 overflow-x-auto max-w-full scroll-smooth">
          {visibleDays.map((day) => (
            <button
              key={day.format("YYYY-MM-DD")}
              ref={(el) => {
                dayRefs.current[day.format("YYYY-MM-DD")] = el;
              }}
              className={`flex flex-col items-center justify-center px-1.5 py-2 rounded-xl min-w-28 ${
                day.isSame(currentDate, "day")
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 hover:bg-blue-300"
              }`}
              onClick={() => handleDayClick(day)}
            >
              <div className="text-xs font-normal">{day.format("dddd")}</div>
              <div className="text-2xl font-bold">{day.format("D")}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar + Sidebar Wrapper */}

      {/* Calendar */}
      <div className="flex-1 overflow-y-auto relative">
        <div className=" absolute py-0.5 rounded-full left-1 top-4 w-10 flex items-center justify-center  text-xs bg-gradient-to-r from-emerald-400 to-sky-500 text-white">
          Events
        </div>
        <FullCalendar
          ref={calendarRef}
          plugins={[resourceTimeGridPlugin]}
          initialView="resourceTimeGridDay"
          initialDate={currentDate.toDate()}
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          weekends={true}
          nowIndicator={false}
          timeZone="UTC"
          height="100%"
          displayEventTime={false}
          eventOverlap={false}
          slotEventOverlap={false}
          headerToolbar={false}
          resources={resources}
          events={events}
          resourceLabelContent={(arg) => {
            return (
              <div className="flex gap-1.5 p-1.5">
                <Image
                  src={arg.resource._resource.extendedProps.image || dp.src}
                  alt={arg.resource._resource.title || ""}
                  width={28}
                  height={28}
                  className="rounded-full w-7 h-7 border"
                />
                <div className="text-sm grid place-content-center font-semibold truncate">
                  {arg.resource._resource.title || "Unknown"}
                </div>
              </div>
            );
          }}
          eventContent={(eventInfo) => <EventCardUI eventInfo={eventInfo} />}
        />
      </div>

      {/* Extra Rows (To-Do + Pocket Money) */}
      <div className="flex w-full h-40 bg-slate-100 border-dashed border-b-2 border-slate-300">
        <div className="w-14 grid place-items-center">
          <div className="text-xs px-2 rounded-xl py-0.5 bg-gradient-to-r from-emerald-400 to-sky-500 text-white ">
            To Do
          </div>
        </div>
        <div className="w-full h-full flex bg-slate-200 overflow-x-auto gap-3 p-3">
          {data.Family.ToDoFamilyGroups.map((group, index) => (
            <div key={index} className="shrink-0">
              <TodoEventUi />
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-full h-28 bg-slate-100">
        <div className="w-14   grid place-items-center">
          <div className="text-xs px-2 rounded-xl py-0.5 bg-gradient-to-r from-emerald-400 to-sky-500 text-white ">
            Pocket Money
          </div>
        </div>
        <div className="w-full h-full flex bg-slate-200 overflow-x-auto gap-3 p-3">
          {data.Family.ToDoFamilyGroups.map((group, index) => (
            <div key={index} className="shrink-0">
              <TodoEventUi />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default calendarView;
