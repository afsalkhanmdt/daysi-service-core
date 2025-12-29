"use client";

import createAppointmentImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import SpecialEventIcon from "@/app/admin/assets/event-badged-1-svgrepo-com (1) 1.png";
import locationIcon from "@/app/admin/assets/location.png";
import nameIcon from "@/app/admin/assets/name.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import alarmIcon from "@/app/admin/assets/alarmIcon.png";
import additionalNoteIcon from "@/app/admin/assets/name.png";

import React, { useCallback, useEffect, useMemo, useState, memo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  appointmentPopupPropsType,
  UserEventCreateRequest,
} from "@/app/types/appoinment";
import { SelectableOption } from "./FormComponents/MultipleSelector";

// Import from centralized constants and icons
import {
  ALERT_OPTIONS,
  REPEAT_OPTIONS,
  buildTimestamp,
  parseDateToForm,
  parseTimeToForm,
} from "@/app/constants/appointmentForm";

// Lazy load heavy components
const ToggleSwitch = dynamic(() =>
  import("./FormComponents/ToggleSwitch").then((mod) => mod.ToggleSwitch)
);
const MultipleSelector = dynamic(
  () => import("./FormComponents/MultipleSelector")
);

type AppointmentFormUI = UserEventCreateRequest & {
  startDateOnly: string;
  startTimeOnly: string;
  endDateOnly: string;
  endTimeOnly: string;
};

// Custom hook for edit form management
const useEditAppointmentForm = (appointment?: any) => {
  const [formData, setFormData] = useState<AppointmentFormUI | null>(null);
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);
  const [alarmSequence, setAlarmSequence] =
    useState<SelectableOption[]>(ALERT_OPTIONS);
  const [repeatSequence, setRepeatSequence] =
    useState<SelectableOption[]>(REPEAT_OPTIONS);

  // Initialize form data from appointment
  useEffect(() => {
    if (!appointment) {
      setFormData(null);
      return;
    }

    const extendedProps = appointment.extendedProps as UserEventCreateRequest;

    const initialFormData: AppointmentFormUI = {
      ...extendedProps,
      startDateOnly: parseDateToForm(appointment.start?.toString() || ""),
      startTimeOnly: parseTimeToForm(appointment.start?.toString() || ""),
      endDateOnly: parseDateToForm(appointment.end?.toString() || ""),
      endTimeOnly: parseTimeToForm(appointment.end?.toString() || ""),
      title: extendedProps.title || appointment.title || "",
      location: extendedProps.location || "",
      description: extendedProps.description || "",
    };

    setFormData(initialFormData);

    // Initialize participants selection
    if (extendedProps.participants?.length > 0) {
      const initialParticipants = extendedProps.participants.map(
        (participant) => ({
          id: Number(participant.id) || Number(participant.id) || 0,
          label: participant.name || `Participant ${participant.id}`,
          isSelected: true,
          memberId: participant.memberId || participant.id?.toString(),
        })
      );

      setResponsiblePersons(initialParticipants);
    }

    // Initialize alarm sequence
    if (extendedProps.alert !== undefined) {
      setAlarmSequence((prev) =>
        prev.map((option) => ({
          ...option,
          isSelected: option.id === extendedProps.alert,
        }))
      );
    }

    // Initialize repeat sequence
    if (extendedProps.repeat !== undefined) {
      setRepeatSequence((prev) =>
        prev.map((option) => ({
          ...option,
          isSelected: option.id === extendedProps.repeat,
        }))
      );
    }
  }, [appointment]);

  const updateField = useCallback(
    <K extends keyof AppointmentFormUI>(
      field: K,
      value: AppointmentFormUI[K]
    ) => {
      setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    []
  );

  const getPayload = useCallback((): UserEventCreateRequest | null => {
    if (!formData) return null;

    const { startDateOnly, startTimeOnly, endDateOnly, endTimeOnly, ...rest } =
      formData;

    return {
      ...rest,
      startDate: buildTimestamp(startDateOnly, startTimeOnly),
      endDate: buildTimestamp(endDateOnly, endTimeOnly),
    };
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(null);
    setResponsiblePersons([]);
    setAlarmSequence(ALERT_OPTIONS);
    setRepeatSequence(REPEAT_OPTIONS);
  }, []);

  return {
    formData,
    responsiblePersons,
    alarmSequence,
    repeatSequence,
    updateField,
    setResponsiblePersons,
    setAlarmSequence,
    setRepeatSequence,
    getPayload,
    resetForm,
  };
};

