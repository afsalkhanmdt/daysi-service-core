import {
  ToDoCreateCommand,
  todoPopupPropsType,
  ToDoTaskType,
} from "@/app/types/todo";
import React, { useEffect, useState } from "react";
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
import { AppointmentFormUI } from "@/app/types/appoinment";
import { useResources } from "@/app/context/ResourceContext";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import {
  groupOptions,
  initialToDoCreateBody,
  statusOptions,
} from "@/app/constants/toDoForm";

// Define options as SelectableOption arrays

// Custom Dropdown Component

const CreateTodoPopup: React.FC<todoPopupPropsType> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ToDoCreateCommand>(
    initialToDoCreateBody,
  );

  // Component states for selector components
  const { resources } = useResources();
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);

  // Generic handler for text inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for group selection
  const handleGroupSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      group: value === "Select group" ? "" : value,
    }));
  };

  // Generic handler for toggle switches
  const handleToggleChange = (
    field: keyof ToDoCreateCommand,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? 1 : 0,
    }));
  };

  // Generic handler for single-select MultipleSelector components
  const handleSingleSelectChange = (
    field: keyof ToDoTaskType,
    selectedOptions: SelectableOption[],
  ) => {
    const selectedOption = selectedOptions.find((option) => option.isSelected);
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption ? selectedOption.id : 0,
    }));
  };

  const handleResponsiblePersonsChange = (
    selectedPersons: SelectableOption[],
  ) => {
    // Update the responsiblePersons state for UI
    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: selectedPersons.some((sp) => sp.id === person.id),
      })),
    );

    // Update formData
    setFormData((prev) => ({
      ...prev,
      participants: selectedPersons.map((person) => ({
        localId: person.id,
        memberId: person.memberId,
      })),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    setFormData(initialToDoCreateBody);
  };

  useEffect(() => {
    setResponsiblePersons(mapResourcesToSelectableOptions(resources));
  }, [resources]);

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
          <div className="bg-blue-100 rounded-md p-2">
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
              name="Description"
              type="text"
              placeholder="By Writing Without"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end items-center ">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium">Private</label>
              <ToggleSwitch
                checked={formData.private === 1 ? true : false}
                onChange={(checked) => handleToggleChange("private", checked)}
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
          <div className="grid grid-cols-2 gap-4 bg-blue-100 rounded-md p-2">
            {/* Groups - Custom Dropdown */}
            <CustomDropdown
              options={groupOptions}
              selectedValue={formData.toDoGroupId.toString()}
              onSelect={handleGroupSelect}
              placeholder="Select a group"
              title="Groups"
              iconUrl={groupIcon.src}
            />

            {/* <div>
              <div className="flex items-center gap-2 mb-2">
                <Image src={dateIcon} alt="DateIcon" width={15} height={15} />
                <label className="block text-lg font-medium text-gray-800">
                  Due Date
                </label>
              </div>
              <input
                name="ClosedDate"
                type="date"
                value={formData.closedDate || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div> */}
          </div>

          {/* Status - Using MultipleSelector for single selection */}
          <MultipleSelector
            options={statusOptions}
            onSelectionChange={(selected) =>
              handleSingleSelectChange("Status", selected)
            }
            title="Status"
            showSelectAll={false}
            showCount={true}
            showImages={false}
            selectedBorderColor="blue"
            selectedBadgeColor="blue"
            singleSelect={true}
          />

          {/* Note - With icon like other components */}
          <div className="bg-blue-100 rounded-md p-2">
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
              name="Note"
              placeholder="Write next here"
              value={formData.note}
              onChange={handleInputChange}
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
