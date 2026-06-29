"use client";
import {
  PMTask,
  PMTaskCreateCommand,
  PocketMoneyPopupProps,
} from "@/app/types/pocketMoney";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import createPocketMoneyImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import closeIcon from "@/app/admin/assets/close-428.png";
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import additionalNoteIcon from "@/app/admin/assets/name.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import DescriptionIcon from "@/app/admin/assets/descriptionIcon.png";
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import nameIcon from "@/app/admin/assets/name.png";
import MultipleSelector, {
  SelectableOption,
} from "./FormComponents/MultipleSelector";
import SingleSelector from "./FormComponents/SingleSelector";
import ResponsiblePersonSelector from "./FormComponents/ResponsiblePersonSelector";
import { REPEAT_OPTIONS } from "@/app/constants/appointmentForm";
import {
  mapPMTaskToCreateCommand,
  mapResourcesToSelectableOptions,
} from "@/app/utils/resourceAdapters";
import { useResources } from "@/app/context/ResourceContext";
import { initialFormDataForPMTaskApi } from "@/app/constants/pocketMoneyForm";
import { usePocketMoneyValidation } from "@/app/hooks/usePocketMoneyValidation";

// Status constants
const STATUS = {
  OPEN: 0,
  FINISHED: 1,
  APPROVED: 2,
};

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

const EditPocketMoneyPopup: React.FC<
  PocketMoneyPopupProps & { isLoading?: boolean }