const EditAppointmentPopup: React.FC<appointmentPopupPropsType> = memo(
  ({ isOpen, onClose, onSubmit, appointment }) => {
    const {
      formData,
      responsiblePersons,
      alarmSequence,
      repeatSequence,
      updateField,
      setResponsiblePersons,
      setAlarmSequence,
      setRepeatSequence,
      getPayload,
      resetForm,
    } = useEditAppointmentForm(appointment);

    const handleSpecialEventToggle = useCallback(
      (checked: boolean) => {
        updateField("isSpecialEvent", checked ? 1 : 0);
      },
      [updateField]
    );

    const handlePrivateToggle = useCallback(
      (checked: boolean) => {
        updateField("isPrivateEvent", checked ? 1 : 0);
      },
      [updateField]
    );

    const handleResponsiblePersonsChange = useCallback(
      (selectedPersons: SelectableOption[]) => {
        setResponsiblePersons(selectedPersons);

        updateField(
          "participants",
          selectedPersons.map((person) => ({
            localId: person.id,
            memberId: person.memberId,
            name: person.label,
            status: "Accepted",
          }))
        );
      },
      [updateField, setResponsiblePersons]
    );

    const handleAlarmChange = useCallback(
      (selectedAlarms: SelectableOption[]) => {
        const selectedAlert = selectedAlarms.find(
          (option) => option.isSelected
        );
        setAlarmSequence(selectedAlarms);

        if (selectedAlert) {
          updateField("alert", selectedAlert.id);
        }
      },
      [updateField, setAlarmSequence]
    );

    const handleRepeatChange = useCallback(
      (selectedRepeats: SelectableOption[]) => {
        const selectedRepeat = selectedRepeats.find(
          (option) => option.isSelected
        );
        setRepeatSequence(selectedRepeats);

        if (selectedRepeat) {
          updateField("repeat", selectedRepeat.id);
        }
      },
      [updateField, setRepeatSequence]
    );

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        const payload = getPayload();
        if (!payload) return;

        onSubmit(payload);
        onClose();
        resetForm();
      },
      [getPayload, onSubmit, onClose, resetForm]
    );

    const handleClose = useCallback(() => {
      onClose();
      resetForm();
    }, [onClose, resetForm]);

    // Handle escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          handleClose();
        }
      };

      if (isOpen) {
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
      }
    }, [isOpen, handleClose]);

    if (!isOpen || !formData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
          <Header onClose={handleClose} />

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <SpecialEventSection
              isSpecialEvent={formData.isSpecialEvent === 1}
              onToggle={handleSpecialEventToggle}
            />

            <TitleLocationSection
              title={formData.title}
              location={formData.location || ""}
              onTitleChange={useCallback(
                (value) => updateField("title", value),
                [updateField]
              )}
              onLocationChange={useCallback(
                (value) => updateField("location", value),
                [updateField]
              )}
            />

            <PrivateToggle
              isPrivate={formData.isPrivateEvent === 1}
              onToggle={handlePrivateToggle}
            />

            <MultipleSelector
              titleIconUrl={participantsIcon.src}
              options={responsiblePersons}
              onSelectionChange={handleResponsiblePersonsChange}
              title="Select Participants"
              showSelectAll={true}
              showCount={true}
              showImages={true}
              selectedBorderColor="green"
              selectedBadgeColor="green"
              singleSelect={false}
            />

            <DateTimeSection
              startDate={formData.startDateOnly}
              startTime={formData.startTimeOnly}
              endDate={formData.endDateOnly}
              endTime={formData.endTimeOnly}
              onStartDateChange={useCallback(
                (value) => updateField("startDateOnly", value),
                [updateField]
              )}
              onStartTimeChange={useCallback(
                (value) => updateField("startTimeOnly", value),
                [updateField]
              )}
              onEndDateChange={useCallback(
                (value) => updateField("endDateOnly", value),
                [updateField]
              )}
              onEndTimeChange={useCallback(
                (value) => updateField("endTimeOnly", value),
                [updateField]
              )}
            />

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
              singleSelect={true}
            />

            <MultipleSelector
              titleIconUrl={alarmIcon.src}
              options={alarmSequence}
              onSelectionChange={handleAlarmChange}
              title="Alarm"
              showSelectAll={true}
              showCount={true}
              showImages={false}
              selectedBorderColor="green"
              selectedBadgeColor="green"
              singleSelect={true}
            />

            <AdditionalNotes
              description={formData.description || ""}
              onChange={useCallback(
                (value) => updateField("description", value),
                [updateField]
              )}
            />

            <FormActions onCancel={handleClose} />
          </form>
        </div>
      </div>
    );
  }
);

