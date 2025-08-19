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
  participantId: string
  participant: string
  participantClass: string
  participantFirstName: string
}

export interface Alarm {
  id: number
}

export interface RecurrenceRule {
  frequency: FrequencyEnum
  interval: number
}

export interface UserEvent {
  id: number
  familyId: number
  title: string
  description: string
  location: string
  actualStartDate: string
  start: string
  end: string
  specialEvent?: SpecialEvent
  eventPerson: string
  repeat: Repeat
  repeatEndDate: string
  alert: Alert
  isForAll: number
  isSpecialEvent: number
  isAllDayEvent: number
  isPrivateEvent: number
  familyColorCode: string
  attendee: string[]
  eventParticipant: EventParticipant[]
  parentEventId: string
  updatedOn: string
  addedBy: string
  externalCalendarId: number
  externalCalendarName: string
  alarms: Alarm[]
  latitude: string
  longitude: string
  recurrenceRule: RecurrenceRule
  localStartDate: string
  localEndDate: string
  localRepeatEndDate: string
}

export interface SharedInFamilyResponse {
  email: string
  memberId: string
  familyId?: number
  invitationStatus: InvitationStatus
}

export interface ExternalCalendarResponse {
  calendarName: string
  calendarURL: string
  calendarId: number
  familyId: number
  memberId: string
  membersUpdatedOn: string
}

export interface ToDoAccessSpecifier {
  memberId: string
  hasViewAccess: boolean
  hasCreateAccess: boolean
}

export interface MasterScheduleResponse {
  shMasterId: number
  familyId: number
  familyMemberId: string
  weekday: number
  startTime: string
  endTime: string
  description: string
  note: string
  sequence: DuplicateSequence
  startDate: string
  endDate: string
  icon: string
}

// --- Main MemberResponse ---
export interface MemberResponse {
  id: number
  memberId: string
  memberName: string
  firstName: string
  email: string
  familyId: number
  sharedFamilyId?: number
  memberType: MemberType
  colorCode: string
  userFileResourceId?: number
  resourceUrl: string
  events: UserEvent[]
  birthdate?: string
  membersUpdatedOn: string
  holidaysCountryCode: string
  invitationStatus: InvitationStatus
  sharedInFamily: SharedInFamilyResponse[]
  autoSubscription: string
  externalEmail: string
  emailSystem: EmailSystem
  isPrivate: boolean
  externalCalendars: ExternalCalendarResponse[]
  frequency: number
  counter: number
  exportEventUrl: string
  deleteAllAppointment: boolean
  deleteOwnAppointment: boolean
  createPMTask: boolean
  pocketMoneyUser: boolean
  pmTaskApprovedSendConfirmation: boolean
  amountEarned: number
  createToDoGroup: boolean
  showDeletedToDoTasks: number
  accessToMembersToDo: ToDoAccessSpecifier[]
  hasMasterScheduleAccess: boolean
  masterSchedules: MasterScheduleResponse[]
  latitude: string
  longitude: string
  hasLocationVisible: boolean
  hasMembersLocationAccess: boolean
  lastLocationUpdatedOn?: string
  canApprovePMTasks: boolean
  locale: string
}
