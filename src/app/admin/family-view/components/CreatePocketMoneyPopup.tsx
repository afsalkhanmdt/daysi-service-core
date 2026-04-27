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
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import nameIcon from "@/app/admin/assets/name.png";
import alarmIcon from "@/app/admin/assets/alarmIcon.png";
import MultipleSelector, {
  SelectableOption,
} from "./FormComponents/MultipleSelector";
import { REPEAT_OPTIONS, ALERT_OPTIONS } from "@/app/constants/appointmentForm";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import { useResources } from "@/app/context/ResourceContext";
import { initialFormDataForPMTaskApi } from "@/app/constants/pocketMoneyForm";

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

const CreatePocketMoneyPopup: React.FC<PocketMoneyPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
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
    } else {
      setFormData((prev) => ({
        ...prev,
        PMDescription: "",
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
      FamilyMembersPlanned: selectedPersons.map((person) => person.memberId!),
    }));
  };

  const handleFirstComeFirstServeToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      FirstComeFirstServe: checked,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
            {/* Standard Task Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image src={nameIcon} alt="icon" width={12} height={12} />{" "}
                Choose Standard Task
              </label>
              <MultipleSelector
                options={standardTasks}
                onSelectionChange={handleStandardTaskChange}
                subHeading="Select a task from the list"
                showSelectAll={false}
                showCount={true}
                showImages={false}
                selectedBorderColor="blue"
                selectedBadgeColor="blue"
                singleSelect={true}
              />
            </div>

            {/* Task Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image
                  src={participantsIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Task Description
              </label>
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <textarea
                  name="PMDescription"
                  placeholder="Detailed description of the task..."
                  value={formData.PMDescription}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[50px]"
                />
              </div>
            </div>

            {/* Payment Details */}
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
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 flex gap-3">
                <div className="flex-1">
                  <input
                    name="PMAmount"
                    type="number"
                    placeholder="Enter amount"
                    value={formData.PMAmount || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div className="w-24">
                  <select
                    name="CurrencyCode"
                    value={formData.CurrencyCode || "RAY"}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  >
                    <option value="RAY">RAY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
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
              <MultipleSelector
                options={responsiblePersons}
                onSelectionChange={handleResponsiblePersonsChange}
                subHeading="Select who can do this task"
                showSelectAll={true}
                showCount={true}
                showImages={true}
                selectedBorderColor="blue"
                selectedBadgeColor="blue"
                singleSelect={false}
              />
            </div>

            {/* Recurring - Moved to its own row */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image src={repeatIcon} alt="icon" width={14} height={14} />{" "}
                Repeat Sequence
              </label>
              <MultipleSelector
                options={repeatSequence}
                onSelectionChange={handleRepeatChange}
                showSelectAll={true}
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
                  src={additionalNoteIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Additional Notes
              </label>
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <textarea
                  name="Note"
                  placeholder="Any special instructions..."
                  rows={2}
                  value={formData.Note}
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

export default CreatePocketMoneyPopup;
