"use client";
import {
  PMTask,
  PMTaskCreateCommand,
  PocketMoneyPopupProps,
} from "@/app/types/pocketMoney";
import React, { useState, useEffect } from "react";
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
import {
  mapPMTaskToCreateCommand,
  mapResourcesToSelectableOptions,
} from "@/app/utils/resourceAdapters";
import { useResources } from "@/app/context/ResourceContext";
import { initialFormDataForPMTaskApi } from "@/app/constants/pocketMoneyForm";

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

const EditPocketMoneyPopup: React.FC<PocketMoneyPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pocketMoney,
}) => {
  const [formData, setFormData] = useState<PMTaskCreateCommand>(
    initialFormDataForPMTaskApi
  );
  const { resources } = useResources();
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);
  const [standardTasks, setStandardTasks] =
    useState<SelectableOption[]>(standardTaskOptions);
  const [repeatSequence, setRepeatSequence] =
    useState<SelectableOption[]>(REPEAT_OPTIONS);

  useEffect(() => {
    if (!pocketMoney) return;

    const mappedFormData = mapPMTaskToCreateCommand(pocketMoney);
    setFormData(mappedFormData);

    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: mappedFormData.FamilyMembersPlanned.includes(
          person.memberId!
        ),
      }))
    );

    setStandardTasks((prev) =>
      prev.map((task) => ({
        ...task,
        isSelected: task.label === mappedFormData.PMDescription,
      }))
    );

    const repeatMap: Record<number, string> = {
      0: "Never",
      1: "Everyday",
      2: "Every Week",
      3: "Every Month",
      4: "Every Year",
    };

    setRepeatSequence((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: option.label === repeatMap[mappedFormData.Repeat],
      }))
    );
  }, [pocketMoney]);

  // ===== HANDLER FUNCTIONS =====

  const handleRepeatChange = (selectedRepeat: SelectableOption[]) => {
    setRepeatSequence((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: selectedRepeat.some((rs) => rs.id === option.id),
      }))
    );

    // Update formData with selected repeat value
    if (selectedRepeat.length > 0) {
      const repeatMap: Record<string, number> = {
        Never: 0,
        Everyday: 1,
        "Every Week": 2,
        "Every Month": 3,
        "Every Year": 4,
      };

      setFormData((prev) => ({
        ...prev,
        Repeat: repeatMap[selectedRepeat[0].label] || 0,
      }));
    }
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
    selectedPersons: SelectableOption[]
  ) => {
    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: selectedPersons.some((sp) => sp.id === person.id),
      }))
    );

    setFormData((prev) => ({
      ...prev,
      FamilyMembersPlanned: selectedPersons.map((p) => p.memberId!),
    }));
  };

  // Handler for description change
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      PMDescription: e.target.value,
    }));
  };

  // Handler for amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      PMAmount: parseFloat(e.target.value) || 0,
    }));
  };

  // Handler for toggle switch
  const handleFirstComeFirstServeToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      FirstComeFirstServe: checked,
    }));
  };

  // Handler for additional notes
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      Note: e.target.value,
    }));
  };

  // ===== FORM SUBMISSION AND RESET =====

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.PMDescription.trim()) {
      alert("Please enter a description or select a standard task");
      return;
    }

    if (formData.FamilyMembersPlanned.length === 0) {
      alert("Please select at least one responsible person");
      return;
    }

    // Submit form
    onSubmit(formData);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    setResponsiblePersons(mapResourcesToSelectableOptions(resources));
  }, [resources]);

  if (!isOpen || !pocketMoney) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header - Matching CreatePocketMoneyPopup Style */}
        <div className="border-b border-gray-200 bg-blue-200 m-2 px-6 py-4 rounded-lg flex gap-2">
          <div className="rounded-full bg-white p-2">
            <Image
              src={createPocketMoneyImage}
              alt="editPocketMoneyImage"
              width={15}
              height={15}
            />
          </div>
          <h2 className="text-xl font-semibold">Edit Pocket Money</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Choose Standard Task - SINGLE SELECT */}
          <MultipleSelector
            titleIconUrl={name.src}
            options={standardTasks}
            onSelectionChange={handleStandardTaskChange}
            title="Choose Standard Task"
            showSelectAll={false}
            showCount={true}
            selectedBorderColor="green"
            selectedBadgeColor="green"
            singleSelect={true}
          />

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src={DescriptionIcon}
                alt="description icon"
                width={15}
                height={15}
              />
              <label className="block text-lg font-medium text-gray-800">
                Description
              </label>
            </div>
            <textarea
              placeholder="While details of track here"
              value={formData.PMDescription}
              onChange={handleDescriptionChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pocket Money Amount */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-lg font-medium text-gray-800">
                Pocket Money Amount
              </label>
            </div>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Enter pocket money amount"
                value={formData.PMAmount || ""}
                onChange={handleAmountChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* First Come First Serve Toggle */}
          <div className="flex justify-end items-center">
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

          {/* Choose Responsible Persons - MULTIPLE SELECT */}
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

          {/* Repeat Options */}
          <MultipleSelector
            titleIconUrl={repeatIcon.src}
            options={repeatSequence}
            onSelectionChange={handleRepeatChange}
            title="Repeat Sequence"
            showSelectAll={false}
            showCount={true}
            showImages={false}
            selectedBorderColor="green"
            selectedBadgeColor="green"
            singleSelect={true}
          />

          {/* Additional Notes */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src={additionalNoteIcon}
                alt="additional notes icon"
                width={15}
                height={15}
              />
              <label className="block text-lg font-medium text-gray-800">
                Additional Notes
              </label>
            </div>
            <textarea
              placeholder="Any additional information..."
              rows={2}
              value={formData.Note}
              onChange={handleNotesChange}
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
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPocketMoneyPopup;
