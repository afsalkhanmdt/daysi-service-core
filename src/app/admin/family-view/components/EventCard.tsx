"use client";
import Image from "next/image";
import eventIcon from "../../assets/cake-svgrepo-com 1.svg";
import dp from "../../assets/MyFamilii Brand Guide (1)-2 1.png";
import icon from "../../assets/try.jpg";

const imageArray = [icon.src, dp.src, eventIcon.src];

const EventCardUI = ({ eventInfo }: { eventInfo: any }) => {
  const start = eventInfo.event.start;
  const end = eventInfo.event.end;

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="h-full border-t-4 rounded-2xl border-sky-500 bg-white shadow-sm overflow-x-auto">
      <div className="flex flex-col flex-wrap gap-4 p-4 h-full">
        <div className="text-center py-1 px-2 bg-indigo-50 text-sky-500 w-fit text-[10px] rounded-[32px]">
          Event
        </div>
        <div className="grid gap-1">
          <div className="font-semibold text-lg text-black">
            {eventInfo.event.title}
          </div>
          <div className="font-normal text-sm text-stone-500">
            {formatTime(start)} - {formatTime(end)}
          </div>
        </div>
        <div className="flex flex-wrap justify-between w-full gap-2">
          <div className="flex -space-x-2 ">
            {imageArray.map((src, i) => (
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
          <div className="rounded-[4px] py-0.5 px-1.5 font-semibold text-sky-500 text-sm bg-slate-100 h-fit w-fit">
            {imageArray.length}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EventCardUI;
