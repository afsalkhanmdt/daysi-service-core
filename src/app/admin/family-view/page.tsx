"use client";

import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import EventCardUI from "./components/EventCard";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import dp from "../assets/MyFamilii Brand Guide (1)-2 1.png";
import calIcon from "../assets/calendar-minimalistic-svgrepo-com (4) 1.svg";
import icon from "../assets/try.jpg";

export default function FamilyPage() {
  const calendarRef = useRef<any>(null);
  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({}); // store refs for days
  const [currentDate, setCurrentDate] = useState(dayjs());

  const people = [
    { id: "1", name: "Alice", image: icon.src },
    { id: "2", name: "Bob", image: dp.src },
    { id: "3", name: "Charlie", image: icon.src },
  ];

  const events = [
    {
      title: "Family Breakfast",
      start: "2025-08-07T06:00:00",
      end: "2025-08-07T09:00:00",
      resourceId: "1",
      display: "block",
    },
    {
      title: "Morning Walk",
      start: "2025-08-07T06:30:00",
      end: "2025-08-07T15:00:00",
      resourceId: "2",
      display: "block",
    },
    {
      title: "Team Call",
      start: "2025-08-07T07:00:00",
      end: "2025-08-07T08:00:00",
      resourceId: "3",
      display: "block",
    },
  ];

  // Generate all days in the given month
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
    scrollToDay(date); // scroll selected day into view
  };

  const goToMonth = (date: dayjs.Dayjs) => {
    const calendarApi = calendarRef.current?.getApi();
    const firstDay = date.startOf("month");
    calendarApi?.gotoDate(firstDay.toDate());
    calendarApi?.changeView("resourceTimeGridDay");
    setCurrentDate(firstDay);
    setVisibleDays(getDaysInMonth(date));
    setTimeout(() => scrollToDay(firstDay), 50); // scroll after re-render
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
    setTimeout(() => scrollToDay(today), 50); // scroll after re-render
  };

  return (
    <div className="p-4 bg-slate-100 grid gap-4">
      <div className="bg-white p-4 rounded-2xl gap-6 grid">
        {/* Month Navigation with Today */}
        <div className="w-full flex justify-between align-middle ">
          <div className="flex gap-2 ">
            <Image
              src={calIcon.src}
              alt="Next.js logo"
              width={28}
              height={28}
              priority
            />
            <div className="grid place-items-center text-3xl font-semibold">
              family name
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={handleToday}
              className="ml-4 px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              Today
            </button>
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              &lt;
            </button>
            <div className="font-semibold text-lg">
              {currentDate.format("MMMM YYYY")}
            </div>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              &gt;
            </button>
          </div>
        </div>
        {/* Scrollable Days Bar */}
        <div className="mb-4 flex gap-0.5 overflow-x-auto max-w-full scroll-smooth">
          {visibleDays.map((day) => (
            <button
              key={day.format("YYYY-MM-DD")}
              ref={(el) => {
                dayRefs.current[day.format("YYYY-MM-DD")] = el;
              }}
              className={`flex flex-col items-center justify-center px-2 py-3 rounded-2xl min-w-36 ${
                day.isSame(currentDate, "day")
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 hover:bg-blue-300"
              }`}
              onClick={() => handleDayClick(day)}
            >
              <div className="text-sm font-normal">{day.format("dddd")}</div>
              <div className="text-4xl font-bold">{day.format("D")}</div>
            </button>
          ))}
        </div>
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
        height="auto"
        displayEventTime={false}
        eventOverlap={false}
        slotEventOverlap={false}
        headerToolbar={false}
        resources={people}
        events={events}
        resourceLabelContent={(arg) => {
          const person = people.find((p) => p.id === arg.resource.id);
          return (
            <div className="flex gap-2 p-2">
              <Image
                src={person?.image || ""}
                alt={person?.name || ""}
                width={40}
                height={40}
                className="rounded-full w-10 h-10 border"
              />
              <div className="text-base grid place-content-center font-semibold truncate">
                {person?.name}
              </div>
            </div>
          );
        }}
        eventContent={(eventInfo) => <EventCardUI eventInfo={eventInfo} />}
      />
    </div>
  );
}
