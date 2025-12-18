import { ToDoTaskType } from "../admin/family-view/components/CalendarView";


export type todoPopupPropsType = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  todo?: ToDoTaskType
};