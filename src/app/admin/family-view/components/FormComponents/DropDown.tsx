import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface DropdownProps {
  options: { id: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  iconUrl?: string;
  title?: string;
}

const CustomDropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  iconUrl,
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption =
    options.find((opt) => opt.label === selectedValue) || options[0];

  return (
    <div className="max-w-md w-full">
      {title && (
        <div className="flex items-center gap-2 mb-2">
          {iconUrl && (
            <div className="w-5 h-5 relative">
              <Image
                src={iconUrl}
                alt={title}
                fill
                className="object-contain"
              />
            </div>
          )}
          <label className="block text-lg font-medium text-gray-800">
            {title}
          </label>
        </div>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white flex items-center justify-between hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center gap-3">
            <span
              className={`font-medium ${
                selectedValue ? "text-gray-800" : "text-gray-500"
              }`}
            >
              {selectedValue || placeholder}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option.label);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                  selectedValue === option.label
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
              >
                <span>{option.label}</span>
                {selectedValue === option.label && (
                  <svg
                    className="w-5 h-5 ml-auto text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 mt-2 px-1">Select cue click</div>
    </div>
  );
};
export default CustomDropdown;
