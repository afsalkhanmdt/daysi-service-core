"use client";

import React, { useEffect, useState } from "react";
import { EventInput } from "@fullcalendar/core";
import {
  AppointmentPopupProps,
  EventParticipant,
  ExtendedProps,
} from "@/app/types/appoinment";

const EditAppointmentPopup: React.FC<AppointmentPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  appointment,
}) => {
  const [formData, setFormData] = useState<ExtendedProps | null>(null);

  const appointmentTypes = ["Meeting", "Call", "Deadline", "Reminder", "Event"];

  useEffect(() => {
    if (!appointment) return;

    setFormData({
      ...(appointment.extendedProps as ExtendedProps),
      Start: appointment.start?.toISOString() ?? "",
      End: appointment.end?.toISOString() ?? "",
    });
  }, [appointment]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const participants = formData.participants ?? ([] as EventParticipant[]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Edit Appointment</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.Title || ""}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, Title: e.target.value } : prev
                )
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.Description || ""}
              onChange={(e) =>
                setFormData((prev) =>
                  prev
                    ? {
                        ...prev,
                        extendedProps: {
                          ...prev,
                          Description: e.target.value,
                        },
                      }
                    : prev
                )
              }
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-medium mb-2">Start</label>
              <input
                type="datetime-local"
                value={
                  formData.Start
                    ? new Date(formData.Start as string)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) =>
                    prev ? { ...prev, Start: e.target.value } : prev
                  )
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">End</label>
              <input
                type="datetime-local"
                value={
                  formData.End
                    ? new Date(formData.End as string)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) =>
                    prev ? { ...prev, End: e.target.value } : prev
                  )
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">
              Appointment Type
            </label>
            <select
              value={formData.Title || ""}
              onChange={(e) =>
                setFormData((prev) =>
                  prev
                    ? {
                        ...prev,
                        extendedProps: {
                          ...prev,
                          Title: e.target.value,
                        },
                      }
                    : prev
                )
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select type</option>
              {appointmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">
              Participants
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
              {participants.map((participentdetails: EventParticipant) => (
                <label
                  key={participentdetails.ParticipantId}
                  className="flex items-center space-x-3"
                >
                  <input type="checkbox" checked readOnly className="rounded" />
                  <span>{participentdetails.Participant}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentPopup;
