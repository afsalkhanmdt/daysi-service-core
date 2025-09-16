"use client";
import Image from "next/image";
import { useRef, useEffect } from "react";
import dayjs from "dayjs";
import { FamilyData } from "./FamilyViewWrapper";

type resourcesType = {
  id: any;
  title: any;
  image: any;
  sortOrder: number;
}[];

const MobileEventAndScrollBar = ({
  resources,
  familyData,
  currentDate,
  selectedMember,
  setSelectedMember,
}: {
  resources: resourcesType;
  familyData: FamilyData;
  currentDate: Date;
  selectedMember?: number;
  setSelectedMember: (id: number) => void;
}) => {
  const memberRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const memberEvents = familyData.Members.find(
    (member) => member.Id === selectedMember
  )?.Events;

  // Normalize events -> convert Start/End into Date type
  const normalizedEvents =
    memberEvents?.map((event) => ({
      ...event,
      Start: new Date(Number(event.Start)),
      End: new Date(Number(event.End)),
    })) || [];

  // Filter events for the selected day
  const selectedDaysEvents = normalizedEvents.filter((event) => {
    const eventStart = dayjs(event.Start);
    const eventEnd = dayjs(event.End);

    const dayStart = dayjs(currentDate).startOf("day");
    const dayEnd = dayjs(currentDate).endOf("day");

    return eventStart.isBefore(dayEnd) && eventEnd.isAfter(dayStart);
  });

  // scroll selected member into view
  useEffect(() => {
    if (selectedMember !== undefined) {
      const el = memberRefs.current[selectedMember];
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [selectedMember]);

  return (
    <div>
      {/* Scrollable members bar */}
      <div className="flex gap-2 p-3 sm:hidden overflow-x-auto scroll-smooth">
        {resources.map((res) => (
          <div
            ref={(el) => {
              memberRefs.current[res.id] = el;
            }}
            onClick={() => setSelectedMember(res.id)}
            key={res.id}
            className={`flex items-center gap-1 min-w-32 ${
              selectedMember == res.id ? "bg-sky-500 text-white" : "bg-white"
            } rounded-full shadow-md px-1 py-1 hover:shadow-lg transition`}
          >
            <Image
              src={res.image || "/fallback.png"}
              alt={res.title}
              width={32}
              height={32}
              className="rounded-full border w-8 h-8"
            />
            <span className="text-sm font-semibold truncate w-full">
              {res.title}
            </span>
          </div>
        ))}
      </div>

      {/* Selected member events */}
      <div className="sm:hidden grid gap-2 sm:gap-4 bg-blue-100">
        {!selectedMember ? (
          <div className="p-2 border-t-4 rounded-xl m-2 border-gray-300 bg-white shadow-sm flex items-center justify-center h-20 text-gray-500 italic">
            No member selected.
          </div>
        ) : selectedDaysEvents.length > 0 ? (
          <div className="grid gap-2 bg-blue-100 m-2">
            {selectedDaysEvents.map((event) => (
              <div
                key={event.Id}
                className="border-t-4 rounded-xl border-sky-500 bg-white shadow-sm overflow-auto"
              >
                <div className="flex flex-col p-3 h-full w-full">
                  <div className="text-center py-0.5 px-1.5 bg-indigo-50 text-sky-500 w-fit text-[7px] text-xs rounded-2xl">
                    Event
                  </div>
                  <div className="grid">
                    <div className="font-semibold text-md text-black">
                      {event.Title}
                    </div>
                    <div className="font-normal text-[9px] md:text-xs text-stone-500">
                      <div className="text-sm text-stone-500">
                        {dayjs(event.Start).format("HH:mm")} -{" "}
                        {dayjs(event.End).format("HH:mm")}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-between max-w-full gap-2">
                    <div className="flex -space-x-2">
                      {familyData.Members.filter((m) =>
                        event.Attendee?.includes(m.Email)
                      ).map((participant) => (
                        <Image
                          key={participant.Id}
                          src={participant.ResourceUrl || "/fallback.png"}
                          alt={participant.MemberName}
                          width={22}
                          height={22}
                          className="rounded-full border-2 border-white"
                        />
                      ))}
                    </div>
                    <div className="rounded-xs py-0.5 px-1 text-sky-500 text-[9px] font-semibold bg-slate-100 h-fit w-fit">
                      {event.Attendee?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 border-t-4 rounded-xl bg-blue-100 border-gray-300 shadow-sm flex items-center justify-center h-20 text-gray-500 italic">
            No events for the selected day for the selected member.
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileEventAndScrollBar;
