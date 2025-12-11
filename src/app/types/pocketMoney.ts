export interface PocketMoney {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  checkerResponsible: string[];
  repeat: 'Never' | 'Everyday' | 'Every Week' | 'Every Month' | 'Every Year';
  notes: string;
  standardTask: string;
}

export interface PocketMoneyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PocketMoney) => void;
  pocketMoney?: PocketMoney | null; // For edit mode
}