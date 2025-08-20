"use client";
import CalendarView from "@/app/admin/family-view/components/CalendarView";
import CelebrationDisplayCard from "@/app/admin/family-view/components/CelebrationDisplayCard";
import PMDisplayCard from "./components/PMDisplayCard";
import Image from "next/image";
import mainIcon from "@/app/admin/assets/MyFamilii Brand Guide (1)-2 1.png";
import ToggleThemeAndLogout from "./components/ToggleThemeAndLogout";
import { FamilyResponse } from "@/app/types/familytypes";
import { MemberResponse } from "@/app/types/familyMemberTypes";
import { useFetch } from "@/app/hooks/useFetch";

export type FamilyData = {
  Family: FamilyResponse;
  Members: MemberResponse[];
};

export default function FamilyPage() {
  const {
    data: familyDetails,
    loading,
    error,
  } = useFetch<FamilyData>(
    "https://dev.daysi.dk/api/Families/GetAllFamilies?familyId=935"
  );

  console.log("Family Details:", familyDetails);

  const mainEvents =
    familyDetails?.Members.flatMap((member: any) =>
      member.Events.filter((event: any) => event.IsSpecialEvent === 1)
    ) ?? [];

  console.log("MainEvents:", mainEvents);

  return (
    <div className="flex w-screen h-screen py-3 pr-3 bg-white dark:bg-gray-800 transition-colors">
      {/* Sidebar */}
      <div
        className="
          flex flex-col flex-shrink 
          min-w-[140px] max-w-[300px] w-[30%] 
          bg-white dark:bg-gray-800 border-r dark:border-gray-700
          text-gray-800 dark:text-gray-100
        "
      >
        {/* Logo */}
        <div className="border-b border-slate-100 dark:border-gray-700 pb-3 grid place-items-center">
          <Image src={mainIcon.src} alt={"mainIcon"} width={120} height={48} />
        </div>

        {/* Celebration Section */}
        <div className="flex-1 min-h-0 flex flex-col border-b border-slate-100 dark:border-gray-700">
          <div className="p-3 text-base font-semibold grid place-content-center border-b dark:border-gray-700">
            Celebration’s Today 🎉
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid gap-2">
              {mainEvents.map((event, i) => (
                <CelebrationDisplayCard key={i} mainEvent={event} />
              ))}
            </div>
          </div>
        </div>

        {/* Pocket Money Section */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="p-3 text-base font-semibold grid place-content-center border-b dark:border-gray-700">
            Pocket Money 💸
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid gap-2">
              {familyDetails?.Members.filter(
                (member) => member.PocketMoneyUser === true
              ).map((member, i) => (
                <PMDisplayCard key={i} memberDetails={member} />
              ))}
            </div>
          </div>
        </div>

        <ToggleThemeAndLogout />
      </div>

      {/* Calendar */}
      <div className="flex-1 min-w-0 h-full">
        {familyDetails ? (
          <CalendarView data={familyDetails} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-xs">
            No data available.
          </div>
        )}
      </div>
    </div>
  );
}
