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
import additionalNoteIcon from "@/app/admin/assets/name.png";
import groupIcon from "@/app/admin/assets/groupIcon.png";
import dateIcon from "@/app/admin/assets/selectDateIcon.png";
import alarmIcon from "@/app/admin/assets/alarmIcon.png";
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import nameIcon from "@/app/admin/assets/name.png";
import CustomDropdown from "./FormComponents/DropDown";
import { useResources } from "@/app/context/ResourceContext";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import {
  groupOptions,
  initialToDoCreateBody,
  statusOptions,
} from "@/app/constants/toDoForm";
import { REPEAT_OPTIONS, ALERT_OPTIONS } from "@/app/constants/appointmentForm";

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
  const [repeatSequence, setRepeatSequence] =
    useState<SelectableOption[]>(REPEAT_OPTIONS);
  const [alarmOptions, setAlarmOptions] =
    useState<SelectableOption[]>(ALERT_OPTIONS);
  const [status, setStatus] = useState<SelectableOption[]>(statusOptions);

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
      toDoGroupId: value === "Select group" ? 0 : parseInt(value) || 0,
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

  const handleRepeatChange = (selectedOptions: SelectableOption[]) => {
    setRepeatSequence((prev) =>
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
        repeat: selectedOption.id,
      }));
    }
  };

  const handleAlarmChange = (selectedOptions: SelectableOption[]) => {
    setAlarmOptions((prev) =>
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
        alert: selectedOption.id,
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
      participants: selectedPersons.map((person) => ({
        localId: person.id,
        memberId: person.memberId,
      })),
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
    setRepeatSequence(REPEAT_OPTIONS);
    setAlarmOptions(ALERT_OPTIONS);
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-3 bg-white">
          <div className="border-b border-gray-200 bg-blue-200 px-6 py-4 rounded-lg flex justify-between items-center">
            <div className="flex gap-2">
              <div className="rounded-full bg-white p-2">
                <Image
                  src={createTodoImage}
                  alt="createTodoImage"
                  width={15}
                  height={15}
                  loading="lazy"
                />
              </div>
              <h2 className="text-xl font-semibold">Create ToDo Task</h2>
            </div>
            {/* Close Icon */}
            <button
              onClick={handleClose}
              className="rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 grid place-items-center"
              aria-label="Close"
              type="button"
            >
              <Image
                src={closeIcon}
                alt="Close"
                width={30}
                height={30}
                className="text-gray-600"
              />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 space-y-6">
          {/* Task Details Section */}
          <div>
            <div className="flex justify-between gap-2">
              <div className="flex items-center gap-2 pb-1">
                <Image
                  src={participantsIcon}
                  alt="task icon"
                  width={15}
                  height={15}
                />
                <label className="block text-2xl font-semibold">
                  Task Details
                </label>
              </div>
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Private Task
                  </label>
                  <ToggleSwitch
                    checked={formData.private === 1}
                    onChange={(checked) =>
                      handleToggleChange("private", checked)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-blue-100 p-2 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={descriptionIcon}
                  alt="Description"
                  width={15}
                  height={15}
                />
                <label className="block text-lg font-medium">Description</label>
              </div>
              <input
                name="description"
                type="text"
                placeholder="Enter task description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Group and Due Date Section */}
          <div>
            <div className="flex items-center gap-2 pb-1">
              <Image
                src={participantsIcon}
                alt="group icon"
                width={15}
                height={15}
              />
              <label className="block text-2xl font-semibold">
                Group & Schedule
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-blue-100 p-2 rounded-md">
              {/* Groups */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Image src={groupIcon} alt="Group" width={15} height={15} />
                  <label className="block text-lg font-medium">Group</label>
                </div>
                <CustomDropdown
                  options={groupOptions}
                  selectedValue={formData.toDoGroupId?.toString() || ""}
                  onSelect={handleGroupSelect}
                  placeholder="Select a group"
                  iconUrl={groupIcon.src}
                />
              </div>

              {/* Due Date */}
              {/* <div>
                <div className="flex items-center gap-2 mb-2">
                  <Image src={dateIcon} alt="Date" width={15} height={15} />
                  <label className="block text-lg font-medium">Due Date</label>
                </div>
                <input
                  name="ClosedDate"
                  type="date"
                  value={formData.closedDate || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div> */}
            </div>
          </div>

          {/* Responsible Persons */}
          <div>
            <div className="flex items-center gap-2 pb-1">
              <Image
                src={participantsIcon}
                alt="participants"
                width={15}
                height={15}
              />
              <label className="block text-2xl font-semibold">
                Responsible Persons
              </label>
            </div>
            <div className="bg-blue-100 p-2 rounded-md">
              <MultipleSelector
                subHeadingIcon={participantsIcon.src}
                options={responsiblePersons}
                onSelectionChange={handleResponsiblePersonsChange}
                subHeading="Select who should complete this task"
                showSelectAll={true}
                showCount={true}
                showImages={true}
                selectedBorderColor="green"
                selectedBadgeColor="green"
                singleSelect={false}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center gap-2 pb-1">
              <Image
                src={participantsIcon}
                alt="status"
                width={15}
                height={15}
              />
              <label className="block text-2xl font-semibold">Status</label>
            </div>
            <div className="bg-blue-100 p-2 rounded-md">
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
          </div>

          {/* Additional Notes */}
          <div>
            <div className="flex items-center gap-2 pb-1">
              <Image
                src={participantsIcon}
                alt="notes"
                width={15}
                height={15}
              />
              <label className="block text-2xl font-semibold">
                Additional Notes
              </label>
            </div>
            <div className="bg-blue-100 p-2 rounded-md">
              <textarea
                name="note"
                placeholder="Any additional information or special instructions..."
                rows={3}
                value={formData.note}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="sticky bottom-0 bg-white p-3 border-t border-gray-200">
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
                Create ToDo Task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTodoPopup;
