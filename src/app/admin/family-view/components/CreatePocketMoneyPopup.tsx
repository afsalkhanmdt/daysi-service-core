"use client";

import {
  PMTaskCreateCommand,
  PocketMoneyPopupProps,
} from "@/app/types/pocketMoney";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import createPocketMoneyImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import closeIcon from "@/app/admin/assets/close-428.png";
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import additionalNoteIcon from "@/app/admin/assets/name.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import DescriptionIcon from "@/app/admin/assets/descriptionIcon.png";
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import nameIcon from "@/app/admin/assets/name.png";
import SingleSelector from "./FormComponents/SingleSelector";
import ResponsiblePersonSelector from "./FormComponents/ResponsiblePersonSelector";
import { SelectableOption } from "./FormComponents/MultipleSelector";
import { REPEAT_OPTIONS } from "@/app/constants/appointmentForm";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import { useResources } from "@/app/context/ResourceContext";
import { initialFormDataForPMTaskApi } from "@/app/constants/pocketMoneyForm";
import { usePocketMoneyValidation } from "@/app/hooks/usePocketMoneyValidation";

// Standard task options
const standardTaskOptions: SelectableOption[] = [
  { id: 1, label: "Clean up the room", isSelected: false },
  { id: 2, label: "Walk the Dog", isSelected: false },
  { id: 3, label: "Vacuum the Room", isSelected: false },
  { id: 4, label: "Wash up", isSelected: false },
  { id: 5, label: "Empty the Dishwasher", isSelected: false },
  { id: 6, label: "Wash the Car", isSelected: false },
  { id: 7, label: "Make the Bed", isSelected: false },
  { id: 8, label: "Do Homework", isSelected: false },
];

const CreatePocketMoneyPopup: React.FC<
  PocketMoneyPopupProps & { isLoading?: boolean }
> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const { resources } = useResources();
  const modalRef = useRef<HTMLDivElement>(null);

  // Main form state
  const [formData, setFormData] = useState<PMTaskCreateCommand>(
    initialFormDataForPMTaskApi,
  );

  // Separate states for each selector component
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);
  const [standardTasks, setStandardTasks] =
    useState<SelectableOption[]>(standardTaskOptions);
  const [repeatSequence, setRepeatSequence] =
    useState<SelectableOption[]>(REPEAT_OPTIONS);
  const [isCustomDescription, setIsCustomDescription] = useState(false);

  const { validate, errors, clearError, clearAllErrors } =
    usePocketMoneyValidation();

  // ===== HANDLER FUNCTIONS =====

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
        Repeat: selectedOption.id,
      }));
    }
  };

  const handleStandardTaskChange = (selectedTasks: SelectableOption[]) => {
    // Don't allow selection if custom description is being typed
    if (isCustomDescription) return;

    setStandardTasks((prev) =>
      prev.map((task) => ({
        ...task,
        isSelected: selectedTasks.some((st) => st.id === task.id),
      })),
    );

    if (selectedTasks.length > 0) {
      setFormData((prev) => ({
        ...prev,
        PMDescription: selectedTasks[0].label,
      }));
      clearError("PMDescription");
      setIsCustomDescription(false);
    } else {
      setFormData((prev) => ({
        ...prev,
        PMDescription: "",
      }));
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      PMDescription: value,
    }));
    clearError("PMDescription");

    // Check if the typed description matches any standard task
    const isStandardTask = standardTaskOptions.some(
      (task) => task.label === value,
    );

    if (isStandardTask) {
      // If it matches a standard task, select it
      setIsCustomDescription(false);
      setStandardTasks((prev) =>
        prev.map((task) => ({
          ...task,
          isSelected: task.label === value,
        })),
      );
    } else if (value.trim() !== "") {
      // If it's custom text (not matching any standard task)
      setIsCustomDescription(true);
      // Deselect all standard tasks
      setStandardTasks((prev) =>
        prev.map((task) => ({
          ...task,
          isSelected: false,
        })),
      );
    } else {
      // If empty, reset
      setIsCustomDescription(false);
      setStandardTasks((prev) =>
        prev.map((task) => ({
          ...task,
          isSelected: false,
        })),
      );
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

    const familyMemberId = resources[0]?.extendedProps?.memberId || "";

    setFormData((prev) => ({
      ...prev,
      FamilyMembersPlanned: [
        familyMemberId,
        ...selectedPersons.map((person) => person.memberId!),
      ].filter((id) => id),
    }));
    clearError("participants");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      PMAmount: val,
    }));
    if (val > 0) clearError("PMAmount");
  };

  const handleFirstComeFirstServeToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      FirstComeFirstServe: checked,
    }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      Note: e.target.value,
    }));
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

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
    if (
      !validate(formData.PMDescription, formData.PMAmount, responsiblePersons)
    ) {
      return;
    }
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
    // Reset selection state when closing
    if (resources.length > 0) {
      const otherMembers = mapResourcesToSelectableOptions(resources).slice(1);
      setResponsiblePersons(otherMembers);
    }
  };

  const resetForm = () => {
    setFormData(initialFormDataForPMTaskApi);
    setResponsiblePersons(
      responsiblePersons.map((p) => ({ ...p, isSelected: false })),
    );
    setStandardTasks(
      standardTaskOptions.map((t) => ({ ...t, isSelected: false })),
    );
    setRepeatSequence(REPEAT_OPTIONS);
    setIsCustomDescription(false);
    clearAllErrors();
  };

  useEffect(() => {
    if (resources.length > 0) {
      const allOptions = mapResourcesToSelectableOptions(resources);
      const otherMembers = allOptions.slice(1);
      setResponsiblePersons(otherMembers);

      // Initialize formData with the family member already selected
      const familyMember = allOptions[0];
      if (familyMember) {
        setFormData((prev) => ({
          ...prev,
          FamilyMembersPlanned: [familyMember.memberId || ""],
        }));
      }
    }
  }, [resources, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-2xl max-h-[98vh] flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <Image
                src={createPocketMoneyImage}
                alt="icon"
                width={16}
                height={16}
              />
            </div>
            <h2 className="text-lg font-bold text-gray-800">
              Create Pocket Money Task
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
            {/* Standard Task Selection - Display on two lines */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image src={nameIcon} alt="icon" width={12} height={12} />{" "}
                Choose Standard Task Description
              </label>
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <div className="grid grid-cols-2 gap-1">
                  {standardTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => {
                        // Don't allow selection if custom description is being typed
                        if (isCustomDescription) return;

                        const isSelected = !task.isSelected;
                        const updatedTasks = standardTasks.map((t) => ({
                          ...t,
                          isSelected: t.id === task.id ? isSelected : false,
                        }));
                        setStandardTasks(updatedTasks);
                        if (isSelected) {
                          setFormData((prev) => ({
                            ...prev,
                            PMDescription: task.label,
                          }));
                          clearError("PMDescription");
                          setIsCustomDescription(false);
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            PMDescription: "",
                          }));
                        }
                      }}
                      className={`px-2 py-1 text-xs rounded-lg border transition-all text-left ${
                        isCustomDescription
                          ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                          : task.isSelected
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                      }`}
                      disabled={isCustomDescription}
                    >
                      {task.label}
                    </button>
                  ))}
                </div>
                {isCustomDescription && (
                  <p className="text-xs text-yellow-600 font-medium mt-1">
                    Custom description is being typed. Standard tasks are
                    disabled.
                  </p>
                )}
              </div>
              {errors.PMDescription && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.PMDescription}
                </p>
              )}
            </div>

            {/* Task Description - Made more narrow */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image
                  src={DescriptionIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Custom Task Description
              </label>
              <div
                className={`bg-blue-50/50 p-2 rounded-xl border flex flex-col ${
                  errors.PMDescription ? "border-red-500" : "border-blue-100"
                }`}
              >
                <textarea
                  placeholder="Detailed description of the task..."
                  value={formData.PMDescription}
                  onChange={handleDescriptionChange}
                  rows={1}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[38px]"
                />
                {errors.PMDescription && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.PMDescription}
                  </p>
                )}
                {isCustomDescription && (
                  <p className="text-xs text-blue-500 font-medium mt-1">
                    Custom description mode - standard tasks are disabled.
                  </p>
                )}
              </div>
            </div>

            {/* Payment Details - Made more narrow */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image
                  src={participantsIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Payment Details
              </label>
              <div
                className={`bg-blue-50/50 p-2 rounded-xl border flex flex-col ${
                  errors.PMAmount ? "border-red-500" : "border-blue-100"
                }`}
              >
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={formData.PMAmount || ""}
                  onChange={handleAmountChange}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                />
                {errors.PMAmount && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.PMAmount}
                  </p>
                )}
              </div>
            </div>

            {/* Responsible Persons & Toggle */}
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                  <Image
                    src={participantsIcon}
                    alt="icon"
                    width={14}
                    height={14}
                  />{" "}
                  Responsible Members
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    First Come First Serve
                  </span>
                  <ToggleSwitch
                    checked={formData.FirstComeFirstServe || false}
                    onChange={handleFirstComeFirstServeToggle}
                  />
                </div>
              </div>
              <ResponsiblePersonSelector
                options={responsiblePersons}
                onSelectionChange={handleResponsiblePersonsChange}
                subHeading="Select who can do this task"
              />
              {errors.participants && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.participants}
                </p>
              )}
            </div>

            {/* Recurring */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image src={repeatIcon} alt="icon" width={14} height={14} />{" "}
                Repeat Sequence
              </label>
              <SingleSelector
                options={repeatSequence}
                onSelectionChange={(s) => handleRepeatChange([s])}
                selectedBorderColor="blue"
                selectedBadgeColor="blue"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image
                  src={additionalNoteIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Additional Notes
              </label>
              <div className="bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                <textarea
                  placeholder="Any additional information..."
                  rows={2}
                  value={formData.Note}
                  onChange={handleNotesChange}
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
            disabled={isLoading}
            className="px-5 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePocketMoneyPopup;
