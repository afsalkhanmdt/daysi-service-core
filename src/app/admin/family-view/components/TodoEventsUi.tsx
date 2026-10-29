"use client";
import React from "react";
import Image from "next/image";
import { FamilyData } from "./FamilyViewWrapper";
import { useTranslation } from "react-i18next";
import { ToDoStatus, ToDoTaskType } from "@/app/types/todo";
import { MemberResponse } from "@/app/types/familyMemberTypes";
import { canUpdateToDo } from "@/app/utils/taskPermissions";

const TodoEventUi = ({
  ToDoData,
  familyDetails,
  currentMember,
  familyWideMemberId,
  onToggleStatus,
}: {
  ToDoData: ToDoTaskType;
  familyDetails: FamilyData;
  currentMember?: MemberResponse | null;
  familyWideMemberId?: string;
  onToggleStatus?: (todo: ToDoTaskType, newStatus: number) => Promise<void> | void;
}) => {
  const { t } = useTranslation("common");

  if (!ToDoData || !familyDetails) return null;

  const assignedTo = ToDoData.AssignedTo as any;
  let assignedIds: string[] = [];

  if (Array.isArray(assignedTo)) {
    assignedIds = assignedTo
      .map((id: any) => {
        if (typeof id === "object" && id !== null) {
          return String(id.MemberId || id.id || id.Id || "");
        }
        return String(id);
      })
      .filter((id) => id !== "");

    if (assignedIds.length === 1 && assignedIds[0].includes(",")) {
      assignedIds = assignedIds[0].split(",").map((id) => id.trim());
    }
  } else if (typeof assignedTo === "string") {
    assignedIds = assignedTo
      .split(",")
      .map((id: string) => id.trim())
      .filter((id) => id !== "");
  }

  const members = familyDetails.Members || [];
  const assignedMembers = members.filter((m) =>
    assignedIds.includes(String(m.MemberId))
  );

  const isFamilyWide = Boolean(
    ToDoData.IsForAll ||
      (ToDoData as any).isForAll ||
      (familyWideMemberId && assignedIds.includes(familyWideMemberId.toLowerCase()))
  );

  const assignedNames =
    assignedMembers.length > 0
      ? assignedMembers.map((m) => m.FirstName || m.MemberName).join(", ")
      : "another member";

  const isAuthorized = canUpdateToDo(ToDoData, currentMember, familyWideMemberId);
  const isClosed =
    Number(ToDoData.Status) === ToDoStatus.Closed ||
    Number(ToDoData.Status) === 1 ||
    Number(ToDoData.Status) === 2;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!isAuthorized) return;
    const nextStatus = isClosed ? ToDoStatus.Open : ToDoStatus.Closed;
    if (onToggleStatus) {
      await onToggleStatus(ToDoData, nextStatus);
    }
  };

  return (
    <div className="min-w-52 sm:min-w-0 h-24 sm:h-20 border-t-2 sm:border-t-4 rounded-xl border-sky-800 bg-white shadow-md shadow-gray-300 flex flex-col justify-between gap-1 p-1">
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <div className="text-center py-0.5 px-1.5 bg-slate-200 text-sky-800 w-fit text-[7px] rounded-2xl">
              {t("To-Do Tasks")}
            </div>
            {isFamilyWide && (
              <span className="text-center py-0.5 px-1.5 bg-purple-100 text-purple-700 border border-purple-200 w-fit text-[7px] font-bold rounded-2xl uppercase tracking-wider">
                Family
              </span>
            )}
          </div>

          {/* Completion Checkbox / Toggle */}
          <div
            className="flex items-center mr-1"
            title={
              !isAuthorized
                ? `Assigned to ${assignedNames}`
                : isClosed
                ? "Mark as Open"
                : "Mark as Closed"
            }
          >
            {!isAuthorized ? (
              <div
                className="flex items-center gap-0.5 text-gray-400 cursor-not-allowed"
                title={`Assigned to ${assignedNames}`}
              >
                {/* Lock icon */}
                <svg
                  className="w-3 h-3 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a3 3 0 00-3 3v2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm1 5V5a1 1 0 10-2 0v2h2z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="checkbox"
                  checked={isClosed}
                  disabled
                  readOnly
                  aria-label={`Assigned to ${assignedNames}`}
                  className="w-3.5 h-3.5 accent-gray-400 rounded cursor-not-allowed opacity-60"
                  onClick={handleCheckboxClick}
                />
              </div>
            ) : (
              <input
                type="checkbox"
                checked={isClosed}
                onChange={handleCheckboxChange}
                onClick={handleCheckboxClick}
                aria-label={isClosed ? "Mark task Open" : "Mark task Closed"}
                className="w-3.5 h-3.5 accent-sky-500 rounded cursor-pointer hover:ring-2 hover:ring-sky-200 transition-all"
              />
            )}
          </div>
        </div>
        <div
          className={`font-semibold text-[13px] max-w-40 truncate ${
            isClosed ? "line-through text-gray-400" : "text-black"
          }`}
        >
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
