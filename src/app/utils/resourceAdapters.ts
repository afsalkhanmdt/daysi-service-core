import { ResourceType } from "@/app/context/ResourceContext";
import { SelectableOption } from "../admin/family-view/components/FormComponents/MultipleSelector";
import { PMTask, PMTaskCreateCommand } from "../types/pocketMoney";
import { ToDoCreateCommand, ToDoTaskType } from "../types/todo";


export const mapResourcesToSelectableOptions = (
  resources: ResourceType[],
  selectedIds: Number[] = []
): SelectableOption[] => {
  return resources.map((r) => ({
    id: r.id,
    memberId: r.extendedProps?.memberId,
    label: r.title,
    imageUrl: r.extendedProps?.image,
    isSelected: selectedIds.includes(Number(r.id)),
  }));
};

export const mapPMTaskToCreateCommand = (
  task: PMTask
): PMTaskCreateCommand => ({
  LocalPMTaskId: task.LocalPMTaskId,
  FamilyId: 0, // set from context if needed
  PMDescription: task.PMDescription ?? "",
  PMAmount: task.PMAmount ?? 0,
  FirstComeFirstServe: task.FirstComeFirstServe ?? false,
  Note: task.Note ?? "",
  FamilyMembersPlanned: task.FamilyMembersPlanned.map(
    (m) => m.MemberId // adjust key name if different
  ),
  CreatedBy: task.CreatedBy,
  ActivityDate: task.ActivityDate,
  Interval: task.Interval,
  Repeat: task.Repeat,
  CurrencyCode: "INR", // or from settings
});


export const mapToDoTaskToCreateCommand = (
  task: ToDoTaskType
): ToDoCreateCommand => {
  let assignedTo: string[] = [];
  const rawAssignedTo = task.AssignedTo as any;

  if (Array.isArray(rawAssignedTo)) {
    assignedTo = rawAssignedTo.map(id => String(id));
  } else if (typeof rawAssignedTo === "string" && rawAssignedTo.trim()) {
    assignedTo = rawAssignedTo.split(",").map(id => id.trim());
  }

  return {
    familyId: task.FamilyId,
    createdBy: task.CreatedBy,
    assignedTo: assignedTo,
    toDoGroupId: task.ToDoGroupId,
    description: task.Description ?? "",
    note: task.Note ?? "",
    private: task.Private,
    isForAll: task.IsForAll,
  };
};
