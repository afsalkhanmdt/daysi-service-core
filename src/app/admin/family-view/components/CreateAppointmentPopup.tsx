import { todoPopupPropsType } from "@/app/types/todo";
import Image from "next/image";
import React, { useState } from "react";
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

type AppointmentFormUI = ExtendedProps & {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

const initialFormDataForApi: ExtendedProps = {
  Id: 0,
  FamilyId: 0,
  Title: "",
  Description: null,
  Location: null,
  ActualStartDate: null,

  Start: "",
  End: "",

  SpecialEvent: 0,
  EventPerson: "",
  Repeat: 0,
  RepeatEndDate: "",
  Alert: 0,

  IsForAll: 0,
  IsSpecialEvent: 0,
  IsAllDayEvent: 0,
  IsPrivateEvent: 0,

  FamilyColorCode: "",

  Attendee: [],
  EventParticipant: [],
  ParentEventId: "",

  UpdatedOn: "",
  AddedBy: "",

  ExternalCalendarId: 0,
  ExternalCalendarName: null,

  Alarms: null,

  Latitude: null,
  Longitude: null,

  RecurrenceRule: {
    Frequency: 0,
    Interval: 1,
  },

  LocalStartDate: "",
  LocalEndDate: "",
  LocalRepeatEndDate: "",

  participants: [],

  externalCalender: null,
  userColorCode: "",

  description: "",
  location: "",

  isRecurrence: false,
};

const initialFormData: AppointmentFormUI = {
  ...initialFormDataForApi, // your existing ExtendedProps object
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
};

const CreateAppointmentPopup: React.FC<
  todoPopupPropsType & { onSubmit: (data: ExtendedProps) => void }
> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AppointmentFormUI>(initialFormData);

  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >(responsiblePersonsOptions);

  const [alarmSequence, setAlarmSequence] =
    useState<SelectableOption[]>(alarmOptions);

  const [repeatSequence, setRepeatSequence] =
    useState<SelectableOption[]>(repeatOptions);

  const handleSpecialEventToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isSpecialEvent: checked }));
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
      checkerResponsible: selectedPersons.map((person) => person.label),
    }));
  };

  const handleAlarmChange = (selectedAlarms: SelectableOption[]) => {
    setAlarmSequence((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: selectedAlarms.some((sa) => sa.id === option.id),
      }))
    );
  };
  const handleRepeatChange = (selectedRepeats: SelectableOption[]) => {
    setRepeatSequence((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: selectedRepeats.some((sr) => sr.id === option.id),
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: ExtendedProps = {
      ...formData,
      Start: buildTimestamp(formData.startDate, formData.startTime),
      End: buildTimestamp(formData.endDate, formData.endTime),
    };

    delete (payload as any).startDate;
    delete (payload as any).startTime;
    delete (payload as any).endDate;
    delete (payload as any).endTime;

    onSubmit(payload);
    onClose();
    setFormData(initialFormData);
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setFormData(initialFormData);
  };

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
                  checked={formData.SpecialEvent === 1 ? true : false}
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
                value={formData.Title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, Title: e.target.value }))
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
                checked={formData.IsPrivateEvent === 1 ? true : false}
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
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
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
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
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
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startTime: e.target.value,
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
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endTime: e.target.value,
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
