"use client";

import {
  PMTask,
  PMTaskCreateCommand,
  PocketMoneyPopupProps,
  PMTransStatus,
} from "@/app/types/pocketMoney";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import createPocketMoneyImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import closeIcon from "@/app/admin/assets/close-428.png";
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import additionalNoteIcon from "@/app/admin/assets/name.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import DescriptionIcon from "@/app/admin/assets/descriptionIcon.png";
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import nameIcon from "@/app/admin/assets/name.png";
import { SelectableOption } from "./FormComponents/MultipleSelector";
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
import {
  finishPocketMoneyTaskCall,
  approvePocketMoneyTaskCall,
} from "@/services/api";
import { MemberResponse, MemberType } from "@/app/types/familyMemberTypes";
import {
  canUpdatePocketMoney,
  canFinishPocketMoney,
  canApprovePocketMoney,
  isPocketMoneyAssignedToMember,
  getBackendError,
} from "@/app/utils/taskPermissions";
import { appToast } from "@/components/Toast/ToastContext";

interface EditPocketMoneyPopupProps extends PocketMoneyPopupProps {
  isLoading?: boolean;
  PMStdFamilyTasks?: any[];
  reloadPM?: () => Promise<void> | void;
  currentMember?: MemberResponse | null;
  onWalletCredit?: (memberId: string, amount: number, currency: string) => void;
  totalFamilyMembersCount?: number;
}

