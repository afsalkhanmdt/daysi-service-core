"use client";
import Image from "next/image";
import calIcon from "@/app/admin/assets/calendar-minimalistic-svgrepo-com (4) 1.svg";
import {
  useEffect,
  useRef,
  useState,
  RefObject,
  Dispatch,
  SetStateAction,
} from "react";
import dayjs from "dayjs";
import "dayjs/locale/da";
import "dayjs/locale/sv";
import "dayjs/locale/nb";
import { useTranslation } from "react-i18next";
import Holidays from "@/app/holiday.json";

interface HolidayEvent {
  EventName: string;
  EventStartDate: string;
}

interface LanguageEventList {
  Language: string;
  Events: HolidayEvent[];
}

interface CountryHolidays {
  Country: string;
  LanguageEventList: LanguageEventList[];
}

interface Holiday {
  date: string;
  name: string;
}

const DateScrollAndDisplay = ({
  familyName,
  calendarRef,
  currentDate,
  setCurrentDate,
  country = "dk", // Default to Denmark, can be "dk" or "uk"
  holidaysData = Holidays as unknown as CountryHolidays[], // Use the full JSON data
}: {
  familyName: string;
  calendarRef: RefObject<any>;
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  country?: string; // Country code: "dk" or "uk"
  holidaysData?: CountryHolidays[]; // The full JSON data structure
}) => {
  const { t, i18n } = useTranslation("common");
  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Sync dayjs locale with current i18n language
  useEffect(() => {
    dayjs.locale(i18n.language);
  }, [i18n.language]);

  // Function to get holidays for current country and language
  const getFilteredHolidays = (): Holiday[] => {
    // Find the country data
    const countryData = holidaysData.find((c) => c.Country === country);
    if (!countryData) return [];

    // Get current language code (map i18n language to your data language codes)
    const currentLang = i18n.language === "da" ? "da" : "en"; // Add more mappings as needed

    // Find the language data
    const languageData = countryData.LanguageEventList.find(
      (lang) => lang.Language === currentLang
    );
    if (!languageData) return [];

    // Transform to the format expected by the component
    return languageData.Events.map((event) => ({
      date: event.EventStartDate,
      name: event.EventName,
    }));
  };

  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>(
    getFilteredHolidays()
  );

  // Update filtered holidays when language or country changes
  useEffect(() => {
    setFilteredHolidays(getFilteredHolidays());
  }, [i18n.language, country, holidaysData]);

  const getDaysInMonth = (date: Date) => {
    const start = dayjs(date).startOf("month");
    const end = dayjs(date).endOf("month");
    const days: Date[] = [];
    for (
      let d = start;
      d.isBefore(end) || d.isSame(end, "day");
      d = d.add(1, "day")
    ) {
      days.push(d.toDate());
    }
    return days;
  };

  const [visibleDays, setVisibleDays] = useState<Date[]>(
    getDaysInMonth(currentDate)
  );

  // Function to check if a date is a holiday
  const getHolidayForDate = (date: Date): Holiday | undefined => {
    const dateString = dayjs(date).format("YYYY-MM-DD");
    return filteredHolidays.find((holiday) => holiday.date === dateString);
  };

  // Function to get day background color based on holiday status
  const getDayBackgroundColor = (
    date: Date,
    isCurrentDate: boolean
  ): string => {
    const holiday = getHolidayForDate(date);

    if (isCurrentDate) {
      return holiday ? "bg-red-600 text-white" : "bg-blue-500 text-white";
    }

    return holiday
      ? "bg-red-100 hover:bg-red-300"
      : "bg-blue-100 hover:bg-blue-300";
  };

  const scrollToDay = (date: Date) => {
    const key = dayjs(date).format("YYYY-MM-DD");
    const el = dayRefs.current[key];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const handleDayClick = (date: Date) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.gotoDate(date);
    calendarApi?.changeView("resourceTimeGridDay");
    setCurrentDate(date);
    scrollToDay(date);
  };

  const goToMonth = (date: Date) => {
    const firstDay = dayjs(date).startOf("month").toDate();
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.gotoDate(firstDay);
    calendarApi?.changeView("resourceTimeGridDay");
    setCurrentDate(firstDay);
    setVisibleDays(getDaysInMonth(date));
    setTimeout(() => scrollToDay(firstDay), 50);
  };

  const handleNextMonth = () =>
    goToMonth(dayjs(currentDate).add(1, "month").toDate());
  const handlePrevMonth = () =>
    goToMonth(dayjs(currentDate).subtract(1, "month").toDate());
  const handleToday = () => {
    const today = new Date();
    const firstDay = dayjs(today).startOf("day").toDate();
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.gotoDate(firstDay);
    calendarApi?.changeView("resourceTimeGridDay");
    setCurrentDate(firstDay);
    setVisibleDays(getDaysInMonth(firstDay));
    setTimeout(() => scrollToDay(firstDay), 50);
  };

  useEffect(() => {
    scrollToDay(currentDate);
  }, [currentDate]);

  return (
    <div className="bg-white p-2 m-2 rounded-xl gap-2 sm:gap-4 grid sm:mb-4">
      {/* Month Navigation */}
      <div className="w-full flex justify-between gap-1 sm:gap-1.5 ">
        <div className="flex gap-1 sm:gap-1.5  justify-center items-center">
          <Image
            src={calIcon.src}
            alt="calendar icon"
            width={20}
            height={20}
            priority
            className="w-4 h-4 sm:w-6 sm:h-6 "
          />
          <div className="grid place-items-center text-lg sm:text-xl font-semibold">
            {familyName}
          </div>
        </div>

        <div className="grid place-items-center sm:flex sm:items-center gap-2 sm:gap-1.5 ">
          <button
            onClick={handleToday}
            className="hidden sm:block ml-2 px-3 py-1.5 rounded-lg bg-emerald-400 text-white hover:bg-emerald-600 text-sm font-semibold"
          >
            {t("Today")}
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold rounded bg-slate-100 text-zinc-600 hover:bg-slate-300"
            >
              &lt;
            </button>
            <div className="font-semibold text-sm sm:text-lg text-center sm:w-40 w-32">
              {dayjs(currentDate).format("MMMM YYYY")}
            </div>
            <button
              onClick={handleNextMonth}
              className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold rounded bg-slate-100 text-zinc-600 hover:bg-slate-300"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Days Bar */}
      <div className="mb-2 py-2 flex gap-0.5 overflow-x-auto max-w-full scroll-smooth">
        {visibleDays.map((day) => {
          const holiday = getHolidayForDate(day);
          const isCurrentDate = dayjs(day).isSame(currentDate, "day");
          const backgroundColor = getDayBackgroundColor(day, isCurrentDate);

          return (
            <button
              key={dayjs(day).format("YYYY-MM-DD")}
              ref={(el) => {
                dayRefs.current[dayjs(day).format("YYYY-MM-DD")] = el;
              }}
              className={`flex flex-col items-center justify-center px-0.5 py-1 sm:px-1.5 sm:py-2 rounded-xl min-w-20 sm:min-w-28 relative ${backgroundColor}`}
              onClick={() => handleDayClick(day)}
            >
              {/* Holiday Specialty Badge */}
              {holiday?.name && (
                <div className="absolute -top-2  bg-yellow-500 text-white text-xs px-1 py-0.5 rounded-full max-w-28 mx-auto truncate">
                  {holiday.name}
                </div>
              )}

              {/* Day of week */}
              <div className="text-xs sm:text-sm font-normal">
                {dayjs(day).format("dddd")}
              </div>

              {/* Date number */}
              <div className="text-2xl sm:text-3xl font-bold">
                {dayjs(day).format("D")}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateScrollAndDisplay;
