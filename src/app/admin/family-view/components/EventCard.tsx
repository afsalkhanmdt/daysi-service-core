"use client";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import lockIcon from "@/app/admin/assets/EventPrivateIcon.jpg";

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
    <div
      className={`h-full border-t-4 rounded-xl border-sky-500 ${
        eventInfo.event.extendedProps.ExternalCalendarName
          ? "bg-slate-200"
          : "bg-white"
      }  shadow-sm overflow-auto min-h-32 w-full max-w-96`}
    >
      <div className="flex flex-col sm:gap-1 p-1 h-full">
        <div className="flex justify-between items-center">
          <div className="text-center py-0.5 px-1.5 sm:py-1 sm:px-2 bg-indigo-50 text-sky-500 w-fit text-[7px] text-xs rounded-2xl">
            {t("Event")}
          </div>
          {eventInfo.event.extendedProps.IsPrivateEvent === 1 && (
            <Image
              src={lockIcon.src}
              width={22}
              height={22}
              className="rounded-full w-6 h-6 "
              alt={"lockIcon"}
            />
          )}
        </div>
        <div className="grid">
          <div className="font-semibold text-[13px] sm:text-sm text-black">
            {eventInfo.event.title}
          </div>
          <div className="flex sm:gap-2 items-center">
            <div className="text-[9px] sm:text-xs text-stone-500">
              {formatTime(start)} - {formatTime(end)}
            </div>
            <div className="text-[9px] sm:text-xs text-black break-all ">
              {eventInfo.event.location}
            </div>
          </div>
          <div className="text-[9px] sm:text-xs font-medium text-black line-clamp-1  break-all truncate">
            {eventInfo.event.description}
          </div>
        </div>
        <div className="flex flex-wrap justify-between max-w-full gap-1.5 sm:gap-3">
          <div className="flex -space-x-1.5">
            {participantImages.map((src, i) => (
              <Image
                key={i}
                src={src}
                alt={`avatar-${i}`}
                width={22}
                height={22}
                className="rounded-full w-8 h-8 border-[1.4px] border-white"
              />
            ))}
          </div>
          <div className="text-black text-xs font-semibold grid place-items-center truncate">
            {eventInfo.event.extendedProps.ExternalCalendarName}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EventCardUI;
