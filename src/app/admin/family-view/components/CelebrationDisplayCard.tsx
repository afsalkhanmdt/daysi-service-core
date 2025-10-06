"use client";
import { UserEvent } from "@/app/types/familyMemberTypes";
import eventIcon from "../../assets/cake-svgrepo-com 1.svg";
import cakeIcon from "../../assets/birthdayeventdefaulticon.png";
import balloonIcon from "../../assets/anniversarydefault.png";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const CelebrationDisplayCard = ({
  mainEvent,
  imageUrl,
}: {
  mainEvent: UserEvent;
  imageUrl: string | undefined;
}) => {
  const { t } = useTranslation("common");
  const today = dayjs();
  const startDate = dayjs(Number(mainEvent.Start));

  // Normalize event date to this year or next year for display
  let normalizedDate = startDate.year(today.year());
  if (normalizedDate.isBefore(today, "day")) {
    normalizedDate = normalizedDate.add(1, "year");
  }

  const displayDate = normalizedDate.format("DD/MM/YYYY");

  // Correct age calculation for birthdays only
  let yearsOld = null;
  if (mainEvent.SpecialEvent === 0) {
    // Only calculate age for birthdays
    const birthDate = startDate;

    // Calculate age based on whether birthday has occurred this year
    yearsOld = today.year() - birthDate.year();

    // If birthday hasn't occurred yet this year, subtract 1
    const hasBirthdayOccurredThisYear =
      today.isAfter(birthDate.year(today.year()), "day") ||
      today.isSame(birthDate.year(today.year()), "day");

    if (!hasBirthdayOccurredThisYear) {
      yearsOld -= 1;
    }
  }

  const fallbackIcon =
    mainEvent.SpecialEvent === 0 ? cakeIcon.src : balloonIcon.src;

  return (
    <div className="grid gap-[0.25rem] p-[0.35rem] border rounded-lg border-slate-200">
      <div className="flex gap-[0.5rem]">
        <img
          className="rounded-full w-7 h-7"
          src={imageUrl || fallbackIcon}
          alt=""
        />
        <div className="flex justify-between flex-wrap w-full">
          <div className="grid gap-[0.35rem]">
            <div className="font-semibold text-base">
              {mainEvent.Title}{" "}
              {mainEvent.SpecialEvent === 0 ? t("Birthday") : t("Anniversary")}
            </div>
          </div>
          <div className="font-semibold">{displayDate}</div>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div className="text-stone-500 italic text-[10px] sm:text-sm">
          {mainEvent.SpecialEvent === 0 && yearsOld !== null && (
            <>
              {yearsOld}
              {t(`YearsOld`)}
            </>
          )}
        </div>
        <img className="w-6 h-6" src={eventIcon.src} alt="" />
      </div>
    </div>
  );
};

export default CelebrationDisplayCard;
