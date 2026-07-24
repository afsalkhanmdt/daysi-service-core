"use client";

import React, { useEffect, useState } from "react";
import { useResources } from "@/app/context/ResourceContext";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import CustomDropdown from "./FormComponents/DropDown";
import { SelectableOption } from "./FormComponents/MultipleSelector";
import { useTranslation } from "react-i18next";

interface ExternalCalendarLogos {
  name: string;
  logo: string;
  link: string;
}

const EXTERNAL_CALENDAR_LOGOS: ExternalCalendarLogos[] = [
  {
    name: "Outlook",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg",
    link: "https://support.microsoft.com/en-us/office/introduction-to-publishing-calendars-06927a3c-b391-4475-a01c-6d9b4b0e9b2d",
  },
  {
    name: "iPhone",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    link: "https://support.apple.com/en-us/HT204407",
  },
  {
    name: "iCal",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Calendar_icon.svg",
    link: "https://support.apple.com/en-us/HT204407",
  },
  {
    name: "teamsnap",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/94/TeamSnap_logo.svg",
    link: "https://helpme.teamsnap.com/article/278-subscribe-to-a-team-schedule",
  },
  {
    name: "Team Cowboy",
    logo: "https://www.teamcowboy.com/img/logo_team_cowboy.png",
    link: "https://www.teamcowboy.com/help",
  },
  {
    name: "Team App",
    logo: "https://www.teamapp.com/assets/teamapp-logo.png",
    link: "https://support.teamapp.com/",
  },
  {
    name: "Google Calendar",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
    link: "https://support.google.com/calendar/answer/37648?hl=en",
  },
  {
    name: "SportMember",
    logo: "https://www.sportmember.com/favicon.ico",
    link: "https://www.sportmember.com",
  },
];

interface ImportAppointmentsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  familyId: number;
  locale: string;
}

const ImportAppointmentsPopup: React.FC<ImportAppointmentsPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  familyId,
  locale,
}) => {
  const { resources } = useResources();
  const { t } = useTranslation("common");

  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);

  const [formData, setFormData] = useState({
    calendarName: "",
    calendarURL: "",
    memberId: "",
  });

  const [errors, setErrors] = useState({
    calendarName: "",
    calendarURL: "",
    memberId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setResponsiblePersons(mapResourcesToSelectableOptions(resources));
  }, [resources]);

  const validateURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validate = () => {
    const newErrors = {
      calendarName: !formData.calendarName ? t("CalendarNameIsRequired") : "",
      calendarURL: !formData.calendarURL
        ? t("CalendarURLIsRequired")
        : !validateURL(formData.calendarURL)
          ? t("InvalidURL")
          : "",
      memberId: !formData.memberId ? t("FamilyMemberIsRequired") : "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      calendarName: "",
      calendarURL: "",
      memberId: "",
    });

    setErrors({
      calendarName: "",
      calendarURL: "",
      memberId: "",
    });

    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        CalendarName: formData.calendarName,
        CalendarURL: formData.calendarURL,
        MemberId: formData.memberId,
        FamilyId: familyId,
        MembersUpdatedOn: new Date().toISOString(),
        FilePath: null,
        FileContent: null,
        Locale: locale,
      });

      handleClose();
    } catch (error) {
      console.error("Failed to import calendar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-[14px] border-[3px] border-[#4ec7bd] bg-[#e8fff5] px-6 pb-6 pt-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex justify-center">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-[#26c6b8]">
                MyFamilii
              </div>
            </div>
          </div>

          <h2 className="mb-4 text-center text-[22px] font-extrabold text-black">
            {t("Import Appointments")}
          </h2>

          <p className="mb-1 text-center text-[13px] leading-4 text-black">
            Import appointments from External calendars
            <br />
            into the MyFamilii App.
          </p>

          <p className="mb-5 text-center text-[10px] italic leading-3 text-black">
            Click on the logo below to find out how to get the URL for your
            calendar
          </p>

          <div className="space-y-2">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-black">
                Calendar Name
              </label>
              <input
                type="text"
                name="calendarName"
                value={formData.calendarName}
                onChange={handleInputChange}
                className={`h-[34px] w-full rounded-md border bg-[#e8ecfb] px-3 text-sm outline-none ${
                  errors.calendarName ? "border-red-500" : "border-[#d6d8e8]"
                }`}
              />
              {errors.calendarName && (
                <p className="mt-1 text-[10px] text-red-500">
                  {errors.calendarName}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-black">
                URL:
              </label>
              <input
                type="text"
                name="calendarURL"
                value={formData.calendarURL}
                onChange={handleInputChange}
                className={`h-[34px] w-full rounded-md border bg-[#e8ecfb] px-3 text-sm outline-none ${
                  errors.calendarURL ? "border-red-500" : "border-[#d6d8e8]"
                }`}
              />
              {errors.calendarURL && (
                <p className="mt-1 text-[10px] text-red-500">
                  {errors.calendarURL}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-black">
                Family Member
              </label>

              <div
                className={`rounded-md bg-[#e8ecfb] ${
                  errors.memberId ? "ring-1 ring-red-500" : ""
                }`}
              >
                <CustomDropdown
                  options={responsiblePersons.map((p) => ({
                    id: String(p.memberId),
                    label: p.label,
                    imageUrl: p.imageUrl,
                  }))}
                  selectedValue={formData.memberId}
                  onSelect={(id) => {
                    setFormData((prev) => ({ ...prev, memberId: id }));
                    if (errors.memberId)
                      setErrors((prev) => ({ ...prev, memberId: "" }));
                  }}
                  placeholder={t("SelectMember")}
                />
              </div>

              {errors.memberId && (
                <p className="mt-1 text-[10px] text-red-500">
                  {errors.memberId}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-[40px] flex-1 rounded-md border border-[#d6d8e8] bg-white text-[16px] font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[40px] flex-1 rounded-md bg-[#49aaf0] text-[16px] font-bold text-white shadow-sm transition hover:bg-[#349ce5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? t("Importing...") : t("Import")}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 items-center gap-x-5 gap-y-4">
            {EXTERNAL_CALENDAR_LOGOS.map((item) => (
              <a
                key={item.name}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[28px] items-center justify-center"
                title={item.name}
              >
                <img
                  src={item.logo}
                  alt={item.name}
                  className="max-h-[26px] max-w-[82px] object-contain"
                />
              </a>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportAppointmentsPopup;
