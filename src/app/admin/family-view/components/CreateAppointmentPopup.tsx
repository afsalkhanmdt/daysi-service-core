"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import SpecialEventIcon from "@/app/admin/assets/event-badged-1-svgrepo-com (1) 1.png";
import createAppointmentImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import nameIcon from "@/app/admin/assets/name.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import alarmIcon from "@/app/admin/assets/alarmIcon.png";
import additionalNoteIcon from "@/app/admin/assets/name.png";

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
    onClose();
    setFormData(initialFormData);
  };

  const handleClose = () => {
    onClose();
    setFormData(initialFormData);
  };

  useEffect(() => {
    setResponsiblePersons(mapResourcesToSelectableOptions(resources));
  }, [resources]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 bg-blue-200 m-2 px-6 py-4 rounded-lg flex gap-2">
          <div className="rounded-full bg-white p-2">
            <Image
              src={createAppointmentImage}
              alt="createAppointmentImage"
              width={15}
              height={15}
            />
          </div>
          <h2 className="text-xl font-semibold">Create Appointment</h2>
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

          {/* Title + Location */}
          <div className="grid grid-cols-2 gap-4 bg-blue-100 p-2 rounded-md">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2">
                <Image src={nameIcon} alt="Name" width={15} height={15} />
                <label className="block text-lg font-medium">Name</label>
              </div>
              <input
                type="text"
                name="title"
                placeholder="Appointment title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Location using LocationInput component */}
            <div>
              <div className="flex items-center gap-2">
                <label className="block text-lg font-medium">Location</label>
              </div>
              <LocationInput
                value={formData?.location || ""}
                onChange={handleLocationChange}
                placeholder="Location"
                required
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
            onSelectionChange={(selected) =>
              handleSingleSelectChange("alert", selected)
            }
            title="Alarm"
            showSelectAll={true}
            showCount={true}
            showImages={false}
            selectedBorderColor="green"
            selectedBadgeColor="green"
            singleSelect={true}
          />

          {/* Additional Notes */}
          <div className="bg-blue-100 p-2 rounded-md">
            <div className="flex items-center gap-2">
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
              value={formData.description}
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
                Create Appointment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAppointmentPopup;
