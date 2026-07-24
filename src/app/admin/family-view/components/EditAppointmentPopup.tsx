import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import editAppointmentImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import SpecialEventIcon from "@/app/admin/assets/event-badged-1-svgrepo-com (1) 1.png";
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import nameIcon from "@/app/admin/assets/name.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import alarmIcon from "@/app/admin/assets/alarmIcon.png";
import additionalNoteIcon from "@/app/admin/assets/name.png";
import closeIcon from "@/app/admin/assets/close-428.png";
import { SelectableOption } from "./FormComponents/MultipleSelector";
import SingleSelector from "./FormComponents/SingleSelector";
import ResponsiblePersonSelector from "./FormComponents/ResponsiblePersonSelector";
import { useResources } from "@/app/context/ResourceContext";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import {
  AppointmentUpdateFormUI,
  appointmentPopupPropsType,
  SpecialEventEnum,
  UserEventCreateRequest,
  UserEventUpdateRequest,
} from "@/app/types/appoinment";
import {
  ALERT_OPTIONS,
  buildLocalTimestamp,
  buildTimestamp,
  normalizeInitialData,
  parseDateToForm,
  REPEAT_OPTIONS,
} from "@/app/constants/appointmentForm";
import { EventInput } from "@fullcalendar/core";
import LocationInput from "./FormComponents/LocationInput";
import DateTimeRange from "./FormComponents/DateTimeRange";
import dayjs from "dayjs";
import RecurringEditOptions from "./RecurringEditOptions";

// Helper function to check if string contains coordinates
const isCoordinateString = (str: string): boolean => {
  const coordinatePattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
  return coordinatePattern.test(str.trim());
};

type EditAppointmentPopupProps = appointmentPopupPropsType & {
  onSubmit: (data: UserEventUpdateRequest) => Promise<any>;
  onCreateSeries?: (data: UserEventCreateRequest) => Promise<any>;
  initialData?: EventInput;
  editType?: "single" | "series" | null;
  onRecurringSplit?: (data: {
    beforeSeries: UserEventCreateRequest | null;
    editedEvent: UserEventUpdateRequest;
    afterSeries: UserEventCreateRequest | null;
  }) => Promise<void>;
};

