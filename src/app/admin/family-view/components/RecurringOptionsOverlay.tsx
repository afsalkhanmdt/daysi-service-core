import Image from "next/image";

const RecurringOptionsOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: "single" | "series") => void;
  eventData: any;
}> = ({ isOpen, onClose, onSelect, eventData }) => {
  if (!isOpen) return null;

  const isRecurring =
    eventData?.extendedProps?.repeat > 0 || eventData?.Repeat > 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6l12 12M18 6L6 18"
            />
          </svg>
        </button>

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
              Edit Recurring Event
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            This event is part of a recurring series. How would you like to edit
            it?
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => onSelect("series")}
            className="w-full text-left p-4 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-500 transition-all hover:shadow-md group"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <div className="w-5 h-5 rounded-full border-2 border-blue-400 group-hover:border-blue-600 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                </div>
              </div>
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
          </button>

          <button
            onClick={() => onSelect("single")}
            className="w-full text-left p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-md group"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <div className="w-5 h-5 rounded-full border-2 border-gray-400 group-hover:border-blue-600 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400 group-hover:bg-blue-500"></div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  Edit only this occurrence
                </div>
                <p className="text-sm text-gray-600 mt-0.5">
                  Changes will apply to{" "}
                  <span className="font-medium">this event only</span>.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                    Series will split
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    This becomes standalone
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
export default RecurringOptionsOverlay;
