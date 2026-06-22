"use client";

import { useMemo, useState } from "react";
import { FamilyData } from "./FamilyViewWrapper";

const weekdayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type ScheduleViewProps = {
  data: FamilyData;
  currentUserId?: string;
};

const ScheduleView = ({ data, currentUserId }: ScheduleViewProps) => {
  const [selectedMemberId, setSelectedMemberId] = useState(
    currentUserId || data.Members[0]?.MemberId,
  );

  const selectedMember = useMemo(
    () => data.Members.find((member) => member.MemberId === selectedMemberId),
    [data.Members, selectedMemberId],
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">Schedule</h1>
      </div>

      <div className="border-b p-4">
        <div className="flex gap-2 overflow-x-auto">
          {data.Members.map((member) => (
            <button
              key={member.MemberId}
              onClick={() => setSelectedMemberId(member.MemberId)}
              className={`px-3 py-2 rounded-lg border whitespace-nowrap ${
                selectedMemberId === member.MemberId
                  ? "bg-blue-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              {member.FirstName}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b p-4 flex justify-between items-center">
        <div>{selectedMember?.FirstName}'s Schedule</div>

        <button className="px-4 py-2 rounded-lg bg-blue-500 text-white">
          Configuration
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {selectedMember?.MasterSchedules?.length ? (
          <div className="space-y-3">
            {selectedMember.MasterSchedules.map((schedule) => (
              <div
                key={schedule.ShMasterId}
                className="border rounded-lg p-3 shadow-sm"
              >
                <div className="font-semibold">{schedule.Description}</div>

                <div className="text-sm text-gray-500">
                  {weekdayNames[schedule.Weekday]}
                </div>

                <div className="text-sm">
                  {schedule.StartTime} - {schedule.EndTime}
                </div>

                {schedule.Note && (
                  <div className="text-sm mt-2">{schedule.Note}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No schedules found</div>
        )}
      </div>
    </div>
  );
};

export default ScheduleView;
