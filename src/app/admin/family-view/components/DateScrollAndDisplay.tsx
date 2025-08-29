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

const DateScrollAndDisplay = ({
  calendarRef,
  currentDate,
  setCurrentDate,
}: {
  calendarRef: RefObject<any>;
  currentDate: dayjs.Dayjs;
  setCurrentDate: Dispatch<SetStateAction<dayjs.Dayjs>>;
}) => {
  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // Generate all days in month
  const getDaysInMonth = (date: dayjs.Dayjs) => {
    const start = date.startOf("month");
    const end = date.endOf("month");
    const days: dayjs.Dayjs[] = [];
    for (
      let d = start;
      d.isBefore(end) || d.isSame(end, "day");
      d = d.add(1, "day")
    ) {
      days.push(d);
    }
    return days;
  };
  const [visibleDays, setVisibleDays] = useState(getDaysInMonth(currentDate));

  const scrollToDay = (date: dayjs.Dayjs) => {
    const key = date.format("YYYY-MM-DD");
    const el = dayRefs.current[key];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const handleDayClick = (date: dayjs.Dayjs) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.gotoDate(date.toDate());
    calendarApi?.changeView("resourceTimeGridDay");
    setCurrentDate(date);
    scrollToDay(date);
  };

  const goToMonth = (date: dayjs.Dayjs) => {
    const calendarApi = calendarRef.current?.getApi();
    const firstDay = date.startOf("month");
    calendarApi?.gotoDate(firstDay.toDate());
    calendarApi?.changeView("resourceTimeGridDay");
    setCurrentDate(firstDay);
    setVisibleDays(getDaysInMonth(date));
    setTimeout(() => scrollToDay(firstDay), 50);
  };

  const handleNextMonth = () => goToMonth(currentDate.add(1, "month"));
  const handlePrevMonth = () => goToMonth(currentDate.subtract(1, "month"));
  const handleToday = () => {
    const today = dayjs();
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.gotoDate(today.toDate());
    calendarApi?.changeView("resourceTimeGridDay");
    setCurrentDate(today);
    setVisibleDays(getDaysInMonth(today));
    setTimeout(() => scrollToDay(today), 50);
  };

  useEffect(() => {
    scrollToDay(currentDate);
  }, []);
  return (
    <div className="bg-white p-2 m-2 rounded-xl gap-2 sm:gap-4 grid sm:mb-4">
      {/* Month Navigation */}
      <div className="first-letter:w-full flex justify-between gap-1 sm:gap-1.5 ">
        <div className="flex gap-1 sm:gap-1.5  justify-center items-center">
          <Image
            src={calIcon.src}
            alt="calendar icon"
            width={20}
            height={20}
            priority
            className="w-4 h-4 sm:w-6 sm:h-6 "
          />
          <div className="grid  place-items-center text-lg sm:text-xl font-semibold">
            family name
          </div>
        </div>

        <div className="grid place-items-center sm:flex sm:items-center gap-1 sm:gap-1.5 ">
          <button
            onClick={handleToday}
            className="hidden sm:block ml-2 px-3 py-1.5 rounded-lg bg-emerald-400 text-white hover:bg-emerald-600 text-sm font-semibold"
          >
            Today
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className=" px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold rounded bg-slate-100 text-zinc-600 hover:bg-slate-300"
            >
              &lt;
            </button>
            <div className="font-semibold text-sm sm:text-lg text-center">
              {currentDate.format("MMMM YYYY")}
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
      <div className="mb-2 flex gap-0.5 overflow-x-auto max-w-full scroll-smooth">
        {visibleDays.map((day) => (
          <button
            key={day.format("YYYY-MM-DD")}
            ref={(el) => {
              dayRefs.current[day.format("YYYY-MM-DD")] = el;
            }}
            className={`flex flex-col items-center justify-center px-0.5 py-1  sm:px-1.5 sm:py-2 rounded-xl min-w-20 sm:min-w-28 ${
              day.isSame(currentDate, "day")
                ? "bg-blue-500 text-white"
                : "bg-blue-100 hover:bg-blue-300"
            }`}
            onClick={() => handleDayClick(day)}
          >
            <div className="text-xs sm:text-sm font-normal">
              {day.format("dddd")}
            </div>
            <div className="text-26xl sm:text-3xl font-bold">
              {day.format("D")}
            </div>
          </button>
        ))}
      </div>
      {/* Scrollable Days Bar */}
    </div>
  );
};
export default DateScrollAndDisplay;
