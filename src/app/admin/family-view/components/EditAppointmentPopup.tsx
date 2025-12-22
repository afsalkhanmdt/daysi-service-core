"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { appointmentPopupPropsType } from "@/app/types/appoinment";
import createAppointmentImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import SpecialEventIcon from "@/app/admin/assets/event-badged-1-svgrepo-com (1) 1.png";
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import locationIcon from "@/app/admin/assets/location.png";
import nameIcon from "@/app/admin/assets/name.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import alarmIcon from "@/app/admin/assets/alarmIcon.png";
import additionalNoteIcon from "@/app/admin/assets/name.png";
import MultipleSelector, {
  SelectableOption,
} from "./FormComponents/MultipleSelector";
import { ExtendedProps } from "@/app/types/appoinment";

const responsiblePersonsOptions: SelectableOption[] = [
  { id: "1", label: "Johnson", isSelected: false },
  { id: "2", label: "Christian", isSelected: false },
  { id: "3", label: "Sofie", isSelected: false },
  { id: "4", label: "Clara", isSelected: false },
];

const alarmOptions: SelectableOption[] = [
  { id: "1", label: "Never", isSelected: false },
  { id: "2", label: "At Time of Event", isSelected: false },
  { id: "3", label: "5 mins before", isSelected: false },
  { id: "4", label: "30 min before", isSelected: false },
  { id: "5", label: "1 hour before", isSelected: false },
];

const repeatOptions: SelectableOption[] = [
  { id: "1", label: "Never", isSelected: false },
  { id: "2", label: "Everyday", isSelected: false },
  { id: "3", label: "Every Week ", isSelected: false },
  { id: "4", label: "Every Month", isSelected: false },
  { id: "5", label: "Every Year", isSelected: false },
];

const buildTimestamp = (date: string, time: string) => {
  return new Date(`${date}T${time}`).toISOString();
};

const parseDateToForm = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const parseTimeToForm = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toTimeString().slice(0, 5);
};

