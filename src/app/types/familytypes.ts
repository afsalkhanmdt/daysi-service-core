export type PMStdFamilyTaskResponse = {
  PMStdFamilyTaskId: number;
  Sorting: number;
  Description: string;
  Amount: number;
};

export type ToDoFamilyGroupResponse = {
  ToDoFamilyGroupId: number;
  FamilyId: number;
  GroupName: string;
  Sorting: number;
  Description: string;
  Icon: string;
  IsActive: boolean;
};

export type SubscriptionType = "Basis" | "Premium";

export type FamilyResponse = {
  Id: number;
  Name: string;
  UserName: string;
  MemberId: string;
  ColorCode: string;
  ResourceUrl: string;
  EventsUpdatedOn: string;
  MembersUpdatedOn: string;
  ValidTillDate: string; // DateTime -> string (ISO)
  SubscriptionType: SubscriptionType;
  FamilyMemberQTY: number;
  DefaultAlarm: number;
  SpecialEventColorCode: string;
  HasGiftVoucher: boolean;
  PocketMoneyUser: boolean;
  PMStdFamilyTasks: PMStdFamilyTaskResponse[];
  CurrencyCode: string;
  EveryoneCreatePMTask: boolean;
  ToDoFamilyGroups: ToDoFamilyGroupResponse[];
};
