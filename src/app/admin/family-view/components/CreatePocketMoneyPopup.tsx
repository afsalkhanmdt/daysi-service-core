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
import name from "@/app/admin/assets/name.png";
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
  const [alarmOptions, setAlarmOptions] =
    useState<SelectableOption[]>(ALERT_OPTIONS);

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

    // Update formData with selected repeat option
    const selectedOption = selectedOptions.find((opt) => opt.isSelected);
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        Repeat: selectedOption.id,
      }));
    }
  };

  // const handleAlarmChange = (selectedOptions: SelectableOption[]) => {
  //   setAlarmOptions((prev) =>
  //     prev.map((option) => ({
  //       ...option,
  //       isSelected: selectedOptions.some(
  //         (selected) => selected.id === option.id,
  //       ),
  //     })),
  //   );

  //   // Update formData with selected alarm option
  //   const selectedOption = selectedOptions.find((opt) => opt.isSelected);
  //   if (selectedOption) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       alert: selectedOption.id,
  //     }));
  //   }
  // };

  // Handler for standard task selection (SINGLE SELECT)
  const handleStandardTaskChange = (selectedTasks: SelectableOption[]) => {
    setStandardTasks((prev) =>
      prev.map((task) => ({
        ...task,
        isSelected: selectedTasks.some((st) => st.id === task.id),
      })),
    );

    // Update formData with the selected task label
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

  // Handler for responsible persons selection (MULTIPLE SELECT)
  const handleResponsiblePersonsChange = (
    selectedPersons: SelectableOption[],
  ) => {
    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: selectedPersons.some((sp) => sp.id === person.id),
      })),
    );

    // Update formData with selected person labels
    setFormData((prev) => ({
      ...prev,
      FamilyMembersPlanned: selectedPersons.map((person) => person.memberId!),
    }));
  };

  // Handler for toggle switch
  const handleFirstComeFirstServeToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      FirstComeFirstServe: checked,
    }));
  };

  // Handler for input and textarea elements
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for select element
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  // ===== FORM SUBMISSION AND RESET =====

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

  // Reset all form states
  const resetForm = () => {
    setFormData(initialFormDataForPMTaskApi);
    setResponsiblePersons(
      responsiblePersons.map((p) => ({ ...p, isSelected: false })),
    );
    setStandardTasks(
      standardTaskOptions.map((t) => ({ ...t, isSelected: false })),
    );
    setRepeatSequence(REPEAT_OPTIONS);
    setAlarmOptions(ALERT_OPTIONS);
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
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-blue-200  px-6 py-4 rounded-lg flex justify-between items-center">
            <div className="flex gap-2">
              <div className="rounded-full bg-white p-2">
                <Image
                  src={createPocketMoneyImage}
                  alt="createPocketMoneyImage"
                  width={15}
                  height={15}
                />
              </div>
              <h2 className="text-xl font-semibold">
                Create Pocket Money Task
              </h2>
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
          {/* Standard Task Selection */}

          <MultipleSelector
            mainHeading="Choose Standard Task"
            subHeadingIcon={name.src}
            options={standardTasks}
            onSelectionChange={handleStandardTaskChange}
            subHeading="Select a task from the list"
            showSelectAll={false}
            showCount={true}
            showImages={false}
            selectedBorderColor="green"
            selectedBadgeColor="green"
            singleSelect={true}
          />

          {/* Description Section - SEPARATED */}
          <div>
            <div className="flex items-center gap-2 pb-1">
              <Image
                src={participantsIcon}
                alt="description icon"
                width={15}
                height={15}
              />
              <label className="block text-2xl font-semibold">
                Task Description
              </label>
            </div>

            <div className="bg-blue-100 p-2 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={additionalNoteIcon}
                  alt="description"
                  width={15}
                  height={15}
                />
                <label className="block text-lg font-medium">Description</label>
              </div>
              <textarea
                name="PMDescription"
                placeholder="Detailed description of the task..."
                value={formData.PMDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Amount Section - SEPARATED */}
          <div>
            <div className="flex items-center gap-2 pb-1">
              <Image
                src={participantsIcon}
                alt="amount icon"
                width={15}
                height={15}
              />
              <label className="block text-2xl font-semibold">
                Payment Details
              </label>
            </div>

            <div className="bg-blue-100 p-2 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Image src={name} alt="amount" width={15} height={15} />
                <label className="block text-lg font-medium">
                  Pocket Money Amount
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  name="PMAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.PMAmount || ""}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <select
                  name="CurrencyCode"
                  value={formData.CurrencyCode || "RAY"}
                  onChange={handleSelectChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-24"
                >
                  <option value="RAY">RAY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Responsible Persons */}
          <div>
            <div className="flex justify-between items-center gap-2 ">
              <div className="flex items-center gap-2 pb-1">
                <Image
                  src={participantsIcon}
                  alt="participants"
                  width={15}
                  height={15}
                />
                <label className="block text-2xl font-semibold">
                  Responsible Family Members
                </label>
              </div>
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-medium text-gray-700">
                    First Come First Serve
                  </label>
                  <ToggleSwitch
                    checked={formData.FirstComeFirstServe || false}
                    onChange={handleFirstComeFirstServeToggle}
                  />
                </div>
              </div>
            </div>
            {/* First Come First Serve Toggle */}

            <div className="bg-blue-100 p-2 rounded-md">
              <MultipleSelector
                subHeadingIcon={participantsIcon.src}
                options={responsiblePersons}
                onSelectionChange={handleResponsiblePersonsChange}
                subHeading="Select who can do this task"
                showSelectAll={true}
                showCount={true}
                showImages={true}
                selectedBorderColor="green"
                selectedBadgeColor="green"
                singleSelect={false}
              />
            </div>
          </div>

          {/* Recurring Configuration */}
          <div>
            <div className="flex items-center gap-2 pb-1">
              <Image
                src={participantsIcon}
                alt="recurring"
                width={15}
                height={15}
              />
              <label className="block text-2xl font-semibold">
                Recurring Configuration
              </label>
            </div>
            <div className="bg-blue-100 p-2 rounded-md">
              <MultipleSelector
                subHeadingIcon={repeatIcon.src}
                options={repeatSequence}
                onSelectionChange={handleRepeatChange}
                subHeading="Repeat Sequence"
                showSelectAll={true}
                showCount={true}
                showImages={false}
                selectedBorderColor="green"
                selectedBadgeColor="green"
                singleSelect={true}
              />
            </div>
          </div>

          {/* Notification */}
          {/* <div>
            <div className="flex items-center gap-2 pb-1">
              <Image
                src={participantsIcon}
                alt="notification"
                width={15}
                height={15}
              />
              <label className="block text-2xl font-semibold">
                Notification
              </label>
            </div>
            <div className="bg-blue-100 p-2 rounded-md">
              <MultipleSelector
                subHeadingIcon={alarmIcon.src}
                options={alarmOptions}
                onSelectionChange={handleAlarmChange}
                subHeading="Set reminder"
                showSelectAll={true}
                showCount={true}
                showImages={false}
                selectedBorderColor="green"
                selectedBadgeColor="green"
                singleSelect={true}
              />
            </div>
          </div> */}

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
                name="Note"
                placeholder="Any additional information or special instructions..."
                rows={3}
                value={formData.Note}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="sticky bottom-0 bg-white p-3 pt-4 border-t border-gray-200">
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
                Create Pocket Money Task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePocketMoneyPopup;
