export enum ScheduleDesign {
  SCHOOL = "school",
  WORK = "work",
}

export interface ScheduleConfiguration {
  topOfPageStartTime: string;
  scheduleDesign: ScheduleDesign;
}

export interface ScheduleTask {
  id: number;
  date: string;
  weekday: number;
  startTime: string;
  endTime: string;
  description: string;
  note?: string;
  iconId?: number;
}

export interface FamilyMemberSchedule {
  memberId: string;
  memberName: string;
  avatar?: string;

  scheduleType: number;
  scheduleName: string;

  daysPerPage: number;

  weekScheduleStartDay: number;

  scheduleDesign: ScheduleDesign;
}