import { PopupPropsType } from "@/app/types/todo";
import React, { useState } from "react";

interface AppointmentData {
  title: string;
  description: string;
  date: string;
  time: string;
  participants: string[];
  type: string;
}

const CreateAppointmentPopup: React.FC<
  PopupPropsType & { onSubmit: (data: AppointmentData) => void }
> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AppointmentData>({
    title: "",
    description: "",
    date: "",
    time: "",
    participants: [],
    type: "",
  });

  const appointmentTypes = ["Meeting", "Call", "Deadline", "Reminder", "Event"];
  const participantOptions = [
    "John Doe",
    "Jane Smith",
    "Mike Johnson",
    "Sarah Wilson",
  ];

  const handleParticipantToggle = (participant: string) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(participant)
        ? prev.participants.filter((p) => p !== participant)
        : [...prev.participants, participant],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      participants: [],
      type: "",
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      participants: [],
      type: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold">Create Appointment</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-lg font-medium mb-2">Title</label>
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

          {/* Description */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Description
            </label>
            <textarea
              placeholder="Appointment description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, time: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Appointment Type */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Appointment Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select type</option>
              {appointmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Participants
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
              {participantOptions.map((participant) => (
                <label
                  key={participant}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(participant)}
                    onChange={() => handleParticipantToggle(participant)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex-1">{participant}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Additional Notes
            </label>
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
