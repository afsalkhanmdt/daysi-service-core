import { FrequencyEnum } from "./appoinment";


export interface PocketMoneyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PMTaskCreateCommand) => void;
  pocketMoney?: PMTask | null; // For edit mode
}

export interface PMTaskCreateCommand {
  LocalPMTaskId: number;
  FamilyId: number;
  PMDescription: string;
  PMAmount: number;
  FirstComeFirstServe: boolean;
  Note: string;
  FamilyMembersPlanned: string[];
  CreatedBy: string;
  ActivityDate: string | Date; // Use string for JSON, Date for TypeScript Date object
  Interval: number;
  Repeat: RepeatEnum; // You'll need to define this enum separately
  CurrencyCode: string;
}

import { RepeatEnum } from "./appoinment";

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
  Repeat: RepeatEnum;
  Status: number;
  UpdatedOn: string;
};

export type PMData = {
  PMFamily: PMFamily;
  PMMembers: PMMember[];
  PMTasks: PMTask[];
  MembersUpdatedOn: string | null;
};