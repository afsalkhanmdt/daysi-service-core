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
import {
  updateAppointmentCall,
  updatePocketMoneyTaskCall,
  updateToDoTaskCall,
} from "@/services/api";
import { createOptimisticEvents } from "@/app/utils/createOptimisticEvents";

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
  reloadTodo,
  reloadPM,
  PMTaskDetails,
  todoData,
  onFreemium,
  onImportAppointments,
  optimisticEvents,
  isLoading,
  setIsLoading,
  optimisticUpdates,
  setOptimisticUpdates,
}: {
  data: FamilyData;
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  dataReload: () => void;
  reloadTodo: () => void;
  reloadPM: () => void;
  PMTaskDetails: PMData | null;
  todoData: ToDoTaskType[] | null;
  onFreemium: () => void;
  optimisticEvents: any[];
  onImportAppointments?: () => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
  optimisticUpdates: Record<string, any[]>;
  setOptimisticUpdates: Dispatch<SetStateAction<Record<string, any[]>>>;
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

  const checkSubscription = (callback: () => void) => {
    if (data?.Family.SubscriptionType !== "Premium") {
      onFreemium();
    } else {
      callback();
    }
  };

  const addEventOptimistically = (event: any) => {
    const api = calendarRef.current?.getApi?.();
    if (!api) return;

    api.addEvent({
      id: event.eventGuID,
      title: event.title,
      start: new Date(event.startDate),
      end: new Date(event.endDate),
      allDay: !!event.isAllDayEvent,
      extendedProps: event,
    });
  };

  const handleRawEventClick = useCallback(
    (event: any) => {
      // checkSubscription(() => {
      setSelectedRawEvent(event);
      setShowEditAppointment(true);
      // });
    },
    [data?.Family.SubscriptionType, onFreemium],
  );

  const memberLookup = useMemo(() => {
    const lookup = new Map<string, MemberResponse>();
    data.Members.forEach((m) => {
      lookup.set(String(m.Id), m);
      lookup.set(String(m.MemberId), m);
    });
    return lookup;
  }, [data.Members]);

  const events: EventInput[] = useMemo(() => {
    const allEvents: EventInput[] = [];
    const seenEventResourcePairs = new Set<string>();
    const seenContentKeys = new Set<string>();

    // 1. Collect all logically unique events across all members
    const uniqueEventsList: any[] = [];
    data.Members.forEach((m) => {
      m.Events.forEach((e) => {
        const contentKey = `${e.Title}-${e.Start}-${e.End}-${e.Location || ""}`;
        if (!seenContentKeys.has(contentKey)) {
          seenContentKeys.add(contentKey);
          uniqueEventsList.push(e);
        }
      });
    });

    const firstResourceId =
      resources.length > 0 ? String(resources[0].id) : null;
    const firstResourceColor =
      resources.length > 0 ? resources[0].extendedProps?.color : "000000";

    // 2. Map each unique event to all its participants' columns
    uniqueEventsList.forEach((event) => {
      const targetResourceIds = new Set<string>();

      if (event.IsForAll === 1) {
        // "For All" events show only in the first column
        if (firstResourceId) targetResourceIds.add(firstResourceId);
      } else {
        // Non-"For All" events show in the column of every participant
        // except the family column (first column) as per original logic
        const participants = event.EventParticipant || [];
        participants.forEach((p: any) => {
          const participantId = p.ParticipantId || p.memberId || p.id;
          const member = memberLookup.get(String(participantId));
          if (member) {
            const rid = String(member.Id);
            if (rid !== firstResourceId) {
              targetResourceIds.add(rid);
            }
          }
        });
      }

      targetResourceIds.forEach((targetResourceId) => {
        const member = data.Members.find(
          (m) => String(m.Id) === targetResourceId,
        );
        const targetColor = member?.ColorCode || "000000";

        let start = new Date(Number(event.Start));
        let end = new Date(Number(event.End));
        const isAllDay = event.IsAllDayEvent === 1;

        const eventKey = `${event.Id}-${targetResourceId}`;
        if (seenEventResourcePairs.has(eventKey)) return;
        seenEventResourcePairs.add(eventKey);

        const baseEvent: EventInput = {
          id: eventKey,
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

        // Recurrence logic
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

    return allEvents;
  }, [data.Members, resources, memberLookup]);

  const calendarEvents = useMemo(() => {
    const editedEventIds = Object.keys(optimisticUpdates);

    const filteredEvents = events.filter(
      (e) => !editedEventIds.some((id) => String(e.id).startsWith(`${id}-`)),
    );

    return [
      ...filteredEvents,
      ...Object.values(optimisticUpdates).flat(),
      ...optimisticEvents,
    ];
  }, [events, optimisticUpdates, optimisticEvents]);

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
    // setIsLoading?.(true);

    const now = new Date().toISOString();

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

    const originalEventId = String(appointmentData.id);

    const optimisticEditedEvents = createOptimisticEvents(
      updatedAppointmentData,
      data?.Members || [],
    );

    setOptimisticUpdates((prev) => {
      const next = { ...prev };

      delete next[originalEventId];

      next[originalEventId] = optimisticEditedEvents;

      return next;
    });

    try {
      const response = await updateAppointmentCall(updatedAppointmentData);

      if (response) {
        await dataReload();

        if (updatedAppointmentData.startDate) {
          setCurrentDate(new Date(updatedAppointmentData.startDate));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setOptimisticUpdates((prev) => {
        const next = { ...prev };
        delete next[originalEventId];
        return next;
      });

      setIsLoading?.(false);
    }
  };

  useEffect(() => {
    if (data?.Members?.length) {
      setMembers(data.Members);
    }
  }, [data.Members, setMembers]);

  const combinedLoading = isLoading;

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
          events={calendarEvents}
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
              .map((p) => {
                const participantId = p.ParticipantId;
                const member = memberLookup.get(String(participantId));
                return member?.ResourceUrl || dp.src;
              })
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
                    id: String(
                      selectedRawEvent.extendedProps?.Id ||
                        selectedRawEvent.Id ||
                        selectedRawEvent.id,
                    ),
                    title: selectedRawEvent.Title || selectedRawEvent.title,
                    startDate: selectedRawEvent.Start
                      ? new Date(Number(selectedRawEvent.Start))
                      : selectedRawEvent.start
                        ? new Date(selectedRawEvent.start)
                        : new Date(),
                    endDate: selectedRawEvent.End
                      ? new Date(Number(selectedRawEvent.End))
                      : selectedRawEvent.end
                        ? new Date(selectedRawEvent.end)
                        : new Date(),
                    description:
                      selectedRawEvent.Description ||
                      selectedRawEvent.description ||
                      "",
                    location:
                      selectedRawEvent.Location ||
                      selectedRawEvent.location ||
                      "",
                    isAllDayEvent:
                      selectedRawEvent.IsAllDayEvent !== undefined
                        ? selectedRawEvent.IsAllDayEvent
                        : selectedRawEvent.isAllDayEvent,
                    isSpecialEvent:
                      selectedRawEvent.IsSpecialEvent !== undefined
                        ? selectedRawEvent.IsSpecialEvent
                        : selectedRawEvent.isSpecialEvent,
                    specialEvent:
                      selectedRawEvent.SpecialEvent !== undefined
                        ? selectedRawEvent.SpecialEvent
                        : selectedRawEvent.specialEvent,
                    isPrivateEvent:
                      selectedRawEvent.IsPrivateEvent !== undefined
                        ? selectedRawEvent.IsPrivateEvent
                        : selectedRawEvent.isPrivateEvent,
                    recurrenceRule: selectedRawEvent.RecurrenceRule ||
                      selectedRawEvent.recurrenceRule || {
                        frequency: 0,
                        interval: 1,
                      },
                    repeat:
                      selectedRawEvent.Repeat !== undefined
                        ? selectedRawEvent.Repeat
                        : selectedRawEvent.repeat !== undefined
                          ? selectedRawEvent.repeat
                          : 0,
                    repeatEndDate:
                      selectedRawEvent.RepeatEndDate ||
                      selectedRawEvent.repeatEndDate,
                    alert:
                      selectedRawEvent.Alert !== undefined
                        ? selectedRawEvent.Alert
                        : selectedRawEvent.alert !== undefined
                          ? selectedRawEvent.alert
                          : 0,
                    alarms: selectedRawEvent.Alarms || selectedRawEvent.alarms,
                    participants:
                      selectedRawEvent.EventParticipant ||
                      selectedRawEvent.participants,
                    externalCalendarName:
                      selectedRawEvent.ExternalCalendarName ||
                      selectedRawEvent.externalCalendarName,
                    localStartDate:
                      selectedRawEvent.extendedProps?.LocalStartDate ||
                      selectedRawEvent.extendedProps?.localStartDate ||
                      selectedRawEvent.LocalStartDate ||
                      selectedRawEvent.localStartDate,
                    localEndDate:
                      selectedRawEvent.extendedProps?.LocalEndDate ||
                      selectedRawEvent.extendedProps?.localEndDate ||
                      selectedRawEvent.LocalEndDate ||
                      selectedRawEvent.localEndDate,
                  }
                : selectedAppointment
                  ? {
                      id: String(
                        selectedAppointment.extendedProps?.Id ||
                          selectedAppointment.id,
                      ),
                      title: selectedAppointment.title,
                      startDate: selectedAppointment.start || undefined,
                      endDate: selectedAppointment.end || undefined,
                      description:
                        selectedAppointment.extendedProps?.Description ||
                        selectedAppointment.extendedProps?.description ||
                        "",
                      location:
                        selectedAppointment.extendedProps?.Location ||
                        selectedAppointment.extendedProps?.location ||
                        "",
                      isAllDayEvent:
                        selectedAppointment.extendedProps?.IsAllDayEvent,
                      isSpecialEvent:
                        selectedAppointment.extendedProps?.IsSpecialEvent,
                      specialEvent:
                        selectedAppointment.extendedProps?.SpecialEvent,
                      isPrivateEvent:
                        selectedAppointment.extendedProps?.IsPrivateEvent,
                      recurrenceRule: selectedAppointment.extendedProps
                        ?.RecurrenceRule ||
                        selectedAppointment.extendedProps?.recurrenceRule || {
                          frequency: 0,
                          interval: 1,
                        },
                      repeat:
                        selectedAppointment.extendedProps?.Repeat !== undefined
                          ? selectedAppointment.extendedProps.Repeat
                          : selectedAppointment.extendedProps?.repeat !==
                              undefined
                            ? selectedAppointment.extendedProps.repeat
                            : 0,
                      repeatEndDate:
                        selectedAppointment.extendedProps?.RepeatEndDate ||
                        selectedAppointment.extendedProps?.repeatEndDate,
                      alert:
                        selectedAppointment.extendedProps?.Alert !== undefined
                          ? selectedAppointment.extendedProps.Alert
                          : selectedAppointment.extendedProps?.alert !==
                              undefined
                            ? selectedAppointment.extendedProps.alert
                            : 0,
                      alarms:
                        selectedAppointment.extendedProps?.Alarms ||
                        selectedAppointment.extendedProps?.alarms,
                      participants:
                        selectedAppointment.extendedProps?.EventParticipant ||
                        selectedAppointment.extendedProps?.participants,
                      externalCalendarName:
                        selectedAppointment.extendedProps
                          ?.ExternalCalendarName ||
                        selectedAppointment.extendedProps?.externalCalendarName,
                      localStartDate:
                        selectedAppointment.extendedProps?.LocalStartDate ||
                        selectedAppointment.extendedProps?.localStartDate,
                      localEndDate:
                        selectedAppointment.extendedProps?.LocalEndDate ||
                        selectedAppointment.extendedProps?.localEndDate,
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
              reloadTodo={reloadTodo}
              reloadPM={reloadPM}
              onFreemium={onFreemium}
              setCurrentDate={setCurrentDate}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
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
            reloadTodo={reloadTodo}
            reloadPM={reloadPM}
            onFreemium={onFreemium}
            setCurrentDate={setCurrentDate}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
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
