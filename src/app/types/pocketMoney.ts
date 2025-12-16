export interface PocketMoney {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  checkerResponsible: string[];
  repeat: string
  notes: string;
  standardTask: string;
  firstComeFirstServe: boolean;
}

export interface PocketMoneyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PocketMoney) => void;
  pocketMoney?: PocketMoney | null; // For edit mode
}