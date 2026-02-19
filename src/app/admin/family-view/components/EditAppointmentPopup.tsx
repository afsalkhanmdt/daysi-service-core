import Image from "next/image";
import React, { useEffect, useState } from "react";
import editAppointmentImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
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
import LocationInput from "./FormComponents/LocationInput";
import DateTimeRange from "./FormComponents/DateTimeRange";

// Helper function to check if string contains coordinates
const isCoordinateString = (str: string): boolean => {
  const coordinatePattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
  return coordinatePattern.test(str.trim());
};

type EditAppointmentPopupProps = appointmentPopupPropsType & {
  onSubmit: (data: UserEventCreateRequest) => void;
  initialData?: EventInput;
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

  // Add loading state for location
  const [locationLoading, setLocationLoading] = useState(false);

  console.log("Initial data received:", initialData);

  const [formData, setFormData] = useState<AppointmentFormUI>(() => {
    // Log what we're initializing with
    console.log("Initializing form with location:", initialData?.location);

    return {
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
    } as AppointmentFormUI;
  });

  const handleLocationChange = (
    location: string,
    lat?: number,
    lng?: number,
  ) => {
    console.log(
      "Location changed to:",
      location,
      "with coordinates:",
      lat,
      lng,
    );
    setFormData((prev) => ({
      ...prev,
      location,
      ...(lat !== undefined && { lat }),
      ...(lng !== undefined && { lng }),
    }));
  };

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
    setResponsiblePersons(selectedPersons);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const initialParticipantIds = new Set(
      initialData?.participants?.map(
        (p: any) => p.memberId || p.ParticipantId || p.id,
      ) || [],
    );

    const formattedParticipants = responsiblePersons
      .filter((person) => person.isSelected)
      .map((person) => {
        const participantData: any = {
          localId: person.id,
          memberId: person.memberId,
        };

        if (
          initialParticipantIds.has(person.memberId) ||
          initialParticipantIds.has(person.id)
        ) {
          participantData.eventId = initialData?.id;
        }

        return participantData;
      });

    const { participants, ...formDataWithoutParticipants } = formData;

    const payload: UserEventCreateRequest = {
      ...formDataWithoutParticipants,
      startDate: buildTimestamp(formData.startDateOnly, formData.startTimeOnly),
      endDate: buildTimestamp(formData.endDateOnly, formData.endTimeOnly),
      participants: formattedParticipants,
    };

    delete (payload as any).startDateOnly;
    delete (payload as any).startTimeOnly;
    delete (payload as any).endDateOnly;
    delete (payload as any).endTimeOnly;

    console.log("Submitting payload:", payload);
    onSubmit(payload);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  // Initialize form when initialData changes
  useEffect(() => {
    if (initialData && isOpen) {
      console.log("Setting form data with location:", initialData.location);

      // Check if the location is coordinates
      if (initialData.location && isCoordinateString(initialData.location)) {
        console.log(
          "Location appears to be coordinates, will be reverse geocoded",
        );
      }

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

    if (initialData?.participants && initialData.participants.length > 0) {
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
        {/* Header */}
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
          <div className=" border-gray-200 grid grid-cols-2 gap-4 bg-blue-100 p-2 rounded-md">
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
                <label className="block text-sm font-medium">Private</label>
              </div>

              <div className="flex items-center gap-2">
                <ToggleSwitch
                  checked={formData.isPrivateEvent === 1 ? true : false}
                  onChange={(checked) =>
                    handleToggleChange("isPrivateEvent", checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Title and Location */}
          <div className="grid grid-cols-2 gap-4 p-2 bg-blue-100 rounded-md">
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
              <LocationInput
                key={formData.location} // Add key to force re-render when location changes
                value={formData?.location || ""}
                onChange={handleLocationChange}
                placeholder="Location"
                required
              />
              {/* Add small helper text to show what's happening */}
              {isCoordinateString(formData?.location || "") && (
                <p className="text-xs text-gray-500 mt-1">
                  Fetching place name from coordinates...
                </p>
              )}
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

          {/* Dates and Times using DateTimeRange component */}
          <DateTimeRange
            startDate={formData.startDateOnly}
            endDate={formData.endDateOnly}
            startTime={formData.startTimeOnly}
            endTime={formData.endTimeOnly}
            onStartDateChange={(value) =>
              setFormData((prev) => ({ ...prev, startDateOnly: value }))
            }
            onEndDateChange={(value) =>
              setFormData((prev) => ({ ...prev, endDateOnly: value }))
            }
            onStartTimeChange={(value) =>
              setFormData((prev) => ({ ...prev, startTimeOnly: value }))
            }
            onEndTimeChange={(value) =>
              setFormData((prev) => ({ ...prev, endTimeOnly: value }))
            }
            required
          />

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
          <div className=" bg-blue-100 p-2 rounded-md">
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

          {/* Buttons */}
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
