import Image from "next/image";
import { useState } from "react";

import closeIcon from "@/app/admin/assets/close-428.png";

const RecurringEditOptions: React.FC<{
  onSelect: (option: "single" | "series") => void;
  onCancel: () => void;
  isProcessing: boolean;
}> = ({ onSelect, onCancel, isProcessing }) => {
  const [selectedOption, setSelectedOption] = useState<"single" | "series">(
    "series",
  );

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
          disabled={isProcessing}
        >
          <Image src={closeIcon} alt="Close" width={20} height={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              How would you like to save your changes?
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            This event is part of a recurring series. Choose how you want to
            apply your changes.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {/* Option 1: Edit All Occurrences */}
          <label
            className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === "series"
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="recurringOption"
                value="series"
                checked={selectedOption === "series"}
                onChange={() => setSelectedOption("series")}
                className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                disabled={isProcessing}
              />
              <div>
                <div className="font-semibold text-gray-800">
                  Edit the whole appointment
                </div>
                <p className="text-sm text-gray-600 mt-0.5">
                  Changes will apply to{" "}
                  <span className="font-medium">all occurrences</span> in this
                  series.
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded">
                    All instances updated
                  </span>
                </div>
              </div>
            </div>
          </label>

          {/* Option 2: Edit Only This Occurrence */}
          <label
            className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === "single"
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="recurringOption"
                value="single"
                checked={selectedOption === "single"}
                onChange={() => setSelectedOption("single")}
                className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                disabled={isProcessing}
              />
              <div>
                <div className="font-semibold text-gray-800">
                  Edit only the current date
                </div>
                <p className="text-sm text-gray-600 mt-0.5">
                  Changes will apply to{" "}
                  <span className="font-medium">this occurrence only</span>.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                    Series will split
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    This event becomes standalone
                  </span>
                </div>
              </div>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={() => onSelect(selectedOption)}
            className="flex-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Apply Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default RecurringEditOptions;
