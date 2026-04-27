import { EventInput } from "@fullcalendar/core";

export type appointmentPopupPropsType = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  appointment?: EventInput;
   
};

export type AppointmentCreateFormUI = UserEventCreateRequest & {
  startDateOnly: string;
  startTimeOnly: string;
  endDateOnly: string;
  endTimeOnly: string;
};

export type AppointmentUpdateFormUI = UserEventUpdateRequest & {
  startDateOnly: string;
  startTimeOnly: string;
  endDateOnly: string;
  endTimeOnly: string;
};


export enum SpecialEventEnum {
  Birthday = 0,
  Anniversary = 1
}

export enum RepeatEnum {
  Never = 0,
  EveryDay = 1,
  EveryWeek = 2,
  Every2Week = 3,
  EveryMonth = 4,
  EveryYear = 5
}

export enum AlertEnum {
  None = 0,
  AtTimeOfTheEvent = 1,
  FiveMinutesBefore = 2,
  FifteenMinutsBefore = 3,
  ThirtyMinutsBefore = 4,
  OneHourBefore = 5,
  TwoHoursBefore = 6,
  OneWeekBefore = 7,
  OneDayBefore = 8,
  FourHoursBefore = 9,
  EightHoursBefore = 10
}

export enum FrequencyEnum {
  Never = 0,
  EveryDay = 1,
  EveryWeek = 2,
  EveryMonth = 3,
  EveryYear = 4
}

export interface Participant {
  id?: string;
  memberId?: string;
  name?: string;
  email?: string;
  // Add other participant properties as needed
}

export interface Alarm {
  id: number;
}

export interface RecurrenceRule {
  frequency: FrequencyEnum;
  interval: number;
}

export interface UserEventCreateRequest {
  participants: Participant[];
  familyUserId?: string;
  familyId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  specialEvent?: SpecialEventEnum;
  repeat?: RepeatEnum;
  repeatEndDate?: string | null;
  alert?: AlertEnum;
  alarms?: Alarm[];
  isForAll: number;
  isAllDayEvent: number;
  isSpecialEvent: number;
  isPrivateEvent: number;
  eventPerson?: string;
  addedBy: string;
  eventsUpdatedOn?: string;
  localStartDate?: string;
  localEndDate?: string;
  timeZone?: string;
  offSet?: string;
  locale?: string;
  parentEventId?: string;
  eventGuID?: string;
  externalCalendarId?: number;
  latitude?: string;
  longitude?: string;
  recurrenceRule?: RecurrenceRule;
  noPush?: boolean;
}

export interface UserEventUpdateRequest {
  id: string;
  participants: Participant[];
  familyUserId?: string;
  familyId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  specialEvent?: SpecialEventEnum;
  repeat?: RepeatEnum;
  repeatEndDate?: string | null;
  alert?: AlertEnum;
  alarms?: Alarm[];
  isForAll: number;
  isAllDayEvent: number;
  isSpecialEvent: number;
  isPrivateEvent: number;
  eventPerson?: string;
  addedBy: string;
  eventsUpdatedOn?: string;
  localStartDate?: string;
  localEndDate?: string;
  timeZone?: string;
  offSet?: string;
  locale?: string;
  parentEventId?: string;
  eventGuID?: string;
  externalCalendarId?: number;
  latitude?: string;
  longitude?: string;
  recurrenceRule?: RecurrenceRule;
  noPush?: boolean;
}
