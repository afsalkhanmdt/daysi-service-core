"use client";
import dayjs from "dayjs";

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
import AllDayEventsRow from "./AllDayEventsRow";
import { EventInput } from "@fullcalendar/core";
import { useTranslation } from "react-i18next";
import ToDoAndPMComponent from "./ToDoAndPMComponent";
import EditAppointmentPopup from "./EditAppointmentPopup";
import { EventApi } from "@fullcalendar/core";
import { useResources } from "@/app/context/ResourceContext";
import {
  UserEventCreateRequest,
  UserEventUpdateRequest,
} from "@/app/types/appoinment";
import { PMData } from "@/app/types/pocketMoney";
import { ToDoTaskType } from "@/app/types/todo";
import { updateAppointmentCall } from "@/services/api";

const memberOrder: Record<number, number> = {
  1: 0,
  0: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
};

const CalendarView = ({
  data,
  currentDate,
  setCurrentDate,
  dataReload,
}: {
  data: FamilyData;
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  dataReload: () => void;
}) => {
  const { resources, setMembers } = useResources();

  const formattedResources = resources.map((r) => ({
    ...r,
    id: String(r.id),
  }));

  const { t } = useTranslation("common");
  const calendarRef = useRef<any>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const [selectedMember, setSelectedMember] = useState<number>();
  const searchParams = useSearchParams();
  const familyId = searchParams.get("familyId");
  const previousDateRef = useRef<Date>(currentDate);

  const [showEditAppointment, setShowEditAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<EventApi | null>(null);
  const [selectedRawEvent, setSelectedRawEvent] = useState<any>(null);

  useEffect(() => {
    if (selectedRawEvent) {
      console.log(
        "CalendarView: selectedRawEvent for EditAppointmentPopup:",
        selectedRawEvent,
      );
    }
    if (selectedAppointment) {
      console.log(
        "CalendarView: selectedAppointment for EditAppointmentPopup:",
        selectedAppointment,
      );
    }
  }, [selectedRawEvent, selectedAppointment]);

  const { data: PMTaskDetails } = useFetch<PMData>(
    `PocketMoney/GetPMTasks?familyId=${familyId}`,
  );
  const { data: todoData } = useFetch<ToDoTaskType[]>(
    `ToDo/GetToDos?familyId=${familyId}`,
  );

  const handleRawEventClick = useCallback((event: any) => {
    setSelectedRawEvent(event);
    setShowEditAppointment(true);
  }, []);

  const imageUrls = useMemo(
    () =>
      data.Members.map((member) => ({
        id: member.MemberId,
        name: member.FirstName,
        imageUrl: member.ResourceUrl || dp.src,
      })),
    [data.Members],
  );

  const events: EventInput[] = useMemo(() => {
    const allEvents: EventInput[] = [];
    const seenEventMemberPairs = new Set<string>(); // Track eventId-memberId pairs
    const duplicateWarnings = new Set<string>(); // Track already warned duplicates

    data.Members.forEach((member: MemberResponse) => {
      // Track events per member to avoid duplicates within same member
      const memberEvents = new Map<string, any>();

      member.Events.forEach((event) => {
        const eventKey = `${event.Id}-${member.Id}`;

        // Skip if we've already processed this event for this member
        if (seenEventMemberPairs.has(eventKey)) {
          if (!duplicateWarnings.has(eventKey)) {
            console.warn(
              `Skipping duplicate event ${event.Id} for member ${member.Id} (${member.FirstName})`,
            );
            duplicateWarnings.add(eventKey);
          }
          return;
        }

        seenEventMemberPairs.add(eventKey);

        // Your existing filtering logic
        if (
          member.MemberType === 1 &&
          event.EventParticipant?.length !== data.Members.length - 1
        ) {
          return;
        }

        if (
          member.MemberType !== 1 &&
          event.EventParticipant?.length === data.Members.length - 1
        ) {
          return;
        }

        let start = new Date(Number(event.Start));
        let end = new Date(Number(event.End));

        if (event.IsAllDayEvent === 1) {
          const day = new Date(start);
          start = new Date(day.setHours(0, 0, 0, 0));
          end = new Date(day.setHours(24, 0, 0, 0));
        }

        /* ==========================
         Base Event
      ========================== */
        const baseEvent: EventInput = {
          id: String(event.Id),
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
            isRecurrence: false,
          },
        };

        /* ==========================
         Recurrence Events
      ========================== */
        const recurrenceEvents: EventInput[] = [];
        const rule = event.RecurrenceRule;
        const repeatEnd = event.RepeatEndDate
          ? new Date(Number(event.RepeatEndDate))
          : null;

        if (rule && rule.Frequency > 0 && repeatEnd) {
          let currentStart = new Date(start);
          let currentEnd = new Date(end);

          const addInterval = () => {
            switch (rule.Frequency) {
              case 1:
                currentStart.setDate(currentStart.getDate() + rule.Interval);
                currentEnd.setDate(currentEnd.getDate() + rule.Interval);
                break;
              case 2:
                currentStart.setDate(
                  currentStart.getDate() + 7 * rule.Interval,
                );
                currentEnd.setDate(currentEnd.getDate() + 7 * rule.Interval);
                break;
              case 3:
                currentStart.setMonth(currentStart.getMonth() + rule.Interval);
                currentEnd.setMonth(currentEnd.getMonth() + rule.Interval);
                break;
              case 4:
                currentStart.setFullYear(
                  currentStart.getFullYear() + rule.Interval,
                );
                currentEnd.setFullYear(
                  currentEnd.getFullYear() + rule.Interval,
                );
                break;
            }
          };

          // skip base event
          addInterval();

          while (currentStart <= repeatEnd) {
            const recurrenceId = `${event.Id}-${currentStart.getTime()}-${
              member.Id
            }`;
            recurrenceEvents.push({
              ...baseEvent,
              id: recurrenceId,
              start: new Date(currentStart),
              end: new Date(currentEnd),
              extendedProps: {
                ...baseEvent.extendedProps,
                isRecurrence: true,
              },
            });

            addInterval();
          }
        }

        allEvents.push(baseEvent, ...recurrenceEvents);
      });
    });

    // Check for any remaining duplicate IDs (should be 0)
    const eventIds = allEvents.map((e) => e.id);
    const duplicateIds = eventIds.filter(
      (id, index) => eventIds.indexOf(id) !== index,
    );
    if (duplicateIds.length > 0) {
      console.error(
        `Found ${duplicateIds.length} duplicate event IDs in final array:`,
        [...new Set(duplicateIds)],
      );
    }

    return allEvents;
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
      ".fc-timegrid-slots table tr",
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
      totalMinutesFromMidnight / slotDurationMinutes,
    );

    // Calculate position within the slot (if needed for more precision)
    const minutesIntoSlot = totalMinutesFromMidnight % slotDurationMinutes;
    const positionInSlot = (minutesIntoSlot / slotDurationMinutes) * slotHeight;

    // Total scroll position
    const scrollPosition = slotIndex * slotHeight + positionInSlot;

    // Get the scrollable container
    const scrollContainer = calendarContainerRef.current?.querySelector(
      ".fc-timegrid-body",
    ) as HTMLElement;
    if (scrollContainer) {
      // Scroll to the calculated position with small offset
      scrollContainer.scrollTo({
        top: Math.max(0, scrollPosition - 80), // Reduced offset for better visibility
        behavior: "smooth",
      });
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
          `.fc-timegrid-col[data-resource-id="${earliestEvent.resourceId}"]`,
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
        error,
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
        ".fc-timegrid-slots table tr",
      );
    }, 500);

    return () => clearTimeout(timeout);
  }, [currentDate]);

  // Add this useEffect to your component
  useEffect(() => {
    const handleScroll = () => {
      const timeAxis =
        calendarContainerRef.current?.querySelector(".fc-timegrid-axis");
      const slotLabels = calendarContainerRef.current?.querySelectorAll(
        ".fc-timegrid-slot-label",
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

  const handleEditAppointment = async (
    appointmentData: UserEventUpdateRequest,
  ) => {
    // Create a new object with all the added values
    const updatedAppointmentData = {
      ...appointmentData,
      addedBy: data?.Family.MemberId,
      familyUserId: data.Family.MemberId,
      familyId: Number(familyId),
      locale:
        data?.Members?.find((m) => m.MemberId === data.Family.MemberId)
          ?.Locale || "en",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offSet: dayjs().format("Z"),
      eventsUpdatedOn: new Date().toISOString(),
      // Add other default values you need
      participants: appointmentData.participants || [],
      isForAll: appointmentData.isForAll || 0,
      isAllDayEvent: appointmentData.isAllDayEvent || 0,
      isSpecialEvent: appointmentData.isSpecialEvent || 0,
      isPrivateEvent: appointmentData.isPrivateEvent || 0,
      recurrenceRule: appointmentData.recurrenceRule || {
        frequency: 0,
        interval: 1,
      },
      noPush: appointmentData.noPush || false,
    };

    const response = await updateAppointmentCall(updatedAppointmentData);
    if (response.ok) {
      dataReload();
    }

    // Now call your API with the updated data
    // Example: createAppointmentAPI(updatedAppointmentData).then(() => reload());
  };

  useEffect(() => {
    if (data?.Members?.length) {
      setMembers(data.Members);
    }
  }, [data.Members, setMembers]);

  return (
    <div className="sm:p-2.5 bg-slate-100 flex flex-col sm:h-full sm:rounded-xl">
      <DateScrollAndDisplay
        familyName={data.Family.Name}
        calendarRef={calendarRef}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />

      <AllDayEventsRow
        data={data}
        currentDate={currentDate}
        onEventClick={handleRawEventClick}
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
          resourceAreaWidth="300px"
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
          resources={formattedResources}
          events={events}
          resourceLabelContent={(arg) => (
            <div className="flex justify-between items-center w-full ">
              <div className="flex gap-1.5 items-center">
                <Image
                  unoptimized
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
                    (m) => String(m.id) === String(p.ParticipantId),
                  )?.imageUrl,
              )
              .filter((img): img is string => Boolean(img));

            return (
              <div
                onClick={() => {
                  setSelectedAppointment(eventInfo.event);
                  setShowEditAppointment(true);
                }}
                className={`h-full border-t-4 rounded-xl border-sky-500 ${
                  eventInfo.event.extendedProps.ExternalCalendarName
                    ? "bg-slate-200"
                    : "bg-white"
                }  shadow-sm overflow-auto min-h-32 w-full max-w-96`}
              >
                <EventCardUI
                  eventInfo={eventInfo}
                  participantImages={participantImages}
                />
              </div>
            );
          }}
        />

        {showEditAppointment && (selectedAppointment || selectedRawEvent) && (
          <EditAppointmentPopup
            isOpen={showEditAppointment}
            onClose={() => {
              setShowEditAppointment(false);
              setSelectedAppointment(null);
              setSelectedRawEvent(null);
            }}
            onSubmit={handleEditAppointment}
            initialData={
              selectedRawEvent
                ? {
                    id: String(selectedRawEvent.Id),
                    title: selectedRawEvent.Title,
                    startDate: new Date(Number(selectedRawEvent.Start)),
                    endDate: new Date(Number(selectedRawEvent.End)),
                    description: selectedRawEvent.Description,
                    location: selectedRawEvent.Location,
                    isAllDayEvent: selectedRawEvent.IsAllDayEvent,
                    isSpecialEvent: selectedRawEvent.IsSpecialEvent,
                    isPrivateEvent: selectedRawEvent.IsPrivateEvent,
                    recurrenceRule: selectedRawEvent.RecurrenceRule || {
                      frequency: 0,
                      interval: 1,
                    },
                    repeat: selectedRawEvent.Repeat,
                    repeatEndDate: selectedRawEvent.RepeatEndDate,
                    alert: selectedRawEvent.Alert,
                    alarms: selectedRawEvent.Alarms,
                    participants: selectedRawEvent.EventParticipant,
                    externalCalendarName: selectedRawEvent.ExternalCalendarName,
                  }
                : selectedAppointment
                  ? {
                      id: selectedAppointment.id,
                      title: selectedAppointment.title,
                      startDate: selectedAppointment.start || undefined,
                      endDate: selectedAppointment.end || undefined,
                      description:
                        selectedAppointment.extendedProps.description,
                      location: selectedAppointment.extendedProps.location,
                      isAllDayEvent:
                        selectedAppointment.extendedProps.IsAllDayEvent,
                      isSpecialEvent:
                        selectedAppointment.extendedProps.IsSpecialEvent,
                      isPrivateEvent:
                        selectedAppointment.extendedProps.IsPrivateEvent,
                      recurrenceRule: selectedAppointment.extendedProps
                        .RecurrenceRule || {
                        frequency: 0,
                        interval: 1,
                      },
                      repeat:
                        selectedAppointment.extendedProps.Repeat || undefined,
                      repeatEndDate:
                        selectedAppointment.extendedProps.RepeatEndDate,
                      alert:
                        selectedAppointment.extendedProps.Alert || undefined,
                      alarms:
                        selectedAppointment.extendedProps.Alarms || undefined,
                      participants:
                        selectedAppointment.extendedProps.participants,
                      externalCalendarName:
                        selectedAppointment.extendedProps.ExternalCalendarName,
                    }
                  : undefined
            }
          />
        )}

        {PMTaskDetails && todoData && (
          <div className="absolute bottom-0  hidden sm:block w-full z-20">
            <ToDoAndPMComponent
              todoDetails={todoData}
              PMTaskDetails={PMTaskDetails}
              familyDetails={data}
              selectedMember={selectedMember}
              dataReload={dataReload}
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
            dataReload={dataReload}
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
