import { useState } from 'react';

export type TodoValidationErrors = {
  description?: string;
  toDoGroupId?: string;
};

export const useTodoValidation = () => {
  const [errors, setErrors] = useState<TodoValidationErrors>({});

  const validate = (description: string, toDoGroupId: number) => {
    const newErrors: TodoValidationErrors = {};
    let isValid = true;

    if (!description || description.trim() === "") {
      newErrors.description = "Please enter a task description.";
      isValid = false;
    }

    if (!toDoGroupId || toDoGroupId === 0) {
      newErrors.toDoGroupId = "Please select a group.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const clearError = (field: keyof TodoValidationErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const clearAllErrors = () => setErrors({});

  return { errors, validate, clearError, clearAllErrors };
};
