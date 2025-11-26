import { PopupPropsType, ToDoType } from "@/app/types/todo";
import React, { useState, useEffect } from "react";

interface EditTodoPopupProps extends PopupPropsType {
  todo: ToDoType | null;
  onSubmit: (data: ToDoType) => void;
}

const EditTodoPopup: React.FC<EditTodoPopupProps> = ({
  isOpen,
  onClose,
  todo,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ToDoType>({
    id: "",
    description: "",
    classesResponsible: [],
    group: "",
    status: "Open",
    notes: "",
  });

  const classesOptions = ["Content", "Safe", "Own", "Free"];
  const groupOptions = ["Pick", "Contact", "Start"];

  useEffect(() => {
    if (todo) {
      setFormData(todo);
    }
  }, [todo]);

  const handleClassToggle = (className: string) => {
    setFormData((prev) => ({
      ...prev,
      classesResponsible: prev.classesResponsible.includes(className)
        ? prev.classesResponsible.filter((c) => c !== className)
        : [...prev.classesResponsible, className],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen || !todo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold">Edit ToDo</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Classes Responsible */}
          <div>
            <h3 className="text-lg font-medium mb-2">Classes Responsible</h3>
            <div className="space-y-2">
              <div className="font-medium text-gray-700">Advanced</div>
              <div className="grid grid-cols-2 gap-2 ml-4">
                {classesOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.classesResponsible.includes(option)}
                      onChange={() => handleClassToggle(option)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Groups */}
          <div>
            <h3 className="text-lg font-medium mb-2">Groups</h3>
            <select
              value={formData.group}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, group: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {groupOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-medium mb-2">Notes</h3>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTodoPopup;
