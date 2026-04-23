import { ToDoFamilyGroupResponse } from "./familytypes";



export type todoPopupPropsType = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  todo?: ToDoTaskType
  ToDoFamilyGroup?:ToDoFamilyGroupResponse[];
};

export type ToDoTaskType = {
  ToDoTaskId: number;
  FamilyId: number;
  CreatedBy: string;
  AssignedTo: string[];
  ToDoGroupId: number;
  Description: string;
  Note: string;
  Private: number;
  CreatedDate: string;
  ClosedDate: string | null;
  Status: number;
  UpdatedOn: string;
  IsForAll: boolean;
};

export type ToDoCreateCommand = {
  familyId: number
  createdBy?: string
  assignedTo?: string[]
  toDoGroupId: number
  description?: string
  note?: string
  private: number
  isForAll?: boolean
}

export type ToDoFamilyGroup ={
  ToDoFamilyGroupId: number
  FamilyId: number
  GroupName: string
  Sorting: number
  Description: string
}