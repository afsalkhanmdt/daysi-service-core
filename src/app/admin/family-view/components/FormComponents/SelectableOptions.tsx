import React from "react";
import Image from "next/image";
import repeatIcon from "@/app/admin/assets/repeatIcon.png";
import alarmIcon from "@/app/admin/assets/alarmIcon.png";

interface SelectableOptionsProps {
  repeat?: string;
  alarm?: string;
  onRepeatChange?: (value: string) => void;
  onAlarmChange?: (value: string) => void;
}

const SelectableOptions: React.FC<SelectableOptionsProps> = ({
  repeat,
  alarm,
  onRepeatChange,
  onAlarmChange,
}) => {
  // Repeat sequence options
  const repeatOptions = ["Never", "Each Week", "Each 2 Week", "Each 3 Week"];

  // Alarm options - single group as per your updated code
  const alarmOptions = [
    "Never",
    "At Time of Event",
    "5 mins before",
    "15 mins before",
    "30 min before",
    "1 hour before",
    "1 week before",
  ];

  return (
    <div className=" bg-white rounded-lg shadow-sm">
      {/* Repeat Sequence Section */}
      {repeat !== undefined && onRepeatChange && (
        <div className="">
          <div className="flex items-center gap-2 ">
            <Image
              src={repeatIcon}
              alt="createAppointmentImage"
              width={15}
              height={15}
            />
            <label className="block text-lg font-medium ">
              Repeat Sequence
            </label>
          </div>
          <div className="flex gap-2 flex-wrap">
            {repeatOptions.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <input
                      type="radio"
                      name="repeat"
                      checked={repeat === option}
                      onChange={() => onRepeatChange(option)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                </div>
                <span
                  className={`text-sm ${
                    option === "Never" ? "font-medium" : "text-gray-700"
                  }`}
                >
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 my-6"></div>

      {/* Alarm Section */}
      {alarm !== undefined && onAlarmChange && (
        <div>
          <div className="flex items-center gap-2 ">
            <Image
              src={alarmIcon}
              alt="createAppointmentImage"
              width={15}
              height={15}
            />
            <label className="block text-lg font-medium ">Alarm</label>
          </div>

          <div className="flex gap-2 flex-wrap">
            {alarmOptions.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <input
                      type="radio"
                      name="alarm"
                      checked={alarm === option}
                      onChange={() => onAlarmChange(option)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                </div>
                <span
                  className={`text-sm ${
                    option === "Never" ? "font-medium" : "text-gray-700"
                  }`}
                >
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectableOptions;
