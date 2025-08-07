import Image from "next/image";
import eventIcon from "./assets/cake-svgrepo-com 1.svg";
import dp from "./assets/try.jpg";
import icon from "./assets/MyFamilii Brand Guide (1)-2 1.png";

const EventCardUI = ({ eventInfo }: { eventInfo: any }) => {
  return (
    <div className="grid gap-1 p-2 border-t-4 rounded-2xl border-sky-500 bg-white shadow-sm">
      <div className="text-center py-1 px-2 bg-indigo-50 text-sky-500 w-fit text-[10px] rounded-[32px]">
        Event
      </div>
      <div className="grid gap-2">
        <div className="font-semibold text-lg">{eventInfo.event.title}</div>
        <div className="font-normal text-sm text-stone-500">
          {eventInfo.timeText}
        </div>
      </div>
      <div className="flex -space-x-2">
        {[icon.src, dp.src, eventIcon.src].map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={`avatar-${i}`}
            width={32}
            height={32}
            className="rounded-full border-2 border-white"
          />
        ))}
      </div>
    </div>
  );
};
export default EventCardUI;
