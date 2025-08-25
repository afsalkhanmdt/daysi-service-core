"use client";

import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import EventCardUI from "@/app/admin/family-view/components/EventCard";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import dp from "@/app/admin/assets/MyFamilii Brand Guide (1)-2 1.png";
import calIcon from "@/app/admin/assets/calendar-minimalistic-svgrepo-com (4) 1.svg";
import { FamilyData } from "../page";
import ToDoAndPMComponent, { PMData } from "./ToDoAndPMComponent";
import { EventParticipant } from "@/app/types/familyMemberTypes";
import MobileViewComponent from "./MobileviewComponent";
import { useFetch } from "@/app/hooks/useFetch";

const calendarView = ({ data }: { data: FamilyData }) => {
  const calendarRef = useRef<any>(null);
  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedMember, setSelectedMember] = useState<number>();
  const {
    data: PMTaskDetails,
    loading,
    error,
  } = useFetch<PMData>(`PocketMoney/GetPMTasks?familyId=936`);

  const resources = data.Members.map((member: any) => ({
    id: member.Id,
    title: member.FirstName,
    image: member.ResourceUrl,
  }));

  const imageUrls = data?.Members.map((member) => ({
    id: member.MemberId,
    name: member.FirstName,
    imageUrl: member.ResourceUrl || dp.src,
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
            participants: event.EventParticipant,
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

  useEffect(() => {
    scrollToDay(currentDate);
  }, []);

  return (
    <div className="p-2.5 bg-slate-100 flex flex-col sm:h-full sm:rounded-xl ">
      <div className="bg-white p-2.5 rounded-xl gap-2 sm:gap-4 grid sm:mb-4">
        {/* Month Navigation */}
        <div className="w-full flex justify-between gap-1 sm:gap-1.5 ">
          <div className="flex gap-1 sm:gap-1.5  justify-center items-center">
            <Image
              src={calIcon.src}
              alt="calendar icon"
              width={20}
              height={20}
              priority
              className="w-4 h-4 sm:w-6 sm:h-6 "
            />
            <div className="grid  place-items-center text-lg sm:text-xl font-semibold">
              family name
            </div>
          </div>

          <div className="grid place-items-center sm:flex sm:items-center gap-1 sm:gap-1.5 ">
            <button
              onClick={handleToday}
              className="hidden sm:block ml-2 px-3 py-1.5 rounded-lg bg-emerald-400 text-white hover:bg-emerald-600 text-sm font-semibold"
            >
              Today
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className=" px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold rounded bg-slate-100 text-zinc-600 hover:bg-slate-300"
              >
                &lt;
              </button>
              <div className="font-semibold text-sm sm:text-lg text-center">
                {currentDate.format("MMMM YYYY")}
              </div>
              <button
                onClick={handleNextMonth}
                className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold rounded bg-slate-100 text-zinc-600 hover:bg-slate-300"
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
              className={`flex flex-col items-center justify-center px-0.5 py-1  sm:px-1.5 sm:py-2 rounded-xl min-w-20 sm:min-w-28 ${
                day.isSame(currentDate, "day")
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 hover:bg-blue-300"
              }`}
              onClick={() => handleDayClick(day)}
            >
              <div className="text-xs sm:text-sm font-normal">
                {day.format("dddd")}
              </div>
              <div className="text-26xl sm:text-3xl font-bold">
                {day.format("D")}
              </div>
            </button>
          ))}
        </div>
        {/* Scrollable Days Bar */}
      </div>

      <MobileViewComponent
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        resources={resources}
        familyData={data}
        currentDate={currentDate}
      />

      {/* Calendar */}
      <div className="hidden sm:block flex-1 overflow-y-auto relative">
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
          eventContent={(eventInfo) => {
            const participants: EventParticipant[] =
              (eventInfo.event.extendedProps
                .participants as EventParticipant[]) || [];

            const participantImages = participants
              .map(
                (p) =>
                  imageUrls?.find(
                    (m) => String(m.id) === String(p.ParticipantId)
                  )?.imageUrl
              )
              .filter((img): img is string => Boolean(img)); // keeps only strings

            return (
              <EventCardUI
                eventInfo={eventInfo}
                participantImages={participantImages}
              />
            );
          }}
        />
      </div>
      {/* <div className="flex overflow-x-auto h-20 sm:hidden gap-2">
        {[...Array(3)].map((_, index) => (
          <PocketMoneyEventUi />
        ))}
      </div> */}

      {PMTaskDetails && (
        <ToDoAndPMComponent
          PMTaskDetails={PMTaskDetails}
          familyDetails={data}
          selectedMember={selectedMember}
        />
      )}
    </div>
  );
};

export default calendarView;
