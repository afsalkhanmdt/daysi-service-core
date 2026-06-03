import Image from "next/image";
import { useState, useEffect } from "react";
import defaultDp from "@/app/admin/assets/default-avatar-icon-of-social-media-user-vector.jpg";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";

type SingleSelectorOption = {
  id: number;
  label: string;
  imageUrl?: string;
  isSelected: boolean | "" | undefined;
};

type SingleSelectorProps = {
  options: SingleSelectorOption[];
  onSelectionChange?: (selectedOption: SingleSelectorOption) => void;
  mainHeading?: string;
  selectedBorderColor?: string;
  selectedBadgeColor?: string;
  className?: string;
};

// ... Check component ...
function Check({
  color,
  strokeWidth,
  className = "",
}: {
  color?: string;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 13l4 4L19 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SingleSelector({
  options: initialOptions,
  onSelectionChange,
  mainHeading,
  selectedBorderColor = "green",
  selectedBadgeColor = "green",
}: SingleSelectorProps) {
  const [options, setOptions] = useState<SingleSelectorOption[]>(initialOptions);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleToggleOption = (id: number) => {
    const updatedOptions = options.map((option) => ({
      ...option,
      isSelected: option.id === id,
    }));
    setOptions(updatedOptions);

    if (onSelectionChange) {
      const selected = updatedOptions.find((p) => p.isSelected);
      if (selected) onSelectionChange(selected);
    }
  };

  const getBorderColorClass = () => {
    switch (selectedBorderColor) {
      case "blue": return "border-blue-500";
      case "red": return "border-red-500";
      case "purple": return "border-purple-500";
      case "orange": return "border-orange-500";
      case "pink": return "border-pink-500";
      default: return "border-green-500";
    }
  };

  const getBadgeColorClass = () => {
    switch (selectedBadgeColor) {
      case "blue": return "bg-blue-500";
      case "red": return "bg-red-500";
      case "purple": return "bg-purple-500";
      case "orange": return "bg-orange-500";
      case "pink": return "bg-pink-500";
      default: return "bg-green-500";
    }
  };

  const borderColorClass = getBorderColorClass();
  const badgeColorClass = getBadgeColorClass();
  const selectedCount = options.filter((p) => p.isSelected).length;

  return (
    <div>
      {mainHeading && (
        <div className="flex items-center gap-2 pb-1 ">
          <Image src={participantsIcon} alt="icon" width={15} height={15} />
          <label className="block text-lg font-semibold">{mainHeading}</label>
        </div>
      )}
      <div className={`w-full p-2 bg-blue-100 rounded-md`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {selectedCount > 0 ? "1 selected" : "Select one option"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {options.map((option) => (
            <div
              onClick={() => handleToggleOption(option.id)}
              key={option.id}
              className="relative cursor-pointer"
            >
              <button
                type="button"
                className={`relative px-3 py-1 bg-white rounded-full border transition-all duration-200 flex items-center space-x-2 max-w-full group ${
                  option.isSelected
                    ? `${borderColorClass} shadow-sm`
                    : "border-gray-300 hover:border-gray-400"
                } pr-10`}
              >
                <span className={`truncate text-xs ${option.isSelected ? "text-gray-800 font-medium" : "text-gray-700"}`}>
                  {option.label}
                </span>
              </button>
              <div
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  option.isSelected ? `${badgeColorClass} border-transparent` : "border-gray-300 bg-white"
                }`}
              >
                {option.isSelected && <Check color="white" strokeWidth={3} className="w-3 h-3" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
