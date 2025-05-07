import { Schema, model, models, Document, Model } from 'mongoose';

export enum MemberType {
    FamilyAdmin = 0,
    Family = 1,
    Member = 2,
    Shared = 3,
    SuperAdmin = 4,
    SharedAdmin = 5
}

export enum EmailSystem {
    None = 0,
    Outlook = 1,
    Gmail = 2
}

export interface IFamilyMember extends Document {
    MemberId: string;
    FamilyId: number;
    MemberType: MemberType;
    ColorCode?: string;
    FileResourceId?: number;
    AutoSubscription?: string;
    ExternalEmail?: string;
    EmailSystem: EmailSystem;
    IsPrivate: boolean;
    LastUsed?: Date;
    Frequency: number;
    Counter: number;
    AppVersion?: string;
    Region?: string;
    DevicePlatform?: string;
    AppointmentCount: number;
    DeviceModel?: string;
    DeleteAllAppointment: boolean;
    DeleteOwnAppointment: boolean;
    CreatePMTask: boolean;
    PocketMoneyUser: boolean;
    PMTaskApprovedSendConfirmation: boolean;
    AmountEarned: number;
    ShowDeletedToDoTasks: number;
    HasMasterScheduleAccess: boolean;
    Latitude?: string;
    Longitude?: string;
    HasLocationVisible: boolean;
    HasMembersLocationAccess: boolean;
    LastLocationUpdatedOn?: Date;
    CanApprovePMTasks: boolean;
    Locale?: string;
}

const FamilyMemberSchema = new Schema<IFamilyMember>({
    MemberId: { type: String, required: true },
    FamilyId: { type: Number, required: true },
    MemberType: { type: Number, enum: Object.values(MemberType), required: true },
    ColorCode: String,
    FileResourceId: Number,
    AutoSubscription: String,
    ExternalEmail: String,
    EmailSystem: { type: Number, enum: Object.values(EmailSystem), default: EmailSystem.None },
    IsPrivate: { type: Boolean, default: false },
    LastUsed: Date,
    Frequency: { type: Number, default: 0 },
    Counter: { type: Number, default: 0 },
    AppVersion: String,
    Region: String,
    DevicePlatform: String,
    AppointmentCount: { type: Number, default: 0 },
    DeviceModel: String,
    DeleteAllAppointment: { type: Boolean, default: false },
    DeleteOwnAppointment: { type: Boolean, default: false },
    CreatePMTask: { type: Boolean, default: false },
    PocketMoneyUser: { type: Boolean, default: true },
    PMTaskApprovedSendConfirmation: { type: Boolean, default: false },
    AmountEarned: { type: Number, default: 0 },
    ShowDeletedToDoTasks: { type: Number, default: 0 },
    HasMasterScheduleAccess: { type: Boolean, default: false },
    Latitude: String,
    Longitude: String,
    HasLocationVisible: { type: Boolean, default: false },
    HasMembersLocationAccess: { type: Boolean, default: false },
    LastLocationUpdatedOn: Date,
    CanApprovePMTasks: { type: Boolean, default: false },
    Locale: String
});

const FamilyMember: Model<IFamilyMember> = models.FamilyMember || model<IFamilyMember>('FamilyMember', FamilyMemberSchema);

export default FamilyMember;
