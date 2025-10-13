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

  console.log("eventInfo", eventInfo.event);

  const { t } = useTranslation("common");

  // Format using local timezone (browser locale)
  const formatTime = (date?: Date | null) => {
    if (!date) return ""; // or return something like "N/A"
    return date.toLocaleTimeString(navigator.language, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
              className="rounded-full w-7 h-7 "
              alt={"lockIcon"}
            />
          )}
        </div>
        <div className="grid">
          <div className="font-semibold text-[13px] sm:text-sm text-black">
            {eventInfo.event.extendedProps.IsPrivateEvent === 1
              ? `${t("Private")}.....`
              : eventInfo.event.title}
          </div>
          <div className="flex sm:gap-2 items-center">
            <div className="text-[9px] sm:text-sm text-stone-500">
              {start && end
                ? `${formatTime(start)} - ${formatTime(end)}`
                : start
                ? formatTime(start)
                : end
                ? formatTime(end)
                : ""}
            </div>
            <div className="text-[9px] sm:text-xs text-black break-all ">
              {eventInfo.event.location}
            </div>
          </div>
          <div className="text-[9px] sm:text-xs font-medium text-black line-clamp-1  break-all truncate">
            {eventInfo.event.extendedProps.IsPrivateEvent === 1
              ? `${t("Private")}.....`
              : eventInfo.event.extendedProps.description}
          </div>
        </div>
        <div className="flex flex-wrap justify-between max-w-full gap-1.5 sm:gap-3">
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex gap-1 overflow-hidden">
              {participantImages.slice(0, 4).map((src, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 transition-all duration-200 ${
                    i > 0 ? "ml-[-4px]" : ""
                  }`}
                  style={{
                    zIndex: participantImages.length - i,
                  }}
                >
                  <Image
                    src={src}
                    alt={`avatar-${i}`}
                    width={22}
                    height={22}
                    className="w-10 h-10 rounded-full border-2 border-white bg-white shadow-sm shadow-gray-200 hover:z-10 hover:scale-110 transition-transform"
                  />
                </div>
              ))}
            </div>

            {/* Show count badge if there are many participants */}
            {participantImages.length > 4 && (
              <div className="flex-shrink-0 ml-1 bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 text-[10px] font-medium border border-gray-300">
                +{participantImages.length - 4}
              </div>
            )}
          </div>
          <div className="text-black text-xs font-semibold grid place-items-center truncate flex-shrink-0">
            {eventInfo.event.extendedProps.ExternalCalendarName}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EventCardUI;
