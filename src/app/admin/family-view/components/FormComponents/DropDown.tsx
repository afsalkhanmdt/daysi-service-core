import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface DropdownProps {
  options: { id: string; label: string; imageUrl?: string }[];
  selectedValue: string;
  onSelect: (id: string, label: string) => void;
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

  const selectedOption = options.find((opt) => opt.id === selectedValue) || options.find((opt) => opt.label === selectedValue);

  return (
    <div className="w-full">
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
            {selectedOption?.imageUrl && (
              <div className="w-6 h-6 relative rounded-full overflow-hidden border border-gray-200">
                <Image
                  src={selectedOption.imageUrl}
                  alt={selectedOption.label}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span
              className={`font-medium ${
                selectedValue ? "text-gray-800" : "text-gray-500"
              }`}
            >
              {selectedOption?.label || placeholder}
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
          <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onSelect(option.id, option.label);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                  selectedValue === option.id || selectedValue === option.label
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
              >
                {option.imageUrl && (
                  <div className="w-8 h-8 relative rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                    <Image
                      src={option.imageUrl}
                      alt={option.label}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="truncate">{option.label}</span>
                {(selectedValue === option.id || selectedValue === option.label) && (
                  <svg
                    className="w-5 h-5 ml-auto text-blue-500 flex-shrink-0"
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
    </div>
  );
};
export default CustomDropdown;
