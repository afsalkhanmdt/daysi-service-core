"use client";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const EventCardUI = ({
  eventInfo,
  participantImages,
}: {
  eventInfo: any;
  participantImages: string[];
}) => {
  const start: Date = eventInfo.event.start;
  const end: Date = eventInfo.event.end;

  const { t } = useTranslation("common");

  // Format using local timezone (browser locale)
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="h-full border-t-4 rounded-xl border-sky-500 bg-white shadow-sm overflow-auto min-h-32">
      <div className="flex flex-col sm:gap-1 p-1 h-full">
        <div className="text-center py-0.5 px-1.5 md:py-1 md:px-2 bg-indigo-50 text-sky-500 w-fit text-[7px] text-xs rounded-2xl">
          {t("Event")}
        </div>
        <div className="grid">
          <div className="font-semibold text-[13px] md:text-sm text-black">
            {eventInfo.event.title}
          </div>
          <div className="font-normal text-[9px] md:text-xs text-stone-500">
            <div className="text-[9px] md:text-xs text-stone-500">
              {formatTime(start)} - {formatTime(end)}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-between max-w-full gap-1.5 md:gap-3">
          <div className="flex -space-x-1.5">
            {participantImages.map((src, i) => (
              <Image
                key={i}
                src={src}
                alt={`avatar-${i}`}
                width={22}
                height={22}
                className="rounded-full border-[1.4px] border-white"
              />
            ))}
          </div>
          <div className="hidden sm:block rounded-[3px] py-0.5 px-1 text-sky-500 text-[9px] font-semibold bg-slate-100 h-fit w-fit">
            {participantImages.length}
          </div>
        </div>
        <div className="text-black text-xs font-semibold">
          {eventInfo.event.extendedProps.ExternalCalendarName}
        </div>
      </div>
    </div>
  );
};
export default EventCardUI;
