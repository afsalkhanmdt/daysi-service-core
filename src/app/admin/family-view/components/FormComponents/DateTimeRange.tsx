"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";

interface DateTimeRangeProps {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  required?: boolean;
  className?: string;
  showLabels?: boolean;
  setDefaultDates?: boolean; // New prop to control default behavior
  hideHeading?: boolean;
}

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to get current time in HH:MM format, rounded up to next hour if minutes > 0
const getCurrentTime = (): string => {
  const now = new Date();
  if (now.getMinutes() > 0) {
    now.setHours(now.getHours() + 1);
  }
  const hours = String(now.getHours() % 24).padStart(2, "0");
  return `${hours}:00`;
};

// Helper function to get time 1 hour from now, also rounded
const getCurrentTimePlusOneHour = (): string => {
  const now = new Date();
  if (now.getMinutes() > 0) {
    now.setHours(now.getHours() + 1);
  }
  now.setHours(now.getHours() + 1);
  const hours = String(now.getHours() % 24).padStart(2, "0");
  return `${hours}:00`;
};

const TimePicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}> = ({ value, onChange, required }) => {
  // Ensure we have a valid HH:MM format
  const timePart = value || "00:00";
  const [h, m] = timePart.split(":");
  
  // Round minute to nearest 15-minute interval for the display
  const normalizeMinute = (minStr: string) => {
    const min = parseInt(minStr) || 0;
    if (min < 8) return "00";
    if (min < 23) return "15";
    if (min < 38) return "30";
    if (min < 53) return "45";
    return "00";
  };

  const hour = h.padStart(2, "0");
  const minute = normalizeMinute(m);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className="flex gap-1 items-center">
      <select
        value={hour}
        onChange={(e) => onChange(`${e.target.value}:${minute}`)}
        className="w-1/2 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        required={required}
      >
        {hours.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="text-gray-500 font-bold">:</span>
      <select
        value={minute}
        onChange={(e) => onChange(`${hour}:${e.target.value}`)}
        className="w-1/2 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        required={required}
      >
        {minutes.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
};

const DateTimeRange: React.FC<DateTimeRangeProps> = ({
  startDate,
  endDate,
  startTime,
  endTime,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  required = false,
  className = "",
  showLabels = true,
  setDefaultDates = true, // Default to true for backward compatibility
  hideHeading = false,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Set default dates on component mount
  useEffect(() => {
    if (setDefaultDates && !isInitialized) {
      const currentDate = getCurrentDate();
      const currentTime = getCurrentTime();
      const currentTimePlusOneHour = getCurrentTimePlusOneHour();

      // Only set defaults if values are empty
      if (!startDate) {
        onStartDateChange(currentDate);
      }
      if (!endDate) {
        onEndDateChange(currentDate);
      }
      if (!startTime) {
        onStartTimeChange(currentTime);
      }
      if (!endTime) {
        onEndTimeChange(currentTimePlusOneHour);
      }

      setIsInitialized(true);
    }
  }, [
    setDefaultDates,
    isInitialized,
    startDate,
    endDate,
    startTime,
    endTime,
    onStartDateChange,
    onEndDateChange,
    onStartTimeChange,
    onEndTimeChange,
  ]);

  return (
    <div>
      {!hideHeading && (
        <div className="flex items-center gap-1.5 pb-0.5">
          <Image
            src={participantsIcon}
            alt="createAppointmentImage"
            width={12}
            height={12}
          />

          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
            Choose Dates & Time
          </label>
        </div>
      )}
      <div className={`bg-blue-100/50 p-2 rounded-lg ${className}`}>
        {/* Date inputs */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            {showLabels && (
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">from</label>
            )}
            <input
              placeholder="Select Start date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required={required}
            />
          </div>
          <div>
            {showLabels && (
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">to</label>
            )}
            <input
              placeholder="Select End date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required={required}
            />
          </div>
        </div>

        {/* Time inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            {showLabels && (
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">Start Time</label>
            )}
            <TimePicker
              value={startTime}
              onChange={onStartTimeChange}
              required={required}
            />
          </div>
          <div>
            {showLabels && (
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">End Time</label>
            )}
            <TimePicker
              value={endTime}
              onChange={onEndTimeChange}
              required={required}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimeRange;
