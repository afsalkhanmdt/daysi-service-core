"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { EventInput } from "@fullcalendar/core";
import {
  appointmentPopupPropsType,
  EventParticipant,
  ExtendedProps,
} from "@/app/types/appoinment";
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

const EditAppointmentPopup: React.FC<appointmentPopupPropsType> = ({
  isOpen,
  onClose,
  onSubmit,
  appointment,
}) => {
  const [formData, setFormData] = useState<ExtendedProps | null>(null);
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >(responsiblePersonsOptions);
  const [alarmSequence, setAlarmSequence] =
    useState<SelectableOption[]>(alarmOptions);
  const [repeatSequence, setRepeatSequence] =
    useState<SelectableOption[]>(repeatOptions);
  const [isSpecialEvent, setIsSpecialEvent] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (!appointment) return;

    const extendedProps = appointment.extendedProps as ExtendedProps;

    setFormData({
      ...extendedProps,
      Start: appointment.start?.toString() ?? "",
      End: appointment.end?.toString() ?? "",
    });

    // Initialize participants selection
    if (extendedProps.participants && extendedProps.participants.length > 0) {
      setResponsiblePersons((prev) =>
        prev.map((person) => ({
          ...person,
          isSelected: extendedProps.participants.some(
            (p: EventParticipant) => p.Participant === person.label
          ),
        }))
      );
    }

    // Initialize special event toggle
    setIsSpecialEvent(extendedProps.IsSpecialEvent === 1 ? true : false);
    // Initialize private toggle
    setIsPrivate(extendedProps.IsPrivateEvent === 1 ? true : false);

    // Initialize alarm sequence (if available in extendedProps)
    if (extendedProps.Alarms) {
      setAlarmSequence((prev) =>
        prev.map((option) => ({
          ...option,
          isSelected: option.label === extendedProps.Alarms,
        }))
      );
    }

    // Initialize repeat sequence (if available in extendedProps)
    if (extendedProps.Repeat) {
      setRepeatSequence((prev) =>
        prev.map((option) => ({
          ...option,
          isSelected: option.label === String(extendedProps.Repeat),
        }))
      );
    }
  }, [appointment]);

  // Handler functions
  const handleSpecialEventToggle = (checked: boolean) => {
    setIsSpecialEvent(checked);
    setFormData((prev) =>
      prev ? { ...prev, IsSpecialEvent: checked ? 1 : 0 } : prev
    );
  };

  const handlePrivateToggle = (checked: boolean) => {
    setIsPrivate(checked);
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
    const participants: EventParticipant[] = selectedPersons.map((person) => ({
      ParticipantId: person.id,
      Participant: person.label,
      Status: "Accepted", // Default status
      ParticipantClass: "", // Provide default or appropriate value
      ParticipantFirstName: "", // Provide default or appropriate value
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
      setFormData((prev) =>
        prev ? { ...prev, Repeat: Number(selectedRepeats[0].label) } : prev
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSubmit(formData);
    }
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !formData) return null;

  // Format datetime-local values
  const startDateTime = formData.Start
    ? new Date(formData.Start as string).toISOString().slice(0, 16)
    : "";
  const endDateTime = formData.End
    ? new Date(formData.End as string).toISOString().slice(0, 16)
    : "";

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
                  checked={isSpecialEvent}
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
                <label className="block text-lg font-medium text-gray-800">
                  Name
                </label>
              </div>
              <input
                type="text"
                placeholder="Appointment title"
                value={formData.Title || ""}
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
                <label className="block text-lg font-medium text-gray-800">
                  Location
                </label>
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
                checked={isPrivate}
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

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium mb-2 text-gray-800">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) =>
                    setFormData((prev) =>
                      prev ? { ...prev, Start: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-gray-800">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) =>
                    setFormData((prev) =>
                      prev ? { ...prev, End: e.target.value } : prev
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
            showSelectAll={false}
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
                alt="additionalNoteIcon"
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

export default EditAppointmentPopup;