const EditPocketMoneyPopup: React.FC<EditPocketMoneyPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pocketMoney,
  isLoading,
  PMStdFamilyTasks = [],
  reloadPM,
  dataReload,
  familyId,
  loggedInUserId,
  loggedInUserMemberType,
  currentMemberId,
  currentMember,
  onWalletCredit,
  totalFamilyMembersCount,
}) => {
  const [formData, setFormData] = useState<PMTaskCreateCommand>(
    initialFormDataForPMTaskApi,
  );
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] =
    useState<PMTaskCreateCommand | null>(null);
  const [currentStatus, setCurrentStatus] = useState<number>(PMTransStatus.Open);
  const [isCustomDescription, setIsCustomDescription] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const { resources } = useResources();
  const modalRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    hasInitialized.current = false;
  }, [pocketMoney]);

  const { errors, validate, clearError, clearAllErrors } =
    usePocketMoneyValidation();

  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);
  const [standardTasks, setStandardTasks] = useState<SelectableOption[]>([]);

  useEffect(() => {
    setStandardTasks(
      PMStdFamilyTasks.map((task: any) => ({
        id: task.PMStdFamilyTaskId || task.id,
        label: task.Description || task.description || task.label,
        isSelected: false,
      })),
    );
  }, [PMStdFamilyTasks]);

  const [repeatSequence, setRepeatSequence] =
    useState<SelectableOption[]>(REPEAT_OPTIONS);

  // Derive current member details
  const effectiveMemberType = Number(
    currentMember?.MemberType ?? loggedInUserMemberType ?? MemberType.Member,
  );
  const isFamilyAdmin = effectiveMemberType === MemberType.FamilyAdmin;
  const currentUserId = String(
    currentMember?.MemberId ?? currentMember?.Id ?? loggedInUserId ?? "",
  );

  // Permission evaluation
  const isAssigned = useMemo(() => {
    if (!pocketMoney || !currentUserId) return false;
    return isPocketMoneyAssignedToMember(
      pocketMoney,
      currentUserId,
      totalFamilyMembersCount,
    );
  }, [pocketMoney, currentUserId, totalFamilyMembersCount]);

  const canEditDetails = useMemo(() => {
    if (!pocketMoney) return false;
    return canUpdatePocketMoney(
      { ...pocketMoney, Status: currentStatus },
      currentMember || { MemberType: effectiveMemberType, MemberId: currentUserId },
      totalFamilyMembersCount,
    );
  }, [pocketMoney, currentStatus, currentMember, effectiveMemberType, currentUserId, totalFamilyMembersCount]);

  const canFinish = useMemo(() => {
    if (!pocketMoney || currentStatus !== PMTransStatus.Open) return false;
    return canFinishPocketMoney(
      { ...pocketMoney, Status: currentStatus },
      currentMember || { MemberType: effectiveMemberType, MemberId: currentUserId },
      totalFamilyMembersCount,
    );
  }, [pocketMoney, currentStatus, currentMember, effectiveMemberType, currentUserId, totalFamilyMembersCount]);

  const canApprove = useMemo(() => {
    if (!pocketMoney) return false;
    return canApprovePocketMoney(
      { ...pocketMoney, Status: currentStatus },
      currentMember || { MemberType: effectiveMemberType, MemberId: currentUserId },
    );
  }, [pocketMoney, currentStatus, currentMember, effectiveMemberType, currentUserId]);

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

    // Determine initial status based on currentMemberId if present, else task status
    const plannedMembers = pocketMoney.FamilyMembersPlanned || [];
    const memberPlanned = currentMemberId
      ? plannedMembers.find((p) => String(p.MemberId) === String(currentMemberId))
      : null;

    let initialStatus = Number(pocketMoney.Status) || PMTransStatus.Open;
    if (
      memberPlanned &&
      memberPlanned.Status !== undefined &&
      memberPlanned.Status !== null
    ) {
      initialStatus = Number(memberPlanned.Status);
    } else {
      const hasFinishedMember = plannedMembers.some(
        (p) => Number(p.Status) === PMTransStatus.Finished,
      );
      if (initialStatus === PMTransStatus.Open && hasFinishedMember) {
        initialStatus = PMTransStatus.Finished;
      }
    }

    setCurrentStatus(initialStatus);

    const isStandardTask = PMStdFamilyTasks.some(
      (task: any) =>
        (task.Description || task.description || task.label) ===
        mappedFormData.PMDescription,
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
  }, [pocketMoney, currentMemberId]);

  useEffect(() => {
    if (initialFormData) {
      const changed = checkForChanges(formData);
      setHasChanges(changed);
    }
  }, [formData, initialFormData]);

  // ===== HANDLER FUNCTIONS =====

  const handleRepeatChange = (selectedRepeat: SelectableOption[]) => {
    if (!canEditDetails) return;
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
    if (!canEditDetails || isCustomDescription) return;

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
    if (!canEditDetails) return;
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
    if (!canEditDetails) return;
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      PMDescription: value,
    }));

    if (value.trim()) {
      clearError("PMDescription");
      setStandardTasks((prev) =>
        prev.map((task) => ({ ...task, isSelected: false })),
      );
      setIsCustomDescription(true);
    } else {
      setIsCustomDescription(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEditDetails) return;
    const value = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      PMAmount: value,
    }));
    if (value > 0) {
      clearError("PMAmount");
    }
  };

  const handleFirstComeFirstServeToggle = (checked: boolean) => {
    if (!canEditDetails) return;
    setFormData((prev) => ({
      ...prev,
      FirstComeFirstServe: checked,
    }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!canEditDetails) return;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditDetails) {
      appToast.error("You can only edit Pocket Money tasks assigned to you.");
      return;
    }

    if (
      !validate(formData.PMDescription, formData.PMAmount, responsiblePersons)
    ) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch {
      // Keep modal open so edits are not lost
    }
  };

  const handleClosePopup = () => {
    if (hasChanges && canEditDetails) {
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

  // Mark task as FINISHED (1)
  const handleMarkFinished = async () => {
    if (!canFinish || isStatusUpdating) return;
    setIsStatusUpdating(true);

    const targetFamilyId = familyId ?? formData.FamilyId;
    const assignedMemberId =
      currentMemberId ||
      pocketMoney?.FamilyMembersPlanned?.[0]?.MemberId ||
      formData.FamilyMembersPlanned?.[0] ||
      currentUserId ||
      "";

    try {
      const finishApiData = {
        FamilyId: targetFamilyId,
        PMTransId: pocketMoney?.PMTransId || (pocketMoney as any)?.LocalPMTaskId,
        FinishedBy: assignedMemberId,
      };

      const response = await finishPocketMoneyTaskCall(finishApiData);
      const err = getBackendError(response);
      if (err.hasError) {
        appToast.error(err.message || "Failed to mark task finished");
        return;
      }

      setCurrentStatus(PMTransStatus.Finished);
      appToast.success("Task marked as finished!");
      if (reloadPM) await reloadPM();
      if (dataReload) await dataReload();
      onClose();
    } catch (error) {
      const err = getBackendError(error);
      appToast.error(err.message || "Failed to mark task finished");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  // Approve task (transition to 2 & wallet credit)
  const handleApprove = async () => {
    if (!canApprove || isStatusUpdating) return;
    if (!isFamilyAdmin) {
      appToast.error("Only Family Admins can approve Pocket Money tasks.");
      return;
    }

    setIsStatusUpdating(true);

    const targetFamilyId = familyId ?? formData.FamilyId;
    const finishedPlannedMember = (pocketMoney?.FamilyMembersPlanned || []).find(
      (p) => Number(p.Status) === PMTransStatus.Finished,
    );
    const assignedMemberId =
      currentMemberId ||
      finishedPlannedMember?.MemberId ||
      pocketMoney?.FamilyMembersPlanned?.[0]?.MemberId ||
      formData.FamilyMembersPlanned?.[0] ||
      "";

    const amount = Number(formData.PMAmount || pocketMoney?.PMAmount || 0);
    const currency = formData.CurrencyCode || (pocketMoney as any)?.CurrencyCode || "DKK";

    // 1. Optimistic wallet update
    if (assignedMemberId && amount > 0 && onWalletCredit) {
      onWalletCredit(assignedMemberId, amount, currency);
    }

    try {
      const approveApiData = {
        familyId: Number(targetFamilyId),
        pmTransId: Number(pocketMoney?.PMTransId || (pocketMoney as any)?.LocalPMTaskId),
        finishedBy: String(assignedMemberId),
        approvedBy: String(currentUserId),
        FamilyId: Number(targetFamilyId),
        PMTransId: Number(pocketMoney?.PMTransId || (pocketMoney as any)?.LocalPMTaskId),
        FinishedBy: String(assignedMemberId),
        ApprovedBy: String(currentUserId),
      };

      const response = await approvePocketMoneyTaskCall(approveApiData);
      const err = getBackendError(response);
      if (err.hasError) {
        // Rollback optimistic credit on error
        if (assignedMemberId && amount > 0 && onWalletCredit) {
          onWalletCredit(assignedMemberId, -amount, currency);
        }
        appToast.error(
          err.errorCode === 127
            ? "Only Family Admins can approve Pocket Money tasks."
            : err.message || "Failed to approve task",
        );
        return;
      }

      setCurrentStatus(PMTransStatus.Approved);
      // 4. Show confirmation toast
      appToast.success(`Task approved! ${amount} ${currency} credited to mWallet`);

      if (reloadPM) await reloadPM();
      if (dataReload) await dataReload();
      onClose();
    } catch (error) {
      if (assignedMemberId && amount > 0 && onWalletCredit) {
        onWalletCredit(assignedMemberId, -amount, currency);
      }
      const err = getBackendError(error);
      appToast.error(
        err.errorCode === 127
          ? "Only Family Admins can approve Pocket Money tasks."
          : err.message || "Failed to approve task",
      );
    } finally {
      setIsStatusUpdating(false);
    }
  };

  useEffect(() => {
    if (resources.length > 0 && isOpen && !hasInitialized.current) {
      hasInitialized.current = true;
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
  }, [resources, pocketMoney, isOpen]);

  if (!isOpen || !pocketMoney) return null;

  // Status display info
  const getStatusInfo = (status: number) => {
    switch (status) {
      case PMTransStatus.Open:
        return {
          label: "OPEN",
          color: "#9CA3AF",
          textColor: "text-gray-500",
          bgColor: "bg-gray-100",
        };
      case PMTransStatus.Finished:
        return {
          label: !isFamilyAdmin ? "PENDING APPROVAL" : "FINISHED",
          color: "#EAB308",
          textColor: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
      case PMTransStatus.Approved:
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
  const isApproved = currentStatus === PMTransStatus.Approved;
  const isFinished = currentStatus === PMTransStatus.Finished;
  const isOpenStatus = currentStatus === PMTransStatus.Open;

  const isFamilyWide = Boolean(
    pocketMoney.FirstComeFirstServe ||
      (pocketMoney as any).firstComeFirstServe ||
      (pocketMoney as any).isForAll ||
      (pocketMoney.FamilyMembersPlanned &&
        pocketMoney.FamilyMembersPlanned.length >= (totalFamilyMembersCount || 0)),
  );

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
                  src={createPocketMoneyImage}
                  alt="icon"
                  width={16}
                  height={16}
                />
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                Edit Pocket Money
              </h2>
              {isFamilyWide && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold uppercase tracking-wider">
                  Family
                </span>
              )}
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

          {/* Read-Only Informative Notice */}
          {!canEditDetails && (
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
                {isApproved
                  ? "This task is completed and approved (read-only)."
                  : isFinished && !isFamilyAdmin
                  ? "This task is pending admin approval (read-only)."
                  : "You can only edit Pocket Money tasks assigned to you."}
              </span>
            </div>
          )}

          {/* Scrollable Form Content */}
          <div className="overflow-y-auto flex-1 p-3 lg:p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Standard Task Selection */}
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
                          if (!canEditDetails || isCustomDescription) return;
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
                          !canEditDetails || isCustomDescription
                            ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                            : task.isSelected
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                        }`}
                        disabled={!canEditDetails || isCustomDescription}
                      >
                        {task.label}
                      </button>
                    ))}
                  </div>
                  {isCustomDescription && canEditDetails && (
                    <p className="text-xs text-yellow-600 font-medium mt-1">
                      Custom description is being typed. Standard tasks are disabled.
                    </p>
                  )}
                </div>
                {errors.PMDescription && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.PMDescription}
                  </p>
                )}
              </div>

              {/* Custom Task Description */}
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
                    disabled={!canEditDetails}
                    rows={1}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[38px] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {errors.PMDescription && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.PMDescription}
                    </p>
                  )}
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
                    disabled={!canEditDetails}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      disabled={!canEditDetails}
                    />
                  </div>
                </div>
                <ResponsiblePersonSelector
                  options={responsiblePersons}
                  onSelectionChange={handleResponsiblePersonsChange}
                  subHeading="Select who can do this task"
                  disabled={!canEditDetails}
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
                  disabled={!canEditDetails}
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
                    disabled={!canEditDetails}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[60px] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={handleClosePopup}
              className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
            >
              {!canEditDetails && !canFinish && !canApprove ? "Close" : "Cancel"}
            </button>

            {/* Finished badge for family members */}
            {isFinished && !isFamilyAdmin && (
              <span className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 rounded-lg">
                Pending Approval
              </span>
            )}

            {/* Approved badge for all */}
            {isApproved && (
              <span className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-lg">
                Completed
              </span>
            )}

            {/* Action buttons based on status & role table */}
            {isOpenStatus && (
              <>
                {/* Family Admin or Assigned Member can Mark Finished */}
                {canFinish && (
                  <button
                    type="button"
                    disabled={isStatusUpdating || isLoading}
                    onClick={handleMarkFinished}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStatusUpdating ? "Updating..." : "Mark Finished"}
                  </button>
                )}

                {/* Family Admin can directly Approve from Open */}
                {canApprove && (
                  <button
                    type="button"
                    disabled={isStatusUpdating || isLoading}
                    onClick={handleApprove}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStatusUpdating ? "Approving..." : "Approve"}
                  </button>
                )}
              </>
            )}

            {isFinished && isFamilyAdmin && (
              <button
                type="button"
                disabled={isStatusUpdating || isLoading}
                onClick={handleApprove}
                className="px-4 py-1.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStatusUpdating ? "Approving..." : "Approve"}
              </button>
            )}

            {/* Edit / Save button: Only when canEditDetails is true */}
            {canEditDetails && (
              <button
                onClick={(e) => handleSubmit(e as any)}
                disabled={isLoading || isStatusUpdating}
                className="px-5 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            )}
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
              You have unsaved changes. Are you sure you want to close without saving?
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
