

export enum SubscriptionType {
  Basis = 0,
  Premium = 1,
}

export interface PMStdFamilyTaskResponse {
  pmStdFamilyTaskId: number
  sorting: number
  description: string
  amount: number
}

export interface ToDoFamilyGroupResponse {
  toDoFamilyGroupId: number
  familyId: number
  groupName: string
  sorting: number
  description: string
  icon: string
  isActive: boolean
}

export interface FamilyResponse {
  id: number
  name: string
  userName: string
  memberId: string
  colorCode: string
  resourceUrl: string
  eventsUpdatedOn: string
  membersUpdatedOn: string
  validTillDate: string
  subscriptionType: SubscriptionType
  familyMemberQTY: number
  defaultAlarm: number
  specialEventColorCode: string
  hasGiftVoucher: boolean
  pocketMoneyUser: boolean
  pmStdFamilyTasks: PMStdFamilyTaskResponse[]
  currencyCode: string
  everyoneCreatePMTask: boolean
  toDoFamilyGroups: ToDoFamilyGroupResponse[]
}
