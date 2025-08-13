"use client";

import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import EventCardUI from "./components/EventCard";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { getAllFamilies } from "@/services/api/apiCall";
import dp from "../assets/MyFamilii Brand Guide (1)-2 1.png";
import icon from "../assets/try.jpg";

export default function FamilyPage() {
  const calendarRef = useRef<any>(null);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const baseDate = dayjs();
  const [loading, setLoading] = useState(false);

  // People / Event Owners
  const people = [
    { id: "1", name: "Alice", image: icon.src },
    { id: "2", name: "Bob", image: dp.src },
    { id: "3", name: "Charlie", image: icon.src },
  ];

  // Events assigned to owners via resourceId
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

  const daysOfWeek = Array.from({ length: 7 }).map((_, i) =>
    baseDate.startOf("week").add(i, "day")
  );

  const handleDayClick = (date: dayjs.Dayjs) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView("resourceTimeGridDay", date.toDate());
  };

  const handleFetchFamilies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.warn("No access token found");
        setLoading(false);
        return;
      }
      const data = await getAllFamilies("935", token);
      console.log("Families API response:", data);
    } catch (error) {
      console.error("Failed to fetch families:", error);
    } finally {
      setLoading(false);
    }
  };

  // Switch to a specific day (e.g., August 15, 2025)
  const goToSpecificDate = (year: number, month: number, day: number) => {
    const calendarApi = calendarRef.current?.getApi();
    const targetDate = new Date(year, month - 1, day); // JS months are 0-indexed
    calendarApi?.gotoDate(targetDate); // Moves calendar to that day
    calendarApi?.changeView("resourceTimeGridDay"); // Optional: ensure day view
  };

  const goToDate = (date: dayjs.Dayjs) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.gotoDate(date.toDate());
    calendarApi?.changeView("resourceTimeGridDay");
    setCurrentDate(date);
  };

  const handleNextMonth = () => goToDate(currentDate.add(1, "month"));
  const handlePrevMonth = () => goToDate(currentDate.subtract(1, "month"));
  const handleToday = () => goToDate(dayjs());

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
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
      {/* Month Navigation with Today */}
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
      ;
      {/* <button
        onClick={handleFetchFamilies}
        disabled={loading}
        className={`mb-6 px-4 py-2 rounded-lg font-semibold ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        } text-white`}
      >
        {loading ? "Fetching Families..." : "Fetch Families"}
      </button> */}
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
        nowIndicator={false} // hide the red current time line
        height="auto"
        displayEventTime={false}
        eventOverlap={false}
        slotEventOverlap={false}
        headerToolbar={false} // disables default FullCalendar navigation
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
