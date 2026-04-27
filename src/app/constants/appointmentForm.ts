import { FrequencyEnum, UserEventCreateRequest, RepeatEnum, AlertEnum } from "@/app/types/appoinment";
import { SelectableOption } from "../admin/family-view/components/FormComponents/MultipleSelector";

export const initialFormDataForAppointmentApi: UserEventCreateRequest = {
  participants: [],
  familyId: 0,
  title: "",
  addedBy: "",
  familyUserId: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  specialEvent: undefined,
  repeat: RepeatEnum.Never,
  repeatEndDate: null,
  alert: AlertEnum.None,
  alarms: [],
  isForAll: 0,
  isAllDayEvent: 0,
  isSpecialEvent: 0,
  isPrivateEvent: 1,
  eventPerson: "",
  eventsUpdatedOn: "",
  localStartDate: "",
  localEndDate: "",
  timeZone: "",
  offSet: "",
  locale: "",
  parentEventId: "",
  eventGuID: "",
  externalCalendarId: 0,
  latitude: "",
  longitude: "",
  recurrenceRule: {
    frequency: FrequencyEnum.Never,
    interval: 1,
  },
  noPush: false,
};
export const ALERT_OPTIONS: SelectableOption[] = [
  { id: AlertEnum.None, label: "Never", isSelected: false },
  { id: AlertEnum.AtTimeOfTheEvent, label: "At Time of Event", isSelected: false },
  { id: AlertEnum.FiveMinutesBefore, label: "5 mins before", isSelected: false },
  { id: AlertEnum.FifteenMinutsBefore, label: "15 mins before", isSelected: false },
  { id: AlertEnum.ThirtyMinutsBefore, label: "30 min before", isSelected: false },
  { id: AlertEnum.OneHourBefore, label: "1 hour before", isSelected: false },
  { id: AlertEnum.TwoHoursBefore, label: "2 hours before", isSelected: false },
  { id: AlertEnum.OneWeekBefore, label: "1 week before", isSelected: false },
  { id: AlertEnum.OneDayBefore, label: "1 day before", isSelected: false },
  { id: AlertEnum.FourHoursBefore, label: "4 hours before", isSelected: false },
  { id: AlertEnum.EightHoursBefore, label: "8 hours before", isSelected: false },
];

export const REPEAT_OPTIONS: SelectableOption[] = [
  { id: RepeatEnum.Never, label: "Never", isSelected: false },
  { id: RepeatEnum.EveryDay, label: "Everyday", isSelected: false },
  { id: RepeatEnum.EveryWeek, label: "Every Week", isSelected: false },
  { id: RepeatEnum.Every2Week, label: "Every 2 Weeks", isSelected: false },
  { id: RepeatEnum.EveryMonth, label: "Every Month", isSelected: false },
  { id: RepeatEnum.EveryYear, label: "Every Year", isSelected: false },
];

export const FREQUENCY_OPTIONS: SelectableOption[] = [
  { id: FrequencyEnum.Never, label: "Never", isSelected: false },
  { id: FrequencyEnum.EveryDay, label: "Every Day", isSelected: false },
  { id: FrequencyEnum.EveryWeek, label: "Every Week", isSelected: false },
  { id: FrequencyEnum.EveryMonth, label: "Every Month", isSelected: false },
  { id: FrequencyEnum.EveryYear, label: "Every Year", isSelected: false },
];

// Add these functions to your existing appointmentForm.ts constants file
export const parseDateToForm = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export const parseTimeToForm = (dateString: string | null): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toTimeString().slice(0, 5);
  } catch {
    return "";
  }
};


export const parseTimestampToDateOnly = (timestamp: string): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split('T')[0];
};

export const parseTimestampToTimeOnly = (timestamp: string): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const buildTimestamp = (date: string, time: string) => {
  if (!date || !time) return "";
  const d = new Date(`${date}T${time}`);
  if (isNaN(d.getTime())) return "";
  return d.toISOString();
};