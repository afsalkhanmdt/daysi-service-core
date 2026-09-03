import { postCall, deleteCall, ForgotPasswordCall, type ForgotPasswordPayload } from "@/services/api/apiCall";
export { ForgotPasswordCall, type ForgotPasswordPayload };
export const createAppointmentCall = postCall("Events/CreateV1");
export const updateAppointmentCall = postCall("Events/Update");
export const deleteAppointmentCall = (
  id: number,
  familyId: number,
  eventsUpdatedOn: string,
  locale: string,
  parentEventId: string
) =>
  deleteCall(
    `Events/${id}?familyId=${familyId}&eventsUpdatedOn=${encodeURIComponent(eventsUpdatedOn)}&locale=${encodeURIComponent(locale)}&parentEventId=${encodeURIComponent(parentEventId)}`
  );
export const createPocketMoneyTaskCall = postCall("PocketMoney/CreatePMTask");
export const updatePocketMoneyTaskCall = postCall("PocketMoney/UpdatePMTask");
export const finishPocketMoneyTaskCall =  postCall("PocketMoney/Finish");
export const payoutDepositCall = postCall("PocketMoney/PayoutDeposit");
export const createToDoTaskCall = postCall("ToDo/CreateToDo");
export const updateToDoTaskCall = postCall("ToDo/UpdateTodo");
export const createCalendarFeedCall = postCall("CalendarFeeds/Create");
export const deleteCalendarFeedCall = (calendarId: number, membersUpdatedOn: string, locale: string) => deleteCall(`CalendarFeeds?calendarId=${calendarId}&membersUpdatedOn=${membersUpdatedOn}&locale=${locale}`);

export const createScheduleMasterCall = postCall("Schedule/Create");
export const updateScheduleMasterCall = postCall("Schedule/Update");
export const deleteScheduleMasterCall = (shMasterId: number) => deleteCall(`Schedule/Delete?shMasterId=${shMasterId}`);

export const generateSHTransV2Call = postCall("Schedule/GenerateSHTransV2");

export const createSHTransCall = postCall("Schedule/CreateSHTrans");
export const updateSHTransCall = postCall("Schedule/UpdateSHTrans");
export const deleteSHTransCall = (shTransId: number) => deleteCall(`Schedule/DeleteSHTrans?shTransId=${shTransId}`);