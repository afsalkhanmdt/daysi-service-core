import { postCall } from "@/services/api/apiCall";
export const createAppointmentCall = postCall("/Events/Create");
export const updateAppointmentCall = postCall("/Events/Update");