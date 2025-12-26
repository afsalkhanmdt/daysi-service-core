import { EventInput } from "@fullcalendar/core";
import { FamilyData } from "../admin/family-view/components/FamilyViewWrapper";

export type appointmentPopupPropsType = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  appointment?: EventInput;
   
};

export enum SpecialEvent {
  Birthday = 0,
  Anniversary = 1
}

export enum Repeat {
  Never = 0,
  EveryDay = 1,
  EveryWeek = 2,
  Every2Week = 3,
  EveryMonth = 4,
  EveryYear = 5
}

export enum Alert {
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
  // Optional based on your commented code
  // memberId?: string;
  
  participants: Participant[];
  familyUserId?: string;
  familyId: number;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  location?: string;
  specialEvent?: SpecialEvent;
  repeat?: Repeat;
  repeatEndDate?: Date | string | null;
  alert?: Alert;
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
