"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import SpecialEventIcon from "@/app/admin/assets/event-badged-1-svgrepo-com (1) 1.png";
import createAppointmentImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import nameIcon from "@/app/admin/assets/name.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import alarmIcon from "@/app/admin/assets/alarmIcon.png";
import additionalNoteIcon from "@/app/admin/assets/name.png";
import closeIcon from "@/app/admin/assets/close-428.png";

import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import MultipleSelector, {
  SelectableOption,
} from "./FormComponents/MultipleSelector";
import SingleSelector from "./FormComponents/SingleSelector";
import ResponsiblePersonSelector from "./FormComponents/ResponsiblePersonSelector";
import LocationInput from "./FormComponents/LocationInput";
import DateTimeRange from "./FormComponents/DateTimeRange";
import { useAppointmentValidation } from "@/app/hooks/useAppointmentValidation";
import { useResources } from "@/app/context/ResourceContext";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import {
  AppointmentCreateFormUI,
  appointmentPopupPropsType,
  SpecialEventEnum,
  UserEventCreateRequest,
} from "@/app/types/appoinment";
import {
  ALERT_OPTIONS,
  buildLocalTimestamp,
  buildTimestamp,
  initialFormDataForAppointmentApi,
  parseDateToForm,
  REPEAT_OPTIONS,
} from "@/app/constants/appointmentForm";

const initialFormData: AppointmentCreateFormUI = {
  ...initialFormDataForAppointmentApi,
  startDateOnly: "",
  startTimeOnly: "",
  endDateOnly: "",
  endTimeOnly: "",
  location: "",
};

const CreateAppointmentPopup: React.FC<
  appointmentPopupPropsType & {
    onSubmit: (data: UserEventCreateRequest) => void;
  }
