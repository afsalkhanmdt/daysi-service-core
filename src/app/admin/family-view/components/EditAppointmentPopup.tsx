import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import editAppointmentImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import SpecialEventIcon from "@/app/admin/assets/event-badged-1-svgrepo-com (1) 1.png";
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import locationIcon from "@/app/admin/assets/location.png";
import nameIcon from "@/app/admin/assets/name.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import alarmIcon from "@/app/admin/assets/alarmIcon.png";
import additionalNoteIcon from "@/app/admin/assets/name.png";
import closeIcon from "@/app/admin/assets/close-428.png";
import MultipleSelector, {
  SelectableOption,
} from "./FormComponents/MultipleSelector";
import SingleSelector from "./FormComponents/SingleSelector";
import ResponsiblePersonSelector from "./FormComponents/ResponsiblePersonSelector";
import { useResources } from "@/app/context/ResourceContext";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import {
  AppointmentUpdateFormUI,
  appointmentPopupPropsType,
  SpecialEventEnum,
  UserEventCreateRequest,
  UserEventUpdateRequest,
} from "@/app/types/appoinment";
import {
  ALERT_OPTIONS,
  buildLocalTimestamp,
  buildTimestamp,
  parseDateToForm,
  parseTimestampToDateOnly,
  parseTimestampToTimeOnly,
  REPEAT_OPTIONS,
} from "@/app/constants/appointmentForm";
import { EventInput } from "@fullcalendar/core";
import LocationInput from "./FormComponents/LocationInput";
import DateTimeRange from "./FormComponents/DateTimeRange";
import { deserializeDescription, serializeDescription } from "@/app/utils/specialEventMetadata";

// Helper function to check if string contains coordinates
const isCoordinateString = (str: string): boolean => {
  const coordinatePattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
  return coordinatePattern.test(str.trim());
};

