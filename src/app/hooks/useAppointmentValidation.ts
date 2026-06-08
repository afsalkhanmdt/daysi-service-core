import { useState } from 'react';
import { SelectableOption } from '../admin/family-view/components/FormComponents/MultipleSelector';

export type ValidationErrors = {
  title?: string;
  participants?: string;
};

export const useAppointmentValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = (title: string, responsiblePersons: SelectableOption[]) => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!title || title.trim() === "") {
      newErrors.title = "Please enter an appointment name.";
      isValid = false;
    }

    if (!responsiblePersons.some((p) => p.isSelected)) {
      newErrors.participants = "Please select at least one responsible person.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const clearError = (field: keyof ValidationErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const clearAllErrors = () => setErrors({});

  return { errors, validate, clearError, clearAllErrors };
};
