import { RepeatEnum } from "../types/appoinment";
import { PMTaskCreateCommand } from "../types/pocketMoney";


export const initialFormDataForPMTaskApi:PMTaskCreateCommand={
    CurrencyCode: "",
    LocalPMTaskId: 0,
    FamilyId: 0,
    PMDescription: "",
    PMAmount: 0,
    FirstComeFirstServe: false,
    Note: "",
    FamilyMembersPlanned: [],
    CreatedBy: "",
    ActivityDate: "",
    Interval: 0,
    Repeat: RepeatEnum.Never,
}