"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Image from "next/image";

import CalendarView from "@/app/admin/family-view/components/CalendarView";
import CelebrationDisplayCard from "@/app/admin/family-view/components/CelebrationDisplayCard";
import PMDisplayCard from "./PMDisplayCard";
import ToggleThemeAndLogout from "./ToggleThemeAndLogout";
import CreateTodoPopup from "./CreateTodoPopup"; // Import your popup components
import CreateAppointmentPopup from "./CreateAppointmentPopup";
import ImportAppointmentsPopup from "./ImportAppointmentsPopup";
// import CreatePocketMoneyPopup from "./CreatePocketMoneyPopup"; // Import when ready

import danishAndNorwegianLogo from "@/app/admin/assets/DaysiDanishLogo.png";
import enLogo from "@/app/admin/assets/DaysiEnLogo.png";
import swedishLogo from "@/app/admin/assets/DaysiSwedishLogo.png";
import mainIcon from "@/app/admin/assets/MyFamilii Brand Guide (1)-2 1.png";
import dp from "@/app/admin/assets/try.jpg";

import { useFetch } from "@/app/hooks/useFetch";
import { FamilyResponse } from "@/app/types/familytypes";
import {
  ExternalCalendar,
  ExternalCalendarResponse,
  MemberResponse,
} from "@/app/types/familyMemberTypes";

import { useTranslation } from "react-i18next";
import i18next from "i18next";
import "../../../../../i18n";
import CreatePocketMoneyPopup from "./CreatePocketMoneyPopup";
import { UserEventCreateRequest } from "@/app/types/appoinment";
import { PMData, PMTaskCreateCommand } from "@/app/types/pocketMoney";
import {
  createAppointmentCall,
  createCalendarFeedCall,
  createToDoTaskCall,
  deleteCalendarFeedCall,
} from "@/services/api";
import { createPocketMoneyTaskCall } from "@/services/api";
import { ToDoCreateCommand, ToDoTaskType } from "@/app/types/todo";
import FreemiumModal from "@/components/Modals/FreemiumModal";
import ScheduleView from "@/app/family-view/components/ScheduleView";
import ExternalCalendarDisplayCard from "./ExternalCalendarDisplayCard";
import { createOptimisticEvents } from "@/app/utils/createOptimisticEvents";

type ExternalCalendarProvider = {
  Id: number;
  Language: string;
  SequenceNumber: number;
  Name: string;
  Link: string;
  Logo: string;
};

export type FamilyData = {
  Family: FamilyResponse;
  Members: MemberResponse[];
  ExternalCalendarTypes: ExternalCalendarProvider[];
  LoggedInUserId: string;
};

const STORAGE_KEY = "familyDetailsCache";
const AUTO_REFRESH_INTERVAL = 60000; // 60 seconds

