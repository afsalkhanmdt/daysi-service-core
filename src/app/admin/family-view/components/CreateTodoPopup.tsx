"use client";

import { ToDoCreateCommand, todoPopupPropsType } from "@/app/types/todo";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import createTodoImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import closeIcon from "@/app/admin/assets/close-428.png";
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import MultipleSelector, {
  SelectableOption,
} from "./FormComponents/MultipleSelector";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import descriptionIcon from "@/app/admin/assets/descriptionIcon.png";
import groupIcon from "@/app/admin/assets/groupIcon.png";
import CustomDropdown from "./FormComponents/DropDown";
import { useResources } from "@/app/context/ResourceContext";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import {
  groupOptions,
  initialToDoCreateBody,
  statusOptions,
} from "@/app/constants/toDoForm";

const CreateTodoPopup: React.FC<todoPopupPropsType> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { resources } = useResources();
  const modalRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<ToDoCreateCommand>(
    initialToDoCreateBody,
  );

  // Component states for selector components
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);
  const [status, setStatus] = useState<SelectableOption[]>(statusOptions);

  // Generic handler for text inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for group selection
  const handleGroupSelect = (id: string, label: string) => {
    setFormData((prev) => ({
      ...prev,
      toDoGroupId: parseInt(id),
    }));
  };
  const getSelectedGroupLabel = () => {
    if (!formData.toDoGroupId) return "";
    const selectedGroup = groupOptions.find(
      (group) => parseInt(group.id) === formData.toDoGroupId,
    );
    return selectedGroup?.label || "";
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

  const handleStatusChange = (selectedOptions: SelectableOption[]) => {
    setStatus((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: selectedOptions.some(
          (selected) => selected.id === option.id,
        ),
      })),
    );

    const selectedOption = selectedOptions.find((opt) => opt.isSelected);
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        statusId: selectedOption.id,
      }));
    }
  };

  const handleResponsiblePersonsChange = (
    selectedPersons: SelectableOption[],
  ) => {
    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: selectedPersons.some((sp) => sp.id === person.id),
      })),
    );

    setFormData((prev) => ({
      ...prev,
      assignedTo: selectedPersons.map((person) => person.memberId!),
    }));
  };

  // Handle click on overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData(initialToDoCreateBody);
    setStatus(statusOptions);
    setResponsiblePersons(
      responsiblePersons.map((p) => ({ ...p, isSelected: false })),
    );
  };

  useEffect(() => {
    setResponsiblePersons(mapResourcesToSelectableOptions(resources));
  }, [resources]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-7xl max-h-[98vh] flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <Image src={createTodoImage} alt="icon" width={16} height={16} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">
              Create ToDo Task
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Image src={closeIcon} alt="Close" width={20} height={20} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto flex-1 p-3 lg:p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Task Basic Details */}
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                  <Image
                    src={participantsIcon}
                    alt="icon"
                    width={14}
                    height={14}
                  />{" "}
                  Task Details
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    Private Task
                  </span>
                  <ToggleSwitch
                    checked={formData.private === 1}
                    onChange={(checked) =>
                      handleToggleChange("private", checked)
                    }
                  />
                </div>
              </div>

              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold flex items-center gap-1.5 text-gray-700 uppercase tracking-wider">
                    <Image
                      src={descriptionIcon}
                      alt="icon"
                      width={12}
                      height={12}
                    />{" "}
                    Description
                  </label>
                  <input
                    name="description"
                    type="text"
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold flex items-center gap-1.5 text-gray-700 uppercase tracking-wider">
                    <Image src={groupIcon} alt="icon" width={12} height={12} />{" "}
                    Group
                  </label>
                  <CustomDropdown
                    options={groupOptions}
                    selectedValue={getSelectedGroupLabel()}
                    onSelect={handleGroupSelect}
                    placeholder="Select a group"
                    iconUrl={groupIcon.src}
                  />
                </div>
              </div>
            </div>

            {/* Responsible Persons */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image
                  src={participantsIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Responsible Persons
              </label>
              <MultipleSelector
                options={responsiblePersons}
                onSelectionChange={handleResponsiblePersonsChange}
                subHeading="Select who should complete this task"
                showSelectAll={true}
                showCount={true}
                showImages={true}
                selectedBorderColor="blue"
                selectedBadgeColor="blue"
                singleSelect={false}
              />
            </div>

            {/* Status - Moved to its own row */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image
                  src={participantsIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Status
              </label>
              <MultipleSelector
                options={status}
                onSelectionChange={handleStatusChange}
                subHeading="Select task status"
                showSelectAll={false}
                showCount={true}
                showImages={false}
                selectedBorderColor="blue"
                selectedBadgeColor="blue"
                singleSelect={true}
              />
            </div>

            {/* Notes - Moved to its own row */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image
                  src={participantsIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Additional Notes
              </label>
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <textarea
                  name="note"
                  placeholder="Any special instructions..."
                  rows={2}
                  value={formData.note}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[60px]"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
          >
            Cancel
          </button>
          <button
            onClick={(e) => handleSubmit(e as any)}
            className="px-5 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTodoPopup;
