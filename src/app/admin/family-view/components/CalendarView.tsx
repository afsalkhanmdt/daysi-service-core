"use client";

import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import EventCardUI from "@/app/admin/family-view/components/EventCard";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import dp from "@/app/admin/assets/MyFamilii Brand Guide (1)-2 1.png";

import ToDoAndPMComponent, { PMData } from "./ToDoAndPMComponent";
import { EventParticipant } from "@/app/types/familyMemberTypes";

import { useFetch } from "@/app/hooks/useFetch";
import { useSearchParams } from "next/navigation";
import { FamilyData } from "./FamilyViewWrapper";

import SideBarMobileView from "./SideBarMobileView";
import MobileEventAndScrollBar from "./MobileEventAndScrollBar";
import DateScrollAndDisplay from "./DateScrollAndDisplay";
const memberOrder: Record<number, number> = {
  1: 0, // Family first
  0: 1, // FamilyAdmin second
  2: 2, // Member
  3: 3, // Shared
  4: 4, // SuperAdmin
  5: 5, // SharedAdmin
};

export type ToDoTaskType = {
  ToDoTaskId: number;
  FamilyId: number;
  CreatedBy: string;
  AssignedTo: string;
  ToDoGroupId: number;
  Description: string;
  Note: string;
  Private: boolean;
  CreatedDate: string; // ISO timestamp string
  ClosedDate: string | null; // can be null
  Status: number; // likely an enum (e.g., 0 = open, 1 = closed, etc.)
  UpdatedOn: string; // looks like a .NET ticks string
  IsForAll: boolean;
};

const calendarView = ({
  data,
  setCurrentDate,
  currentDate,
}: {
  data: FamilyData;
  currentDate: dayjs.Dayjs;
  setCurrentDate: Dispatch<SetStateAction<dayjs.Dayjs>>;
}) => {
  const calendarRef = useRef<any>(null);

  const [selectedMember, setSelectedMember] = useState<number>();
  const searchParams = useSearchParams();
  const familyId = searchParams.get("familyId");
  const {
    data: PMTaskDetails,
    loading: PMLoading,
    error: PMError,
  } = useFetch<PMData>(`PocketMoney/GetPMTasks?familyId=${familyId}`);

  const {
    data: todoData,
    loading: todoLoading,
    error: todoError,
  } = useFetch<ToDoTaskType[]>(`ToDo/GetToDos?familyId=${familyId}`);

  const sortedMembers = [...data.Members].sort(
    (a, b) => memberOrder[a.MemberType] - memberOrder[b.MemberType]
  );

  const resources = sortedMembers.map((member: any, index: number) => ({
    id: member.Id,
    title: member.FirstName,
    image: member.ResourceUrl,
    sortOrder: index, // 👈 store the order explicitly
  }));

  console.log("resources", resources);

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

  return (
    <div className="sm:p-2.5 bg-slate-100 flex flex-col sm:h-full sm:rounded-xl ">
      <DateScrollAndDisplay
        calendarRef={calendarRef}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />

      <MobileEventAndScrollBar
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        resources={resources}
        familyData={data}
        currentDate={currentDate}
      />

      {/* Calendar */}
      <div className="hidden sm:block flex-1 relative overflow-x-auto">
        <div className=" absolute py-0.5 rounded-full left-1 top-4 w-10 flex items-center justify-center  text-xs bg-gradient-to-r from-emerald-400 to-sky-500 text-white">
          Events
        </div>
        <FullCalendar
          ref={calendarRef}
          height="100%"
          contentHeight="100%"
          expandRows={true}
          resourceOrder="sortOrder"
          plugins={[resourceTimeGridPlugin]}
          initialView="resourceTimeGridDay"
          initialDate={currentDate.toDate()}
          slotDuration="04:00:00" // each slot = 4 hours
          slotLabelInterval="04:00"
          slotMinTime="08:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={false}
          weekends={true}
          nowIndicator={false}
          timeZone="UTC"
          displayEventTime={false}
          eventOverlap={false}
          slotEventOverlap={false}
          headerToolbar={false}
          resources={resources}
          events={events}
          resourceLabelContent={(arg) => {
            console.log(arg);

            return (
              <div className="flex  gap-1.5 p-1.5">
                <Image
                  src={arg.resource._resource.extendedProps.image || dp.src}
                  alt={arg.resource._resource.title || ""}
                  width={28}
                  height={28}
                  className="rounded-full w-7 h-7 border"
                />
                <div className="text-sm grid justify-start items-center font-semibold truncate w-full">
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
      {PMTaskDetails && todoData && (
        <ToDoAndPMComponent
          todoDetails={todoData}
          PMTaskDetails={PMTaskDetails}
          familyDetails={data}
          selectedMember={selectedMember}
        />
      )}
      {data && (
        <SideBarMobileView familyDetails={data} currentDate={currentDate} />
      )}
    </div>
  );
};

export default calendarView;
