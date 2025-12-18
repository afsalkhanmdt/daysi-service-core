import { EventInput } from "@fullcalendar/core";

export type appointmentPopupPropsType = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  appointment?: EventInput;
};

export type CalendarEvent = {
  id: number;
  resourceId: string;
  title: string;
  start: string;
  end: string;
  display: "block" | "auto" | "background";
  extendedProps: ExtendedProps;
};

export type ExtendedProps = {
  Id: number;
  FamilyId: number;
  Title: string;
  Description: string | null;
  Location: string | null;
  ActualStartDate: string | null;

  Start: string;
  End: string;

  SpecialEvent: number;
  EventPerson: string;
  Repeat: number;
  RepeatEndDate: string;
  Alert: number;

  IsForAll: number;
  IsSpecialEvent: number;
  IsAllDayEvent: number;
  IsPrivateEvent: number;

  FamilyColorCode: string;

  Attendee: string[];
  EventParticipant: EventParticipant[];
  ParentEventId: string;

  UpdatedOn: string;
  AddedBy: string;

  ExternalCalendarId: number;
  ExternalCalendarName: string | null;

  Alarms: any | null;

  Latitude: number | null;
  Longitude: number | null;

  RecurrenceRule: RecurrenceRule;

  LocalStartDate: string;
  LocalEndDate: string;
  LocalRepeatEndDate: string;

  participants: EventParticipant[];

  externalCalender: any | null;
  userColorCode: string;

  description: string;
  location: string;

  isRecurrence: boolean;
};


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
