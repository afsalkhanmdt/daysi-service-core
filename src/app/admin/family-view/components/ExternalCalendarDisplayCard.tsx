"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ExternalCalendar = {
  CalendarId: number;
  CalendarName: string;
  CalendarURL: string;
  FamilyId: number;
  MemberId: string;
  MembersUpdatedOn: string | null;
  memberName?: string;
  memberEmail?: string;
  memberLocale?: string;
};

const ExternalCalendarDisplayCard = ({
  calendar,
  onDelete,
}: {
  calendar: ExternalCalendar;
  onDelete: (calendarId: number) => void;
}) => {
  const { t } = useTranslation("common");
  const [isDeleting, setIsDeleting] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true);
    onDelete(calendar.CalendarId);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="flex justify-between gap-[0.25rem] p-[0.35rem] border rounded-lg border-slate-200">
      <div className="flex gap-[0.5rem] flex-1 min-w-0">
        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4 h-4 text-blue-600 dark:text-blue-300"
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

        <div className="flex justify-between flex-wrap w-full">
          <div className="grid gap-[0.35rem]">
            <div className="font-semibold text-base">
              {calendar.CalendarName}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-[0.25rem]">
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className={`bg-sky-500 px-2 py-0.5 text-white italic text-[8px] sm:text-sm rounded-2xl cursor-pointer ${
            isDeleting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("Delete Calendar")}</h3>
            <p className="text-gray-600 mb-6 text-sm">{t("Are you sure you want to delete this calendar? This action cannot be undone.")}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t("Cancel")}
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
              >
                {t("Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalCalendarDisplayCard;
