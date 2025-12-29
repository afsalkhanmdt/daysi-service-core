import { Alert, Repeat, FrequencyEnum } from "@/app/types/appoinment";
import { SelectableOption } from "../admin/family-view/components/FormComponents/MultipleSelector";

export const ALERT_OPTIONS: SelectableOption[] = [
  { id: Alert.None, label: "Never", isSelected: false },
  { id: Alert.AtTimeOfTheEvent, label: "At Time of Event", isSelected: false },
  { id: Alert.FiveMinutesBefore, label: "5 mins before", isSelected: false },
  { id: Alert.FifteenMinutsBefore, label: "15 mins before", isSelected: false },
  { id: Alert.ThirtyMinutsBefore, label: "30 min before", isSelected: false },
  { id: Alert.OneHourBefore, label: "1 hour before", isSelected: false },
  { id: Alert.TwoHoursBefore, label: "2 hours before", isSelected: false },
  { id: Alert.OneWeekBefore, label: "1 week before", isSelected: false },
  { id: Alert.OneDayBefore, label: "1 day before", isSelected: false },
  { id: Alert.FourHoursBefore, label: "4 hours before", isSelected: false },
  { id: Alert.EightHoursBefore, label: "8 hours before", isSelected: false },
];

export const REPEAT_OPTIONS: SelectableOption[] = [
  { id: Repeat.Never, label: "Never", isSelected: false },
  { id: Repeat.EveryDay, label: "Everyday", isSelected: false },
  { id: Repeat.EveryWeek, label: "Every Week", isSelected: false },
  { id: Repeat.Every2Week, label: "Every 2 Weeks", isSelected: false },
  { id: Repeat.EveryMonth, label: "Every Month", isSelected: false },
  { id: Repeat.EveryYear, label: "Every Year", isSelected: false },
];

export const FREQUENCY_OPTIONS: SelectableOption[] = [
  { id: FrequencyEnum.Never, label: "Never", isSelected: false },
  { id: FrequencyEnum.EveryDay, label: "Every Day", isSelected: false },
  { id: FrequencyEnum.EveryWeek, label: "Every Week", isSelected: false },
  { id: FrequencyEnum.EveryMonth, label: "Every Month", isSelected: false },
  { id: FrequencyEnum.EveryYear, label: "Every Year", isSelected: false },
];

// Add these functions to your existing appointmentForm.ts constants file
export const parseDateToForm = (dateString: string | null): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export const parseTimeToForm = (dateString: string | null): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toTimeString().slice(0, 5);
  } catch {
    return "";
  }
};

export const buildTimestamp = (date: string, time: string) => {
  return new Date(`${date}T${time}`).toISOString();
};