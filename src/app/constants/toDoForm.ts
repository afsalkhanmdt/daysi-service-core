import { SelectableOption } from "../admin/family-view/components/FormComponents/MultipleSelector";
import { ToDoCreateCommand, ToDoTaskType } from "../types/todo";

export const groupOptions = [
  { id: "1", label: "Select group" },
  { id: "2", label: "Work Group" },
  { id: "3", label: "Personal Group" },
  { id: "4", label: "Urgent Group" },
  { id: "5", label: "Project Alpha" },
  { id: "6", label: "Marketing Team" },
];

 export const statusOptions: SelectableOption[] = [
  { id: 1, label: "Open", isSelected: true },
  { id: 2, label: "Close", isSelected: false },
];

export const initialToDoCreateBody: ToDoCreateCommand = {
  familyId: 0,
  createdBy: "",
  assignedTo: [],
  toDoGroupId: 0,
  description: "",
  note: "",
  private: 0,
  isForAll: false,
}