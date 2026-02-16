import Image from "next/image";
import React, { useEffect, useState } from "react";
import editAppointmentImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png"; // You might want a different icon
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
import { useResources } from "@/app/context/ResourceContext";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import {
  AppointmentFormUI,
  appointmentPopupPropsType,
  UserEventCreateRequest,
} from "@/app/types/appoinment";
import {
  ALERT_OPTIONS,
  buildTimestamp,
  parseTimestampToDateOnly,
  parseTimestampToTimeOnly,
  REPEAT_OPTIONS,
} from "@/app/constants/appointmentForm";
import { EventInput } from "@fullcalendar/core";

// Define the props type for the edit popup
type EditAppointmentPopupProps = appointmentPopupPropsType & {
  onSubmit: (data: UserEventCreateRequest) => void;
  initialData?: EventInput; // Add initial data for editing
};

const EditAppointmentPopup: React.FC<EditAppointmentPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { resources } = useResources();
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);

  console.log(initialData, "initialData");

  const [formData, setFormData] = useState<AppointmentFormUI>({
    ...initialData, // Start with initial data if provided
    startDateOnly: initialData?.startDate
      ? parseTimestampToDateOnly(initialData.startDate)
      : "",
    startTimeOnly: initialData?.startDate
      ? parseTimestampToTimeOnly(initialData.startDate)
      : "",
    endDateOnly: initialData?.endDate
      ? parseTimestampToDateOnly(initialData.endDate)
      : "",
    endTimeOnly: initialData?.endDate
      ? parseTimestampToTimeOnly(initialData.endDate)
      : "",
  } as AppointmentFormUI);

  // Generic handler for text inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Generic handler for toggle switches
  const handleToggleChange = (
    field: keyof AppointmentFormUI,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? 1 : 0,
    }));
  };

  // Generic handler for single-select MultipleSelector components
  const handleSingleSelectChange = (
    field: keyof AppointmentFormUI,
    selectedOptions: SelectableOption[],
  ) => {
    const selectedOption = selectedOptions.find((option) => option.isSelected);
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption ? selectedOption.id : 0,
    }));
  };

  // Handler for responsible persons (multi-select)
  const handleResponsiblePersonsChange = (
    selectedPersons: SelectableOption[],
  ) => {
    // Update the responsiblePersons state
    setResponsiblePersons(selectedPersons);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a set of initial participant memberIds for quick lookup
    const initialParticipantIds = new Set(
      initialData?.participants?.map(
        (p: any) => p.memberId || p.ParticipantId || p.id,
      ) || [],
    );

    // Format participants properly for the API from responsiblePersons state
    const formattedParticipants = responsiblePersons
      .filter((person) => person.isSelected)
      .map((person) => {
        const participantData: any = {
          localId: person.id,
          memberId: person.memberId,
        };

        // Only add eventId if this participant was in the initial data
        if (
          initialParticipantIds.has(person.memberId) ||
          initialParticipantIds.has(person.id)
        ) {
          participantData.eventId = initialData?.id;
        }

        return participantData;
      });

    // Create a copy of formData without the participants field
    const { participants, ...formDataWithoutParticipants } = formData;

    const payload: UserEventCreateRequest = {
      ...formDataWithoutParticipants,
      startDate: buildTimestamp(formData.startDateOnly, formData.startTimeOnly),
      endDate: buildTimestamp(formData.endDateOnly, formData.endTimeOnly),
      participants: formattedParticipants, // Always use the formatted participants
    };

    delete (payload as any).startDateOnly;
    delete (payload as any).startTimeOnly;
    delete (payload as any).endDateOnly;
    delete (payload as any).endTimeOnly;

    console.log("Submitting payload:", payload); // Add this for debugging
    onSubmit(payload);
    onClose();
  };

  const handleClose = () => {
    onClose();
    // Optionally reset form on close, or keep data for re-opening
    if (initialData) {
      setFormData({
        ...initialData,
        startDateOnly: initialData?.startDate
          ? parseTimestampToDateOnly(initialData.startDate)
          : "",
        startTimeOnly: initialData?.startDate
          ? parseTimestampToTimeOnly(initialData.startDate)
          : "",
        endDateOnly: initialData?.endDate
          ? parseTimestampToDateOnly(initialData.endDate)
          : "",
        endTimeOnly: initialData?.endDate
          ? parseTimestampToTimeOnly(initialData.endDate)
          : "",
      } as AppointmentFormUI);
    }
  };

  // Initialize form when initialData changes
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        ...initialData,
        startDateOnly: initialData.startDate
          ? parseTimestampToDateOnly(initialData.startDate)
          : "",
        startTimeOnly: initialData.startDate
          ? parseTimestampToTimeOnly(initialData.startDate)
          : "",
        endDateOnly: initialData.endDate
          ? parseTimestampToDateOnly(initialData.endDate)
          : "",
        endTimeOnly: initialData.endDate
          ? parseTimestampToTimeOnly(initialData.endDate)
          : "",
      } as AppointmentFormUI);
    }
  }, [initialData, isOpen]);

  // Initialize responsible persons from resources
  useEffect(() => {
    const mappedPersons = mapResourcesToSelectableOptions(resources);

    // If we have initial participants, mark them as selected
    if (initialData?.participants && initialData.participants.length > 0) {
      // Create a set of selected memberIds for quick lookup
      const selectedMemberIds = new Set(
        initialData.participants.map(
          (p: any) => p.memberId || p.ParticipantId || p.id,
        ),
      );

      const updatedPersons = mappedPersons.map((person) => ({
        ...person,
        isSelected:
          selectedMemberIds.has(person.memberId) ||
          selectedMemberIds.has(person.id),
      }));
      setResponsiblePersons(updatedPersons);
    } else {
      setResponsiblePersons(mappedPersons);
    }
  }, [resources, initialData?.participants]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header - Changed title to "Edit Appointment" */}
        <div className="border-b border-gray-200 bg-blue-200 m-2 px-6 py-4 rounded-lg flex gap-2">
          <div className="rounded-full bg-white p-2 ">
            <Image
              src={editAppointmentImage}
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
          <div className=" border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <Image
                    src={SpecialEventIcon}
                    alt="SpecialEventIcon"
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
                  checked={formData.isSpecialEvent === 1}
                  onChange={(checked) =>
                    handleToggleChange("isSpecialEvent", checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Title and Location */}
          <div className="flex gap-4">
            <div>
              <div className="flex items-center gap-2 ">
                <Image src={nameIcon} alt="Name" width={15} height={15} />
                <label className="block text-lg font-medium ">Name</label>
              </div>
              <input
                type="text"
                name="title"
                placeholder="Appointment title"
                value={formData.title || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <div className="flex items-center gap-2 ">
                <Image
                  src={locationIcon}
                  alt="Location"
                  width={15}
                  height={15}
                />
                <label className="block text-lg font-medium">Location</label>
              </div>
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Private Toggle */}
          <div className="flex justify-end items-center ">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium">Private</label>
              <ToggleSwitch
                checked={formData.isPrivateEvent === 1 ? true : false}
                onChange={(checked) =>
                  handleToggleChange("isPrivateEvent", checked)
                }
              />
            </div>
          </div>

          {/* Participants */}
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

          {/* Dates and Times */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium">from</label>
                <input
                  placeholder="Select Start date"
                  type="date"
                  name="startDateOnly"
                  value={formData.startDateOnly || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium">to</label>
                <input
                  placeholder="Select End date"
                  type="date"
                  name="endDateOnly"
                  value={formData.endDateOnly || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium">Start Time</label>
                <input
                  type="time"
                  name="startTimeOnly"
                  value={formData.startTimeOnly || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium">End Time</label>
                <input
                  type="time"
                  name="endTimeOnly"
                  value={formData.endTimeOnly || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Repeat Sequence */}
          <MultipleSelector
            titleIconUrl={repeatIcon.src}
            options={REPEAT_OPTIONS.map((option) => ({
              ...option,
              isSelected: option.id === formData.repeat,
            }))}
            onSelectionChange={(selected) =>
              handleSingleSelectChange("repeat", selected)
            }
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
            options={ALERT_OPTIONS.map((option) => ({
              ...option,
              isSelected: option.id === formData.alert,
            }))}
            onSelectionChange={(selected) => {
              handleSingleSelectChange("alert", selected);
            }}
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
            <div className="flex items-center gap-2 ">
              <Image
                src={additionalNoteIcon}
                alt="Notes"
                width={15}
                height={15}
              />
              <label className="block text-lg font-medium">
                Additional Notes
              </label>
            </div>
            <textarea
              name="description"
              onChange={handleInputChange}
              placeholder="Any additional information..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description || ""}
            />
          </div>

          {/* Buttons - Changed submit button text */}
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
                Update Appointment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentPopup;
