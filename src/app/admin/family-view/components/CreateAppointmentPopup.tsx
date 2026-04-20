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
import LocationInput from "./FormComponents/LocationInput";
import DateTimeRange from "./FormComponents/DateTimeRange";
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
  initialFormDataForAppointmentApi,
  REPEAT_OPTIONS,
} from "@/app/constants/appointmentForm";

const initialFormData: AppointmentFormUI = {
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
> = ({ isOpen, onClose, onSubmit }) => {
  const { resources } = useResources();
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);

  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<AppointmentFormUI>(initialFormData);

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
      ...(lat !== undefined && { lat }),
      ...(lng !== undefined && { lng }),
    }));
  };

  const handleToggleChange = (
    field: keyof AppointmentFormUI,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? 1 : 0,
    }));
  };

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

  const handleResponsiblePersonsChange = (
    selectedPersons: SelectableOption[],
  ) => {
    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: selectedPersons.some((sp) => sp.id === person.id),
      })),
    );

    setFormData((prev) => ({
      ...prev,
      participants: selectedPersons.map((person) => ({
        localId: person.id,
        memberId: person.memberId,
      })),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: UserEventCreateRequest = {
      ...formData,
      startDate: buildTimestamp(formData.startDateOnly, formData.startTimeOnly),
      endDate: buildTimestamp(formData.endDateOnly, formData.endTimeOnly),
    };

    delete (payload as any).startDateOnly;
    delete (payload as any).startTimeOnly;
    delete (payload as any).endDateOnly;
    delete (payload as any).endTimeOnly;

    onSubmit(payload);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setFormData(initialFormData);
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
    setResponsiblePersons(mapResourcesToSelectableOptions(resources));
  }, [resources]);

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
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    required
                  />
                </div>
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
              <MultipleSelector
                options={responsiblePersons}
                onSelectionChange={handleResponsiblePersonsChange}
                subHeading="Select Responsible Persons"
                showSelectAll={true}
                showCount={true}
                showImages={true}
                selectedBorderColor="blue"
                selectedBadgeColor="blue"
                singleSelect={false}
              />
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
                <MultipleSelector
                  options={REPEAT_OPTIONS.map((o) => ({
                    ...o,
                    isSelected: o.id === formData.repeat,
                  }))}
                  onSelectionChange={(s) =>
                    handleSingleSelectChange("repeat", s)
                  }
                  showSelectAll={false}
                  showCount={false}
                  singleSelect={true}
                  selectedBorderColor="blue"
                  selectedBadgeColor="blue"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold flex items-center gap-1.5 text-gray-800 uppercase tracking-wider">
                  <Image src={alarmIcon} alt="icon" width={14} height={14} />{" "}
                  Alarm
                </label>
                <MultipleSelector
                  options={ALERT_OPTIONS.map((o) => ({
                    ...o,
                    isSelected: o.id === formData.alert,
                  }))}
                  onSelectionChange={(s) =>
                    handleSingleSelectChange("alert", s)
                  }
                  showSelectAll={false}
                  showCount={false}
                  singleSelect={true}
                  selectedBorderColor="blue"
                  selectedBadgeColor="blue"
                />
              </div>
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
