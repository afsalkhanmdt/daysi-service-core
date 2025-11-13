export type PMMember = {
  MemberId: string;
  MemberName: string;
  FirstName: string;
  MemberType: number;
  CanApprovePMTask: boolean;
  CanCreatePMTask: boolean;
  IsPocketMoneyUser: boolean;
  HasPMTaskApprovedConfirmation: boolean;
  AmountEarned: number;
};

export type PMFamily = {
  FamilyId: number;
  FamilyName: string;
  CurrencyCode: string | null;
  EveryoneCreatePMTask: boolean;
};

export type FamilyMemberPlanned = {
  MemberId: string;
  FinishedDate: string | null;
  ApprovedDate: string | null;
  Status: number;
};

export type PMTask = {
  LocalPMTaskId: number;
  PMTransId: number;
  TransType: number;
  PMDescription: string;
  PMAmount: number;
  FirstComeFirstServe: boolean;
  Note: string;
  FamilyMembersPlanned: FamilyMemberPlanned[];
  CreatedBy: string;
  CreatedOn: string;
  ActivityDate: string;
  Interval: number;
  Repeat: number;
  Status: number;
  UpdatedOn: string;
};

export type PMData = {
  PMFamily: PMFamily;
  PMMembers: PMMember[];
  PMTasks: PMTask[];
  MembersUpdatedOn: string | null;
};