const FamilyViewWrapper = ({
  familyId,
  userId,
}: {
  familyId: string;
  userId?: string;
}) => {
  const {
    data: apiData,
    reload,
    loading,
  } = useFetch<FamilyData>(`Families/GetAllFamilies?familyId=${familyId}`);

  const { data: PMTaskDetails, reload: reloadPM } = useFetch<PMData>(
    `PocketMoney/GetPMTasks?familyId=${familyId}`,
  );
  const { data: todoData, reload: reloadTodo } = useFetch<ToDoTaskType[]>(
    `ToDo/GetToDos?familyId=${familyId}`,
  );

  const [familyDetails, setFamilyDetails] = useState<FamilyData | null>(null);
  const [isLangReady, setIsLangReady] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [showCreateTodo, setShowCreateTodo] = useState(false);
  const [showCreateAppointment, setShowCreateAppointment] = useState(false);
  const [showImportAppointments, setShowImportAppointments] = useState(false);
  const [showCreatePocketMoney, setShowCreatePocketMoney] = useState(false);
  const [showFreemiumModal, setShowFreemiumModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [optimisticEvents, setOptimisticEvents] = useState<any[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Record<string, any>
  >({});
  // State declarations
  const [externalCalendars, setExternalCalendars] = useState<
    ExternalCalendar[]
  >([]);

  // Update externalCalendars when apiData changes
  useEffect(() => {
    if (apiData?.Members) {
      const calendars =
        apiData.Members.flatMap((member) =>
          member.ExternalCalendars?.map((calendar) => ({
            ...calendar,
            memberName: member.MemberName,
            memberEmail: member.Email,
            memberLocale: member.Locale || "en",
          })),
        ) || [];
      setExternalCalendars(calendars);

      // Log for debugging
      console.log("External calendars loaded:", calendars);
    }
  }, [apiData]);

  // Also make sure to update when familyDetails changes (if you use it)
  useEffect(() => {
    if (familyDetails?.Members) {
      const calendars =
        familyDetails.Members.flatMap((member) =>
          member.ExternalCalendars?.map((calendar) => ({
            ...calendar,
            memberName: member.MemberName,
            memberEmail: member.Email,
            memberLocale: member.Locale || "en",
          })),
        ) || [];
      setExternalCalendars(calendars);
    }
  }, [familyDetails]);

  const handleDeleteCalendar = async (calendarId: number) => {
    // Find the calendar - use the current state
    const calendarToDelete = externalCalendars.find(
      (cal) => cal.CalendarId === calendarId,
    );

    try {
      // Call API first
      if (calendarToDelete) {
        await deleteCalendarFeedCall(
          calendarToDelete.CalendarId,
          calendarToDelete.MembersUpdatedOn || "",
          calendarToDelete.memberLocale || "en",
        );
      }

      // Remove from UI only after successful API call
      setExternalCalendars((prev) =>
        prev.filter((cal) => cal.CalendarId !== calendarId),
      );

      // Also reload the main data to keep everything in sync
      reload();
    } catch (error) {
      console.error("Error deleting calendar:", error);
      alert("Failed to delete calendar. Please try again.");
    }
  };

  const { t } = useTranslation("common");

  const checkSubscription = (callback: () => void) => {
    if (familyDetails?.Family.SubscriptionType !== "Premium") {
      setShowFreemiumModal(true);
    } else {
      callback();
    }
  };

  useEffect(() => {
    console.log("optimisticEvents changed", optimisticEvents);
  }, [optimisticEvents]);

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        setFamilyDetails(JSON.parse(cached));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (apiData) {
      // ── DIAGNOSTIC: check raw API data for external calendar events ──
      console.log("[EXT_CAL_DEBUG] Raw apiData received:", {
        membersCount: apiData.Members?.length,
        members: apiData.Members?.map((m: any) => ({
          Id: m.Id,
          Name: m.FirstName,
          MemberId: m.MemberId,
          eventsCount: m.Events?.length,
          externalCalendars: m.ExternalCalendars,
          externalEvents: m.Events?.filter(
            (e: any) => e.ExternalCalendarId > 0 || e.ExternalCalendarName,
          )?.map((e: any) => ({
            Id: e.Id,
            Title: e.Title,
            ExternalCalendarName: e.ExternalCalendarName,
            ExternalCalendarId: e.ExternalCalendarId,
            Start: e.Start,
            End: e.End,
            IsAllDayEvent: e.IsAllDayEvent,
            IsForAll: e.IsForAll,
            EventParticipant: e.EventParticipant,
          })),
        })),
      });
      // ── END DIAGNOSTIC ──
      setFamilyDetails(apiData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apiData));
    }
  }, [apiData]);

  useEffect(() => {
    const userLanguage = familyDetails?.Members?.find(
      (m) => m.MemberId === userId,
    )?.Locale;
    if (userLanguage) {
      i18next.changeLanguage(userLanguage).then(() => setIsLangReady(true));
    } else {
      setIsLangReady(true);
    }
  }, [familyDetails, userId]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [reload]);

  // Handler functions for creating new items
  const handleCreateTodo = async (todoData: ToDoCreateCommand) => {
    // setIsActionLoading(true);
    const updatedTodoData: ToDoCreateCommand = {
      ...todoData,
      familyId: Number(familyId),
      createdBy: userId || "",
      assignedTo: todoData.assignedTo || [],
      description: todoData.description || "",
      note: todoData.note || "",
      private: Number(todoData.private) || 0,
      isForAll: todoData.isForAll ?? false,
    };

    // call your API
    const response = await createToDoTaskCall(updatedTodoData);

    if (response) {
      await Promise.all([reload(), reloadTodo()]);
    }
    setIsActionLoading(false);
  };

  const handleCreateAppointment = async (
    appointmentData: UserEventCreateRequest,
  ) => {
    // setIsActionLoading(true);

    const now = new Date().toISOString();

    // Create a new object with all the added values (UserEventCreateCommand)
    // following the structure and fields required by CreateV1
    const updatedAppointmentData = {
      ...appointmentData,
      addedBy: apiData?.LoggedInUserId || "",
      familyUserId: familyDetails?.Family.MemberId || "",
      familyId: Number(familyId),
      locale:
        familyDetails?.Members?.find((m) => m.MemberId === userId)?.Locale ||
        "en",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offSet: dayjs().format("Z"),
      eventsUpdatedOn: now,
      // Fields supported by CreateV1
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
      participants: appointmentData.participants?.map((p) => ({
        ...p,
        ParticipantId: p.memberId || p.id,
        MemberId: p.memberId || p.id,
        EventId: 0,
        ParentEventId: "",
      })),
    };

    const createdOptimisticEvents = createOptimisticEvents(
      updatedAppointmentData,
      familyDetails?.Members || [],
    );

    setOptimisticEvents((prev) => [...prev, ...createdOptimisticEvents]);

    const optimisticIds = createdOptimisticEvents.map((e: any) => e.id);

    if (updatedAppointmentData.startDate) {
      setCurrentDate(new Date(updatedAppointmentData.startDate));
    }

    // Sending as an array of UserEventCreateCommand for CreateV1
    try {
      const response: any = await createAppointmentCall([
        updatedAppointmentData,
      ]);

      if (response) {
        setOptimisticEvents((prev) =>
          prev.filter((e) => !optimisticIds.includes(e.id)),
        );
        await reload();
      }
    } catch (error) {
      setOptimisticEvents((prev) =>
        prev.filter((e) => !optimisticIds.includes(e.id)),
      );

      console.error(error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreatePocketMoney = async (
    pocketMoneyData: PMTaskCreateCommand,
  ) => {
    // setIsActionLoading(true);
    const updatedPocketMoneyData = {
      ...pocketMoneyData,
      FamilyId: Number(familyId),
      CreatedBy: userId || "",
      PMAmount: Number(pocketMoneyData.PMAmount) || 0,
      Interval: Number(pocketMoneyData.Interval) || 0,
      ActivityDate: pocketMoneyData.ActivityDate
        ? new Date(pocketMoneyData.ActivityDate).toISOString()
        : new Date().toISOString(),
      FirstComeFirstServe: Boolean(pocketMoneyData.FirstComeFirstServe),
      PMDescription: pocketMoneyData.PMDescription || "",
      Note: pocketMoneyData.Note || "",
      Repeat: pocketMoneyData.Repeat || "none", // Assuming RepeatEnum has a default
      FamilyMembersPlanned: pocketMoneyData.FamilyMembersPlanned || [],
    };

    const response = await createPocketMoneyTaskCall([updatedPocketMoneyData]);

    if (response) {
      await Promise.all([reload(), reloadPM()]);
      if (updatedPocketMoneyData.ActivityDate) {
        setCurrentDate(new Date(updatedPocketMoneyData.ActivityDate));
      }
    }
    setIsActionLoading(false);
  };

  const handleImportAppointments = async (importData: any) => {
    setIsActionLoading(true);
    const response = await createCalendarFeedCall(importData);
    if (response) {
      reload();
    }
    setIsActionLoading(false);
  };

  if (!familyDetails || !isLangReady) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        {t("Loading your data...")}
      </div>
    );
  }

  const mainEvents =
    familyDetails?.Members.flatMap((member: MemberResponse) =>
      member.Events.filter((event: any) => event.IsSpecialEvent === 1),
    ) ?? [];

  const uniqueEvents = mainEvents.filter((event, index, self) => {
    return (
      index ===
      self.findIndex(
        (e) =>
          e.Start === event.Start &&
          e.End === event.End &&
          e.EventPerson === event.EventPerson &&
          e.IsSpecialEvent === event.IsSpecialEvent,
      )
    );
  });

  const today = dayjs();

  const selectedDaysEvents =
    uniqueEvents
      ?.map((event) => {
        let eventDate = dayjs(Number(event.Start));
        eventDate = eventDate.year(today.year());
        if (eventDate.isBefore(today, "day")) {
          eventDate = eventDate.add(1, "year");
        }
        return { ...event, normalizedDate: eventDate };
      })
      .sort((a, b) => a.normalizedDate.valueOf() - b.normalizedDate.valueOf())
      .slice(0, 5) || [];

  const imageUrls = familyDetails?.Members.reduce(
    (acc: Record<string, string>, member) => {
      acc[member.FirstName] = member.ResourceUrl || dp.src;
      return acc;
    },
    {},
  );

  console.log(familyDetails, "familyDetails");

  return (
    <div className="sm:flex w-screen h-screen sm:py-3 sm:px-3 bg-white dark:bg-gray-800 transition-colors">
      <div className="hidden sm:flex flex-col min-w-[140px] max-w-[300px] w-[30%] bg-white dark:bg-gray-800 border-r dark:border-gray-700 text-gray-800 dark:text-gray-100">
        <div className="border-b border-slate-100 dark:border-gray-700 pb-3 grid place-items-center">
          <Image
            src={
              familyDetails?.Members?.find((m) => m.MemberId === userId)
                ?.Locale === "en"
                ? enLogo.src
                : familyDetails?.Members?.find((m) => m.MemberId === userId)
                      ?.Locale === "sv"
                  ? swedishLogo.src
                  : danishAndNorwegianLogo.src
            }
            alt="mainIcon"
            width={1200}
            height={200}
            className="w-72 h-10"
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col border-b border-slate-100 dark:border-gray-700">
          <div className="p-3 text-base font-semibold grid place-content-center border-b dark:border-gray-700">
            {t("Celebrations")}
          </div>
          {selectedDaysEvents.length > 0 ? (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid gap-2">
                {selectedDaysEvents.map((event, i) => (
                  <CelebrationDisplayCard
                    key={i}
                    mainEvent={event}
                    imageUrl={imageUrls[event.EventPerson]}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2 border-t-4 rounded-xl m-2 border-gray-300 bg-white shadow-sm flex items-center justify-center h-20 text-gray-500 italic">
              {t("NoSpecialEvents")}
            </div>
          )}
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="p-3 text-base font-semibold grid place-content-center border-b dark:border-gray-700">
            {t("PocketMoney")}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid gap-2">
              {familyDetails.Members.filter((m) => m.PocketMoneyUser)
                .sort((a, b) => b.AmountEarned - a.AmountEarned)
                .map((member, i) => (
                  <PMDisplayCard key={i} memberDetails={member} />
                ))}
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="p-3 text-base font-semibold grid place-content-center border-b dark:border-gray-700">
            {t("ExternalCalendars")}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid gap-2">
              {externalCalendars.map((calendar) => (
                <ExternalCalendarDisplayCard
                  key={calendar.CalendarId}
                  calendar={calendar}
                  onDelete={handleDeleteCalendar}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Updated ToggleThemeAndLogout with create functionality */}
        <ToggleThemeAndLogout
          reload={reload}
          onNewAppointment={() =>
            // checkSubscription(() => setShowCreateAppointment(true))
            setShowCreateAppointment(true)
          }
          onNewToDo={() =>
            // checkSubscription(() => setShowCreateTodo(true))
            setShowCreateTodo(true)
          }
          onNewPocketMoney={() =>
            // checkSubscription(() => setShowCreatePocketMoney(true))
            setShowCreatePocketMoney(true)
          }
          onImportAppointments={() =>
            // checkSubscription(() => setShowImportAppointments(true))
            setShowImportAppointments(true)
          }
        />
      </div>

      <div className="sm:hidden w-full flex justify-between p-2">
        <div className="grid place-items-center">
          <Image
            unoptimized
            src={mainIcon.src}
            alt="mainIcon"
            width={120}
            height={48}
          />
        </div>
        {/* Mobile version with create functionality */}
        <ToggleThemeAndLogout
          reload={reload}
          onNewAppointment={() =>
            // checkSubscription(() => setShowCreateAppointment(true))
            setShowCreateAppointment(true)
          }
          onNewToDo={() =>
            // checkSubscription(() => setShowCreateTodo(true))
            setShowCreateTodo(true)
          }
          onNewPocketMoney={() =>
            // checkSubscription(() => setShowCreatePocketMoney(true))
            setShowCreatePocketMoney(true)
          }
          onImportAppointments={() =>
            // checkSubscription(() => setShowImportAppointments(true))
            setShowImportAppointments(true)
          }
        />
      </div>

      <div className="flex-1 min-w-0 sm:h-full">
        <CalendarView
          data={familyDetails}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          dataReload={reload}
          reloadTodo={reloadTodo}
          reloadPM={reloadPM}
          PMTaskDetails={PMTaskDetails}
          todoData={todoData}
          optimisticEvents={optimisticEvents}
          onFreemium={() => setShowFreemiumModal(true)}
          isLoading={isActionLoading}
          setIsLoading={setIsActionLoading}
          onImportAppointments={() =>
            // checkSubscription(() => setShowImportAppointments(true))
            setShowCreateAppointment(true)
          }
          optimisticUpdates={optimisticUpdates}
          setOptimisticUpdates={setOptimisticUpdates}
        />
        {/* <ScheduleView data={familyDetails} currentUserId={userId} /> */}
      </div>

      {/* Popup Modals */}

      <CreateAppointmentPopup
        isOpen={showCreateAppointment}
        onClose={() => setShowCreateAppointment(false)}
        onSubmit={handleCreateAppointment}
        currentDate={currentDate}
      />

      <ImportAppointmentsPopup
        isOpen={showImportAppointments}
        onClose={() => setShowImportAppointments(false)}
        onSubmit={handleImportAppointments}
        familyId={Number(familyId)}
        locale={
          familyDetails?.Members?.find((m) => m.MemberId === userId)?.Locale ||
          "en"
        }
      />

      <CreateTodoPopup
        isOpen={showCreateTodo}
        onClose={() => setShowCreateTodo(false)}
        onSubmit={handleCreateTodo}
        ToDoFamilyGroup={apiData?.Family.ToDoFamilyGroups}
        isLoading={isActionLoading}
      />

      <CreatePocketMoneyPopup
        isOpen={showCreatePocketMoney}
        onClose={() => setShowCreatePocketMoney(false)}
        onSubmit={handleCreatePocketMoney}
        isLoading={isActionLoading}
      />

      <FreemiumModal
        isOpen={showFreemiumModal}
        onClose={() => setShowFreemiumModal(false)}
      />
    </div>
  );
};

export default FamilyViewWrapper;
