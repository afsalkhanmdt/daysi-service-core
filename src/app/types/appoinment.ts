import { EventApi, EventInput } from "@fullcalendar/core";

/* ================================
   Popup Props (IMPORTANT FIX)
================================ */

export type AppointmentPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExtendedProps) => void;
  appointment?: EventApi| null; // For edit mode
};

/* ================================
   Backend Event (API shape)
================================ */

export type BackendEvent = {
  Id: number;
  FamilyId: number;
  Title: string;
  Description: string | null;
  Location: string | null;

  Start: string;
  End: string;

  Repeat: number;
  RepeatEndDate: string | null;
  IsAllDayEvent: number;

  EventParticipant: EventParticipant[];
  ExternalCalendarName: string | null;

  RecurrenceRule?: RecurrenceRule;
};

/* ================================
   Frontend ExtendedProps (UI-safe)
================================ */

export type ExtendedProps = BackendEvent & {
  participants: EventParticipant[];
  externalCalender: string | null;
  userColorCode: string;

  description: string;
  location: string;

  isRecurrence: boolean;
};

/* ================================
   Calendar Event Input (creation)
================================ */

export type CalendarEventInput = EventInput & {
  extendedProps: ExtendedProps;
};

/* ================================
   Supporting Types
================================ */

export type EventParticipant = {
  ParticipantId: string;
  Participant: string;
  ParticipantClass: string;
  ParticipantFirstName: string | null;
};

export type RecurrenceRule = {
  Frequency: number;
  Interval: number;
};
