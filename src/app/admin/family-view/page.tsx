"use client";
import CalendarView from "@/app/admin/family-view/components/CalendarView";
import CelebrationDisplayCard from "@/app/admin/family-view/components/CelebrationDisplayCard";
import PMDisplayCard from "./components/PMDisplayCard";
import Image from "next/image";
import mainIcon from "@/app/admin/assets/MyFamilii Brand Guide (1)-2 1.png";
import dp from "@/app/admin/assets/try.jpg";
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
    familyDetails?.Members.flatMap((member: MemberResponse) =>
      member.Events.filter((event: any) => event.IsSpecialEvent === 1)
    ) ?? [];

  const imageUrls = familyDetails?.Members.reduce(
    (acc: Record<string, string>, member) => {
      acc[member.FirstName] = member.ResourceUrl || dp.src;
      return acc;
    },
    {}
  );

  return (
    <div className="sm:flex w-screen h-screen sm:py-3 sm:pr-3 sm:pl-3  bg-white dark:bg-gray-800 transition-colors">
      {/* Sidebar */}
      <div
        className="
          hidden sm:flex flex-col flex-shrink 
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
                <CelebrationDisplayCard
                  key={i}
                  mainEvent={event}
                  imageUrl={imageUrls?.[event.EventPerson]}
                />
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
      <div className="sm:hidden w-full  flex justify-between p-2">
        <div className="  grid place-items-center  sm:px-0 sm:py-0 ">
          <Image src={mainIcon.src} alt={"mainIcon"} width={120} height={48} />
        </div>
        <ToggleThemeAndLogout />
      </div>

      {/* Calendar */}
      <div className="flex-1 min-w-0 sm:h-full">
        {familyDetails ? (
          <CalendarView data={familyDetails} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-xs">
            No data available.
          </div>
        )}
      </div>
      <div
        className="
          bg-white dark:bg-gray-800 border-r dark:border-gray-700
          text-gray-800 dark:text-gray-100 sm:hidden"
      >
        <div className=" border-b border-slate-100 dark:border-gray-700">
          <div className="p-3 text-base font-semibold grid place-content-center border-b dark:border-gray-700">
            Celebration’s Today 🎉
          </div>
          <div className="flex-1 overflow-y-auto p-3 max-h-40">
            <div className="grid gap-2">
              {mainEvents.map((event, i) => (
                <CelebrationDisplayCard
                  key={i}
                  mainEvent={event}
                  imageUrl={imageUrls?.[event.EventPerson]}
                />
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
      </div>
    </div>
  );
}
