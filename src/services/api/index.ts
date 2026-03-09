import { postCall } from "@/services/api/apiCall";
export const createAppointmentCall = postCall("/Events/Create");
export const updateAppointmentCall = postCall("/Events/Update");
export const createPocketMoneyTaskCall = postCall("PocketMoney/CreatePMTask");
export const updatePocketMoneyTaskCall = postCall("PocketMoney/UpdatePMTask");
export const createToDoTaskCall = postCall("/ToDo/Create");
export const updateToDoTaskCall = postCall("/ToDo/Update");