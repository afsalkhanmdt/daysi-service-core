import { postCall } from "./apiCall";

export const createAppointmentCall = postCall("/Events/Create");
export const updateAppointmentCall = postCall("/Events/Update");