"use client";

import React, { useEffect, useState } from "react";
import { useResources } from "@/app/context/ResourceContext";
import { mapResourcesToSelectableOptions } from "@/app/utils/resourceAdapters";
import CustomDropdown from "./FormComponents/DropDown";
import { SelectableOption } from "./FormComponents/MultipleSelector";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import mainIcon from "../../assets/2026-03-06 NEW MyFamilii Header - ONLY Logo Black TAG line CROP.png";
import OutlookLogo from "../../assets/outlook-externalcal-icon.jpg";
import AppleLogo from "../../assets/apple-externalcal-icon.png";
import GoogleLogo from "../../assets/google-externalcal-icon.png";
import FacebookLogo from "../../assets/facebook-externalcal-icon.png";

interface ExternalCalendarLogos {
  name: string;
  logo: any;
  link: string;
}

const EXTERNAL_CALENDAR_LOGOS: ExternalCalendarLogos[] = [
  {
    name: "Outlook",
    logo: OutlookLogo?.src || OutlookLogo,
    link: "https://support.microsoft.com/en-us/office/introduction-to-publishing-calendars-06927a3c-b391-4475-a01c-6d9b4b0e9b2d",
  },
  {
    name: "iCal",
    logo: AppleLogo?.src || AppleLogo,
    link: "https://support.apple.com/en-in/guide/icloud/mm6b1a9479/1.0/icloud/1.0",
  },
  {
    name: "Google Calendar",
    logo: GoogleLogo?.src || GoogleLogo,
    link: "https://support.google.com/calendar/answer/37648?hl=en",
  },
  {
    name: "facebook",
    logo: FacebookLogo?.src || FacebookLogo,
    link: "https://www.facebook.com/help/www/152652248136178",
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
              <Image 
                src={mainIcon.src} 
                alt="MyFamilii" 
                width={200} 
                height={60} 
                className="object-contain max-h-[50px] mix-blend-multiply" 
              />
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

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 items-center gap-x-4 gap-y-4">
            {EXTERNAL_CALENDAR_LOGOS.map((item) => (
              <a
                key={item.name}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[44px] items-center justify-center transition-transform hover:scale-105 mix-blend-multiply"
                title={item.name}
              >
                <img
                  src={item.logo}
                  alt={item.name}
                  className="max-h-[40px] max-w-[100px] object-contain"
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
