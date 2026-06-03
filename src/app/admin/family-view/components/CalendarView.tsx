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
  onFreemium,
  onImportAppointments,
  isLoading,
}: {
  data: FamilyData;
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  dataReload: () => void;
  onFreemium: () => void;
  onImportAppointments?: () => void;
  isLoading?: boolean;
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
  const [localActionLoading, setLocalActionLoading] = useState(false);

  const checkSubscription = (callback: () => void) => {
    if (data?.Family.SubscriptionType !== "Premium") {
      onFreemium();
    } else {
      callback();
    }
  };

  const { data: PMTaskDetails } = useFetch<PMData>(
    `PocketMoney/GetPMTasks?familyId=${familyId}`,
  );
  const { data: todoData } = useFetch<ToDoTaskType[]>(
    `ToDo/GetToDos?familyId=${familyId}`,
  );

  const handleRawEventClick = useCallback(
    (event: any) => {
      // checkSubscription(() => {
      setSelectedRawEvent(event);
      setShowEditAppointment(true);
      // });
    },
    [data?.Family.SubscriptionType, onFreemium],
  );

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
    const processedForAllEventKeys = new Set<string>(); // Track processed IsForAll events by content

    const firstResourceId = resources.length > 0 ? String(resources[0].id) : null;
    const firstResourceColor =
      resources.length > 0 ? resources[0].extendedProps?.color : "000000";

    data.Members.forEach((member: MemberResponse) => {
      member.Events.forEach((event) => {
        let targetResourceId = String(member.Id);
        let targetColor = member.ColorCode || "000000";

        // Special handling for IsForAll events: only display in the first column (Family Events)
        if (event.IsForAll === 1) {
          const contentKey = `${event.Title}-${event.Start}-${event.End}-${event.Location || ""}`;
          if (processedForAllEventKeys.has(contentKey)) {
            return;
          }
          processedForAllEventKeys.add(contentKey);
          if (firstResourceId) {
            targetResourceId = firstResourceId;
            targetColor = firstResourceColor || "000000";
          }
        } else {
          // Non-"For All" events should not be shown for the Family member column
          if (firstResourceId && String(member.Id) === firstResourceId) {
            return;
          }
        }

        const eventKey = `${event.Id}-${targetResourceId}`;

        // Skip if we've already processed this event for this target resource
        if (seenEventMemberPairs.has(eventKey)) {
          return;
        }

        seenEventMemberPairs.add(eventKey);

        let start = new Date(Number(event.Start));
        let end = new Date(Number(event.End));

        const isAllDay = event.IsAllDayEvent === 1;

        /* ==========================
         Base Event
      ========================== */
        const baseEvent: EventInput = {
          id: eventKey, // Use unique event-resource key as ID to avoid collisions
          resourceId: targetResourceId,
          title: event.Title,
          start,
          end,
          allDay: isAllDay,
          display: "block",
          extendedProps: {
            ...event,
            participants: event.EventParticipant,
            externalCalender: event.ExternalCalendarName,
            userColorCode: targetColor,
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
            const recurrenceId = `${event.Id}-${currentStart.getTime()}-${targetResourceId}`;
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
  }, [data.Members, resources]);

  // Function to determine exactly which time and resource to scroll to
  const getScrollTarget = useCallback(() => {
    // 1. If currentDate has a specific time (not midnight), focus that time
    const hasSpecificTime =
      currentDate.getHours() !== 0 || currentDate.getMinutes() !== 0;

    if (hasSpecificTime) {
      // Find the resource associated with this time if possible
      // We look for an event that starts at this exact time
      const targetEvent = events.find((ev) => {
        const evStart = new Date(ev.start as string);
        return (
          evStart.toDateString() === currentDate.toDateString() &&
          evStart.getHours() === currentDate.getHours() &&
          evStart.getMinutes() === currentDate.getMinutes()
        );
      });

      return {
        time: currentDate,
        resourceId: targetEvent?.resourceId || null,
      };
    }

    // 2. If it's midnight, find the earliest event on this day
    const currentDateString = currentDate.toDateString();
    const todaysEvents = events.filter((event) => {
      const eventDate = new Date(event.start as string);
      return eventDate.toDateString() === currentDateString;
    });

    if (todaysEvents.length > 0) {
      let earliestEvent = todaysEvents[0];
      let earliestTime = new Date(earliestEvent.start as string);

      todaysEvents.forEach((event) => {
        const eventTime = new Date(event.start as string);
        if (eventTime < earliestTime) {
          earliestTime = eventTime;
          earliestEvent = event;
        }
      });

      return {
        time: earliestTime,
        resourceId: earliestEvent.resourceId || null,
      };
    }

    // 3. Default: Scroll to 08:00 if no events
    const defaultTime = new Date(currentDate);
    defaultTime.setHours(8, 0, 0, 0);
    return { time: defaultTime, resourceId: null };
  }, [events, currentDate]);

  // Robust unified scrolling function
  const executeScroll = useCallback(() => {
    const target = getScrollTarget();
    if (!calendarRef.current?.getApi) return;

    const calendarApi = calendarRef.current.getApi();

    try {
      // 1. Vertical Scroll
      calendarApi.scrollToTime({
        hours: target.time.getHours(),
        minutes: target.time.getMinutes(),
        seconds: 0,
      });

      // 2. Horizontal Scroll (Resource Column)
      if (target.resourceId) {
        const resourceEl = calendarContainerRef.current?.querySelector(
          `.fc-timegrid-col[data-resource-id="${target.resourceId}"]`,
        ) as HTMLElement;

        if (resourceEl) {
          resourceEl.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }
    } catch (error) {
      console.warn("Unified scroll failed:", error);
    }
  }, [getScrollTarget]);

  // Combined effect for navigation and scrolling
  useEffect(() => {
    if (!calendarRef.current?.getApi) return;
    const api = calendarRef.current.getApi();

    // 1. Navigate to the correct date
    api.gotoDate(currentDate);

    // 2. Trigger scroll with a slight delay to allow rendering
    const scrollTimeout = setTimeout(() => {
      executeScroll();
    }, 250); // Increased delay slightly for better reliability after reload

    return () => clearTimeout(scrollTimeout);
  }, [currentDate, executeScroll, data]); // Added data dependency to re-scroll after reload

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
    setLocalActionLoading(true);

    const now = new Date().toISOString();

    // Create a new object with all the added values
    const updatedAppointmentData = {
      ...appointmentData,
      addedBy: data?.LoggedInUserId,
      familyUserId: data.Family.MemberId,
      familyId: Number(familyId),
      locale:
        data?.Members?.find((m) => m.MemberId === data.Family.MemberId)
          ?.Locale || "en",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offSet: dayjs().format("Z"),
      eventsUpdatedOn: now,
      // Add sync-related fields
      participants: appointmentData.participants || [],
      isForAll: appointmentData.isForAll || 0,
      isAllDayEvent: appointmentData.isAllDayEvent || 0,
      isSpecialEvent: appointmentData.isSpecialEvent || 0,
      isPrivateEvent: appointmentData.isPrivateEvent || 0,
      recurrenceRule: appointmentData.recurrenceRule || {
        frequency: 0,
        interval: 1,
      },
      alarms: appointmentData.alarms || [],
      latitude: appointmentData.latitude || "",
      longitude: appointmentData.longitude || "",
      eventGuID: appointmentData.eventGuID || crypto.randomUUID(),
      externalCalendarId: appointmentData.externalCalendarId || 0,
      noPush: appointmentData.noPush || false,
    };

    try {
      const response = await updateAppointmentCall(updatedAppointmentData);
      if (response.ok) {
        await dataReload();
        if (updatedAppointmentData.startDate) {
          setCurrentDate(new Date(updatedAppointmentData.startDate));
        }
      }
    } finally {
      setLocalActionLoading(false);
    }
  };

  useEffect(() => {
    if (data?.Members?.length) {
      setMembers(data.Members);
    }
  }, [data.Members, setMembers]);

  const combinedLoading = isLoading || localActionLoading;

  return (
    <div className="sm:p-2.5 bg-slate-100 flex flex-col sm:h-full sm:rounded-xl relative">
      {combinedLoading && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-[3px] rounded-xl transition-all duration-300 animate-in fade-in">
          <div className="flex flex-col items-center gap-4 text-center p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold text-gray-800">
                {t("Updating Calendar...")}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                {t("Please wait a moment")}
              </p>
            </div>
          </div>
        </div>
      )}
      <DateScrollAndDisplay
        familyName={data.Family.Name}
        calendarRef={calendarRef}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        isPremium={data?.Family.SubscriptionType === "Premium"}
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
                  // checkSubscription(() => {
                  setSelectedAppointment(eventInfo.event);
                  setShowEditAppointment(true);
                  // });
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
                    id: String(selectedRawEvent.extendedProps.Id),
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
                    localStartDate: selectedRawEvent.extendedProps.LocalStartDate,
                    localEndDate: selectedRawEvent.extendedProps.LocalEndDate,
                  }
                : selectedAppointment
                  ? {
                      id: selectedAppointment.extendedProps.Id,
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
                      localStartDate: selectedAppointment.extendedProps.LocalStartDate,
                      localEndDate: selectedAppointment.extendedProps.LocalEndDate,
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
              onFreemium={onFreemium}
              setCurrentDate={setCurrentDate}
              setIsLoading={setLocalActionLoading}
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
            onFreemium={onFreemium}
            setCurrentDate={setCurrentDate}
            setIsLoading={setLocalActionLoading}
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
