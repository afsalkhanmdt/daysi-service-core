export const ToggleSwitch = ({
  checked = false,
  onChange,
  disabled = false,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  const handleToggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleToggle}
      className={`
        relative inline-flex items-center h-4 w-8 rounded-full border-2 border-gray-300
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
        ${checked ? "bg-blue-600" : "bg-gray-300"}
      `}
    >
      <span
        className={`
          inline-block h-3 w-3 transform rounded-full bg-white shadow-lg transition-transform duration-200
          ${checked ? "translate-x-4" : "translate-x-0.5"}
        `}
      />
    </button>
  );
};
