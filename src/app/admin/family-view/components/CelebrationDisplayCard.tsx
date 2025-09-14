import { UserEvent } from "@/app/types/familyMemberTypes";
import eventIcon from "../../assets/cake-svgrepo-com 1.svg";
import cakeIcon from "../../assets/birthdayeventdefaulticon.png";
import balloonIcon from "../../assets/anniversarydefault.png";
import dayjs from "dayjs";

const CelebrationDisplayCard = ({
  mainEvent,
  imageUrl,
}: {
  mainEvent: UserEvent;
  imageUrl: string | undefined;
}) => {
  const startDate = dayjs(Number(mainEvent.Start));
  const startTime = startDate.format("hh:mm A");
  const endTime = dayjs(Number(mainEvent.End)).format("hh:mm A");

  // calculate age properly (only after birthday has passed this year)
  let yearsOld = dayjs().year() - startDate.year();
  const hasBirthdayPassed = dayjs().isAfter(
    startDate.month(dayjs().month()).date(startDate.date())
  );
  if (!hasBirthdayPassed) {
    yearsOld -= 1;
  }

  const displayDate = startDate.year(dayjs().year()).format("DD/MM/YYYY");

  const fallbackIcon =
    mainEvent.SpecialEvent === 0 ? cakeIcon.src : balloonIcon.src;

  return (
    <div className="grid gap-[0.25rem] p-[0.35rem] border rounded-lg border-slate-200">
      <div className="flex gap-[0.5rem] ">
        {imageUrl ? (
          <img className="rounded-full w-7 h-7" src={imageUrl} alt="" />
        ) : (
          <img className="w-7 h-7" src={fallbackIcon} alt="" />
        )}
        <div className="flex justify-between flex-wrap w-full">
          <div className="grid gap-[0.35rem]">
            <div className="font-semibold text-base">
              {mainEvent.Title}
              {mainEvent.SpecialEvent === 0 ? "BirthDay" : "Anniversary"}
            </div>
            {/* <div className="font-normal text-[10px] text-stone-500">
            {startTime} - {endTime}
          </div> */}
          </div>
          <div className="font-semibold">{displayDate}</div>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div className="text-stone-500 italic text-[10px]">
          {yearsOld} years old
        </div>
        <img className="w-6 h-6" src={eventIcon.src} alt="" />
      </div>
    </div>
  );
};

export default CelebrationDisplayCard;
