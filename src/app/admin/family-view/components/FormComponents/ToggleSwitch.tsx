import { useState } from "react";

export const ToggleSwitch = ({
  checked = false,
  onChange,
  disabled = false,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={handleToggle}
      className={`
        relative inline-flex items-center h-6 w-11 rounded-full
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
        ${isChecked ? "bg-blue-600" : "bg-gray-300"}
      `}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200
          ${isChecked ? "translate-x-6" : "translate-x-0.5"}
        `}
      />
    </button>
  );
};
