import { useState } from 'react';
import { SelectableOption } from '../admin/family-view/components/FormComponents/MultipleSelector';

export type PMValidationErrors = {
  PMDescription?: string;
  PMAmount?: string;
  participants?: string;
};

export const usePocketMoneyValidation = () => {
  const [errors, setErrors] = useState<PMValidationErrors>({});

  const validate = (description: string, amount: number, responsiblePersons: SelectableOption[]) => {
    const newErrors: PMValidationErrors = {};
    let isValid = true;

    if (!description || description.trim() === "") {
      newErrors.PMDescription = "Please enter a task description.";
      isValid = false;
    }

    if (amount <= 0) {
      newErrors.PMAmount = "Please enter an amount greater than 0.";
      isValid = false;
    }

    if (!responsiblePersons.some((p) => p.isSelected)) {
      newErrors.participants = "Please select at least one responsible person.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const clearError = (field: keyof PMValidationErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const clearAllErrors = () => setErrors({});

  return { errors, validate, clearError, clearAllErrors };
};
