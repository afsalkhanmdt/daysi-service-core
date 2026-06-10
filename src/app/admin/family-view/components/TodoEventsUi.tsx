"use client";
import Image from "next/image";
import { FamilyData } from "./FamilyViewWrapper";
import { useTranslation } from "react-i18next";
import { ToDoTaskType } from "@/app/types/todo";

const TodoEventUi = ({
  ToDoData,
  familyDetails,
}: {
  ToDoData: ToDoTaskType;
  familyDetails: FamilyData;
}) => {
  const { t } = useTranslation("common");

  if (!ToDoData || !familyDetails) return null;

  const assignedTo = ToDoData.AssignedTo as any;
  let assignedIds: string[] = [];

  if (Array.isArray(assignedTo)) {
    assignedIds = assignedTo.map((id: any) => {
      if (typeof id === "object" && id !== null) {
        return String(id.MemberId || id.id || "");
      }
      return String(id);
    }).filter(id => id !== "");
    
    if (assignedIds.length === 1 && assignedIds[0].includes(",")) {
        assignedIds = assignedIds[0].split(",").map(id => id.trim());
    }
  } else if (typeof assignedTo === "string") {
    assignedIds = assignedTo.split(",").map((id: string) => id.trim()).filter(id => id !== "");
  }

  const members = familyDetails.Members || [];
  const assignedMembers = members.filter((m) =>
    assignedIds.includes(String(m.MemberId))
  );

  return (
    <div className="min-w-52 sm:min-w-0 h-24 sm:h-20 border-t-2 sm:border-t-4 rounded-xl border-sky-800 bg-white shadow-md shadow-gray-300 flex flex-col justify-between gap-1 p-1">
      <div>
        <div className="flex justify-between items-center">
          <div className="text-center py-0.5 px-1.5 bg-slate-200 text-sky-800 w-fit text-[7px] rounded-2xl">
            {t("To-Do Tasks")}
          </div>
          <input
            type="checkbox"
            className="w-3 h-3 accent-sky-500 rounded mr-2"
            readOnly
          />
        </div>
        <div className="font-semibold text-[13px] text-black max-w-40 truncate">
          {ToDoData.Description || "No Description"}
        </div>
      </div>
      <div className="flex gap-2 overflow-hidden">
        {assignedMembers.map((participant, index) => (
          <div
            key={participant.MemberId || participant.Id}
            className={`flex-shrink-0 transition-all duration-200 ${
              index > 0 ? "ml-[-4px]" : ""
            }`}
            style={{
              zIndex: assignedMembers.length - index,
            }}
          >
            <Image
              src={participant.ResourceUrl || "/fallback.png"}
              alt={participant.MemberName || "Member"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white shadow-sm shadow-gray-200 hover:scale-110 transition-transform object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default TodoEventUi;