> = ({ isOpen, onClose, onSubmit, currentDate }) => {
  const { resources } = useResources();
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] =
    useState<AppointmentCreateFormUI>(initialFormData);

  /* ==============================
     Generic Handlers
  ============================== */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleToggleChange = (
    field: keyof AppointmentCreateFormUI,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? 1 : 0,
      // Default to Birthday if Special Event is turned on
      specialEvent:
        field === "isSpecialEvent" && checked
          ? (prev.specialEvent ?? SpecialEventEnum.Birthday)
          : prev.specialEvent,
    }));

    // If turning ON special event, set default values
    if (field === "isSpecialEvent" && checked) {
      // Select all participants
      const allOptions = mapResourcesToSelectableOptions(resources);
      const allParticipants = allOptions.map((option) => ({
        ParticipantId: option.memberId || "",
        MemberId: option.memberId || "",
        localId: option.id,
        memberId: option.memberId || "",
        EventId: 0,
        ParentEventId: "",
      }));

      setResponsiblePersons(
        allOptions.slice(1).map((option) => ({
          ...option,
          isSelected: true,
        })),
      );

      setFormData((prev) => ({
        ...prev,
        participants: allParticipants,
        isForAll: 1,
        // Set repeat to Every Year (assuming 3 is the ID for "Every Year")
        repeat: 5,
        // Set alarm to 1 day before (assuming appropriate ID)
        alert: 8,
      }));
    }

    // If turning OFF special event, reset to default values
    if (field === "isSpecialEvent" && !checked) {
      const allOptions = mapResourcesToSelectableOptions(resources);
      const familyMember = allOptions[0];
      const otherMembers = allOptions.slice(1);

      setResponsiblePersons(
        otherMembers.map((option) => ({
          ...option,
          isSelected: false,
        })),
      );

      setFormData((prev) => ({
        ...prev,
        participants: familyMember
          ? [
              {
                ParticipantId: familyMember.memberId || "",
                MemberId: familyMember.memberId || "",
                localId: familyMember.id,
                memberId: familyMember.memberId || "",
                EventId: 0,
                ParentEventId: "",
              },
            ]
          : [],
        isForAll: resources.length === 1 ? 1 : 0,
        // Reset repeat to default (Never)
        repeat: 0,
        // Reset alert to default
        alert: 0,
        title: "",
        location: "",
        startDateOnly: "",
        endDateOnly: "",
        startTimeOnly: "",
        endTimeOnly: "",
      }));
    }
  };

  const handleSpecialEventChange = (value: SpecialEventEnum) => {
    setFormData((prev) => ({
      ...prev,
      specialEvent: value,
    }));
  };

  const handleSingleSelectChange = (
    field: keyof AppointmentCreateFormUI,
    selectedOptions: SelectableOption[],
  ) => {
    const selectedOption = selectedOptions.find((option) => option.isSelected);
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption ? selectedOption.id : 0,
    }));
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

    // Clear error when user interacts with selection
    setSelectionError(null);

    const firstResource = resources[0];
    const participants = selectedPersons.map((person) => ({
      ParticipantId: person.memberId,
      MemberId: person.memberId,
      localId: person.id,
      memberId: person.memberId,
      EventId: 0,
      ParentEventId: "",
    }));

    // Always include the first member (Family)
    if (firstResource) {
      const familyParticipant = {
        ParticipantId: firstResource.extendedProps?.memberId || "",
        MemberId: firstResource.extendedProps?.memberId || "",
        localId: firstResource.id,
        memberId: firstResource.extendedProps?.memberId || "",
        EventId: 0,
        ParentEventId: "",
      };
      participants.unshift(familyParticipant);
    }

    setFormData((prev) => ({
      ...prev,
      participants,
      isForAll: participants.length === resources.length ? 1 : 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    // Check if at least one person is selected
    if (!responsiblePersons.some((p) => p.isSelected)) {
      setSelectionError("Please select at least one responsible person.");
      hasError = true;
    }

    // Check if title is empty
    if (!formData.title || formData.title.trim() === "") {
      setTitleError("Please enter an appointment name.");
      hasError = true;
    }

    if (hasError) return;

    let repeatEndDate: string | null = null;
    if (formData.repeatEndDate) {
      const date = new Date(formData.repeatEndDate);
      if (!isNaN(date.getTime())) {
        // Force the repeat end date to be the end of the selected day
        date.setHours(23, 59, 59, 999);
        repeatEndDate = date.toISOString();
      }
    }

    const payload: UserEventCreateRequest = {
      title: formData.title,
      description: formData.description,
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
      participants: formData.participants,
      addedBy: formData.addedBy || "",
      familyId: formData.familyId,
      familyUserId: formData.familyUserId,
      recurrenceRule: formData.recurrenceRule,
      alarms: formData.alarms,
      latitude: formData.latitude,
      longitude: formData.longitude,
      eventGuID: formData.eventGuID || crypto.randomUUID(),
      externalCalendarId: formData.externalCalendarId || 0,
      noPush: formData.noPush || false,
      locale: formData.locale,
      timeZone: formData.timeZone,
      offSet: formData.offSet,
    };

    onSubmit(payload);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setFormData(initialFormData);
    setSelectionError(null); // Clear error on close
    // Reset selection state when closing
    if (resources.length > 0) {
      const otherMembers = mapResourcesToSelectableOptions(resources).slice(1);
      setResponsiblePersons(otherMembers);
    }
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

  useEffect(() => {
    if (resources.length > 0) {
      const allOptions = mapResourcesToSelectableOptions(resources);
      const familyMember = allOptions[0];
      const otherMembers = allOptions.slice(1);

      setResponsiblePersons(otherMembers);

      // Initialize formData with the family member already selected
      if (familyMember) {
        setFormData((prev) => ({
          ...prev,
          participants: [
            {
              ParticipantId: familyMember.memberId || "",
              MemberId: familyMember.memberId || "",
              localId: familyMember.id,
              memberId: familyMember.memberId || "",
              EventId: 0,
              ParentEventId: "",
            },
          ],
          isForAll: resources.length === 1 ? 1 : 0,
        }));
      }
    }
  }, [resources, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[98vh] flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <Image
                src={createAppointmentImage}
                alt="icon"
                width={16}
                height={16}
              />
            </div>
            <h2 className="text-lg font-bold text-gray-800">
              Create Appointment
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
                {formData.isSpecialEvent === 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-gray-700 uppercase tracking-wider">
                      <Image src={nameIcon} alt="icon" width={12} height={12} />{" "}
                      Name
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter appointment title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${titleError ? "border-red-500" : "border-gray-200"}`}
                    />
                    {titleError && (
                      <p className="text-xs text-red-500 font-medium mt-1">
                        {titleError}
                      </p>
                    )}
                  </div>
                )}
                {/* Conditionally render Location - hide for Special Events */}
                {formData.isSpecialEvent === 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-gray-700 uppercase tracking-wider">
                      Location
                    </label>
                    <LocationInput
                      value={formData?.location || ""}
                      onChange={handleLocationChange}
                      placeholder="Search location..."
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Image
                      src={SpecialEventIcon}
                      alt="icon"
                      width={12}
                      height={12}
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      All Day
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={formData.isAllDayEvent === 1}
                    onChange={(checked) =>
                      handleToggleChange("isAllDayEvent", checked)
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
                        checked={
                          formData.specialEvent === SpecialEventEnum.Birthday
                        }
                        onChange={() =>
                          handleSpecialEventChange(SpecialEventEnum.Birthday)
                        }
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 transition-all cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        Birthday
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="specialEvent"
                        checked={
                          formData.specialEvent === SpecialEventEnum.Anniversary
                        }
                        onChange={() =>
                          handleSpecialEventChange(SpecialEventEnum.Anniversary)
                        }
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 transition-all cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        Anniversary
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                        What / Whom
                      </label>
                      <input
                        type="text"
                        name="specialEventTitle"
                        value={formData.title}
                        onChange={(e) => {
                          // Update title directly
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }));
                        }}
                        placeholder="e.g., John's Birthday"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                        Date
                      </label>
                      <input
                        type="date"
                        name="specialEventDate"
                        value={formData.startDateOnly}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            startDateOnly: e.target.value,
                            endDateOnly: e.target.value,
                          }));
                        }}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50/30"
                      />
                    </div>
                  </div>
                </div>
              )}
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

            {/* Repeat & datetime */}
            <div
              className={`grid ${formData.isSpecialEvent === 0 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-3`}
            >
              {/* Date & Time - Hide for Special Events since it's handled in the special event section */}
              {formData.isSpecialEvent === 0 && (
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
                    autoSyncEndDateTime={true}
                    defaultDate={currentDate} // Pass the date from parent
                    disableTime={formData.isAllDayEvent === 1}
                  />
                  {/* Repeat End Date - Only show if repeat is not Never */}
                  {formData.repeat !== 0 && (
                    <div className="space-y-1 grid grid-cols-1 ">
                      <div>
                        <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                          Repeat End Date
                        </label>
                        <div className="bg-blue-100/50 p-2 rounded-lg">
                          <div className="grid grid-cols-1">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">
                                Ends On
                              </label>
                              <input
                                type="date"
                                name="repeatEndDate"
                                value={parseDateToForm(formData.repeatEndDate)}
                                onChange={handleInputChange}
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                  <Image src={repeatIcon} alt="icon" width={14} height={14} />{" "}
                  Repeat
                </label>
                <div className="flex flex-col gap-2">
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
                  {formData.repeat !== 0 && (
                    <div className="flex items-center gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                      <span className="text-xs font-bold text-gray-700">
                        Interval:
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={formData.recurrenceRule?.interval || 1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setFormData((prev) => ({
                            ...prev,
                            recurrenceRule: {
                              frequency: prev.recurrenceRule?.frequency || 0,
                              interval: val,
                            },
                          }));
                        }}
                        className="w-16 px-2 py-1 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-xs text-gray-500">
                        {formData.repeat === 1
                          ? "day(s)"
                          : formData.repeat === 2
                            ? "week(s)"
                            : formData.repeat === 3
                              ? "2 week(s)"
                              : formData.repeat === 4
                                ? "month(s)"
                                : "year(s)"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
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
                value={formData.description}
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
            Create Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointmentPopup;
