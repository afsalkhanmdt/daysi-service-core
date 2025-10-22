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
  useCallback,
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
// const formatMinutesToTime = (mins: number) => {
//   if (mins >= 1440) return "24:00:00";
//   const h = Math.floor(mins / 60);
//   const m = Math.floor(mins % 60);
//   return `${pad(h)}:${pad(m)}:00`;
// };

const CalendarView = ({
  data,
  currentDate,
  setCurrentDate,
}: {
  data: FamilyData;
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
}) => {
  const { t } = useTranslation("common");
  const calendarRef = useRef<any>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const [selectedMember, setSelectedMember] = useState<number>();
  const searchParams = useSearchParams();
  const familyId = searchParams.get("familyId");
  const previousDateRef = useRef<Date>(currentDate);

  const { data: PMTaskDetails } = useFetch<PMData>(
    `PocketMoney/GetPMTasks?familyId=${familyId}`
  );
  const { data: todoData } = useFetch<ToDoTaskType[]>(
    `ToDo/GetToDos?familyId=${familyId}`
  );

  const sortedMembers = useMemo(() => {
    return [...data.Members].sort((a, b) => {
      const aType = a.MemberType;
      const bType = b.MemberType;

      // Family first
      if (aType === 1 && bType !== 1) return -1;
      if (bType === 1 && aType !== 1) return 1;

      // Admin second
      if (aType === 0 && bType !== 0) return -1;
      if (bType === 0 && aType !== 0) return 1;

      // For all others (normal members), sort by birthdate (eldest first)
      if (aType > 1 && bType > 1) {
        const aDate = new Date(a.Birthdate || "");
        const bDate = new Date(b.Birthdate || "");
        return aDate.getTime() - bDate.getTime(); // earlier = older
      }

      // keep relative order if all else equal
      return 0;
    });
  }, [data.Members]);

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
    const extractedEvents = data.Members.flatMap((member: MemberResponse) =>
      member.Events.flatMap((event: any): EventInput[] => {
        // Filter logic for family/admin members
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

        // ✅ Handle all-day events (set to 00:00 → 24:00)
        let start = new Date(Number(event.Start));
        let end = new Date(Number(event.End));

        if (event.IsAllDayEvent === 1) {
          const day = new Date(Number(event.Start));
          start = new Date(day.setHours(0, 0, 0, 0));
          end = new Date(day.setHours(24, 0, 0, 0)); // midnight next day
        }

        return [
          {
            id: event.Id,
            resourceId: String(member.Id),
            title: event.Title,
            start,
            end,
            display: "block",
            extendedProps: {
              ...event,
              participants: event.EventParticipant,
              externalCalender: event.ExternalCalendarName,
              userColorCode: member.ColorCode || "000000",
              description: event.Description || "",
              location: event.Location || "",
            },
          },
        ];
      })
    );

    // Optional: summary log for testing
    const repeatEventsCount = extractedEvents.filter(
      (e) => e.extendedProps?.RepeatEndDate
    ).length;

    return extractedEvents;
  }, [data.Members]);

  // Function to find the earliest event time for the current day
  const findEarliestEventTime = useCallback(() => {
    if (!events.length) return null;

    const currentDateString = currentDate.toDateString();
    const todaysEvents = events.filter((event) => {
      const eventDate = new Date(event.start as string);
      return eventDate.toDateString() === currentDateString;
    });

    if (!todaysEvents.length) return null;

    let earliestTime = new Date(todaysEvents[0].start as string);

    todaysEvents.forEach((event) => {
      const eventTime = new Date(event.start as string);
      if (eventTime < earliestTime) {
        earliestTime = eventTime;
      }
    });

    return earliestTime;
  }, [events, currentDate]);

  // Function to scroll to the earliest event - FIXED VERSION
  const scrollToEarliestEvent = useCallback(() => {
    const earliestEventTime = findEarliestEventTime();
    if (!earliestEventTime || !calendarRef.current?.getApi) return;

    const calendarApi = calendarRef.current.getApi();

    // Get the actual slot elements to measure real height
    const slotLanes = calendarContainerRef.current?.querySelectorAll(
      ".fc-timegrid-slots table tr"
    );

    if (!slotLanes || slotLanes.length === 0) {
      console.warn("No slot lanes found");
      return;
    }

    // Calculate position based on actual slot configuration
    const slotDurationHours = 4; // Your slotDuration is 4 hours
    const slotDurationMinutes = slotDurationHours * 60;
    const slotHeight = 120; // Your CSS slot height

    const eventHours = earliestEventTime.getHours();
    const eventMinutes = earliestEventTime.getMinutes();
    const totalMinutesFromMidnight = eventHours * 60 + eventMinutes;

    // Calculate which slot the event falls into
    const slotIndex = Math.floor(
      totalMinutesFromMidnight / slotDurationMinutes
    );

    // Calculate position within the slot (if needed for more precision)
    const minutesIntoSlot = totalMinutesFromMidnight % slotDurationMinutes;
    const positionInSlot = (minutesIntoSlot / slotDurationMinutes) * slotHeight;

    // Total scroll position
    const scrollPosition = slotIndex * slotHeight + positionInSlot;

    console.log("Scroll debugging:", {
      eventTime: earliestEventTime.toTimeString(),
      eventHours,
      eventMinutes,
      totalMinutesFromMidnight,
      slotIndex,
      minutesIntoSlot,
      positionInSlot,
      scrollPosition,
    });

    // Get the scrollable container
    const scrollContainer = calendarContainerRef.current?.querySelector(
      ".fc-timegrid-body"
    ) as HTMLElement;
    if (scrollContainer) {
      // Scroll to the calculated position with small offset
      scrollContainer.scrollTo({
        top: Math.max(0, scrollPosition - 80), // Reduced offset for better visibility
        behavior: "smooth",
      });

      console.log("Scrolling to position:", Math.max(0, scrollPosition - 80));
    }
  }, [findEarliestEventTime]);

  // Alternative approach: Use FullCalendar's built-in scrolling
  const scrollToEarliestEventAlternative = useCallback(() => {
    const earliestEventTime = findEarliestEventTime();
    if (!earliestEventTime || !calendarRef.current?.getApi) return;

    const calendarApi = calendarRef.current.getApi();

    try {
      // Vertical scroll using FullCalendar API
      calendarApi.scrollToTime({
        hours: earliestEventTime.getHours(),
        minutes: earliestEventTime.getMinutes(),
      });

      // Also scroll horizontally to the resource column
      const earliestEvent = events.find((ev) => {
        return (
          new Date(ev.start as string).toDateString() ===
            currentDate.toDateString() &&
          new Date(ev.start as string).getTime() === earliestEventTime.getTime()
        );
      });

      if (earliestEvent) {
        const resourceEl = calendarContainerRef.current?.querySelector(
          `.fc-timegrid-col[data-resource-id="${earliestEvent.resourceId}"]`
        ) as HTMLElement;

        if (resourceEl) {
          resourceEl.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center", // horizontally center that resource column
          });
        }
      }
    } catch (error) {
      console.warn(
        "FullCalendar scrollToTime failed, using manual method:",
        error
      );
      scrollToEarliestEvent(); // fallback vertical
    }
  }, [findEarliestEventTime, scrollToEarliestEvent, events, currentDate]);

  // Effect to handle date changes and scroll to earliest event
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (calendarRef.current?.getApi) {
        const api = calendarRef.current.getApi();
        api.gotoDate(currentDate);

        // Scroll to earliest event only when date actually changes
        if (
          previousDateRef.current.toDateString() !== currentDate.toDateString()
        ) {
          // Increased delay to ensure calendar has fully rendered
          setTimeout(() => {
            scrollToEarliestEventAlternative();
          }, 300);
        }

        previousDateRef.current = currentDate;
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [currentDate, scrollToEarliestEventAlternative]);

  // Debug effect to log slot information
  useEffect(() => {
    const timeout = setTimeout(() => {
      const slotLanes = calendarContainerRef.current?.querySelectorAll(
        ".fc-timegrid-slots table tr"
      );
      if (slotLanes) {
        console.log("Slot lanes found:", slotLanes.length);
        console.log(
          "First slot time:",
          slotLanes[0]?.querySelector(".fc-timegrid-slot-label")?.textContent
        );
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [currentDate]);

  // Add this useEffect to your component
  useEffect(() => {
    const handleScroll = () => {
      const timeAxis =
        calendarContainerRef.current?.querySelector(".fc-timegrid-axis");
      const slotLabels = calendarContainerRef.current?.querySelectorAll(
        ".fc-timegrid-slot-label"
      );

      if (timeAxis) {
        (timeAxis as HTMLElement).style.transform = `translateX(${
          calendarContainerRef.current?.scrollLeft || 0
        }px)`;
        (timeAxis as HTMLElement).style.zIndex = "1000"; // Very high z-index
      }

      slotLabels?.forEach((label) => {
        (label as HTMLElement).style.transform = `translateX(${
          calendarContainerRef.current?.scrollLeft || 0
        }px)`;
        (label as HTMLElement).style.zIndex = "999"; // High z-index
      });
    };

    const scrollContainer = calendarContainerRef.current;
    scrollContainer?.addEventListener("scroll", handleScroll);

    // Initial call to set positions
    handleScroll();

    return () => {
      scrollContainer?.removeEventListener("scroll", handleScroll);
    };
  }, []);
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (calendarRef.current?.getApi) {
  //       const calendarApi = calendarRef.current.getApi();

  //       // Force calendar to update its dimensions
  //       setTimeout(() => {
  //         calendarApi.updateSize();

  //         // Additional forced reflow for the calendar
  //         const calendarEl =
  //           calendarContainerRef.current?.querySelector(".fc-timegrid-body");
  //         if (calendarEl) {
  //           // Trigger reflow
  //           (calendarEl as HTMLElement).style.display = "none";
  //           (calendarEl as HTMLElement).offsetHeight; // Force reflow
  //           (calendarEl as HTMLElement).style.display = "";
  //         }
  //       }, 100);
  //     }
  //   };

  //   // Add event listeners
  //   window.addEventListener("resize", handleResize);
  //   window.addEventListener("orientationchange", handleResize);

  //   // Initial calculation after mount
  //   const initTimer = setTimeout(() => {
  //     handleResize();
  //   }, 500);

  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //     window.removeEventListener("orientationchange", handleResize);
  //     clearTimeout(initTimer);
  //   };
  // }, []);

  // // Add this useEffect to handle initial load stretching
  // useEffect(() => {
  //   // Force a recalculation after the calendar has rendered
  //   const timer = setTimeout(() => {
  //     if (calendarRef.current?.getApi) {
  //       const calendarApi = calendarRef.current.getApi();
  //       calendarApi.updateSize();

  //       // Additional DOM manipulation to ensure proper stretching
  //       const resourceCols =
  //         calendarContainerRef.current?.querySelectorAll(".fc-timegrid-col");
  //       const resourceHeaders =
  //         calendarContainerRef.current?.querySelectorAll(".fc-resource");

  //       if (resourceCols && resourceHeaders) {
  //         // Calculate available width
  //         const container = calendarContainerRef.current;
  //         if (container) {
  //           const availableWidth = container.clientWidth - 50; // Subtract time axis
  //           const columnCount = resourceCols.length;
  //           const calculatedWidth = Math.max(350, availableWidth / columnCount);

  //           // Apply calculated width
  //           resourceCols.forEach((col: Element) => {
  //             (col as HTMLElement).style.minWidth = "350px";
  //             (col as HTMLElement).style.flex = `1 1 ${calculatedWidth}px`;
  //           });

  //           resourceHeaders.forEach((header: Element) => {
  //             (header as HTMLElement).style.minWidth = "350px";
  //             (header as HTMLElement).style.flex = `1 1 ${calculatedWidth}px`;
  //           });
  //         }
  //       }
  //     }
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, [resources.length, currentDate]);

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

      <div
        ref={calendarContainerRef}
        className="hidden sm:block flex-1 relative calendar-container"
      >
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
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          slotDuration="04:00:00" // 4-hour slots
          slotLabelInterval="01:00" // Labels every hour
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // This is the key - forces 24-hour format
            meridiem: false,
          }}
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
            <div className="flex justify-between items-center w-full ">
              <div className="flex gap-1.5 items-center">
                <Image
                  src={arg.resource._resource.extendedProps.image || dp.src}
                  alt={arg.resource._resource.title || ""}
                  width={28}
                  height={28}
                  className="rounded-full w-7 h-7 border"
                />
                <div className="text-sm font-semibold truncate">
                  {arg.resource._resource.title || t("Unknown")}
                </div>
              </div>

              <div
                className="w-6 h-6 rounded-full shadow-md shadow-slate-500 "
                style={{
                  backgroundColor: `#${arg.resource._resource.extendedProps.color}`,
                }}
              />
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
