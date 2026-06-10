"use client";

import {
  ToDoCreateCommand,
  ToDoFamilyGroup as ToDoFamilyGroupType,
  todoPopupPropsType,
} from "@/app/types/todo";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import createTodoImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import closeIcon from "@/app/admin/assets/close-428.png";
import descriptionIcon from "@/app/admin/assets/descriptionIcon.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import groupIcon from "@/app/admin/assets/groupIcon.png";
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import MultipleSelector, {
  SelectableOption,
} from "./FormComponents/MultipleSelector";
import SingleSelector from "./FormComponents/SingleSelector";
import SingleResponsiblePersonSelector from "./FormComponents/SingleResponsiblePersonSelector";
import CustomDropdown from "./FormComponents/DropDown";
import {
  mapResourcesToSelectableOptions,
  mapToDoTaskToCreateCommand,
} from "@/app/utils/resourceAdapters";
import { useResources } from "@/app/context/ResourceContext";
import { initialToDoCreateBody, statusOptions } from "@/app/constants/toDoForm";
import { useTodoValidation } from "@/app/hooks/useTodoValidation";

const EditTodoPopup: React.FC<todoPopupPropsType> = ({
  ToDoFamilyGroup,
  isOpen,
  onClose,
  todo,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ToDoCreateCommand>(
    initialToDoCreateBody,
  );

  const { resources } = useResources();
  const modalRef = useRef<HTMLDivElement>(null);
  const { errors, validate, clearError, clearAllErrors } = useTodoValidation();
  const [status, setStatus] = useState<SelectableOption[]>(statusOptions);
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);

  const groupOptions = useMemo(
    () =>
      (ToDoFamilyGroup || []).map((item: ToDoFamilyGroupType) => ({
        id: item.ToDoFamilyGroupId.toString(),
        label: item.GroupName,
        imageUrl: item.Icon,
      })),
    [ToDoFamilyGroup],
  );

  const getSelectedGroupLabel = () => {
    if (!formData.toDoGroupId) return "";

    const selectedGroup = groupOptions.find(
      (group) => Number(group.id) === formData.toDoGroupId,
    );

    return selectedGroup?.label || "";
  };

  /* ---------- Load family members ---------- */
  useEffect(() => {
    if (resources.length > 0) {
      const allOptions = mapResourcesToSelectableOptions(resources);
      setResponsiblePersons(allOptions);

      if (todo) {
        const mapped = mapToDoTaskToCreateCommand(todo);
        setResponsiblePersons((prev) =>
          prev.map((person) => ({
            ...person,
            isSelected: mapped.assignedTo?.includes(String(person.memberId)),
          })),
        );
      }
    }
  }, [resources, todo]);

  /* ---------- Map todo → formData ---------- */
  useEffect(() => {
    if (!todo || resources.length === 0) return;

    const mapped = mapToDoTaskToCreateCommand(todo);

    // Add statusId if it exists in the original task structure or map from status
    const currentMapped = {
      ...mapped,
      status: todo.Status,
      ToDoTaskId: String(todo.ToDoTaskId),
    };
    setFormData(currentMapped as any);

    clearAllErrors();
  }, [todo, resources.length]);

  /* ---------- Handlers ---------- */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "description") clearError("description");
  };

  const handleGroupSelect = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      toDoGroupId: Number(id),
    }));
    clearError("toDoGroupId");
  };

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
        status: selectedOption.id,
      }));
    }
  };

  const handleResponsiblePersonsChange = (selectedPerson: SelectableOption) => {
    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: person.id === selectedPerson.id,
      })),
    );

    const firstResourceId = resources[0]?.extendedProps?.memberId || "";
    const memberId = selectedPerson.memberId!;
    const assignedTo = [memberId];

    setFormData((prev) => ({
      ...prev,
      assignedTo,
      isForAll: memberId === firstResourceId,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !validate(
        formData.description || "",
        formData.toDoGroupId,
        formData.assignedTo,
      )
    ) {
      return;
    }
    onSubmit(formData);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  if (!isOpen || !todo) return null;

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
            <h2 className="text-lg font-bold text-gray-800">Edit ToDo Task</h2>
          </div>
          <button
            onClick={onClose}
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
                    value={formData.description ?? ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all ${
                      errors.description ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold flex items-center gap-1.5 text-gray-700 uppercase tracking-wider">
                    <Image src={groupIcon} alt="icon" width={12} height={12} />{" "}
                    Group
                  </label>
                  <div
                    className={
                      errors.toDoGroupId
                        ? "border border-red-500 rounded-lg"
                        : ""
                    }
                  >
                    <CustomDropdown
                      options={groupOptions}
                      selectedValue={getSelectedGroupLabel()}
                      onSelect={handleGroupSelect}
                      placeholder="Select a group"
                      iconUrl={groupIcon.src}
                    />
                  </div>
                  {errors.toDoGroupId && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.toDoGroupId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Responsible Person */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image
                  src={participantsIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Responsible Person
              </label>
              <SingleResponsiblePersonSelector
                options={responsiblePersons}
                onSelectionChange={handleResponsiblePersonsChange}
                subHeading="Select who should complete this task"
              />
              {errors.assignedTo && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.assignedTo}
                </p>
              )}
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
              <SingleSelector
                options={status}
                onSelectionChange={(s) => handleStatusChange([s])}
                mainHeading="Select task status"
                selectedBorderColor="blue"
                selectedBadgeColor="blue"
              />
            </div>

            {/* Additional Notes - Moved to its own row */}
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
                  value={formData.note ?? ""}
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
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
          >
            Cancel
          </button>
          <button
            onClick={(e) => handleSubmit(e as any)}
            className="px-5 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTodoPopup;
