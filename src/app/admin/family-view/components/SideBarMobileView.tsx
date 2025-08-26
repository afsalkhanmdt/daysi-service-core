import { MemberResponse } from "@/app/types/familyMemberTypes";
import CelebrationDisplayCard from "./CelebrationDisplayCard";
import PMDisplayCard from "./PMDisplayCard";

import dp from "@/app/admin/assets/try.jpg";
import { FamilyData } from "./FamilyViewWrapper";
import dayjs from "dayjs";

const SideBarMobileView = ({
  familyDetails,
  currentDate,
}: {
  familyDetails: FamilyData;
  currentDate: dayjs.Dayjs;
}) => {
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

  console.log("mainEvents", mainEvents);

  const selectedDaysEvents =
    uniqueEvents?.filter((event) => {
      const eventStart = dayjs(Number(event.Start));
      const eventEnd = dayjs(Number(event.End));

      const normalizedEventStart = eventStart.year(currentDate.year());
      const normalizedEventEnd = eventEnd.year(currentDate.year());

      const dayStart = currentDate.startOf("day");
      const dayEnd = currentDate.endOf("day");

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
            {selectedDaysEvents.map((event, i) => (
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
  );
};
export default SideBarMobileView;
