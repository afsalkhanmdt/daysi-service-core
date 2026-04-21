"use client";
import dayjs from "dayjs";
import Image from "next/image";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import dp from "@/app/admin/assets/MyFamilii Brand Guide (1)-2 1.png";
import { FamilyData } from "./FamilyViewWrapper";
import { MemberResponse } from "@/app/types/familyMemberTypes";

const AllDayEventsRow = ({
  data,
  currentDate,
  onEventClick,
}: {
  data: FamilyData;
  currentDate: Date;
  onEventClick?: (event: any) => void;
}) => {
  const { t } = useTranslation("common");

  // Map to get member images by ID
  const memberImageMap = useMemo(() => {
    const map: Record<string, string> = {};
    data.Members.forEach((m) => {
      map[String(m.Id)] = m.ResourceUrl || dp.src;
      map[m.MemberId] = m.ResourceUrl || dp.src;
    });
    return map;
  }, [data.Members]);

  // Extract unique all-day events for the selected date
  const uniqueAllDayEvents = useMemo(() => {
    const selectedDate = dayjs(currentDate).startOf("day");
    const selectedDateStr = selectedDate.format("YYYY-MM-DD");
    const eventMap = new Map<string, any>();

    data.Members.forEach((member: MemberResponse) => {
      member.Events.forEach((event) => {
        // Must be an all-day event
        if (Number(event.IsAllDayEvent) !== 1) return;

        // Apply same filtering as CalendarView
        if (
          member.MemberType === 1 &&
          event.EventParticipant?.length !== data.Members.length - 1
        ) {
          return;
        }

        if (
          member.MemberType !== 1 &&
          event.EventParticipant?.length === data.Members.length - 1
        ) {
          return;
        }

        let isMatch = false;
        
        // Basic check for non-recurring events
        if (!event.RecurrenceRule || event.RecurrenceRule.Frequency === 0) {
            const eventStart = dayjs(Number(event.Start)).format("YYYY-MM-DD");
            isMatch = eventStart === selectedDateStr;
        } else {
            // For recurring events
            let currentStart = dayjs(Number(event.Start));
            const repeatEnd = event.RepeatEndDate ? dayjs(Number(event.RepeatEndDate)) : null;
            const rule = event.RecurrenceRule;

            if (currentStart.format("YYYY-MM-DD") === selectedDateStr) {
                isMatch = true;
            } else if (currentStart.isBefore(selectedDate, "day")) {
                if (!(repeatEnd && selectedDate.isAfter(repeatEnd, "day"))) {
                    while (currentStart.isBefore(selectedDate, "day")) {
                        switch (rule.Frequency) {
                            case 1: currentStart = currentStart.add(rule.Interval, "day"); break;
                            case 2: currentStart = currentStart.add(rule.Interval, "week"); break;
                            case 3: currentStart = currentStart.add(rule.Interval, "month"); break;
                            case 4: currentStart = currentStart.add(rule.Interval, "year"); break;
                            default: currentStart = selectedDate.add(1, 'day'); break; 
                        }
                    }
                    isMatch = currentStart.format("YYYY-MM-DD") === selectedDateStr;
                }
            }
        }

        if (isMatch) {
            // Use a composite key for de-duplication in case IDs differ but events are the same
            const compositeKey = `${event.Title}-${event.Start}-${event.End}-${event.Location || ""}`;
            
            if (!eventMap.has(compositeKey)) {
                // Clone the event to avoid modifying the original data
                eventMap.set(compositeKey, { ...event, mergedParticipants: [...(event.EventParticipant || [])] });
            } else {
                // Merge participants if they aren't already in the list
                const existingEvent = eventMap.get(compositeKey);
                const currentParticipants = event.EventParticipant || [];
                
                currentParticipants.forEach((p: any) => {
                    const pId = p.ParticipantId || p.id;
                    const alreadyExists = existingEvent.mergedParticipants.some(
                        (ep: any) => (ep.ParticipantId || ep.id) === pId
                    );
                    if (!alreadyExists) {
                        existingEvent.mergedParticipants.push(p);
                    }
                });
            }
        }
      });
    });

    return Array.from(eventMap.values()).map(e => ({
        ...e,
        EventParticipant: e.mergedParticipants // Override for the UI loop
    }));
  }, [data.Members, currentDate]);

  if (uniqueAllDayEvents.length === 0) return null;

  return (
    <div className="bg-white mx-2 mb-2 p-2 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-sky-500 rounded-full" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          {t("AllDayEvent")}
        </h3>
      </div>
      
      <div className="flex overflow-x-auto gap-3 pb-1 pr-2">
        {uniqueAllDayEvents.map((event) => (
          <div 
            key={event.Id} 
            onClick={() => onEventClick?.(event)}
            className="flex-shrink-0 min-w-[240px] max-w-[320px] bg-slate-50 rounded-xl p-3 border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-100 transition-all active:scale-[0.98]"
          >
            <div className="text-[13px] font-bold text-slate-800 line-clamp-2 mb-1">
              {event.IsPrivateEvent === 1 ? `${t("Private")}.....` : event.Title}
            </div>
            
            {(event.Location || (event.Description && event.IsPrivateEvent !== 1)) && (
              <div className="mb-3 space-y-0.5">
                {event.Location && (
                  <div className="text-[10px] text-slate-500 italic truncate">
                    {event.Location}
                  </div>
                )}
                {event.Description && event.IsPrivateEvent !== 1 && (
                  <div className="text-[10px] text-slate-400 line-clamp-1">
                    {event.Description}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200/60">
              <div className="flex -space-x-1.5 overflow-hidden">
                {event.EventParticipant?.map((p: any, i: number) => (
                  <div key={i} className="relative transition-transform hover:z-10 hover:scale-110">
                    <Image
                      unoptimized
                      src={memberImageMap[p.ParticipantId] || memberImageMap[p.id] || dp.src}
                      alt="participant"
                      width={24}
                      height={24}
                      className="rounded-full w-6 h-6 border-2 border-white shadow-sm"
                    />
                  </div>
                ))}
              </div>
              
              {event.ExternalCalendarName && (
                <div className="text-[9px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 truncate max-w-[100px]">
                  {event.ExternalCalendarName}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllDayEventsRow;
