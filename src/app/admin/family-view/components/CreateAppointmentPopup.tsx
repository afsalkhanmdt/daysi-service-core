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

// Switch Component

interface AppointmentData {
  name: string;
  location: string;
  isAllDay: boolean;
  isPrivate: boolean;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  participants: string[];
  repeat: string;
  alarm: string;
  note: string;
  isSpecialEvent: boolean; // Added field for special event
}

const CreateAppointmentPopup: React.FC<
  todoPopupPropsType & { onSubmit: (data: AppointmentData) => void }
> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AppointmentData>({
    name: "",
    location: "",
    isAllDay: false,
    isPrivate: false,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    participants: [],
    repeat: "",
    alarm: "",
    note: "",
    isSpecialEvent: false, // Initialize special event as false
  });

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
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      name: "",
      location: "",
      isAllDay: false,
      isPrivate: false,
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      participants: [],
      repeat: "",
      alarm: "",
      note: "",
      isSpecialEvent: false,
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setFormData({
      name: "",
      location: "",
      isAllDay: false,
      isPrivate: false,
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      participants: [],
      repeat: "",
      alarm: "",
      note: "",
      isSpecialEvent: false,
    });
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
                  checked={formData.isSpecialEvent}
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
                value={formData.name}
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
                checked={formData.isPrivate}
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
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
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
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
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
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
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
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
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
