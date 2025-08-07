"use client";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import EventCardUI from "./components/EventCard";
import { useRef, useState } from "react";
import dayjs from "dayjs";

export default function FamilyPage() {
  const calendarRef = useRef<any>(null);
  const baseDate = dayjs(); // today

  const daysOfWeek = Array.from({ length: 7 }).map((_, i) =>
    baseDate.startOf("week").add(i, "day")
  );
  const handleDayClick = (date: dayjs.Dayjs) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView("timeGridDay", date.toDate());
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        {daysOfWeek.map((day) => (
          <button
            key={day.format("YYYY-MM-DD")}
            className="px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-300"
            onClick={() => handleDayClick(day)}
          >
            {day.format("ddd, MMM D")}
          </button>
        ))}
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin]}
        initialView="timeGridDay"
        initialDate={new Date()}
        slotDuration="00:30:00"
        slotLabelInterval="01:00"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        weekends={true}
        nowIndicator={true}
        height="auto"
        displayEventTime={false}
        eventOverlap={false}
        slotEventOverlap={false}
        events={[
          {
            title: "Family Breakfast",
            start: "2025-08-07T06:00:00",
            end: "2025-08-07T09:00:00",
            display: "block",
          },
          {
            title: "Morning Walk",
            start: "2025-08-07T06:30:00",
            end: "2025-08-07T15:00:00",
            display: "block",
          },
          {
            title: "Team Call",
            start: "2025-08-07T07:00:00",
            end: "2025-08-07T08:00:00",
            display: "block",
          },
        ]}
        eventContent={(eventInfo) => <EventCardUI eventInfo={eventInfo} />}
      />
    </div>
  );
}
