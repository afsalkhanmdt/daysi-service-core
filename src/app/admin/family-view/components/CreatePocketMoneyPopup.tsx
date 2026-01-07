"use client";
import {
  PMTaskCreateCommand,
  PocketMoneyPopupProps,
} from "@/app/types/pocketMoney";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import createPocketMoneyImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import additionalNoteIcon from "@/app/admin/assets/name.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import DescriptionIcon from "@/app/admin/assets/descriptionIcon.png";
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import name from "@/app/admin/assets/name.png";
import MultipleSelector, {
  SelectableOption,
} from "./FormComponents/MultipleSelector";
import { REPEAT_OPTIONS } from "@/app/constants/appointmentForm";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import { useResources } from "@/app/context/ResourceContext";
import { initialFormDataForPMTaskApi } from "@/app/constants/pocketMoneyForm";

// You can now define different sets of options

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
  // Main form state
  const [formData, setFormData] = useState<PMTaskCreateCommand>(
    initialFormDataForPMTaskApi
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

  const handleRepeatChange = (repeatSequence: SelectableOption[]) => {
    setRepeatSequence((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: repeatSequence.some((rs) => rs.id === option.id),
      }))
    );
  };

  // Handler for standard task selection (SINGLE SELECT)
  const handleStandardTaskChange = (selectedTasks: SelectableOption[]) => {
    setStandardTasks((prev) =>
      prev.map((task) => ({
        ...task,
        isSelected: selectedTasks.some((st) => st.id === task.id),
      }))
    );

    // Update formData with the selected task label
    if (selectedTasks.length > 0) {
      setFormData((prev) => ({
        ...prev,
        standardTask: selectedTasks[0].label, // Single select, so take first item
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        standardTask: "",
      }));
    }
  };

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
      FamilyMembersPlanned: selectedPersons.map((person) => person.memberId!),
    }));
  };

  // Handler for toggle switch
  const handleFirstComeFirstServeToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      firstComeFirstServe: checked,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ===== FORM SUBMISSION AND RESET =====

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    // if (!formData.standardTask) {
    //   alert("Please select a standard task");
    //   return;
    // }

    // if (formData.checkerResponsible.length === 0) {
    //   alert("Please select at least one responsible person");
    //   return;
    // }

    // Submit form
    onSubmit(formData);

    // Reset form and close
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

    // Reset selector states
    setResponsiblePersons(
      responsiblePersons.map((p) => ({ ...p, isSelected: false }))
    );
    setStandardTasks(
      standardTaskOptions.map((t) => ({ ...t, isSelected: false }))
    );
  };

  useEffect(() => {
    setResponsiblePersons(mapResourcesToSelectableOptions(resources));
    console.log(responsiblePersons, "responsiblePersons");
  }, [resources]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header - Matching Appointment Popup Style */}
        <div className="border-b border-gray-200 bg-blue-200 m-2 px-6 py-4 rounded-lg flex gap-2">
          <div className="rounded-full bg-white p-2">
            <Image
              src={createPocketMoneyImage}
              alt="createPocketMoneyImage"
              width={15}
              height={15}
            />
          </div>
          <h2 className="text-xl font-semibold">Create Pocket Money</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Choose Standard Task - SINGLE SELECT */}
          <MultipleSelector
            titleIconUrl={name.src}
            options={standardTasks}
            onSelectionChange={handleStandardTaskChange}
            title="Choose Standard Task"
            showSelectAll={false} // Disabled for single select
            showCount={true}
            selectedBorderColor="green"
            selectedBadgeColor="green"
            singleSelect={true}
          />

          {/* Description */}
          <div>
            <div className="flex items-center gap-2">
              <Image
                src={DescriptionIcon}
                alt="participants icon"
                width={15}
                height={15}
              />
              <label className="block text-lg font-medium text-gray-800">
                Description
              </label>
            </div>

            <textarea
              name="PMDescription"
              placeholder="While details of track here"
              value={formData.PMDescription}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pocket Money Amount */}
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-800">
              Pocket Money Amount
            </label>
            <div className="flex gap-4">
              <input
                name="PMAmount"
                type="number"
                placeholder="Enter pocket money amount"
                value={formData.PMAmount || ""}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* <select
                value={formData.currency}
                onChange={handleCurrencyChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              >
                <option value="RAY">RAY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select> */}
            </div>
          </div>

          {/* Choose Responsible Section - MULTIPLE SELECT */}
          <div>
            <div className="flex justify-end items-center mb-4">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium">
                  First Come First Serve
                </label>
                <ToggleSwitch
                  checked={formData.FirstComeFirstServe}
                  onChange={handleFirstComeFirstServeToggle}
                />
              </div>
            </div>

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
              singleSelect={false} // Multiple select
            />
          </div>

          {/* Repeat Options */}
          <MultipleSelector
            titleIconUrl={repeatIcon.src}
            options={repeatSequence}
            onSelectionChange={handleRepeatChange}
            title="Repeat Sequence"
            showSelectAll={true}
            showCount={true}
            showImages={false}
            selectedBorderColor="green"
            selectedBadgeColor="green"
            singleSelect={true} // Multiple select
          />

          {/* Additional Notes */}
          <div>
            <div className="flex items-center gap-2">
              <Image
                src={additionalNoteIcon}
                alt="additional notes icon"
                width={15}
                height={15}
              />
              <label className="block text-lg font-medium mb-2">
                Additional Notes
              </label>
            </div>
            <textarea
              name="Note"
              placeholder="Any additional information..."
              rows={2}
              value={formData.Note}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Divider and Buttons */}
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
                Create Pocket Money
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePocketMoneyPopup;