type EditAppointmentPopupProps = appointmentPopupPropsType & {
  onSubmit: (data: UserEventUpdateRequest) => void;
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
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const normalizeInitialData = (data: any): AppointmentUpdateFormUI => {
    const rawDescription = 
      data?.description ?? 
      data?.extendedProps?.description ?? 
      data?.Description ?? 
      data?.extendedProps?.Description ?? 
      "";
    const { description, metadata } = deserializeDescription(rawDescription);

    return {
      ...data,
      description,
      // Normalize Enums and Booleans
      repeat: data?.repeat ?? data?.Repeat ?? data?.extendedProps?.Repeat ?? data?.extendedProps?.repeat ?? 0,
      alert: data?.alert ?? data?.Alert ?? data?.extendedProps?.Alert ?? data?.extendedProps?.alert ?? 0,
      isForAll: data?.isForAll ?? data?.IsForAll ?? data?.extendedProps?.IsForAll ?? 0,
      isAllDayEvent: data?.isAllDayEvent ?? data?.IsAllDayEvent ?? data?.extendedProps?.IsAllDayEvent ?? 0,
      isSpecialEvent: data?.isSpecialEvent ?? data?.IsSpecialEvent ?? data?.extendedProps?.IsSpecialEvent ?? 0,
      isPrivateEvent: data?.isPrivateEvent ?? data?.IsPrivateEvent ?? data?.extendedProps?.IsPrivateEvent ?? 0,
      specialEvent: data?.specialEvent ?? data?.SpecialEvent ?? data?.extendedProps?.SpecialEvent ?? undefined,
      
      // Normalize Metadata and End Dates
      repeatEndDate: data?.repeatEndDate ?? data?.RepeatEndDate ?? data?.extendedProps?.RepeatEndDate ?? data?.extendedProps?.repeatEndDate ?? null,
      specialEventWhatWhom: metadata.whatWhom || "",
      specialEventDate: metadata.date || "",
      startDateOnly: data?.startDate
        ? parseTimestampToDateOnly(data.startDate as string)
        : "",
      startTimeOnly: data?.startDate
        ? parseTimestampToTimeOnly(data.startDate as string)
        : "",
      endDateOnly: data?.endDate
        ? parseTimestampToDateOnly(data.endDate as string)
        : "",
      endTimeOnly: data?.endDate
        ? parseTimestampToTimeOnly(data.endDate as string)
        : "",
    } as AppointmentUpdateFormUI;
  };

  const [formData, setFormData] = useState<AppointmentUpdateFormUI>(() => {
    return normalizeInitialData(initialData);
  });
  const handleLocationChange = (
    location: string,
    lat?: number,
    lng?: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      location,
      latitude: lat !== undefined ? String(lat) : prev.latitude,
      longitude: lng !== undefined ? String(lng) : prev.longitude,
    }));
  };

  // Generic handler for text inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear title error on input change
    if (name === "title") setTitleError(null);
  };

  // Generic handler for toggle switches
  const handleToggleChange = (
    field: keyof AppointmentUpdateFormUI,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? 1 : 0,
      // Default to Birthday if Special Event is turned on
      specialEvent:
        field === "isSpecialEvent" && checked
          ? prev.specialEvent ?? SpecialEventEnum.Birthday
          : prev.specialEvent,
    }));
  };

  const handleSpecialEventChange = (value: SpecialEventEnum) => {
    setFormData((prev) => ({
      ...prev,
      specialEvent: value,
    }));
  };

  // Generic handler for single-select SingleSelector components
  const handleSingleSelectChange = (
    field: keyof AppointmentUpdateFormUI,
    selectedOptions: SelectableOption[],
  ) => {
    const selectedOption = selectedOptions.find((option) => option.isSelected);
    const newValue = selectedOption ? selectedOption.id : 0;
    
    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
      // Force repeatEndDate to null if repeat is set to Never
      repeatEndDate: field === 'repeat' && newValue === 0 ? null : prev.repeatEndDate
    }));
  };

  // Handler for responsible persons (multi-select)
  const handleResponsiblePersonsChange = (
    selectedPersons: SelectableOption[],
  ) => {
    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: selectedPersons.some((sp) => sp.id === person.id),
      })),
    );

    // When calculating isForAll, we need to account for the family member who is hidden but always selected
    setFormData((prev) => ({
      ...prev,
      isForAll: (selectedPersons.length + 1) === resources.length ? 1 : 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const firstResource = resources[0];

    const formattedParticipants = responsiblePersons
      .filter((person) => person.isSelected)
      .map((person) => {
        const existingParticipant = (initialData?.participants as any[])?.find(
          (p) =>
            String(p.ParticipantId || p.memberId || p.id) ===
            String(person.memberId || person.id),
        );

        const participantData: any = {
          ParticipantId: person.memberId,
          MemberId: person.memberId,
          localId: person.id,
          memberId: person.memberId,
          Participant: person.label,
          ParticipantFirstName: person.label,
          ParticipantClass: "",
          EventId: initialData?.id ? Number(initialData.id) : 0,
        };

        if (existingParticipant) {
          participantData.EventId =
            existingParticipant.EventId ||
            existingParticipant.eventId ||
            participantData.EventId;
          participantData.ParentEventId =
            existingParticipant.ParentEventId ||
            existingParticipant.parentEventId ||
            initialData?.parentEventId;
        } else {
          participantData.ParentEventId = initialData?.parentEventId || "";
        }

        // Add both casings for safety
        participantData.eventId = participantData.EventId;
        participantData.parentEventId = participantData.ParentEventId;

        return participantData;
      });

    // Always include the first member (Family)
    if (firstResource) {
      const familyMemberId = firstResource.extendedProps?.memberId || "";
      const existingFamilyParticipant = (initialData?.participants as any[])?.find(
        (p) =>
          String(p.ParticipantId || p.memberId || p.id) === String(familyMemberId),
      );

      const familyParticipant: any = {
        ParticipantId: familyMemberId,
        MemberId: familyMemberId,
        localId: firstResource.id,
        memberId: familyMemberId,
        Participant: firstResource.title,
        ParticipantFirstName: firstResource.title,
        ParticipantClass: "",
        EventId: initialData?.id ? Number(initialData.id) : 0,
      };

      if (existingFamilyParticipant) {
        familyParticipant.EventId = existingFamilyParticipant.EventId || existingFamilyParticipant.eventId || familyParticipant.EventId;
        familyParticipant.ParentEventId = existingFamilyParticipant.ParentEventId || existingFamilyParticipant.parentEventId || initialData?.parentEventId;
      } else {
        familyParticipant.ParentEventId = initialData?.parentEventId || "";
      }

      familyParticipant.eventId = familyParticipant.EventId;
      familyParticipant.parentEventId = familyParticipant.ParentEventId;

      formattedParticipants.unshift(familyParticipant);
    }

    let repeatEndDate: string | null = null;
    if (formData.repeat !== 0 && formData.repeatEndDate !== null && formData.repeatEndDate !== undefined && String(formData.repeatEndDate).trim() !== "") {
      // Handle numeric timestamps as strings or numbers
      const timestamp = typeof formData.repeatEndDate === 'string' && !isNaN(Number(formData.repeatEndDate)) 
        ? Number(formData.repeatEndDate) 
        : formData.repeatEndDate;
      
      const date = new Date(timestamp as any);
      if (!isNaN(date.getTime())) {
        repeatEndDate = date.toISOString();
      }
    }

    // Serialize metadata into description
    const finalDescription = serializeDescription(formData.description || "", {
      whatWhom: formData.specialEventWhatWhom,
      date: formData.specialEventDate,
    });

    const payload: UserEventUpdateRequest = {
      id: String(initialData?.id || ""),
      title: formData.title,
      description: finalDescription,
      location: formData.location,
      startDate: buildTimestamp(formData.startDateOnly, formData.startTimeOnly),
      endDate: buildTimestamp(formData.endDateOnly, formData.endTimeOnly),
      localStartDate: buildLocalTimestamp(
        formData.startDateOnly,
        formData.startTimeOnly,
      ),
      localEndDate: buildLocalTimestamp(
        formData.endDateOnly,
        formData.endTimeOnly,
      ),
      repeat: formData.repeat,
      repeatEndDate,
      alert: formData.alert,
      isForAll: formData.isForAll,
      isAllDayEvent: formData.isAllDayEvent,
      isSpecialEvent: formData.isSpecialEvent,
      isPrivateEvent: formData.isPrivateEvent,
      specialEvent: formData.specialEvent,
      participants: formattedParticipants,
      addedBy: formData.addedBy || "",
      familyId: formData.familyId,
      familyUserId: formData.familyUserId,
      recurrenceRule: formData.recurrenceRule,
      alarms: formData.alarms,
      latitude: formData.latitude,
      longitude: formData.longitude,
      eventGuID: formData.eventGuID,
      externalCalendarId: formData.externalCalendarId,
      noPush: formData.noPush,
    };

    onSubmit(payload);
    onClose();
  };

  const handleClose = () => {
    onClose();
    setSelectionError(null); // Clear error on close
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

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
  }, [isOpen, handleClose]);

  // Initialize form when initialData changes
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(normalizeInitialData(initialData));
    }
  }, [initialData, isOpen]);

  // Initialize responsible persons from resources
  useEffect(() => {
    if (resources.length === 0 || !isOpen) return;

    const mappedPersons = mapResourcesToSelectableOptions(resources);
    // Filter out the family member (index 0) from UI
    const otherMembers = mappedPersons.slice(1);

    if (initialData?.participants && initialData.participants.length > 0) {
      const selectedMemberIds = new Set(
        initialData.participants.map(
          (p: any) => String(p.ParticipantId || p.memberId || p.id),
        ),
      );

      const updatedPersons = otherMembers.map((person) => ({
        ...person,
        isSelected:
          selectedMemberIds.has(String(person.memberId)) ||
          selectedMemberIds.has(String(person.id)),
      }));
      setResponsiblePersons(updatedPersons);

      // Recalculate isForAll initially based on selected persons + family member
      const selectedCount = updatedPersons.filter(p => p.isSelected).length + 1;
      setFormData(prev => ({
        ...prev,
        isForAll: selectedCount === resources.length ? 1 : 0
      }));
    } else {
      setResponsiblePersons(otherMembers);
      // If no participants provided, default isForAll to 1 if only family member exists
      setFormData(prev => ({
        ...prev,
        isForAll: resources.length === 1 ? 1 : 0
      }));
    }
  }, [resources, initialData?.participants, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-7xl max-h-[98vh] flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <Image
                src={editAppointmentImage}
                alt="icon"
                width={16}
                height={16}
              />
            </div>
            <h2 className="text-lg font-bold text-gray-800">
              Edit Appointment
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Image src={closeIcon} alt="Close" width={20} height={20} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto flex-1 p-3 lg:p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Basic Information & Toggles Combined */}
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold flex items-center gap-1.5 text-gray-700 uppercase tracking-wider">
                    <Image src={nameIcon} alt="icon" width={12} height={12} />{" "}
                    Name
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter appointment title"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${titleError ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {titleError && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {titleError}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold flex items-center gap-1.5 text-gray-700 uppercase tracking-wider">
                    Location
                  </label>
                  <LocationInput
                    key={formData.location}
                    value={formData?.location || ""}
                    onChange={handleLocationChange}
                    placeholder="Search location..."
                    required
                  />
                  {isCoordinateString(formData?.location || "") && (
                    <p className="text-[10px] text-gray-500 mt-0.5 italic">
                      Fetching place name...
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Image
                      src={SpecialEventIcon}
                      alt="icon"
                      width={12}
                      height={12}
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      Special Event
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={formData.isSpecialEvent === 1}
                    onChange={(checked) =>
                      handleToggleChange("isSpecialEvent", checked)
                    }
                  />
                </div>
              </div>

              {/* Special Event Options */}
              {formData.isSpecialEvent === 1 && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="specialEvent"
                        checked={formData.specialEvent === SpecialEventEnum.Birthday}
                        onChange={() => handleSpecialEventChange(SpecialEventEnum.Birthday)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 transition-all cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Birthday</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="specialEvent"
                        checked={formData.specialEvent === SpecialEventEnum.Anniversary}
                        onChange={() => handleSpecialEventChange(SpecialEventEnum.Anniversary)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 transition-all cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Anniversary</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">What / Whom</label>
                      <input
                        type="text"
                        name="specialEventWhatWhom"
                        value={formData.specialEventWhatWhom}
                        onChange={handleInputChange}
                        placeholder="e.g., John's Birthday"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">Date</label>
                      <input
                        type="date"
                        name="specialEventDate"
                        value={formData.specialEventDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Image
                      src={SpecialEventIcon}
                      alt="icon"
                      width={12}
                      height={12}
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      Private
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={formData.isPrivateEvent === 1}
                    onChange={(checked) =>
                      handleToggleChange("isPrivateEvent", checked)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image
                  src={participantsIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Choose Participants
              </label>
              <ResponsiblePersonSelector
                options={responsiblePersons}
                onSelectionChange={handleResponsiblePersonsChange}
                subHeading="Select Responsible Persons"
              />
              {selectionError && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {selectionError}
                </p>
              )}
            </div>

            {/* Date & Time */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                <Image
                  src={participantsIcon}
                  alt="icon"
                  width={14}
                  height={14}
                />{" "}
                Choose Dates & Time
              </label>
              <DateTimeRange
                startDate={formData.startDateOnly}
                endDate={formData.endDateOnly}
                startTime={formData.startTimeOnly}
                endTime={formData.endTimeOnly}
                onStartDateChange={(v) =>
                  setFormData((p) => ({ ...p, startDateOnly: v }))
                }
                onEndDateChange={(v) =>
                  setFormData((p) => ({ ...p, endDateOnly: v }))
                }
                onStartTimeChange={(v) =>
                  setFormData((p) => ({ ...p, startTimeOnly: v }))
                }
                onEndTimeChange={(v) =>
                  setFormData((p) => ({ ...p, endTimeOnly: v }))
                }
                hideHeading={true}
                required
              />
            </div>

            {/* Repeat & Alarm Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                  <Image src={repeatIcon} alt="icon" width={14} height={14} />{" "}
                  Repeat
                </label>
                <SingleSelector
                  options={REPEAT_OPTIONS.map((o) => ({
                    ...o,
                    isSelected: o.id === formData.repeat,
                  }))}
                  onSelectionChange={(s) =>
                    handleSingleSelectChange("repeat", [s])
                  }
                  selectedBorderColor="blue"
                  selectedBadgeColor="blue"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                  <Image src={alarmIcon} alt="icon" width={14} height={14} />{" "}
                  Alarm
                </label>
                <SingleSelector
                  options={ALERT_OPTIONS.map((o) => ({
                    ...o,
                    isSelected: o.id === formData.alert,
                  }))}
                  onSelectionChange={(s) =>
                    handleSingleSelectChange("alert", [s])
                  }
                  selectedBorderColor="blue"
                  selectedBadgeColor="blue"
                />
              </div>
            </div>

            {/* Repeat End Date - Only show if repeat is not Never */}
            {formData.repeat !== 0 && (
              <div className="space-y-1">
                <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                  Repeat End Date
                </label>
                <div className="bg-blue-100/50 p-2 rounded-lg">
                  <input
                    type="date"
                    name="repeatEndDate"
                    value={parseDateToForm(formData.repeatEndDate)}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            )}

            {/* Notes - Moved to its own row */}
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
              <textarea
                name="description"
                onChange={handleInputChange}
                placeholder="Add any additional details here..."
                rows={1}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[40px]"
                value={formData.description || ""}
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
          >
            Cancel
          </button>
          <button
            onClick={(e) => handleSubmit(e as any)}
            className="px-5 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95"
          >
            Update Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentPopup;
