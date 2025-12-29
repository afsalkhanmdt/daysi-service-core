import { todoPopupPropsType } from "@/app/types/todo";
import Image from "next/image";
import React, { useEffect, useState } from "react";
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
import { useResources } from "@/app/context/ResourceContext";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import {
  appointmentPopupPropsType,
  UserEventCreateRequest,
} from "@/app/types/appoinment";
import {
  ALERT_OPTIONS,
  buildTimestamp,
  REPEAT_OPTIONS,
} from "@/app/constants/appointmentForm";

type AppointmentFormUI = UserEventCreateRequest & {
  startDateOnly: string;
  startTimeOnly: string;
  endDateOnly: string;
  endTimeOnly: string;
};

const initialFormDataForApi: UserEventCreateRequest = {
  participants: [],
  familyId: 0,
  title: "",
  addedBy: "",
  familyUserId: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  specialEvent: 0,
  repeat: 0,
  repeatEndDate: "",
  alert: 0,
  alarms: [],
  isForAll: 0,
  isAllDayEvent: 0,
  isSpecialEvent: 0,
  isPrivateEvent: 0,
  eventPerson: "",
  eventsUpdatedOn: "",
  localStartDate: "",
  localEndDate: "",
  timeZone: "",
  offSet: "",
  locale: "",
  parentEventId: "",
  eventGuID: "",
  externalCalendarId: 0,
  latitude: "",
  longitude: "",
  recurrenceRule: {
    frequency: 0,
    interval: 1,
  },
  noPush: false,
};

const initialFormData: AppointmentFormUI = {
  ...initialFormDataForApi, // your existing ExtendedProps object
  startDateOnly: "",
  startTimeOnly: "",
  endDateOnly: "",
  endTimeOnly: "",
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

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleSpecialEventToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isSpecialEvent: checked ? 1 : 0 }));
  };

  const handlePrivateToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isPrivate: checked,
    }));
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

    // Update formData with selected person labels
    setFormData((prev) => ({
      ...prev,
      participants: selectedPersons.map((person) => ({
        localId: person.id,
        memberId: person.memberId, // Replace 'id' with the correct property if needed
      })),
    }));
  };

  const handleAlertChange = (selectedOptions: SelectableOption[]) => {
    const selectedAlert = selectedOptions.find((option) => option.isSelected);
    setFormData((prev) => ({
      ...prev,
      alert: selectedAlert ? selectedAlert.id : 0,
    }));
  };

  const handleRepeatChange = (selectedRepeats: SelectableOption[]) => {
    const selectedRepeatSequence = selectedRepeats.find(
      (option) => option.isSelected
    );
    setFormData((prev) => ({
      ...prev,
      repeat: selectedRepeatSequence ? selectedRepeatSequence.id : 0,
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
    // Reset form on close
    setFormData(initialFormData);
  };

  useEffect(() => {
    setResponsiblePersons(mapResourcesToSelectableOptions(resources));
    console.log(responsiblePersons, "responsiblePersons");
  }, [resources]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 bg-blue-200 m-2 px-6 py-4 rounded-lg flex gap-2">
          <div className="rounded-full bg-white p-2 ">
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
          <div className=" border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <Image
                    src={SpecialEventIcon}
                    alt="createAppointmentImage"
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
                  checked={formData.specialEvent === 1 ? true : false}
                  onChange={handleSpecialEventToggle}
                />
              </div>
            </div>
          </div>
          {/* Title */}
          <div className="flex gap-4">
            <div>
              <div className="flex items-center gap-2 ">
                <Image
                  src={nameIcon}
                  alt="createAppointmentImage"
                  width={15}
                  height={15}
                />
                <label className="block text-lg font-medium mb-2">Name</label>
              </div>
              <input
                type="text"
                placeholder="Appointment title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <div className="flex items-center gap-2 ">
                <Image
                  src={locationIcon}
                  alt="createAppointmentImage"
                  width={15}
                  height={15}
                />
                <label className="block text-lg font-medium mb-2">
                  Location
                </label>
              </div>
              <input
                type="text"
                placeholder="Appointment title"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end items-center ">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium">Private</label>
              <ToggleSwitch
                checked={formData.isPrivateEvent === 1 ? true : false}
                onChange={handlePrivateToggle}
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
            singleSelect={false} // Multiple select
          />

          <div className="">
            {/* Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium mb-2">from</label>
                <input
                  placeholder="Select Start date"
                  type="date"
                  value={formData.startDateOnly}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDateOnly: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2">to</label>
                <input
                  placeholder="Select Start date"
                  type="date"
                  value={formData.endDateOnly}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDateOnly: e.target.value,
                    }))
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
                  value={formData.startTimeOnly}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startTimeOnly: e.target.value,
                    }))
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
                  value={formData.endTimeOnly}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endTimeOnly: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <MultipleSelector
            titleIconUrl={repeatIcon.src}
            options={REPEAT_OPTIONS}
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
            options={ALERT_OPTIONS}
            onSelectionChange={handleAlertChange}
            title="Alarm"
            showSelectAll={true}
            showCount={true}
            showImages={false}
            selectedBorderColor="green"
            selectedBadgeColor="green"
            singleSelect={true} // Multiple select
          />

          {/* Additional Notes */}
          <div>
            <div className="flex items-center gap-2 ">
              <Image
                src={additionalNoteIcon}
                alt="createAppointmentImage"
                width={15}
                height={15}
              />
              <label className="block text-lg font-medium mb-2">
                Additional Notes
              </label>
            </div>
            <textarea
              onChange={handleDescriptionChange}
              placeholder="Any additional information..."
              rows={2}
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
