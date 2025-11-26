export type ToDoType = {
  id: string;
  description: string;
  classesResponsible: string[];
  group: string;
  status: "Open" | "Close";
  notes: string;
};

export type PopupPropsType = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
};