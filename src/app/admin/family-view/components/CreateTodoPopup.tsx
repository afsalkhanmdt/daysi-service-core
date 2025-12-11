import { PopupPropsType } from "@/app/types/todo";
import React, { useState } from "react";
import Image from "next/image";
import createTodoImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png"; // You need to add an appropriate icon
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";

interface CreateTodoData {
  description: string;
  classesResponsible: string[];
  group: string;
  status: "Open" | "Close";
  notes: string;
}

const CreateTodoPopup: React.FC<
  PopupPropsType & { onSubmit: (data: CreateTodoData) => void }
> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateTodoData>({
    description: "",
    classesResponsible: [],
    group: "",
    status: "Open",
    notes: "",
  });

  const classesOptions = ["Content", "Safe", "Own", "Free"];
  const groupOptions = ["Select group"];
  const statusOptions = ["Open", "Close"];

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
    // Reset form
    setFormData({
      description: "",
      classesResponsible: [],
      group: "",
      status: "Open",
      notes: "",
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setFormData({
      description: "",
      classesResponsible: [],
      group: "",
      status: "Open",
      notes: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header - Matching Appointment Popup Style */}
        <div className="border-b border-gray-200 bg-blue-200 m-2 px-6 py-4 rounded-lg flex gap-2">
          <div className="rounded-full bg-white p-2">
            <Image
              src={createTodoImage}
              alt="createTodoImage"
              width={15}
              height={15}
            />
          </div>
          <h2 className="text-xl font-semibold">Create ToDo</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-800">
              Description
            </label>
            <input
              type="text"
              placeholder="By Writing Without"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Classes Responsible */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-lg font-medium text-gray-800">
                Classes Responsible
              </label>
            </div>
            <div className="space-y-3">
              <div className="font-medium text-gray-700">Advanced</div>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                {classesOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.classesResponsible.includes(option)}
                      onChange={() => handleClassToggle(option)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex-1">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Groups */}
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-800">
              Groups
            </label>
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
            <div className="text-sm text-gray-500 mt-1">Select cue click</div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-800">
              Status
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
              {statusOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="radio"
                    name="status"
                    value={option}
                    checked={formData.status === option}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as "Open" | "Close",
                      }))
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex-1">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-800">
              Note
            </label>
            <textarea
              placeholder="Write next here"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Divider and Buttons - Matching Appointment Popup Style */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
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

export default CreateTodoPopup;
