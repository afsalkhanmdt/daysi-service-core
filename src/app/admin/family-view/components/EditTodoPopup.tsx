"use client";

import {
  ToDoCreateCommand,
  ToDoFamilyGroup as ToDoFamilyGroupType,
  todoPopupPropsType,
  ToDoStatus,
} from "@/app/types/todo";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import createTodoImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import closeIcon from "@/app/admin/assets/close-428.png";
import descriptionIcon from "@/app/admin/assets/descriptionIcon.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import groupIcon from "@/app/admin/assets/groupIcon.png";
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
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
import { MemberResponse } from "@/app/types/familyMemberTypes";
import { canUpdateToDo } from "@/app/utils/taskPermissions";
import { SelectableOption } from "./FormComponents/MultipleSelector";

const STATUS = {
  OPEN: ToDoStatus.Open,
  CLOSED: ToDoStatus.Closed,
};

interface EditTodoPopupProps extends todoPopupPropsType {
  isLoading?: boolean;
  currentMember?: MemberResponse | null;
  familyWideMemberId?: string;
  familyId?: number;
}

const EditTodoPopup: React.FC<EditTodoPopupProps> = ({
  ToDoFamilyGroup,
  isOpen,
  onClose,
  todo,
  onSubmit,
  isLoading,
  currentMember,
  familyWideMemberId,
  familyId,
}) => {
  const [formData, setFormData] = useState<ToDoCreateCommand>(
    initialToDoCreateBody,
  );
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] =
    useState<ToDoCreateCommand | null>(null);

  const { resources } = useResources();
  const modalRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    hasInitialized.current = false;
  }, [todo]);

  const { errors, validate, clearError, clearAllErrors } = useTodoValidation();
  const [status, setStatus] = useState<SelectableOption[]>(statusOptions);
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);
  const [currentStatus, setCurrentStatus] = useState<number>(STATUS.OPEN);

  const isAuthorized = useMemo(() => {
    if (!todo) return false;
    return canUpdateToDo(todo, currentMember, familyWideMemberId);
  }, [todo, currentMember, familyWideMemberId]);

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

  // Function to check if form data has changed
  const checkForChanges = (currentData: ToDoCreateCommand) => {
    if (!initialFormData) return false;

    // Compare relevant fields
    const fieldsToCompare = [
      "description",
      "toDoGroupId",
      "note",
      "private",
      "status",
      "assignedTo",
      "isForAll",
    ];

    for (const field of fieldsToCompare) {
      const currentValue = (currentData as any)[field];
      const initialValue = (initialFormData as any)[field];

      // Handle arrays
      if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
        if (
          currentValue.length !== initialValue.length ||
          currentValue.some((v, i) => v !== initialValue[i])
        ) {
          return true;
        }
      } else if (currentValue !== initialValue) {
        return true;
      }
    }
    return false;
  };

  /* ---------- Load family members ---------- */
  useEffect(() => {
    if (resources.length > 0 && isOpen && !hasInitialized.current) {
      hasInitialized.current = true;
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
  }, [resources, todo, isOpen]);

  /* ---------- Map todo → formData ---------- */
  useEffect(() => {
    if (!todo || resources.length === 0) return;

    const mapped = mapToDoTaskToCreateCommand(todo);

    const taskStatus =
      todo.Status === 1 || todo.Status === 2 ? STATUS.CLOSED : STATUS.OPEN;

    const currentMapped = {
      ...mapped,
      status: taskStatus,
      ToDoTaskId: String(todo.ToDoTaskId),
      isForAll: Boolean(todo.IsForAll || (todo as any).isForAll),
    };

    setFormData(currentMapped as any);
    setInitialFormData(currentMapped as any);
    setHasChanges(false);

    // Set current status for display
    setCurrentStatus(taskStatus);

    // Update status selector to match current status
    setStatus((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: Number(option.id) === taskStatus,
      })),
    );

    clearAllErrors();
  }, [todo, resources.length]);

  // Check for changes whenever formData updates
  useEffect(() => {
    if (initialFormData) {
      const changed = checkForChanges(formData);
      setHasChanges(changed);
    }
  }, [formData, initialFormData]);

  /* ---------- Handlers ---------- */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!isAuthorized) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "description") clearError("description");
  };

  const handleGroupSelect = (id: string) => {
    if (!isAuthorized) return;
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
    if (!isAuthorized) return;
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? 1 : 0,
    }));
  };

  const handleStatusChange = (selectedOptions: SelectableOption[]) => {
    if (!isAuthorized) return;
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
      const statusValue = Number(selectedOption.id);
      setFormData((prev) => ({
        ...prev,
        status: statusValue,
      }));
      setCurrentStatus(statusValue);
    }
  };

  const handleResponsiblePersonsChange = (selectedPerson: SelectableOption) => {
    if (!isAuthorized) return;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;

    if (
      !validate(
        formData.description || "",
        formData.toDoGroupId,
        formData.assignedTo,
      )
    ) {
      return;
    }

    const payload = {
      toDoTaskId: Number(todo?.ToDoTaskId),
      familyId: Number(familyId || todo?.FamilyId || 0),
      assignedTo: formData.assignedTo || [],
      toDoGroupId: Number(formData.toDoGroupId || 0),
      description: formData.description || "",
      note: formData.note || "",
      private: Boolean(formData.private === 1 || (formData.private as any) === true),
      status: Number(formData.status ?? currentStatus ?? STATUS.OPEN),
      isForAll: Boolean(formData.isForAll),
      updatedBy: String(
        currentMember?.MemberId || currentMember?.Id || (todo as any)?.CreatedBy || ""
      ),
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch {
      // Keep modal open so edits are not lost
    }
  };

  const handleCloseTask = () => {
    if (!isAuthorized) return;
    setShowCloseConfirmation(true);
  };

  const confirmCloseTask = () => {
    if (!isAuthorized) return;
    setCurrentStatus(STATUS.CLOSED);
    const updatedFormData = {
      ...formData,
      status: STATUS.CLOSED,
    };
    setFormData(updatedFormData);

    setStatus((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: Number(option.id) === STATUS.CLOSED,
      })),
    );
    setShowCloseConfirmation(false);
    setHasChanges(false);

    const payload = {
      toDoTaskId: Number(todo?.ToDoTaskId),
      familyId: Number(familyId || todo?.FamilyId || 0),
      assignedTo: updatedFormData.assignedTo || [],
      toDoGroupId: Number(updatedFormData.toDoGroupId || 0),
      description: updatedFormData.description || "",
      note: updatedFormData.note || "",
      private: Boolean(updatedFormData.private === 1 || (updatedFormData.private as any) === true),
      status: STATUS.CLOSED,
      isForAll: Boolean(updatedFormData.isForAll),
      updatedBy: String(
        currentMember?.MemberId || currentMember?.Id || (todo as any)?.CreatedBy || ""
      ),
    };

    onSubmit(payload);
    onClose();
  };

  const cancelCloseTask = () => {
    setShowCloseConfirmation(false);
  };

  const handleClosePopup = () => {
    if (hasChanges && isAuthorized) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClosePopup();
    }
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        if (showCloseConfirmation) {
          setShowCloseConfirmation(false);
        } else {
          handleClosePopup();
        }
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, showCloseConfirmation, hasChanges, isAuthorized]);

  if (!isOpen || !todo) return null;

  const isClosed = currentStatus === STATUS.CLOSED;
  const statusText = isClosed ? "CLOSED" : "OPEN";
  const tickColor = isClosed ? "#22C55E" : "#9CA3AF";

  const assignedTo = todo.AssignedTo as any;
  let assignedIds: string[] = [];
  if (Array.isArray(assignedTo)) {
    assignedIds = assignedTo
      .map((id: any) =>
        typeof id === "object" && id !== null
          ? String(id.MemberId || id.id || id.Id || "")
          : String(id)
      )
      .filter(Boolean);
  } else if (typeof assignedTo === "string") {
    assignedIds = assignedTo.split(",").map((s) => s.trim()).filter(Boolean);
  }

  const assignedNames =
    responsiblePersons
      .filter((p) => assignedIds.includes(String(p.memberId)))
      .map((p) => p.label)
      .join(", ") || "another member";

  const isFamilyWide = Boolean(formData.isForAll || todo.IsForAll || (todo as any).isForAll);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          className="bg-white rounded-xl w-full max-w-2xl max-h-[98vh] flex flex-col shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-1.5 rounded-lg">
                <Image
                  src={createTodoImage}
                  alt="icon"
                  width={16}
                  height={16}
                />
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                Edit ToDo Task
              </h2>
              {isFamilyWide && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold uppercase tracking-wider">
                  Family
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                <span
                  className={`text-xs font-bold ${
                    isClosed ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  Status: {statusText}
                </span>
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke={tickColor}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <button
                onClick={handleClosePopup}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Image src={closeIcon} alt="Close" width={20} height={20} />
              </button>
            </div>
          </div>

          {/* Unauthorized Banner */}
          {!isAuthorized && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-800 font-medium">
              <svg
                className="w-4 h-4 text-amber-600 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a3 3 0 00-3 3v2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm1 5V5a1 1 0 10-2 0v2h2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Read-only: You do not have permission to update this ToDo task (Assigned to {assignedNames}).
              </span>
            </div>
          )}

          {/* Scrollable Form Content */}
          <div className="overflow-y-auto flex-1 p-3 lg:p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Task Details */}
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
                      disabled={!isAuthorized}
                    />
                  </div>
                </div>

                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 space-y-3">
                  {/* Description */}
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
                      disabled={!isAuthorized}
                      placeholder="Enter task description"
                      value={formData.description ?? ""}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500 font-medium mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-gray-700 uppercase tracking-wider">
                      <Image
                        src={participantsIcon}
                        alt="icon"
                        width={12}
                        height={12}
                      />{" "}
                      Status
                    </label>
                    <SingleSelector
                      options={status}
                      onSelectionChange={(s) => handleStatusChange([s])}
                      mainHeading="Select task status"
                      selectedBorderColor="blue"
                      selectedBadgeColor="blue"
                      disabled={!isAuthorized}
                    />
                  </div>

                  {/* Group */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-gray-700 uppercase tracking-wider">
                      <Image
                        src={groupIcon}
                        alt="icon"
                        width={12}
                        height={12}
                      />{" "}
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
                        disabled={!isAuthorized}
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
                  disabled={!isAuthorized}
                />
                {errors.assignedTo && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.assignedTo}
                  </p>
                )}
              </div>

              {/* Additional Notes */}
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
                    disabled={!isAuthorized}
                    placeholder="Any special instructions..."
                    rows={2}
                    value={formData.note ?? ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[60px] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClosePopup}
              className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
            >
              {!isAuthorized ? "Close" : "Cancel"}
            </button>
            {isAuthorized && (
              <>
                <button
                  type="button"
                  onClick={handleCloseTask}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {isClosed ? "Mark Open" : "Mark Closed"}
                </button>
                <button
                  onClick={(e) => handleSubmit(e as any)}
                  disabled={isLoading}
                  className="px-5 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Close Confirmation Popup */}
      {showCloseConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {hasChanges ? "Unsaved Changes" : "Confirm Status Change"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {hasChanges
                ? "You have unsaved changes. Are you sure you want to close without saving?"
                : isClosed
                ? "Are you sure you want to reopen this ToDo task?"
                : "Are you sure you want to close this ToDo task? This action will mark it as completed."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelCloseTask}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={
                  hasChanges
                    ? () => {
                        setShowCloseConfirmation(false);
                        onClose();
                      }
                    : confirmCloseTask
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {hasChanges ? "Close Without Saving" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditTodoPopup;