// Extracted sub-components
const Header = memo(({ onClose }: { onClose: () => void }) => (
  <div className="border-b border-gray-200 bg-blue-200 m-2 px-6 py-4 rounded-lg flex gap-2">
    <div className="rounded-full bg-white p-2">
      <Image
        src={createAppointmentImage}
        alt="Edit Appointment"
        width={15}
        height={15}
        loading="eager"
      />
    </div>
    <h2 className="text-xl font-semibold">Edit Appointment</h2>
    <button
      onClick={onClose}
      className="ml-auto text-gray-500 hover:text-gray-700"
      aria-label="Close"
    >
      ×
    </button>
  </div>
));

const SpecialEventSection = memo(
  ({
    isSpecialEvent,
    onToggle,
  }: {
    isSpecialEvent: boolean;
    onToggle: (checked: boolean) => void;
  }) => (
    <div className="border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gray-100 p-2">
            <Image
              src={SpecialEventIcon}
              alt="Special Event"
              width={15}
              height={15}
              loading="lazy"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Special event
            </h3>
          </div>
        </div>
        <ToggleSwitch checked={isSpecialEvent} onChange={onToggle} />
      </div>
    </div>
  )
);

const TitleLocationSection = memo(
  ({
    title,
    location,
    onTitleChange,
    onLocationChange,
  }: {
    title: string;
    location: string;
    onTitleChange: (value: string) => void;
    onLocationChange: (value: string) => void;
  }) => (
    <div className="flex gap-4">
      <FormField
        label="Name"
        icon={nameIcon}
        value={title}
        onChange={onTitleChange}
        placeholder="Appointment title"
        required
      />
      <FormField
        label="Location"
        icon={locationIcon}
        value={location}
        onChange={onLocationChange}
        placeholder="Location"
      />
    </div>
  )
);

const PrivateToggle = memo(
  ({
    isPrivate,
    onToggle,
  }: {
    isPrivate: boolean;
    onToggle: (checked: boolean) => void;
  }) => (
    <div className="flex justify-end items-center">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium">Private</label>
        <ToggleSwitch checked={isPrivate} onChange={onToggle} />
      </div>
    </div>
  )
);

const DateTimeSection = memo(
  ({
    startDate,
    startTime,
    endDate,
    endTime,
    onStartDateChange,
    onStartTimeChange,
    onEndDateChange,
    onEndTimeChange,
  }: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    onStartDateChange: (value: string) => void;
    onStartTimeChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onEndTimeChange: (value: string) => void;
  }) => (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="from"
          value={startDate}
          onChange={onStartDateChange}
          type="date"
          placeholder="Select Start date"
          required
        />
        <FormField
          label="to"
          value={endDate}
          onChange={onEndDateChange}
          type="date"
          placeholder="Select End date"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <FormField
          label="Start Time"
          value={startTime}
          onChange={onStartTimeChange}
          type="time"
          required
        />
        <FormField
          label="End Time"
          value={endTime}
          onChange={onEndTimeChange}
          type="time"
          required
        />
      </div>
    </div>
  )
);

const AdditionalNotes = memo(
  ({
    description,
    onChange,
  }: {
    description: string;
    onChange: (value: string) => void;
  }) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Image
          src={additionalNoteIcon}
          alt="Additional Notes"
          width={15}
          height={15}
          loading="lazy"
        />
        <label className="block text-lg font-medium">Additional Notes</label>
      </div>
      <textarea
        value={description}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Any additional information..."
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
);

const FormActions = memo(({ onCancel }: { onCancel: () => void }) => (
  <div className="border-t border-gray-200 pt-4">
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={onCancel}
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
));

const FormField = memo(
  ({
    label,
    icon,
    value,
    onChange,
    type = "text",
    placeholder,
    required,
  }: {
    label: string;
    icon?: any;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <Image src={icon} alt={label} width={15} height={15} loading="lazy" />
        )}
        <label className="block text-lg font-medium">{label}</label>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
      />
    </div>
  )
);

EditAppointmentPopup.displayName = "EditAppointmentPopup";

export default EditAppointmentPopup;
