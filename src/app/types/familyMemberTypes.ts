// types/member.ts

// --- Enums ---
export enum MemberType {
  FamilyAdmin = 0,
  Family = 1,
  Member = 2,
  Shared = 3,
  SuperAdmin = 4,
  SharedAdmin = 5,
}

export enum EmailSystem {
  None = 0,
  Outlook = 1,
  Gmail = 2,
}

export enum InvitationStatus {
  Pending = 0,
  Declined = 1,
  Accepted = 2,
}

export enum SpecialEvent {
  Birthday = 0,
  Anniversary = 1,
}

export enum Repeat {
  Never = 0,
  EveryDay = 1,
  EveryWeek = 2,
  Every2Week = 3,
  EveryMonth = 4,
  EveryYear = 5,
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
  EightHoursBefore = 10,
}

export enum FrequencyEnum {
  Never = 0,
  EveryDay = 1,
  EveryWeek = 2,
  EveryMonth = 3,
  EveryYear = 4,
}

export enum DuplicateSequence {
  Never = 0,
  EachWeek = 1,
  Each2Week = 2,
  Each3Week = 3,
  Each4Week = 4,
}

// --- Submodels ---
export interface EventParticipant {
  ParticipantId: string
  Participant: string
  ParticipantClass: string
  ParticipantFirstName: string
}

export interface Alarm {
  Id: number
}

export interface RecurrenceRule {
  Frequency: FrequencyEnum
  Interval: number
}

export interface UserEvent {
  Id: number
  FamilyId: number
  Title: string
  Description: string
  Location: string
  ActualStartDate: string
  Start: string
  End: string
  SpecialEvent?: SpecialEvent
  EventPerson: string
  Repeat: Repeat
  RepeatEndDate: string
  Alert: Alert
  IsForAll: number
  IsSpecialEvent: number
  IsAllDayEvent: number
  IsPrivateEvent: number
  FamilyColorCode: string
  Attendee: string[]
  EventParticipant: EventParticipant[]
  ParentEventId: string
  UpdatedOn: string
  AddedBy: string
  ExternalCalendarId: number
  ExternalCalendarName: string
  Alarms: Alarm[]
  Latitude: string
  Longitude: string
  RecurrenceRule: RecurrenceRule
  LocalStartDate: string
  LocalEndDate: string
  LocalRepeatEndDate: string
}

export interface SharedInFamilyResponse {
  Email: string
  MemberId: string
  FamilyId?: number
  InvitationStatus: InvitationStatus
}

export interface ExternalCalendarResponse {
  CalendarName: string
  CalendarURL: string
  CalendarId: number
  FamilyId: number
  MemberId: string
  MembersUpdatedOn: string
}

export interface ToDoAccessSpecifier {
  MemberId: string
  HasViewAccess: boolean
  HasCreateAccess: boolean
}

export interface MasterScheduleResponse {
  ShMasterId: number
  FamilyId: number
  FamilyMemberId: string
  Weekday: number
  StartTime: string
  EndTime: string
  Description: string
  Note: string
  Sequence: DuplicateSequence
  StartDate: string
  EndDate: string
  Icon: string
}

// --- Main MemberResponse ---
export interface MemberResponse {
  Id: number
  MemberId: string
  MemberName: string
  FirstName: string
  Email: string
  FamilyId: number
  SharedFamilyId?: number
  MemberType: MemberType
  ColorCode: string
  UserFileResourceId?: number
  ResourceUrl: string
  Events: UserEvent[]
  Birthdate?: string
  MembersUpdatedOn: string
  HolidaysCountryCode: string
  InvitationStatus: InvitationStatus
  SharedInFamily: SharedInFamilyResponse[]
  AutoSubscription: string
  ExternalEmail: string
  EmailSystem: EmailSystem
  IsPrivate: boolean
  ExternalCalendars: ExternalCalendarResponse[]
  Frequency: number
  Counter: number
  ExportEventUrl: string
  DeleteAllAppointment: boolean
  DeleteOwnAppointment: boolean
  CreatePMTask: boolean
  PocketMoneyUser: boolean
  PMTaskApprovedSendConfirmation: boolean
  AmountEarned: number
  CreateToDoGroup: boolean
  ShowDeletedToDoTasks: number
  AccessToMembersToDo: ToDoAccessSpecifier[]
  HasMasterScheduleAccess: boolean
  MasterSchedules: MasterScheduleResponse[]
  Latitude: string
  Longitude: string
  HasLocationVisible: boolean
  HasMembersLocationAccess: boolean
  LastLocationUpdatedOn?: string
  CanApprovePMTasks: boolean
  Locale: string
}
