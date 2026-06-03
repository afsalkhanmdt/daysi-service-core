import Image from "next/image";
import { useState, useEffect } from "react";
import defaultDp from "@/app/admin/assets/default-avatar-icon-of-social-media-user-vector.jpg";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";

export type SelectableOption = {
  id: number;
  memberId?: string;
  label: string;
  imageUrl?: string;
  isSelected: boolean | "" | undefined;
};

type MultipleSelectorProps = {
  options: SelectableOption[];
  onSelectionChange?: (selectedOptions: SelectableOption[]) => void;
  mainHeading?: string;
  subHeading?: string;
  subHeadingIcon?: string;
  showSelectAll?: boolean;
  showCount?: boolean;
  showImages?: boolean;
  selectedBorderColor?: string;
  selectedBadgeColor?: string;
  className?: string;
};

function Check({ color, strokeWidth, className = "" }: { color?: string; strokeWidth?: number; className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 13l4 4L19 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MultipleSelector({
  options: initialOptions,
  onSelectionChange,
  mainHeading,
  subHeading,
  subHeadingIcon,
  showSelectAll = true,
  showCount = true,
  showImages = false,
  selectedBorderColor = "green",
  selectedBadgeColor = "green",
}: MultipleSelectorProps) {
  const [options, setOptions] = useState<SelectableOption[]>(initialOptions);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleToggleOption = (id: number) => {
    const updatedOptions = options.map((option) => {
      if (option.id === id) {
        return { ...option, isSelected: !option.isSelected };
      }
      return option;
    });

    setOptions(updatedOptions);

    if (onSelectionChange) {
      onSelectionChange(updatedOptions.filter((p) => p.isSelected));
    }
  };

  const handleSelectAll = () => {
    const allSelected = options.map((option) => ({ ...option, isSelected: true }));
    setOptions(allSelected);
    if (onSelectionChange) onSelectionChange(allSelected);
  };

  const handleClearAll = () => {
    const noneSelected = options.map((option) => ({ ...option, isSelected: false }));
    setOptions(noneSelected);
    if (onSelectionChange) onSelectionChange([]);
  };

  const selectedCount = options.filter((p) => p.isSelected).length;

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

  return (
    <div>
      {mainHeading && (
        <div className="flex items-center gap-2 pb-1 ">
          <Image src={participantsIcon} alt="icon" width={15} height={15} />
          <label className="block text-lg font-semibold">{mainHeading}</label>
        </div>
      )}
      <div className="w-full p-2 bg-blue-100 rounded-md">
        {subHeading && (
          <div className="flex items-center gap-2 ">
            {subHeading && subHeadingIcon && <Image src={subHeadingIcon} alt="icon" width={15} height={15} />}
            <label className="block">{subHeading}</label>
          </div>
        )}

        {(showSelectAll || showCount) && (
          <div>
            <div className="flex items-center justify-between">
              {showCount && <span className="text-xs text-gray-500">{selectedCount} of {options.length} selected</span>}
              {showSelectAll && (
                <div className="flex space-x-2">
                  <button type="button" onClick={handleSelectAll} className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors">Select All</button>
                  <button type="button" onClick={handleClearAll} className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">Clear All</button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <div onClick={() => handleToggleOption(option.id)} key={option.memberId || option.id} className="relative cursor-pointer">
              <button
                type="button"
                className={`relative px-3 py-1 bg-white rounded-full border transition-all duration-200 flex items-center space-x-2 max-w-full group ${
                  option.isSelected ? `${borderColorClass} shadow-sm` : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {showImages && (
                  <div className="flex-shrink-0 w-4 h-4 relative">
                    <Image className="rounded-full object-cover" src={option.imageUrl ? option.imageUrl : defaultDp} alt={option.label} fill sizes="24px" unoptimized />
                  </div>
                )}
                <span className={`truncate text-xs ${option.isSelected ? "text-gray-800 font-medium" : "text-gray-700"}`}>{option.label}</span>
              </button>
              {option.isSelected && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 ${badgeColorClass} rounded-full flex items-center justify-center z-10 shadow-sm border border-white`}>
                  <Check color="white" strokeWidth={3} className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