const EditAppointmentPopup: React.FC<EditAppointmentPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onCreateSeries,
  initialData,
  onRecurringSplit,
  editType = null,
}) => {
  const { resources } = useResources();
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  // State for recurring event handling
  const [showRecurringOptions, setShowRecurringOptions] =
    useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRepeatDisabled, setIsRepeatDisabled] = useState<boolean>(false); // ADD THIS STATE

  const modalRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<AppointmentUpdateFormUI>(() => {
    return normalizeInitialData(initialData);
  });

  // Store original repeat value when editing a single occurrence
  const [originalRepeatValue, setOriginalRepeatValue] = useState<number>(0);

  // Check if this is a recurring event
  const isRecurringEvent = (): boolean => {
    const hasParentId = !!(
      initialData?.parentEventId ||
      initialData?.extendedProps?.parentEventId ||
      initialData?.extendedProps?.ParentEventId
    );
    const rawRepeat =
      formData.repeat ??
      initialData?.extendedProps?.repeat ??
      initialData?.extendedProps?.Repeat;
    const repeatStr = String(rawRepeat ?? "0")
      .toLowerCase()
      .trim();
    const isRecurring =
      repeatStr !== "0" &&
      repeatStr !== "never" &&
      repeatStr !== "none" &&
      repeatStr !== "null" &&
      repeatStr !== "undefined" &&
      repeatStr !== "";

    return isRecurring && hasParentId;
  };

  // Get the original event details for splitting
  const getOriginalEventDetails = () => {
    const startDate = formData.startDateOnly || initialData?.startDate || "";
    const endDate = formData.endDateOnly || initialData?.endDate || "";

    return {
      id: initialData?.id || "",
      parentEventId:
        initialData?.parentEventId ||
        initialData?.extendedProps?.parentEventId ||
        "",
      repeat: formData.repeat || initialData?.extendedProps?.repeat || 0,
      repeatEndDate:
        formData.repeatEndDate ||
        initialData?.extendedProps?.repeatEndDate ||
        null,
      startDate: startDate,
      endDate: endDate,
      title: formData.title || initialData?.title || "",
      description:
        formData.description || initialData?.extendedProps?.description || "",
      location: formData.location || initialData?.extendedProps?.location || "",
      participants:
        formData.participants || initialData?.extendedProps?.participants || [],
      isForAll: formData.isForAll || initialData?.extendedProps?.IsForAll || 0,
      isAllDayEvent:
        formData.isAllDayEvent ||
        initialData?.extendedProps?.isAllDayEvent ||
        0,
      isSpecialEvent:
        formData.isSpecialEvent ||
        initialData?.extendedProps?.isSpecialEvent ||
        0,
      isPrivateEvent:
        formData.isPrivateEvent ||
        initialData?.extendedProps?.isPrivateEvent ||
        0,
      specialEvent:
        formData.specialEvent ||
        initialData?.extendedProps?.specialEvent ||
        null,
      alert: formData.alert || initialData?.extendedProps?.alert || 0,
      alarms: formData.alarms || initialData?.extendedProps?.alarms || [],
      recurrenceRule:
        formData.recurrenceRule ||
        initialData?.extendedProps?.recurrenceRule ||
        null,
      latitude: formData.latitude || initialData?.extendedProps?.latitude || "",
      longitude:
        formData.longitude || initialData?.extendedProps?.longitude || "",
      addedBy: formData.addedBy || initialData?.extendedProps?.addedBy || "",
      familyId: formData.familyId || initialData?.extendedProps?.familyId || 0,
      familyUserId:
        formData.familyUserId || initialData?.extendedProps?.familyUserId || "",
      externalCalendarId:
        formData.externalCalendarId ||
        initialData?.extendedProps?.externalCalendarId ||
        0,
      eventGuID:
        formData.eventGuID ||
        initialData?.extendedProps?.eventGuID ||
        crypto.randomUUID(),
      noPush: formData.noPush || initialData?.extendedProps?.noPush || false,
      locale: formData.locale || initialData?.extendedProps?.locale || "",
      timeZone:
        formData.timeZone ||
        initialData?.extendedProps?.timeZone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      offSet:
        formData.offSet ||
        initialData?.extendedProps?.offSet ||
        dayjs().format("Z"),
    };
  };

  // Helper: Get next occurrence date based on repeat type
  const getNextOccurrence = (date: Date, repeatType: number): Date => {
    const newDate = new Date(date);
    switch (repeatType) {
      case 1: // Daily
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 2: // Weekly
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 3: // Every 2 Weeks
        newDate.setDate(newDate.getDate() + 14);
        break;
      case 4: // Monthly
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 5: // Yearly
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
      default:
        newDate.setDate(newDate.getDate() + 1);
    }
    return newDate;
  };

  // Helper: Calculate split dates
  const calculateSplitDates = (
    originalStartDate: string,
    editDate: string,
    repeatType: number,
    repeatEndDate: string | null,
  ) => {
    const beforeDates: string[] = [];
    const afterDates: string[] = [];

    if (!repeatEndDate) return { beforeDates, afterDates };

    const toDay = (d: Date) => d.toISOString().split("T")[0]; // YYYY-MM-DD

    let currentDate = new Date(originalStartDate);
    const editDay = toDay(new Date(editDate));
    const endDate = new Date(repeatEndDate);

    // Collect dates before the edited occurrence (day-level comparison)
    while (currentDate <= endDate) {
      const currentDay = toDay(currentDate);
      if (currentDay === editDay) {
        // This is the occurrence being edited — skip it
        currentDate = getNextOccurrence(currentDate, repeatType);
        break;
      }
      if (currentDay < editDay) {
        beforeDates.push(currentDate.toISOString());
        currentDate = getNextOccurrence(currentDate, repeatType);
      } else {
        // Passed the edit date without finding it (shouldn't happen if data is correct)
        break;
      }
    }

    // Collect dates after the edited occurrence
    while (currentDate <= endDate) {
      afterDates.push(currentDate.toISOString());
      currentDate = getNextOccurrence(currentDate, repeatType);
    }

    return { beforeDates, afterDates };
  };

  // Helper: Get duration between start and end in milliseconds
  const getEventDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end.getTime() - start.getTime();
  };

  // Helper: Calculate end date for a given start date
  const calculateEndDate = (
    startDate: string,
    originalStart: string,
    originalEnd: string,
  ): string => {
    const duration = getEventDuration(originalStart, originalEnd);
    const start = new Date(startDate);
    const end = new Date(start.getTime() + duration);
    return end.toISOString();
  };

  // Helper: Create a new series payload.
  // startDate / endDate / repeatEndDate are full ISO strings (including time).
  const createSeriesPayload = (
    startDate: string,
    endDate: string,
    repeatEndDate: string,
    originalEvent: any,
    participants: any[],
  ): UserEventCreateRequest => {
    // Extract the time portion from the original series start so the new
    // occurrences keep the same start/end time as the original event.
    const extractTime = (isoDatetime: string): string => {
      try {
        const d = new Date(isoDatetime);
        if (isNaN(d.getTime())) return "00:00";
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      } catch {
        return "00:00";
      }
    };

    const origStartISO: string = originalEvent._originalStartISO || startDate;
    const origEndISO: string = originalEvent._originalEndISO || endDate;
    const startTime = extractTime(origStartISO);
    const endTime = extractTime(origEndISO);

    // Build date-only strings (YYYY-MM-DD) from the ISO datetimes
    const toDateOnly = (iso: string) => iso.split("T")[0];

    return {
      title: originalEvent.title,
      description: originalEvent.description || "",
      location: originalEvent.location || "",
      startDate: buildTimestamp(toDateOnly(startDate), startTime),
      endDate: buildTimestamp(toDateOnly(endDate), endTime),
      localStartDate: buildLocalTimestamp(toDateOnly(startDate), startTime),
      localEndDate: buildLocalTimestamp(toDateOnly(endDate), endTime),
      repeat: originalEvent.repeat,
      repeatEndDate: (() => {
        const d = new Date(repeatEndDate);
        if (!isNaN(d.getTime())) {
          d.setDate(d.getDate() + 1);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          return buildTimestamp(`${yyyy}-${mm}-${dd}`, "23:59:59");
        }
        return new Date(repeatEndDate).toISOString();
      })(),
      alert: originalEvent.alert || 0,
      isForAll: originalEvent.isForAll || 0,
      isAllDayEvent: originalEvent.isAllDayEvent || 0,
      isSpecialEvent: originalEvent.isSpecialEvent || 0,
      isPrivateEvent: originalEvent.isPrivateEvent || 0,
      specialEvent: originalEvent.specialEvent ?? undefined,
      participants: participants,
      addedBy: originalEvent.addedBy || "",
      familyId: originalEvent.familyId || 0,
      familyUserId: originalEvent.familyUserId || "",
      // Always normalize recurrenceRule to camelCase — the API returns it in
      // PascalCase ({ Frequency, Interval }) but the create endpoint requires
      // camelCase ({ frequency, interval }). Sending PascalCase = INVALID_MODEL_STATE.
      recurrenceRule: (() => {
        const rule = originalEvent.recurrenceRule;
        if (!rule) return { frequency: 0, interval: 1 };
        return {
          frequency: rule.frequency ?? rule.Frequency ?? 0,
          interval: rule.interval ?? rule.Interval ?? 1,
        };
      })(),
      alarms: originalEvent.alarms || [],
      latitude: originalEvent.latitude || "",
      longitude: originalEvent.longitude || "",
      eventGuID: crypto.randomUUID(),
      externalCalendarId: originalEvent.externalCalendarId || 0,
      noPush: originalEvent.noPush || false,
      locale: originalEvent.locale || "",
      timeZone:
        originalEvent.timeZone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      offSet: originalEvent.offSet || dayjs().format("Z"),
    };
  };

  // Get formatted participants for the payload
  const getFormattedParticipants = () => {
    const firstResource = resources[0];

    const formattedParticipants = responsiblePersons
      .filter((person) => person.isSelected)
      .map((person) => {
        const existingParticipant = (initialData?.participants as any[])?.find(
          (p) =>
            String(p.ParticipantId || p.memberId || p.id) ===
            String(person.memberId || person.id),
        );

        const participantData: any = {
          ParticipantId: person.memberId,
          MemberId: person.memberId,
          localId: person.id,
          memberId: person.memberId,
          Participant: person.label,
          ParticipantFirstName: person.label,
          ParticipantClass: "",
          EventId: initialData?.id ? Number(initialData.id) : 0,
        };

        if (existingParticipant) {
          participantData.EventId =
            existingParticipant.EventId ||
            existingParticipant.eventId ||
            participantData.EventId;
          participantData.ParentEventId =
            existingParticipant.ParentEventId ||
            existingParticipant.parentEventId ||
            initialData?.parentEventId;
        } else {
          participantData.ParentEventId = initialData?.parentEventId || "";
        }

        participantData.eventId = participantData.EventId;
        participantData.parentEventId = participantData.ParentEventId;

        return participantData;
      });

    // Always include the first member (Family)
    if (firstResource) {
      const familyMemberId = firstResource.extendedProps?.memberId || "";
      const existingFamilyParticipant = (
        initialData?.participants as any[]
      )?.find(
        (p) =>
          String(p.ParticipantId || p.memberId || p.id) ===
          String(familyMemberId),
      );

      const familyParticipant: any = {
        ParticipantId: familyMemberId,
        MemberId: familyMemberId,
        localId: firstResource.id,
        memberId: familyMemberId,
        Participant: firstResource.title,
        ParticipantFirstName: firstResource.title,
        ParticipantClass: "",
        EventId: initialData?.id ? Number(initialData.id) : 0,
      };

      if (existingFamilyParticipant) {
        familyParticipant.EventId =
          existingFamilyParticipant.EventId ||
          existingFamilyParticipant.eventId ||
          familyParticipant.EventId;
        familyParticipant.ParentEventId =
          existingFamilyParticipant.ParentEventId ||
          existingFamilyParticipant.parentEventId ||
          initialData?.parentEventId;
      } else {
        familyParticipant.ParentEventId = initialData?.parentEventId || "";
      }

      familyParticipant.eventId = familyParticipant.EventId;
      familyParticipant.parentEventId = familyParticipant.ParentEventId;

      formattedParticipants.unshift(familyParticipant);
    }

    return formattedParticipants;
  };

  // Participants for CREATE calls — backend only accepts { localId, memberId, eventId }.
  // eventId must be 0 for new events (no existing event ID).
  const getParticipantsForCreate = () => {
    const firstResource = resources[0];

    const participants: {
      localId: number | string;
      memberId: string;
      eventId: number;
    }[] = [];

    // Add the family (first resource) member
    if (firstResource) {
      participants.push({
        localId: firstResource.id,
        memberId: firstResource.extendedProps?.memberId || "",
        eventId: 0,
      });
    }

    // Add each selected responsible person
    responsiblePersons
      .filter((person) => person.isSelected)
      .forEach((person) => {
        participants.push({
          localId: person.id,
          memberId: person.memberId || "",
          eventId: 0,
        });
      });

    return participants;
  };

  // Get the update payload
  const getUpdatePayload = (): UserEventUpdateRequest => {
    let repeatEndDate: string | null = null;
    if (
      formData.repeat !== 0 &&
      formData.repeatEndDate !== null &&
      formData.repeatEndDate !== undefined &&
      String(formData.repeatEndDate).trim() !== ""
    ) {
      const parsedVal =
        typeof formData.repeatEndDate === "string" &&
        !isNaN(Number(formData.repeatEndDate))
          ? Number(formData.repeatEndDate)
          : formData.repeatEndDate;

      const date = new Date(parsedVal as any);
      if (!isNaN(date.getTime())) {
        // Add 1 day to the selected end date as per backend configuration requirements
        date.setDate(date.getDate() + 1);
        
        // Extract the local date components from the incremented date
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        
        // Create the date at 23:59:59 LOCAL time, then convert to UTC ISO string.
        repeatEndDate = buildTimestamp(`${yyyy}-${mm}-${dd}`, "23:59:59");
      }
    }

    return {
      id: String(initialData?.id || ""),
      title: formData.title,
      description: formData.description || "",
      location: formData.location,
      startDate: buildTimestamp(
        formData.startDateOnly, 
        Number(formData.isAllDayEvent) === 1 ? "00:00:00" : formData.startTimeOnly
      ),
      endDate: buildTimestamp(
        formData.endDateOnly, 
        Number(formData.isAllDayEvent) === 1 ? "23:59:59" : formData.endTimeOnly
      ),
      localStartDate: buildLocalTimestamp(
        formData.startDateOnly,
        Number(formData.isAllDayEvent) === 1 ? "00:00:00" : formData.startTimeOnly,
      ),
      localEndDate: buildLocalTimestamp(
        formData.endDateOnly,
        Number(formData.isAllDayEvent) === 1 ? "23:59:59" : formData.endTimeOnly,
      ),
      repeat: formData.repeat,
      repeatEndDate,
      alert: formData.alert,
      isForAll: formData.isForAll,
      isAllDayEvent: formData.isAllDayEvent,
      isSpecialEvent: formData.isSpecialEvent,
      isPrivateEvent: formData.isPrivateEvent,
      specialEvent: formData.specialEvent,
      participants: getFormattedParticipants(),
      addedBy: formData.addedBy || "",
      familyId: formData.familyId,
      familyUserId: formData.familyUserId,
      recurrenceRule: formData.recurrenceRule,
      alarms: formData.alarms,
      latitude: formData.latitude,
      longitude: formData.longitude,
      eventGuID: formData.eventGuID,
      externalCalendarId: formData.externalCalendarId,
      noPush: formData.noPush,
    };
  };

  // Handle editing a single occurrence (splitting the series)
  const handleSingleOccurrenceEdit = async () => {
    if (!onCreateSeries) {
      console.error(
        "onCreateSeries is required for splitting recurring events",
      );
      setSelectionError("Unable to split recurring event. Please try again.");
      return;
    }

    setIsProcessing(true);

    try {
      // ── Read repeat value directly from initialData (NOT formData whose
      //    repeat is already set to 0 by the editType==='single' useEffect).
      const rawRepeat =
        initialData?.extendedProps?.Repeat ??
        initialData?.extendedProps?.repeat ??
        initialData?.repeat ??
        0;

      const rawRepeatEndDate =
        initialData?.extendedProps?.RepeatEndDate ??
        initialData?.extendedProps?.repeatEndDate ??
        initialData?.repeatEndDate ??
        null;

      // ── CRITICAL FIX ──────────────────────────────────────────────────────
      // When a user clicks a recurrence instance, initialData.startDate is
      // the START OF THAT SPECIFIC OCCURRENCE, NOT the first occurrence of the
      // series. Using it as the series start makes originalSeriesStartISO ===
      // editDateISO, so calculateSplitDates finds nothing before the edit and
      // nothing after — both arrays are empty, and neither createAppointmentCall
      // is ever invoked.
      //
      // The raw API event always stores the FIRST occurrence's start/end in
      // extendedProps.Start / extendedProps.End as numeric timestamp strings.
      // We must use those for originalSeriesStartISO, and use
      // initialData.startDate only as editDateISO (the clicked occurrence).
      // ─────────────────────────────────────────────────────────────────────

      const parseTs = (val: any): string => {
        if (!val) return "";
        const ts =
          typeof val === "string" && !isNaN(Number(val))
            ? Number(val) // numeric string → number
            : val instanceof Date
              ? val.getTime() // Date object → number
              : val; // already a number or ISO string
        const d = new Date(ts as any);
        return isNaN(d.getTime()) ? "" : d.toISOString();
      };

      // Series first-occurrence start/end — from raw API extendedProps
      const originalSeriesStartISO =
        parseTs(initialData?.extendedProps?.ActualStartDate) ||
        parseTs(initialData?.extendedProps?.Start) ||
        parseTs(initialData?.extendedProps?.start) ||
        parseTs(initialData?.startDate); // fallback if not a recurrence instance

      // The occurrence the user clicked — initialData.startDate
      const editDateISO =
        parseTs(initialData?.startDate) || originalSeriesStartISO;
        
      const occurrenceEndISO = parseTs(initialData?.endDate) || parseTs(initialData?.extendedProps?.End) || editDateISO;
        
      // Calculate original series end based on duration of the edited occurrence
      const originalSeriesEndISO = calculateEndDate(
        originalSeriesStartISO,
        editDateISO,
        occurrenceEndISO
      );

      // Parse repeatEndDate (may be a numeric timestamp string from the API)
      const repeatEndDateISO = parseTs(rawRepeatEndDate);

      if (!rawRepeat || rawRepeat === 0) {
        console.warn(
          "[Split] rawRepeat is 0 — not a recurring event, falling back to simple update.",
        );
        const updatePayload = getUpdatePayload();
        updatePayload.repeat = 0;
        updatePayload.repeatEndDate = null;
        onSubmit(updatePayload);
        handleClose();
        return;
      }

      if (!repeatEndDateISO) {
        console.warn(
          "[Split] repeatEndDate is missing — cannot calculate split dates.",
        );
        setSelectionError(
          "This recurring event has no end date and cannot be split.",
        );
        return;
      }

      // Calculate split points
      const { beforeDates, afterDates } = calculateSplitDates(
        originalSeriesStartISO,
        editDateISO,
        rawRepeat,
        repeatEndDateISO,
      );

      // Build a snapshot of the original event metadata (using initialData, NOT formData)
      const originalEventSnapshot = {
        title: initialData?.title || "",
        description:
          initialData?.extendedProps?.Description ||
          initialData?.extendedProps?.description ||
          "",
        location:
          initialData?.extendedProps?.Location ||
          initialData?.extendedProps?.location ||
          "",
        repeat: rawRepeat,
        repeatEndDate: repeatEndDateISO,
        alert:
          initialData?.extendedProps?.Alert ??
          initialData?.extendedProps?.alert ??
          0,
        isForAll:
          initialData?.extendedProps?.IsForAll ??
          initialData?.extendedProps?.isForAll ??
          0,
        isAllDayEvent:
          initialData?.extendedProps?.IsAllDayEvent ??
          initialData?.extendedProps?.isAllDayEvent ??
          0,
        isSpecialEvent:
          initialData?.extendedProps?.IsSpecialEvent ??
          initialData?.extendedProps?.isSpecialEvent ??
          0,
        isPrivateEvent:
          initialData?.extendedProps?.IsPrivateEvent ??
          initialData?.extendedProps?.isPrivateEvent ??
          0,
        specialEvent:
          initialData?.extendedProps?.SpecialEvent ??
          initialData?.extendedProps?.specialEvent ??
          null,
        alarms:
          initialData?.extendedProps?.Alarms ??
          initialData?.extendedProps?.alarms ??
          [],
        recurrenceRule:
          initialData?.extendedProps?.RecurrenceRule ??
          initialData?.extendedProps?.recurrenceRule ??
          null,
        latitude: initialData?.extendedProps?.latitude ?? "",
        longitude: initialData?.extendedProps?.longitude ?? "",
        addedBy:
          initialData?.extendedProps?.AddedBy ??
          initialData?.extendedProps?.addedBy ??
          "",
        familyId:
          initialData?.extendedProps?.FamilyId ??
          initialData?.extendedProps?.familyId ??
          0,
        familyUserId:
          initialData?.extendedProps?.FamilyUserId ??
          initialData?.extendedProps?.familyUserId ??
          "",
        externalCalendarId:
          initialData?.extendedProps?.ExternalCalendarId ??
          initialData?.extendedProps?.externalCalendarId ??
          0,
        noPush:
          initialData?.extendedProps?.NoPush ??
          initialData?.extendedProps?.noPush ??
          false,
        locale:
          initialData?.extendedProps?.Locale ??
          initialData?.extendedProps?.locale ??
          "",
        timeZone:
          initialData?.extendedProps?.TimeZone ??
          initialData?.extendedProps?.timeZone ??
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        offSet:
          initialData?.extendedProps?.OffSet ??
          initialData?.extendedProps?.offSet ??
          dayjs().format("Z"),
        // keep original start/end ISO so createSeriesPayload can extract the time
        _originalStartISO: originalSeriesStartISO,
        _originalEndISO: originalSeriesEndISO,
      };

      // Format participants for the new series — create shape only { localId, memberId }
      const formattedParticipants = getParticipantsForCreate();

      const results = {
        beforeSeries: null as UserEventCreateRequest | null,
        editedEvent: null as UserEventUpdateRequest | null,
        afterSeries: null as UserEventCreateRequest | null,
      };

      // 1. Update the single edited event FIRST (detach it from the recurring
      //    series by setting repeat=0). The backend must process this before the
      //    two new series are created so there is no overlap.
      const updatePayload = getUpdatePayload();
      updatePayload.repeat = 0;
      updatePayload.repeatEndDate = null;
      results.editedEvent = updatePayload;

      await onSubmit(results.editedEvent);

      // 2. Create "Before" series (occurrences before the edited one)
      if (beforeDates.length > 0) {
        const beforeStart = beforeDates[0];
        const beforeEnd = calculateEndDate(
          beforeStart,
          originalSeriesStartISO,
          originalSeriesEndISO,
        );
        const beforeSeriesLastStart = beforeDates[beforeDates.length - 1];
        const beforeSeriesEnd = calculateEndDate(
          beforeSeriesLastStart,
          originalSeriesStartISO,
          originalSeriesEndISO,
        );

        const beforePayload = createSeriesPayload(
          beforeStart,
          beforeEnd,
          beforeSeriesEnd,
          originalEventSnapshot,
          formattedParticipants,
        );

        await onCreateSeries(beforePayload);
        results.beforeSeries = beforePayload;
      }

      // 3. Create "After" series (occurrences after the edited one)
      if (afterDates.length > 0) {
        const afterStart = afterDates[0];
        const afterEnd = calculateEndDate(
          afterStart,
          originalSeriesStartISO,
          originalSeriesEndISO,
        );
        const afterSeriesLastStart = afterDates[afterDates.length - 1];
        const afterSeriesEnd = calculateEndDate(
          afterSeriesLastStart,
          originalSeriesStartISO,
          originalSeriesEndISO,
        );

        const afterPayload = createSeriesPayload(
          afterStart,
          afterEnd,
          afterSeriesEnd,
          originalEventSnapshot,
          formattedParticipants,
        );

        await onCreateSeries(afterPayload);
        results.afterSeries = afterPayload;
      }

      // Notify parent about the completed split (triggers data reload)
      if (onRecurringSplit) {
        await onRecurringSplit(results as any);
      }

      handleClose();
    } catch (error) {
      console.error("Error splitting recurring event:", error);
      setSelectionError("Failed to split recurring event. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle editing the entire series
  const handleSeriesEdit = () => {
    // Normal update - all occurrences updated
    const payload = getUpdatePayload();
    onSubmit(payload);
    handleClose();
  };

  // Handle the selection from the recurring options overlay
  const handleRecurringOptionSelect = (option: "single" | "series") => {
    setShowRecurringOptions(false);

    if (option === "single") {
      // NOTE: We call handleSingleOccurrenceEdit() BEFORE mutating formData so
      // that the function can still read the original repeat value from initialData.
      // handleSingleOccurrenceEdit reads directly from initialData (not formData)
      // for the critical split fields, so order no longer matters here.
      setIsRepeatDisabled(true);
      setOriginalRepeatValue(
        formData.repeat || initialData?.extendedProps?.repeat || 0,
      );
      handleSingleOccurrenceEdit();
      // Disable repeat in the UI after initiating the split
      setFormData((prev) => ({
        ...prev,
        repeat: 0,
        repeatEndDate: null,
      }));
    } else {
      setIsRepeatDisabled(false);
      handleSeriesEdit();
    }
  };

  const handleLocationChange = (
    location: string,
    lat?: number,
    lng?: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      location,
      latitude: lat !== undefined ? String(lat) : prev.latitude,
      longitude: lng !== undefined ? String(lng) : prev.longitude,
    }));
  };

  // Generic handler for text inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "title") setTitleError(null);
  };

  const handleToggleChange = (
    field: keyof AppointmentUpdateFormUI,
    checked: boolean,
  ) => {
    setFormData((prev) => {
      const newState = {
        ...prev,
        [field]: checked ? 1 : 0,
        specialEvent:
          field === "isSpecialEvent" && checked
            ? (prev.specialEvent ?? SpecialEventEnum.Birthday)
            : prev.specialEvent,
      };

      if (field === "isSpecialEvent" && checked) {
        // Calculate repeatEndDate (10 years from today or startDate)
        const baseDateStr = prev.startDateOnly || new Date().toISOString().split("T")[0];
        const date = new Date(baseDateStr);
        let newRepeatEndDate = null;
        if (!isNaN(date.getTime())) {
          date.setFullYear(date.getFullYear() + 10);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          newRepeatEndDate = `${yyyy}-${mm}-${dd}`;
        }

        // Select all participants
        const allOptions = mapResourcesToSelectableOptions(resources);
        const allParticipants = allOptions.map((option) => ({
          ParticipantId: option.memberId || "",
          MemberId: option.memberId || "",
          localId: option.id,
          memberId: option.memberId || "",
          EventId: 0,
          ParentEventId: "",
        }));

        setResponsiblePersons(
          allOptions.slice(1).map((option) => ({
            ...option,
            isSelected: true,
          })),
        );

        newState.participants = allParticipants;
        newState.isForAll = 1;
        newState.repeat = 5;
        newState.alert = 8;
        newState.repeatEndDate = newRepeatEndDate;
      }

      if (field === "isSpecialEvent" && !checked) {
        // When turning off, optionally reset to some safe default, but in edit we might just let it be
        // or reset repeat to 0. We'll just reset repeat to 0 and alert to 0.
        newState.repeat = 0;
        newState.alert = 0;
        newState.repeatEndDate = null;
      }

      return newState;
    });
  };

  const handleSpecialEventChange = (value: SpecialEventEnum) => {
    setFormData((prev) => ({
      ...prev,
      specialEvent: value,
    }));
  };

  // Generic handler for single-select SingleSelector components
  const handleSingleSelectChange = (
    field: keyof AppointmentUpdateFormUI,
    selectedOptions: SelectableOption[],
  ) => {
    const selectedOption = selectedOptions.find((option) => option.isSelected);
    const newValue = selectedOption ? selectedOption.id : 0;

    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleRepeatChange = (selectedOption: SelectableOption) => {
    const repeatValue = selectedOption.isSelected ? selectedOption.id : 0;
    setFormData((prev) => {
      let newRepeatEndDate = prev.repeatEndDate;
      
      if (repeatValue !== 0) {
        // Only generate a new default date if one isn't already set, or if changing frequency
        // We use startDateOnly or today as the base
        const baseDateStr = prev.startDateOnly || new Date().toISOString().split("T")[0];
        const date = new Date(baseDateStr);
        
        if (!isNaN(date.getTime())) {
          if (repeatValue === 1) {
            date.setMonth(date.getMonth() + 1);
          } else if (repeatValue === 2 || repeatValue === 3) {
            date.setMonth(date.getMonth() + 3);
          } else if (repeatValue === 4) {
            date.setFullYear(date.getFullYear() + 1);
          } else if (repeatValue === 5) {
            date.setFullYear(date.getFullYear() + 10);
          }
          
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          newRepeatEndDate = `${yyyy}-${mm}-${dd}`;
        }
      } else {
         newRepeatEndDate = null;
      }
      
      return {
        ...prev,
        repeat: Number(repeatValue),
        repeatEndDate: newRepeatEndDate,
      };
    });
  };

  // Handler for responsible persons (multi-select)
  const handleResponsiblePersonsChange = (
    selectedPersons: SelectableOption[],
  ) => {
    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: selectedPersons.some((sp) => sp.id === person.id),
      })),
    );

    setFormData((prev) => ({
      ...prev,
      isForAll: selectedPersons.length + 1 === resources.length ? 1 : 0,
    }));
  };

  // Update the submit handler to check for recurring events and editType
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate title
    if (!formData.title || formData.title.trim() === "") {
      setTitleError("Please enter an appointment name.");
      return;
    }

    // Validate participants
    if (!responsiblePersons.some((p) => p.isSelected)) {
      setSelectionError("Please select at least one responsible person.");
      return;
    }

    // If editType is already set (from calendar selection), don't show options again
    if (editType) {
      if (editType === "single") {
        handleSingleOccurrenceEdit();
      } else {
        handleSeriesEdit();
      }
      return;
    }

    // Check if this is a recurring event and show the options overlay
    if (isRecurringEvent()) {
      setShowRecurringOptions(true);
      return;
    }

    // For non-recurring events, submit directly
    const payload = getUpdatePayload();
    onSubmit(payload);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setSelectionError(null);
    setTitleError(null);
    setShowRecurringOptions(false);
    setIsProcessing(false);
    setOriginalRepeatValue(0);
    setIsRepeatDisabled(false); // RESET REPEAT DISABLED STATE
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, handleClose]);

  // Initialize form when initialData changes
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(normalizeInitialData(initialData));
      // Reset repeat disabled state when new data loads
      setIsRepeatDisabled(false);
    }
  }, [initialData, isOpen]);

  // FIXED: Handle editType from calendar selection
  useEffect(() => {
    if (editType === "single") {
      // Set repeat to 0 and disable repeat selection
      setFormData((prev) => ({
        ...prev,
        repeat: 0,
        repeatEndDate: null,
      }));
      setIsRepeatDisabled(true); // DISABLE REPEAT
      setShowRecurringOptions(false);
    } else if (editType === "series") {
      // Keep the original repeat value
      setIsRepeatDisabled(false); // ENABLE REPEAT
      setShowRecurringOptions(false);
    } else {
      // Reset when editType is null
      setIsRepeatDisabled(false);
    }
  }, [editType, initialData]);

  // Initialize responsible persons from resources
  useEffect(() => {
    if (resources.length === 0 || !isOpen) return;

    const mappedPersons = mapResourcesToSelectableOptions(resources);
    const otherMembers = mappedPersons.slice(1);

    const isForAllValue = Number(
      initialData?.isForAll ??
      initialData?.IsForAll ??
      initialData?.extendedProps?.IsForAll ??
      0
    );

    if (initialData?.participants && initialData.participants.length > 0) {
      const selectedMemberIds = new Set(
        initialData.participants.map((p: any) =>
          String(p.ParticipantId || p.memberId || p.id),
        ),
      );

      const updatedPersons = otherMembers.map((person) => ({
        ...person,
        isSelected:
          selectedMemberIds.has(String(person.memberId)) ||
          selectedMemberIds.has(String(person.id)),
      }));
      setResponsiblePersons(updatedPersons);

      const selectedCount =
        updatedPersons.filter((p) => p.isSelected).length + 1;
      setFormData((prev) => ({
        ...prev,
        isForAll: selectedCount === resources.length ? 1 : 0,
      }));
    } else if (isForAllValue === 1) {
      const updatedPersons = otherMembers.map((person) => ({
        ...person,
        isSelected: true,
      }));
      setResponsiblePersons(updatedPersons);
      setFormData((prev) => ({
        ...prev,
        isForAll: 1,
      }));
    } else {
      setResponsiblePersons(otherMembers);
      setFormData((prev) => ({
        ...prev,
        isForAll: resources.length === 1 ? 1 : 0,
      }));
    }
  }, [resources, initialData?.participants, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
      onClick={isProcessing ? undefined : handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[98vh] flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full-modal processing overlay — shown during split API calls */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="relative">
                <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-gray-800">
                  Saving changes...
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Updating your calendar. Please wait.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Compact Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <Image
                src={editAppointmentImage}
                alt="icon"
                width={16}
                height={16}
              />
            </div>
            <h2 className="text-lg font-bold text-gray-800">
              {isRecurringEvent() ? "Edit Recurring Event" : "Edit Appointment"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isProcessing}
          >
            <Image src={closeIcon} alt="Close" width={20} height={20} />
          </button>
        </div>

        {/* Recurring Options Overlay */}
        {showRecurringOptions && isRecurringEvent() && (
          <RecurringEditOptions
            onSelect={handleRecurringOptionSelect}
            onCancel={() => setShowRecurringOptions(false)}
            isProcessing={isProcessing}
          />
        )}

        {/* Scrollable Form Content */}
        <div
          className={`overflow-y-auto flex-1 p-3 lg:p-4 ${showRecurringOptions ? "opacity-50 pointer-events-none" : ""}`}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Basic Information & Toggles Combined */}
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Name field - hide when special event is active */}
                {formData.isSpecialEvent === 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-gray-700 uppercase tracking-wider">
                      <Image src={nameIcon} alt="icon" width={12} height={12} />{" "}
                      Name
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter appointment title"
                      value={formData.title || ""}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${titleError ? "border-red-500" : "border-gray-200"}`}
                      disabled={isProcessing}
                    />
                    {titleError && (
                      <p className="text-xs text-red-500 font-medium mt-1">
                        {titleError}
                      </p>
                    )}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold flex items-center gap-1.5 text-gray-700 uppercase tracking-wider">
                    Location
                  </label>
                  <LocationInput
                    key={formData.location}
                    value={formData?.location || ""}
                    onChange={handleLocationChange}
                    placeholder="Search location..."
                    required
                    disabled={isProcessing}
                  />
                  {isCoordinateString(formData?.location || "") && (
                    <p className="text-[10px] text-gray-500 mt-0.5 italic">
                      Fetching place name...
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Image
                      src={SpecialEventIcon}
                      alt="icon"
                      width={12}
                      height={12}
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      Special Event
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={formData.isSpecialEvent === 1}
                    onChange={(checked) =>
                      handleToggleChange("isSpecialEvent", checked)
                    }
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Image
                      src={SpecialEventIcon}
                      alt="icon"
                      width={12}
                      height={12}
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      Private
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={formData.isPrivateEvent === 1}
                    onChange={(checked) =>
                      handleToggleChange("isPrivateEvent", checked)
                    }
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Image
                      src={SpecialEventIcon}
                      alt="icon"
                      width={12}
                      height={12}
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      All Day
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={Number(formData.isAllDayEvent) === 1}
                    onChange={(checked) =>
                      handleToggleChange("isAllDayEvent", checked)
                    }
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Special Event Options */}
              {formData.isSpecialEvent === 1 && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="specialEvent"
                        checked={
                          formData.specialEvent === SpecialEventEnum.Birthday
                        }
                        onChange={() =>
                          handleSpecialEventChange(SpecialEventEnum.Birthday)
                        }
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 transition-all cursor-pointer"
                        disabled={isProcessing}
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        Birthday
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="specialEvent"
                        checked={
                          formData.specialEvent === SpecialEventEnum.Anniversary
                        }
                        onChange={() =>
                          handleSpecialEventChange(SpecialEventEnum.Anniversary)
                        }
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 transition-all cursor-pointer"
                        disabled={isProcessing}
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        Anniversary
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                        What / Whom
                      </label>
                      <input
                        type="text"
                        name="specialEventWhatWhom"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }));
                          setTitleError(null);
                        }}
                        placeholder="e.g., John's Birthday"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50/30"
                        disabled={isProcessing}
                      />
                      {titleError && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          {titleError}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                        Date
                      </label>
                      <input
                        type="date"
                        name="specialEventDate"
                        value={formData.startDateOnly}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            startDateOnly: e.target.value,
                            endDateOnly: e.target.value,
                          }));
                        }}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50/30"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image
                  src={participantsIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Choose Participants
              </label>
              <ResponsiblePersonSelector
                options={responsiblePersons}
                onSelectionChange={handleResponsiblePersonsChange}
                subHeading="Select Responsible Persons"
                disabled={isProcessing}
              />
              {selectionError && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {selectionError}
                </p>
              )}
            </div>

            {/* Repeat & Alarm Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Date & Time - Hide when special event is active */}
              {formData.isSpecialEvent === 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                    <Image
                      src={participantsIcon}
                      alt="icon"
                      width={14}
                      height={14}
                    />{" "}
                    Choose Dates & Time
                  </label>
                  <DateTimeRange
                    startDate={formData.startDateOnly}
                    endDate={formData.endDateOnly}
                    startTime={formData.startTimeOnly}
                    endTime={formData.endTimeOnly}
                    onStartDateChange={(v) =>
                      setFormData((p) => ({ ...p, startDateOnly: v }))
                    }
                    onEndDateChange={(v) =>
                      setFormData((p) => ({ ...p, endDateOnly: v }))
                    }
                    onStartTimeChange={(v) =>
                      setFormData((p) => ({ ...p, startTimeOnly: v }))
                    }
                    onEndTimeChange={(v) =>
                      setFormData((p) => ({ ...p, endTimeOnly: v }))
                    }
                    hideHeading={true}
                    required
                    autoSyncEndDateTime={false}
                    disabled={isProcessing}
                    disableTime={Number(formData.isAllDayEvent) === 1}
                  />
                  {(formData.repeat ?? 0) !== 0 && (
                    <div className="space-y-1 grid grid-cols-1">
                      <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                        Repeat End Date
                      </label>
                      <div className="bg-blue-100/50 p-2 rounded-lg">
                        <input
                          type="date"
                          name="repeatEndDate"
                          value={parseDateToForm(formData.repeatEndDate)}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          disabled={
                            isProcessing ||
                            isRepeatDisabled ||
                            (formData.repeat ?? 0) === 0
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                  <Image src={repeatIcon} alt="icon" width={14} height={14} />{" "}
                  Repeat
                </label>
                <div className="flex flex-col gap-2">
                  <SingleSelector
                    options={REPEAT_OPTIONS.map((o) => ({
                      ...o,
                      isSelected: o.id === formData.repeat,
                    }))}
                    onSelectionChange={(s) =>
                      handleRepeatChange(s)
                    }
                    selectedBorderColor="blue"
                    selectedBadgeColor="blue"
                    disabled={isProcessing || isRepeatDisabled}
                  />
                  {formData.repeat !== 0 && (
                    <div className="flex items-center gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                      <span className="text-xs font-bold text-gray-700">
                        Interval:
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={formData.recurrenceRule?.interval || 1}
                        disabled={isProcessing || isRepeatDisabled}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setFormData((prev) => ({
                            ...prev,
                            recurrenceRule: {
                              frequency: val > 0 ? val - 1 : 0,
                              interval: val,
                            },
                          }));
                        }}
                        className="w-16 px-2 py-1 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                      />
                      <span className="text-xs text-gray-500">
                        {formData.repeat === 1
                          ? "day(s)"
                          : formData.repeat === 2
                            ? "week(s)"
                            : formData.repeat === 3
                              ? "2 week(s)"
                              : formData.repeat === 4
                                ? "month(s)"
                                : "year(s)"}
                      </span>
                    </div>
                  )}
                </div>
                {isRepeatDisabled && isRecurringEvent() && (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    This occurrence will be a standalone event (not recurring)
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image src={alarmIcon} alt="icon" width={14} height={14} />{" "}
                Alarm
              </label>
              <SingleSelector
                options={ALERT_OPTIONS.map((o) => ({
                  ...o,
                  isSelected: o.id === formData.alert,
                }))}
                onSelectionChange={(s) =>
                  handleSingleSelectChange("alert", [s])
                }
                selectedBorderColor="blue"
                selectedBadgeColor="blue"
                disabled={isProcessing}
              />
            </div>

            {/* Repeat End Date - Only show if repeat is not Never */}

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image
                  src={additionalNoteIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Additional Notes
              </label>
              <textarea
                name="description"
                onChange={handleInputChange}
                placeholder="Add any additional details here..."
                rows={1}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[40px]"
                value={formData.description || ""}
                disabled={isProcessing}
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Update Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentPopup;
