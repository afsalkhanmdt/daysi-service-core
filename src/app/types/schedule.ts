export interface Alert {
    // Define alert properties based on existing Alert interface if any
    alertId?: number;
    minutes?: number;
}

export interface SHMasterCreateCommand {
    familyId: number;
    memberId: string;
    description: string;
    note?: string;
    weekday: number;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    shIconId?: number;
    alarm?: Alert;
}

export interface SHMasterUpdateCommand {
    shMasterId: number;
    description: string;
    note?: string;
    weekday: number;
    startTime: string;
    endTime: string;
    shIconId?: number;
    alarm?: Alert;
}

export interface GenerateSHTransV2Command {
    familyId: number;
    familyMemberId: string;
    createStartDate: Date | string;
    createEndDate: Date | string;
}

export interface SHCreateCommand {
    shMasterId: number;
    familyId: number;
    memberId: string;
    date: Date | string;
    weekday: number;
    startTime: string;
    endTime: string;
    description: string;
    note: string;
    shIconId: number;
    alarm: Alert;
}

export interface SHUpdateCommand {
    shTransId: number;
    date: Date | string;
    weekday: number;
    startTime: string;
    endTime: string;
    description: string;
    note: string;
    shIconId: number;
    alarm: Alert;
}

export interface SHTrans {
    shTransId: number;
    shMasterId: number;
    description: string;
    note?: string;
    date: string;
    weekday: number;
    startTime: string;
    endTime: string;
    shIconId?: number;
    alarm?: Alert;
}

export interface SHMaster {
    shMasterId: number;
    description: string;
    note?: string;
    weekday: number;
    startTime: string;
    endTime: string;
    shIconId?: number;
    alarm?: Alert;
}
