import { todoPopupPropsType } from "@/app/types/todo";
import React, { useState } from "react";
import Image from "next/image";
import createTodoImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import MultipleSelector, {
  SelectableOption,
} from "./FormComponents/MultipleSelector";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import descriptionIcon from "@/app/admin/assets/descriptionIcon.png";
import additionalNoteIcon from "@/app/admin/assets/name.png";
import groupIcon from "@/app/admin/assets/groupIcon.png";
import dateIcon from "@/app/admin/assets/selectDateIcon.png"; // Add this icon
import CustomDropdown from "./FormComponents/DropDown";
import { ToDoTaskType } from "./CalendarView";

interface CreateTodoData {
  description: string;
  responsiblePersons: string[];
  dueDate?: string;
  group: string;
  status: "Open" | "Close";
  notes: string;
  private?: boolean;
}

// Define options as SelectableOption arrays
const groupOptions = [
  { id: "1", label: "Select group" },
  { id: "2", label: "Work Group" },
  { id: "3", label: "Personal Group" },
  { id: "4", label: "Urgent Group" },
  { id: "5", label: "Project Alpha" },
  { id: "6", label: "Marketing Team" },
];

const statusOptions: SelectableOption[] = [
  { id: "1", label: "Open", isSelected: true },
  { id: "2", label: "Close", isSelected: false },
];

const responsiblePersonsOptions: SelectableOption[] = [
  { id: "1", label: "Johnson", isSelected: false },
  { id: "2", label: "Christian", isSelected: false },
  { id: "3", label: "Sofie", isSelected: false },
  { id: "4", label: "Clara", isSelected: false },
];

// Custom Dropdown Component

const CreateTodoPopup: React.FC<todoPopupPropsType> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ToDoTaskType>({
    ToDoTaskId: 0,
    FamilyId: 0,
    CreatedBy: "",
    AssignedTo: "",
    ToDoGroupId: 0,
    Description: "",
    Note: "",
    Private: false,
    CreatedDate: "",
    ClosedDate: null,
    Status: 0,
    UpdatedOn: "",
    IsForAll: false,
  });

  // Component states for selector components
  const [statuses, setStatuses] = useState<SelectableOption[]>(statusOptions);
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >(responsiblePersonsOptions);

  // ===== HANDLER FUNCTIONS =====

  // Handler for responsible persons selection (MULTIPLE SELECT)
  const handleResponsiblePersonsChange = (
    selectedPersons: SelectableOption[]
  ) => {
    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: selectedPersons.some((sp) => sp.id === person.id),
      }))
    );

    // Update formData with selected person labels
    setFormData((prev) => ({
      ...prev,
      responsiblePersons: selectedPersons.map((person) => person.label),
    }));
  };

  // Handler for description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  // Handler for group selection
  const handleGroupSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      group: value === "Select group" ? "" : value,
    }));
  };

  // Handler for status selection (SINGLE SELECT)
  const handleStatusChange = (selectedStatuses: SelectableOption[]) => {
    setStatuses((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: selectedStatuses.some((ss) => ss.id === option.id),
      }))
    );

    // Update formData with selected status
    if (selectedStatuses.length > 0) {
      setFormData((prev) => ({
        ...prev,
        status: selectedStatuses[0].label as "Open" | "Close",
      }));
    }
  };

  // Handler for due date change
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      dueDate: e.target.value,
    }));
  };

  const handlePrivateToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      private: checked,
    }));
  };

  // Handler for notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      notes: e.target.value,
    }));
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.Description.trim()) {
      alert("Please enter a description");
      return;
    }

    if (formData.AssignedTo.length === 0) {
      alert("Please select at least one responsible person");
      return;
    }

    onSubmit(formData);
    resetForm();
    onClose();
  };

  // Form close handler
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Reset all form states
  const resetForm = () => {
    setFormData({
      ToDoTaskId: 0,
      FamilyId: 0,
      CreatedBy: "",
      AssignedTo: "",
      ToDoGroupId: 0,
      Description: "",
      Note: "",
      Private: false,
      CreatedDate: "",
      ClosedDate: null,
      Status: 0,
      UpdatedOn: "",
      IsForAll: false,
    });

    // Reset selector states
    setResponsiblePersons(
      responsiblePersonsOptions.map((p) => ({ ...p, isSelected: false }))
    );
    setStatuses(
      statusOptions.map((s) => ({
        ...s,
        isSelected: s.label === "Open",
      }))
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header - Consistent with other components */}
        <div className="border-b border-gray-200 bg-blue-200 m-2 px-6 py-4 rounded-lg flex gap-2">
          <div className="rounded-full bg-white p-2">
            <Image
              src={createTodoImage}
              alt="createTodoImage"
              width={15}
              height={15}
              loading="lazy"
            />
          </div>
          <h2 className="text-xl font-semibold">Create ToDo</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Description - With icon like other components */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src={descriptionIcon}
                alt="Description Icon"
                width={15}
                height={15}
                loading="lazy"
              />
              <label className="block text-lg font-medium text-gray-800">
                Description
              </label>
            </div>
            <input
              type="text"
              placeholder="By Writing Without"
              value={formData.Description}
              onChange={handleDescriptionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end items-center ">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium">Private</label>
              <ToggleSwitch
                checked={formData.Private}
                onChange={handlePrivateToggle}
              />
            </div>
          </div>

          {/* Responsible Persons - Using MultipleSelector */}
          <MultipleSelector
            titleIconUrl={participantsIcon.src}
            options={responsiblePersons}
            onSelectionChange={handleResponsiblePersonsChange}
            title="Select Responsible Persons"
            showSelectAll={true}
            showCount={true}
            showImages={true}
            selectedBorderColor="green"
            selectedBadgeColor="green"
            singleSelect={false}
          />
          <div className="grid grid-cols-2 gap-4">
            {/* Groups - Custom Dropdown */}
            <CustomDropdown
              options={groupOptions}
              selectedValue={formData.ToDoGroupId.toString()}
              onSelect={handleGroupSelect}
              placeholder="Select a group"
              title="Groups"
              iconUrl={groupIcon.src}
            />
            {/* Due Date - Simple date input */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Image src={dateIcon} alt="DateIcon" width={15} height={15} />
                <label className="block text-lg font-medium text-gray-800">
                  Due Date
                </label>
              </div>
              <input
                type="date"
                value={formData.ClosedDate || ""}
                onChange={handleDueDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status - Using MultipleSelector for single selection */}
          <MultipleSelector
            options={statuses}
            onSelectionChange={handleStatusChange}
            title="Status"
            showSelectAll={false}
            showCount={true}
            showImages={false}
            selectedBorderColor="blue"
            selectedBadgeColor="blue"
            singleSelect={true}
          />

          {/* Note - With icon like other components */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src={additionalNoteIcon}
                alt="Additional Notes Icon"
                width={15}
                height={15}
                loading="lazy"
              />
              <label className="block text-lg font-medium text-gray-800">
                Note
              </label>
            </div>
            <textarea
              placeholder="Write next here"
              value={formData.Note}
              onChange={handleNotesChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Divider and Buttons */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
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
