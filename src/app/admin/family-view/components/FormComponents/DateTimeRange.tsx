"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
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
}

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to get current time in HH:MM format
const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Helper function to get time 1 hour from now
const getCurrentTimePlusOneHour = (): string => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
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
      <div className="flex items-center gap-2 pb-1 ">
        <Image
          src={participantsIcon}
          alt="createAppointmentImage"
          width={15}
          height={15}
        />

        <label className="block text-2xl font-semibold ">
          Choose Dates & Time
        </label>
      </div>
      <div className={`bg-blue-100 p-2 ${className}`}>
        {/* Date inputs */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            {showLabels && (
              <label className="block text-lg font-medium">from</label>
            )}
            <input
              placeholder="Select Start date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={required}
            />
          </div>
          <div>
            {showLabels && (
              <label className="block text-lg font-medium">to</label>
            )}
            <input
              placeholder="Select End date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={required}
            />
          </div>
        </div>

        {/* Time inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            {showLabels && (
              <label className="block text-lg font-medium">Start Time</label>
            )}
            <input
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={required}
            />
          </div>
          <div>
            {showLabels && (
              <label className="block text-lg font-medium">End Time</label>
            )}
            <input
              type="time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={required}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimeRange;
