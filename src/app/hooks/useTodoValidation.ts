import { useState } from 'react';

export type TodoValidationErrors = {
  description?: string;
  toDoGroupId?: string;
  assignedTo?: string;
};

export const useTodoValidation = () => {
  const [errors, setErrors] = useState<TodoValidationErrors>({});

  const validate = (description: string, toDoGroupId: number, assignedTo?: string[]) => {
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

    if (!assignedTo || assignedTo.length === 0) {
        newErrors.assignedTo = "Please select a responsible person.";
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
