"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Image from "next/image";

import CalendarView from "@/app/admin/family-view/components/CalendarView";
import CelebrationDisplayCard from "@/app/admin/family-view/components/CelebrationDisplayCard";
import PMDisplayCard from "./PMDisplayCard";
import ToggleThemeAndLogout from "./ToggleThemeAndLogout";

import mainIcon from "@/app/admin/assets/MyFamilii Brand Guide (1)-2 1.png";
import dp from "@/app/admin/assets/try.jpg";

import { useFetch } from "@/app/hooks/useFetch";
import { FamilyResponse } from "@/app/types/familytypes";
import { MemberResponse } from "@/app/types/familyMemberTypes";

import { useTranslation } from "react-i18next";
import i18next from "i18next";
import "../../../../../i18n";

export type FamilyData = {
  Family: FamilyResponse;
  Members: MemberResponse[];
};

const FamilyViewWrapper = ({
  familyId,
  userId,
}: {
  familyId: string;
  userId?: string;
}) => {
  const { data: familyDetails, reload } = useFetch<FamilyData>(
    `Families/GetAllFamilies?familyId=${familyId}`
  );

  console.log(familyDetails, "familyDetails");

  // Example: Access language property if it exists in FamilyResponse
  const userLanguage = familyDetails?.Members?.find(
    (m) => m.MemberId === userId
  )?.Locale;

  // const userLanguage = "en";

  const [currentDate, setCurrentDate] = useState(new Date());

  const { t } = useTranslation("common");

  const [isLangReady, setIsLangReady] = useState(false);

  useEffect(() => {
    if (userLanguage) {
      i18next.changeLanguage(userLanguage).then(() => setIsLangReady(true));
    }
  }, [userLanguage]);

  if (!familyDetails || !isLangReady) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading your data...
      </div>
    );
  }

  const mainEvents =
    familyDetails?.Members.flatMap((member: MemberResponse) =>
      member.Events.filter((event: any) => event.IsSpecialEvent === 1)
    ) ?? [];

  const uniqueEvents = mainEvents.filter((event, index, self) => {
    return (
      index ===
      self.findIndex(
        (e) =>
          e.Start === event.Start &&
          e.End === event.End &&
          e.EventPerson === event.EventPerson &&
          e.IsSpecialEvent === event.IsSpecialEvent
      )
    );
  });

  const selectedDaysEvents =
    uniqueEvents?.filter((event) => {
      const normalizedEventStart = dayjs(event.Start).year(
        dayjs(currentDate).year()
      );
      const normalizedEventEnd = dayjs(event.End).year(
        dayjs(currentDate).year()
      );

      const dayStart = dayjs(currentDate).startOf("day");
      const dayEnd = dayjs(currentDate).endOf("day");

      return (
        normalizedEventStart.isBefore(dayEnd) &&
        normalizedEventEnd.isAfter(dayStart)
      );
    }) || [];

  const imageUrls = familyDetails?.Members.reduce(
    (acc: Record<string, string>, member) => {
      acc[member.FirstName] = member.ResourceUrl || dp.src;
      return acc;
    },
    {}
  );

  return (
    <div className="sm:flex w-screen h-screen sm:py-3 sm:px-3 bg-white dark:bg-gray-800 transition-colors">
      {/* Sidebar */}
      <div className="hidden sm:flex flex-col min-w-[140px] max-w-[300px] w-[30%] bg-white dark:bg-gray-800 border-r dark:border-gray-700 text-gray-800 dark:text-gray-100">
        <div className="border-b border-slate-100 dark:border-gray-700 pb-3 grid place-items-center">
          <Image src={mainIcon.src} alt="mainIcon" width={120} height={48} />
        </div>

        {/* Celebrations */}
        <div className="flex-1 min-h-0 flex flex-col border-b border-slate-100 dark:border-gray-700">
          <div className="p-3 text-base font-semibold grid place-content-center border-b dark:border-gray-700">
            {t("Celebrations")}
          </div>
          {selectedDaysEvents.length > 0 ? (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid gap-2">
                {selectedDaysEvents.map((event, i) => (
                  <CelebrationDisplayCard
                    key={i}
                    mainEvent={event}
                    imageUrl={imageUrls[event.EventPerson]}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2 border-t-4 rounded-xl m-2 border-gray-300 bg-white shadow-sm flex items-center justify-center h-20 text-gray-500 italic">
              {t("NoSpecialEvents")}
            </div>
          )}
        </div>

        {/* Pocket Money */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="p-3 text-base font-semibold grid place-content-center border-b dark:border-gray-700">
            {t("PocketMoney")}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid gap-2">
              {familyDetails.Members.filter((m) => m.PocketMoneyUser)
                .sort((a, b) => b.AmountEarned - a.AmountEarned)
                .map((member, i) => (
                  <PMDisplayCard key={i} memberDetails={member} />
                ))}
            </div>
          </div>
        </div>

        <ToggleThemeAndLogout reload={reload} />
      </div>

      <div className="sm:hidden w-full flex justify-between p-2">
        <div className="grid place-items-center">
          <Image src={mainIcon.src} alt="mainIcon" width={120} height={48} />
        </div>
        <ToggleThemeAndLogout reload={reload} />
      </div>

      {/* Calendar */}
      <div className="flex-1 min-w-0 sm:h-full">
        <CalendarView
          data={familyDetails}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      </div>
    </div>
  );
};

export default FamilyViewWrapper;
