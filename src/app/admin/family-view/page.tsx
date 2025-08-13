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

      <button
        onClick={handleFetchFamilies}
        disabled={loading}
        className={`mb-6 px-4 py-2 rounded-lg font-semibold ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        } text-white`}
      >
        {loading ? "Fetching Families..." : "Fetch Families"}
      </button>

      <FullCalendar
        ref={calendarRef}
        plugins={[resourceTimeGridPlugin]}
        initialView="resourceTimeGridDay"
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
