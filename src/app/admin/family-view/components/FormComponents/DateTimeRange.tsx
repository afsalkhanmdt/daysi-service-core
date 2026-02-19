"use client";

import React from "react";

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
}

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
}) => {
  return (
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
  );
};

export default DateTimeRange;