type AppointmentFormUI = ExtendedProps & {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

const EditAppointmentPopup: React.FC<appointmentPopupPropsType> = ({
  isOpen,
  onClose,
  onSubmit,
  appointment,
}) => {
  const [formData, setFormData] = useState<AppointmentFormUI | null>(null);
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >(responsiblePersonsOptions);
  const [alarmSequence, setAlarmSequence] =
    useState<SelectableOption[]>(alarmOptions);
  const [repeatSequence, setRepeatSequence] =
    useState<SelectableOption[]>(repeatOptions);

  useEffect(() => {
    if (!appointment) return;

    const extendedProps = appointment.extendedProps as ExtendedProps;

    const initialFormData: AppointmentFormUI = {
      ...extendedProps,
      startDate: parseDateToForm(appointment.start?.toString() || ""),
      startTime: parseTimeToForm(appointment.start?.toString() || ""),
      endDate: parseDateToForm(appointment.end?.toString() || ""),
      endTime: parseTimeToForm(appointment.end?.toString() || ""),
      Title: extendedProps.Title || appointment.title || "",
      Location: extendedProps.Location || "",
      Description: extendedProps.Description || "",
    };

    setFormData(initialFormData);

    // Initialize participants selection
    if (extendedProps.participants && extendedProps.participants.length > 0) {
      setResponsiblePersons((prev) =>
        prev.map((person) => ({
          ...person,
          isSelected: extendedProps.participants.some(
            (p) => p.Participant === person.label
          ),
        }))
      );
    }

    // Initialize alarm sequence based on Alarm property
    if (extendedProps.Alarms || extendedProps.Alarms) {
      const alarmValue = extendedProps.Alarms || extendedProps.Alarms;
      setAlarmSequence((prev) =>
        prev.map((option) => ({
          ...option,
          isSelected: option.label === alarmValue,
        }))
      );
    }

    // Initialize repeat sequence based on Repeat property
    if (extendedProps.Repeat !== undefined) {
      setRepeatSequence((prev) =>
        prev.map((option) => ({
          ...option,
          isSelected:
            option.id === String(extendedProps.Repeat) ||
            option.label
              .toLowerCase()
              .includes(extendedProps.Repeat.toString().toLowerCase()),
        }))
      );
    }
  }, [appointment]);

  const handleSpecialEventToggle = (checked: boolean) => {
    setFormData((prev) =>
      prev ? { ...prev, IsSpecialEvent: checked ? 1 : 0 } : prev
    );
  };

  const handlePrivateToggle = (checked: boolean) => {
    setFormData((prev) =>
      prev ? { ...prev, IsPrivateEvent: checked ? 1 : 0 } : prev
    );
  };

  const handleResponsiblePersonsChange = (
    selectedPersons: SelectableOption[]
  ) => {
    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: selectedPersons.some((sp) => sp.id === person.id),
      }))
    );

    // Update formData with selected participants
    const participants = selectedPersons.map((person) => ({
      ParticipantId: person.id,
      Participant: person.label,
      Status: "Accepted",
      ParticipantClass: "",
      ParticipantFirstName: "",
    }));

    setFormData((prev) => (prev ? { ...prev, participants } : prev));
  };

  const handleAlarmChange = (selectedAlarms: SelectableOption[]) => {
    setAlarmSequence((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: selectedAlarms.some((sa) => sa.id === option.id),
      }))
    );

    if (selectedAlarms.length > 0) {
      setFormData((prev) =>
        prev ? { ...prev, Alarm: selectedAlarms[0].label } : prev
      );
    }
  };

  const handleRepeatChange = (selectedRepeats: SelectableOption[]) => {
    setRepeatSequence((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: selectedRepeats.some((sr) => sr.id === option.id),
      }))
    );

    if (selectedRepeats.length > 0) {
      // Map label to appropriate repeat value
      const repeatLabel = selectedRepeats[0].label;
      let repeatValue = 0;

      switch (repeatLabel) {
        case "Everyday":
          repeatValue = 1;
          break;
        case "Every Week":
          repeatValue = 2;
          break;
        case "Every Month":
          repeatValue = 3;
          break;
        case "Every Year":
          repeatValue = 4;
          break;
        default:
          repeatValue = 0; // Never
      }

      setFormData((prev) => (prev ? { ...prev, Repeat: repeatValue } : prev));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Prepare payload similar to CreateAppointmentPopup
    const payload: ExtendedProps = {
      ...formData,
      Start: buildTimestamp(formData.startDate, formData.startTime),
      End: buildTimestamp(formData.endDate, formData.endTime),
    };

    // Remove UI-only fields
    delete (payload as any).startDate;
    delete (payload as any).startTime;
    delete (payload as any).endDate;
    delete (payload as any).endTime;

    onSubmit(payload);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header - Matching CreateAppointmentPopup Style */}
        <div className="border-b border-gray-200 bg-blue-200 m-2 px-6 py-4 rounded-lg flex gap-2">
          <div className="rounded-full bg-white p-2">
            <Image
              src={createAppointmentImage}
              alt="editAppointmentImage"
              width={15}
              height={15}
            />
          </div>
          <h2 className="text-xl font-semibold">Edit Appointment</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Special Event Section with Switch */}
          <div className="border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <Image
                    src={SpecialEventIcon}
                    alt="specialEventIcon"
                    width={15}
                    height={15}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Special event
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ToggleSwitch
                  checked={formData.IsSpecialEvent === 1}
                  onChange={handleSpecialEventToggle}
                />
              </div>
            </div>
          </div>

          {/* Title and Location */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Image src={nameIcon} alt="nameIcon" width={15} height={15} />
                <label className="block text-lg font-medium">Name</label>
              </div>
              <input
                type="text"
                placeholder="Appointment title"
                value={formData.Title}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev ? { ...prev, Title: e.target.value } : prev
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={locationIcon}
                  alt="locationIcon"
                  width={15}
                  height={15}
                />
                <label className="block text-lg font-medium">Location</label>
              </div>
              <input
                type="text"
                placeholder="Appointment location"
                value={formData.Location || ""}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev ? { ...prev, Location: e.target.value } : prev
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Private Toggle */}
          <div className="flex justify-end items-center">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium">Private</label>
              <ToggleSwitch
                checked={formData.IsPrivateEvent === 1}
                onChange={handlePrivateToggle}
              />
            </div>
          </div>

          {/* Participants */}
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

          {/* Date and Time - Separated like CreateAppointmentPopup */}
          <div className="">
            {/* Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium mb-2">from</label>
                <input
                  placeholder="Select Start date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) =>
                      prev ? { ...prev, startDate: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2">to</label>
                <input
                  placeholder="Select End date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) =>
                      prev ? { ...prev, endDate: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((prev) =>
                      prev ? { ...prev, startTime: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((prev) =>
                      prev ? { ...prev, endTime: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Repeat Sequence */}
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

          {/* Alarm */}
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

          {/* Additional Notes */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src={additionalNoteIcon}
                alt="additionalNoteIcon"
                width={15}
                height={15}
              />
              <label className="block text-lg font-medium">
                Additional Notes
              </label>
            </div>
            <textarea
              placeholder="Any additional information..."
              rows={2}
              value={formData.Description || ""}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, Description: e.target.value } : prev
                )
              }
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
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentPopup;
