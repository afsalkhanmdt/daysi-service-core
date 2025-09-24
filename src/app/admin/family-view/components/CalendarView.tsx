"use client";

import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import EventCardUI from "@/app/admin/family-view/components/EventCard";
import {
  Dispatch,
  SetStateAction,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import Image from "next/image";
import dp from "@/app/admin/assets/MyFamilii Brand Guide (1)-2 1.png";

import ToDoAndPMComponent, { PMData } from "./ToDoAndPMComponent";
import {
  EventParticipant,
  MemberResponse,
} from "@/app/types/familyMemberTypes";

import { useFetch } from "@/app/hooks/useFetch";
import { useSearchParams } from "next/navigation";
import { FamilyData } from "./FamilyViewWrapper";

import SideBarMobileView from "./SideBarMobileView";
import MobileEventAndScrollBar from "./MobileEventAndScrollBar";
import DateScrollAndDisplay from "./DateScrollAndDisplay";
import { EventInput } from "@fullcalendar/core";
import { useTranslation } from "react-i18next";

const memberOrder: Record<number, number> = {
  1: 0,
  0: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
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
  CreatedDate: string;
  ClosedDate: string | null;
  Status: number;
  UpdatedOn: string;
  IsForAll: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

// convert minutes-from-day-start to "HH:MM:SS"; allow 1440 -> "24:00:00"
const formatMinutesToTime = (mins: number) => {
  if (mins >= 1440) return "24:00:00";
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  return `${pad(h)}:${pad(m)}:00`;
};

const CalendarView = ({
  data,
  currentDate,
  setCurrentDate,
}: {
  data: FamilyData;
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
}) => {
  console.log(data, "data in calendar view");

  const { t } = useTranslation("common");
  const calendarRef = useRef<any>(null);
  const [selectedMember, setSelectedMember] = useState<number>();
  const searchParams = useSearchParams();
  const familyId = searchParams.get("familyId");

  const { data: PMTaskDetails } = useFetch<PMData>(
    `PocketMoney/GetPMTasks?familyId=${familyId}`
  );
  const { data: todoData } = useFetch<ToDoTaskType[]>(
    `ToDo/GetToDos?familyId=${familyId}`
  );

  const sortedMembers = useMemo(
    () =>
      [...data.Members].sort(
        (a, b) => memberOrder[a.MemberType] - memberOrder[b.MemberType]
      ),
    [data.Members]
  );

  const resources = useMemo(
    () =>
      sortedMembers.map((member, index) => ({
        id: String(member.Id),
        title: member.FirstName,
        image: member.ResourceUrl,
        sortOrder: index,
        color: member.ColorCode
          ? member.ColorCode.slice(-6) // take last 6 chars
          : "000000",
      })),
    [sortedMembers]
  );

  const allMemberIds = useMemo(
    () => data.Members.map((m) => String(m.Id)),
    [data.Members]
  );

  const imageUrls = useMemo(
    () =>
      data.Members.map((member) => ({
        id: member.MemberId,
        name: member.FirstName,
        imageUrl: member.ResourceUrl || dp.src,
      })),
    [data.Members]
  );

  const events: EventInput[] = useMemo(() => {
    return data.Members.flatMap((member: MemberResponse) =>
      member.Events.flatMap((event: any): EventInput[] => {
        // If member is type 1, only keep events where participants count matches members count
        if (
          member.MemberType === 1 &&
          event.EventParticipant?.length !== data.Members.length - 1
        ) {
          return [];
        }

        if (
          member.MemberType !== 1 &&
          event.EventParticipant?.length === data.Members.length - 1
        ) {
          return [];
        }

        return [
          {
            id: event.Id,
            resourceId: String(member.Id),
            title: event.Title,
            start: new Date(Number(event.Start)),
            end: new Date(Number(event.End)),
            display: "block",
            extendedProps: {
              ...event,
              participants: event.EventParticipant,
              externalCalender: event.ExternalCalendarName,
              userColorCode: member.ColorCode || "000000",
            },
          },
        ];
      })
    );
  }, [data.Members]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (calendarRef.current?.getApi) {
        const api = calendarRef.current.getApi();
        api.gotoDate(currentDate);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [currentDate]);

  const { slotMinTime, slotMaxTime } = useMemo(() => {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const intersecting = events
      .map((ev) => {
        const evStart =
          ev.start instanceof Date ? ev.start : new Date(ev.start as any);
        const evEnd = ev.end instanceof Date ? ev.end : new Date(ev.end as any);

        if (evEnd <= dayStart || evStart >= dayEnd) return null;

        const startInDay = evStart < dayStart ? dayStart : evStart;
        const endInDay = evEnd > dayEnd ? dayEnd : evEnd;
        return { startInDay, endInDay };
      })
      .filter(Boolean) as { startInDay: Date; endInDay: Date }[];

    if (intersecting.length === 0) {
      return { slotMinTime: "08:00:00", slotMaxTime: "24:00:00" };
    }

    const minutesFromDayStart = (d: Date) =>
      Math.round((d.getTime() - dayStart.getTime()) / 60000);

    const allStartMins = intersecting.map((x) =>
      minutesFromDayStart(x.startInDay)
    );
    const allEndMins = intersecting.map((x) => minutesFromDayStart(x.endInDay));

    let earliestMin = Math.min(...allStartMins);
    let latestMin = Math.max(...allEndMins);

    // Round earliestMin down to nearest 4-hour slot (240 minutes)
    const slotSize = 240; // 4 hours = 240 minutes
    earliestMin = Math.floor(earliestMin / slotSize) * slotSize;

    // We do NOT round latestMin — we keep it as is (so all later slots are still visible)
    return {
      slotMinTime: formatMinutesToTime(earliestMin),
      slotMaxTime: "24:00:00", // keep showing until end of day
    };
  }, [events, currentDate]);

  return (
    <div className="sm:p-2.5 bg-slate-100 flex flex-col sm:h-full sm:rounded-xl">
      <DateScrollAndDisplay
        familyName={data.Family.Name}
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

      <div className="hidden sm:block flex-1 relative overflow-x-auto">
        <div className="absolute p-0.5 rounded-lg left-1 top-4 w-12 flex items-center justify-center text-[13px] font-medium bg-gradient-to-r from-emerald-400 to-sky-500 text-white break-all">
          {t("Events")}
        </div>

        <FullCalendar
          ref={calendarRef}
          height="100%"
          contentHeight="100%"
          expandRows
          resourceOrder="sortOrder"
          plugins={[resourceTimeGridPlugin]}
          initialView="resourceTimeGridDay"
          initialDate={currentDate}
          slotMinTime={slotMinTime}
          slotMaxTime={slotMaxTime}
          slotDuration="06:00:00"
          slotLabelInterval="01:00"
          allDaySlot={false}
          weekends
          nowIndicator={false}
          timeZone="local"
          displayEventTime={false}
          eventOverlap={false}
          slotEventOverlap={false}
          headerToolbar={false}
          resources={resources}
          events={events}
          resourceLabelContent={(arg) => (
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-1.5 items-center">
                <Image
                  src={arg.resource._resource.extendedProps.image || dp.src}
                  alt={arg.resource._resource.title || ""}
                  width={28}
                  height={28}
                  className="rounded-full w-7 h-7 border"
                />
                <div className="text-sm font-semibold truncate w-40">
                  {arg.resource._resource.title || t("Unknown")}
                </div>
              </div>

              <div className="w-6 h-6 rounded-full border border-black shrink-0 flex items-center justify-center bg-white">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{
                    backgroundColor: `#${arg.resource._resource.extendedProps.color}`,
                  }}
                />
              </div>
            </div>
          )}
          eventContent={(eventInfo) => {
            const participants: EventParticipant[] =
              (eventInfo.event.extendedProps
                .participants as EventParticipant[]) || [];

            const participantImages = participants
              .map(
                (p) =>
                  imageUrls.find(
                    (m) => String(m.id) === String(p.ParticipantId)
                  )?.imageUrl
              )
              .filter((img): img is string => Boolean(img));

            return (
              <EventCardUI
                eventInfo={eventInfo}
                participantImages={participantImages}
              />
            );
          }}
        />
        {PMTaskDetails && todoData && (
          <div className="absolute bottom-0  hidden sm:block w-full z-20">
            <ToDoAndPMComponent
              todoDetails={todoData}
              PMTaskDetails={PMTaskDetails}
              familyDetails={data}
              selectedMember={selectedMember}
            />
          </div>
        )}
      </div>

      {PMTaskDetails && todoData && (
        <div className="sm:hidden ">
          <ToDoAndPMComponent
            todoDetails={todoData}
            PMTaskDetails={PMTaskDetails}
            familyDetails={data}
            selectedMember={selectedMember}
          />
        </div>
      )}

      {data && (
        <SideBarMobileView familyDetails={data} currentDate={currentDate} />
      )}
    </div>
  );
};

export default CalendarView;
