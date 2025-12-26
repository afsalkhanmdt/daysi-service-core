// MultipleSelector.tsx
import Image from "next/image";
import { useState, useEffect } from "react";
import defaultDp from "@/app/admin/assets/default-avatar-icon-of-social-media-user-vector.jpg";

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

export type SelectableOption = {
  id: number;
  memberId?: string;
  label: string;
  imageUrl?: string;
  isSelected: boolean;
};

type MultipleSelectorProps = {
  options: SelectableOption[];
  onSelectionChange?: (selectedOptions: SelectableOption[]) => void;
  title?: string;
  titleIconUrl?: string;
  showSelectAll?: boolean;
  showCount?: boolean;
  showImages?: boolean;
  selectedBorderColor?: string;
  selectedBadgeColor?: string;
  className?: string;
  singleSelect?: boolean;
};

export default function MultipleSelector({
  options: initialOptions,
  onSelectionChange,
  title,
  titleIconUrl,
  showSelectAll = true,
  showCount = true,
  showImages = false,
  selectedBorderColor = "green",
  selectedBadgeColor = "green",
  singleSelect = false,
}: MultipleSelectorProps) {
  const [options, setOptions] = useState<SelectableOption[]>(initialOptions);

  // Sync with external changes to initialOptions
  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleToggleOption = (id: number) => {
    let updatedOptions: SelectableOption[];

    if (singleSelect) {
      // For single selection: select the clicked option, deselect all others
      updatedOptions = options.map((option) => ({
        ...option,
        isSelected: option.id === Number(id),
      }));
    } else {
      // For multiple selection: toggle the clicked option
      updatedOptions = options.map((option) =>
        option.id === Number(id)
          ? { ...option, isSelected: !option.isSelected }
          : option
      );
    }

    setOptions(updatedOptions);

    // Notify parent component about selection changes
    if (onSelectionChange) {
      const selected = updatedOptions.filter((p) => p.isSelected);
      onSelectionChange(selected);
    }
  };

  const handleSelectAll = () => {
    if (singleSelect) return;

    const allSelected = options.map((option) => ({
      ...option,
      isSelected: true,
    }));
    setOptions(allSelected);
    if (onSelectionChange) {
      onSelectionChange(allSelected);
    }
  };

  const handleClearAll = () => {
    const noneSelected = options.map((option) => ({
      ...option,
      isSelected: false,
    }));
    setOptions(noneSelected);
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  // Get selected options count
  const selectedCount = options.filter((p) => p.isSelected).length;

  // Dynamic border color class
  const getBorderColorClass = () => {
    switch (selectedBorderColor) {
      case "blue":
        return "border-blue-500";
      case "red":
        return "border-red-500";
      case "purple":
        return "border-purple-500";
      case "orange":
        return "border-orange-500";
      case "pink":
        return "border-pink-500";
      default:
        return "border-green-500";
    }
  };

  // Dynamic badge color class
  const getBadgeColorClass = () => {
    switch (selectedBadgeColor) {
      case "blue":
        return "bg-blue-500";
      case "red":
        return "bg-red-500";
      case "purple":
        return "bg-purple-500";
      case "orange":
        return "bg-orange-500";
      case "pink":
        return "bg-pink-500";
      default:
        return "bg-green-500";
    }
  };

  const borderColorClass = getBorderColorClass();
  const badgeColorClass = getBadgeColorClass();

  return (
    <div className={`w-full bg-white `}>
      {title && (
        <div className="flex items-center gap-2 ">
          {titleIconUrl && (
            <Image
              src={titleIconUrl}
              alt="createAppointmentImage"
              width={15}
              height={15}
            />
          )}
          <label className="block text-lg font-medium ">{title}</label>
        </div>
      )}

      {/* Hide select all/clear all in single select mode */}
      {(showSelectAll || showCount) && !singleSelect && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            {showCount && (
              <span className="text-sm text-gray-500">
                {selectedCount} of {options.length} selected
              </span>
            )}
            {showSelectAll && (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show different message for single select mode */}
      {singleSelect && showCount && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              {selectedCount > 0 ? "1 selected" : "Select one option"}
            </span>
          </div>
        </div>
      )}

      {/* Responsive flex-wrap container */}
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <div
            onClick={() => handleToggleOption(option.id)}
            key={option.id}
            className="relative"
          >
            <button
              type="button"
              className={`relative px-3 py-2 rounded-full border transition-all duration-200 flex items-center space-x-2 max-w-full group ${
                option.isSelected
                  ? `${borderColorClass} shadow-sm`
                  : "border-gray-300 hover:border-gray-400"
              } ${singleSelect ? "cursor-pointer pr-10" : ""}`}
            >
              {/* Image/Icon - conditionally shown */}
              {showImages && (
                <div className="flex-shrink-0 w-6 h-6 relative">
                  <Image
                    className="rounded-full object-cover"
                    src={option.imageUrl ? option.imageUrl : defaultDp}
                    alt={`${option.label}`}
                    fill
                    sizes="24px"
                    unoptimized
                  />
                </div>
              )}

              {/* Label */}
              <span
                className={`truncate text-sm ${
                  option.isSelected
                    ? "text-gray-800 font-medium"
                    : "text-gray-700"
                }`}
              >
                {option.label}
              </span>

              {/* Optional: Subtle background color on hover for non-selected items */}
              {!option.isSelected && (
                <div className="absolute inset-0 rounded-full bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              )}
            </button>

            {/* Checkmark for SINGLE selection mode - radio button style */}
            {singleSelect && (
              <div
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  option.isSelected
                    ? `${badgeColorClass} border-${selectedBorderColor}-500`
                    : "border-gray-300 bg-white"
                }`}
              >
                {option.isSelected && (
                  <Check color="white" strokeWidth={3} className="w-3 h-3" />
                )}
              </div>
            )}

            {/* Checkmark badge for MULTIPLE selection mode - checkbox style */}
            {!singleSelect && option.isSelected && (
              <div
                className={`absolute -top-1 -right-1 w-5 h-5 ${badgeColorClass} rounded-full flex items-center justify-center z-10 shadow-sm border border-white`}
              >
                <Check color="white" strokeWidth={3} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