> = ({ isOpen, onClose, onSubmit, pocketMoney, isLoading }) => {
  const [formData, setFormData] = useState<PMTaskCreateCommand>(
    initialFormDataForPMTaskApi,
  );
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] =
    useState<PMTaskCreateCommand | null>(null);
  const [currentStatus, setCurrentStatus] = useState<number>(STATUS.OPEN);
  const [isCustomDescription, setIsCustomDescription] = useState(false);

  const { resources } = useResources();
  const modalRef = useRef<HTMLDivElement>(null);
  const { errors, validate, clearError, clearAllErrors } =
    usePocketMoneyValidation();

  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);
  const [standardTasks, setStandardTasks] =
    useState<SelectableOption[]>(standardTaskOptions);
  const [repeatSequence, setRepeatSequence] =
    useState<SelectableOption[]>(REPEAT_OPTIONS);

  // Function to check if form data has changed
  const checkForChanges = (currentData: PMTaskCreateCommand) => {
    if (!initialFormData) return false;

    const fieldsToCompare = [
      "PMDescription",
      "PMAmount",
      "Note",
      "Repeat",
      "FirstComeFirstServe",
      "FamilyMembersPlanned",
    ];

    for (const field of fieldsToCompare) {
      const currentValue = (currentData as any)[field];
      const initialValue = (initialFormData as any)[field];

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

  useEffect(() => {
    if (!pocketMoney) return;

    const mappedFormData = mapPMTaskToCreateCommand(pocketMoney);
    setFormData(mappedFormData);
    setInitialFormData(mappedFormData);
    setHasChanges(false);

    // Set current status
    setCurrentStatus(pocketMoney.Status || STATUS.OPEN);

    // Check if the description matches any standard task
    const isStandardTask = standardTaskOptions.some(
      (task) => task.label === mappedFormData.PMDescription,
    );
    setIsCustomDescription(!isStandardTask);

    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: mappedFormData.FamilyMembersPlanned.includes(
          person.memberId!,
        ),
      })),
    );

    setStandardTasks((prev) =>
      prev.map((task) => ({
        ...task,
        isSelected: task.label === mappedFormData.PMDescription,
      })),
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
      })),
    );
    clearAllErrors();
  }, [pocketMoney]);

  // Check for changes whenever formData updates
  useEffect(() => {
    if (initialFormData) {
      const changed = checkForChanges(formData);
      setHasChanges(changed);
    }
  }, [formData, initialFormData]);

  // ===== HANDLER FUNCTIONS =====

  const handleRepeatChange = (selectedRepeat: SelectableOption[]) => {
    setRepeatSequence((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: selectedRepeat.some((rs) => rs.id === option.id),
      })),
    );

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
        ...selectedPersons.map((p) => p.memberId!),
      ].filter((id) => id),
    }));
    clearError("participants");
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
  }, [isOpen, showCloseConfirmation, hasChanges]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !validate(formData.PMDescription, formData.PMAmount, responsiblePersons)
    ) {
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const handleClosePopup = () => {
    if (hasChanges) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowCloseConfirmation(false);
    onClose();
  };

  const cancelClose = () => {
    setShowCloseConfirmation(false);
  };

  // Handle status change button
  const handleStatusChange = () => {
    let newStatus: number;

    if (currentStatus === STATUS.OPEN) {
      newStatus = STATUS.FINISHED;
    } else if (currentStatus === STATUS.FINISHED) {
      newStatus = STATUS.APPROVED;
    } else {
      return; // Should not happen
    }

    setCurrentStatus(newStatus);
    const updatedFormData = { ...formData, Status: newStatus };
    setFormData(updatedFormData);

    // Auto-save with new status
    onSubmit(updatedFormData);
    onClose();
  };

  useEffect(() => {
    if (resources.length > 0) {
      const allOptions = mapResourcesToSelectableOptions(resources);
      const otherMembers = allOptions.slice(1);
      setResponsiblePersons(otherMembers);

      if (pocketMoney) {
        const mappedFormData = mapPMTaskToCreateCommand(pocketMoney);
        setResponsiblePersons((prev) =>
          prev.map((person) => ({
            ...person,
            isSelected: mappedFormData.FamilyMembersPlanned.includes(
              person.memberId!,
            ),
          })),
        );
      }
    }
  }, [resources, pocketMoney]);

  if (!isOpen || !pocketMoney) return null;

  // Get status display info
  const getStatusInfo = (status: number) => {
    switch (status) {
      case STATUS.OPEN:
        return {
          label: "OPEN",
          color: "#9CA3AF",
          textColor: "text-gray-500",
          bgColor: "bg-gray-100",
        };
      case STATUS.FINISHED:
        return {
          label: "FINISHED",
          color: "#EAB308",
          textColor: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
      case STATUS.APPROVED:
        return {
          label: "APPROVED",
          color: "#22C55E",
          textColor: "text-green-600",
          bgColor: "bg-green-50",
        };
      default:
        return {
          label: "OPEN",
          color: "#9CA3AF",
          textColor: "text-gray-500",
          bgColor: "bg-gray-100",
        };
    }
  };

  const statusInfo = getStatusInfo(currentStatus);
  const showStatusButton = currentStatus !== STATUS.APPROVED;

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
          {/* Compact Header with Status */}
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
                Edit Pocket Money
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <div
                className={`flex items-center gap-1.5 ${statusInfo.bgColor} px-2.5 py-1 rounded-full`}
              >
                <span className={`text-xs font-bold ${statusInfo.textColor}`}>
                  Status: {statusInfo.label}
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
                    stroke={statusInfo.color}
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
                  className={`bg-blue-50/50 p-2 rounded-xl border flex flex-col ${errors.PMDescription ? "border-red-500" : "border-blue-100"}`}
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
                  className={`bg-blue-50/50 p-2 rounded-xl border flex flex-col ${errors.PMAmount ? "border-red-500" : "border-blue-100"}`}
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
                      checked={formData.FirstComeFirstServe}
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
              onClick={handleClosePopup}
              className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
            >
              Cancel
            </button>
            {showStatusButton && (
              <button
                type="button"
                onClick={handleStatusChange}
                className={`px-4 py-1.5 text-sm font-medium text-white rounded-lg transition-colors ${
                  currentStatus === STATUS.OPEN
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {currentStatus === STATUS.OPEN ? "FINISHED" : "APPROVE"}
              </button>
            )}
            <button
              onClick={(e) => handleSubmit(e as any)}
              disabled={isLoading}
              className="px-5 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Close Confirmation Popup */}
      {showCloseConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Unsaved Changes
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to close without
              saving?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmClose}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Close Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditPocketMoneyPopup;
