"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dp from "@/app/admin/assets/MyFamilii Brand Guide (1)-2 1.png";
import PocketMoneyEventUi from "./PocketMoneyEventsUi";
import TodoEventUi from "./TodoEventsUi";
import { ToDoTaskType } from "./CalendarView";
import { FamilyData } from "./FamilyViewWrapper";
import { useTranslation } from "react-i18next";

export type PMMember = {
  MemberId: string;
  MemberName: string;
  FirstName: string;
  MemberType: number; // maybe enum later (1 = child, 2 = parent?)
  CanApprovePMTask: boolean;
  CanCreatePMTask: boolean;
  IsPocketMoneyUser: boolean;
  HasPMTaskApprovedConfirmation: boolean;
  AmountEarned: number;
};

export type PMFamily = {
  FamilyId: number;
  FamilyName: string;
  CurrencyCode: string | null;
  EveryoneCreatePMTask: boolean;
};

//  Each family member assigned to a task
export type FamilyMemberPlanned = {
  MemberId: string;
  FinishedDate: string | null;
  ApprovedDate: string | null;
  Status: number;
};

export type PMTask = {
  LocalPMTaskId: number;
  PMTransId: number;
  TransType: number;
  PMDescription: string;
  PMAmount: number;
  FirstComeFirstServe: boolean;
  Note: string;
  FamilyMembersPlanned: FamilyMemberPlanned[];
  CreatedBy: string;
  CreatedOn: string; // ISO date string
  ActivityDate: string; // ISO date string
  Interval: number;
  Repeat: number;
  Status: number;
  UpdatedOn: string;
};

export type PMData = {
  PMFamily: PMFamily;
  PMMembers: PMMember[];
  PMTasks: PMTask[];
  MembersUpdatedOn: string | null;
};

const ToDoAndPMComponent = ({
  todoDetails,
  selectedMember,
  familyDetails,
  PMTaskDetails,
}: {
  todoDetails: ToDoTaskType[];
  familyDetails: FamilyData;
  selectedMember?: number;
  PMTaskDetails: PMData;
}) => {
  const { t } = useTranslation("common");
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 640);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // helpers to be robust with Id fields
  const memberResourceId = (member: any) =>
    String(member.MemberId ?? member.Id);
  const normalizeId = (id: any) => String(id ?? "");

  // members to show (filter by selectedMember if present)
  const members = useMemo(() => {
    if (!familyDetails?.Members) return [];
    return selectedMember
      ? familyDetails.Members.filter(
          (m) => Number(m.Id) === Number(selectedMember)
        )
      : familyDetails.Members;
  }, [familyDetails?.Members, selectedMember]);

  // safe arrays
  const todosArr: ToDoTaskType[] = todoDetails
    ? Array.isArray(todoDetails)
      ? todoDetails
      : [todoDetails] // wrap single object in array
    : [];

  const pmTasksArr: PMTask[] = PMTaskDetails?.PMTasks ?? [];

  // group PM tasks by assigned MemberId (use FamilyMembersPlanned)
  const pmTasksByMember = useMemo(() => {
    const map = new Map<string, PMTask[]>();
    for (const pm of pmTasksArr) {
      const planned = Array.isArray(pm.FamilyMembersPlanned)
        ? pm.FamilyMembersPlanned
        : [];
      for (const p of planned) {
        const mid = normalizeId(p.MemberId);
        if (!map.has(mid)) map.set(mid, []);
        map.get(mid)!.push(pm);
      }
    }
    return map;
  }, [pmTasksArr]);

  // group todos by AssignedTo
  const todosByMember = useMemo(() => {
    const map = new Map<string, ToDoTaskType[]>();
    for (const t of todosArr) {
      const mid = normalizeId(t.AssignedTo);
      if (!map.has(mid)) map.set(mid, []);
      map.get(mid)!.push(t);
    }
    return map;
  }, [todosArr]);

  // UI for resource header (matches CalendarView)
  const ResourceHeader = ({ member }: { member: any }) => {
    const img = member.ResourceUrl || dp.src;
    const title = member.FirstName || member.MemberName || "Unknown";
    return (
      <div className="flex items-center gap-2 p-1">
        <Image
          src={img}
          alt={title}
          width={28}
          height={28}
          className="rounded-full w-7 h-7 border"
        />
        <div className="text-sm font-semibold truncate">{title}</div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Pull-up button only on larger screens */}
      {!isSmallScreen && (
        <div className="sticky top-0 left-0 z-10 flex justify-center mb-2">
          <button
            onClick={() => setIsTasksOpen((s) => !s)}
            className="px-4 py-1 bg-gradient-to-r from-emerald-400 to-sky-500 text-white text-xs rounded-t-lg shadow-md w-28"
          >
            {isTasksOpen ? t("Hide") : t("PullForTask")}
          </button>
        </div>
      )}

      <div
        className={`flex flex-col gap-4 transition-all duration-300 ${
          isSmallScreen
            ? "max-h-[60rem]"
            : isTasksOpen
            ? "max-h-[60rem]"
            : "max-h-0 overflow-hidden"
        }`}
      >
        {/* Pocket Money Columns */}
        <section className="bg-blue-100 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-sky-700">
              {t("Pocket Money Tasks")}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-4 items-start">
              {members.length === 0 && (
                <div className="py-6 px-4 text-sm text-gray-500 italic">
                  {t("No members")}
                </div>
              )}

              {members.map((member) => {
                const rid = memberResourceId(member);
                const pmForThis = pmTasksByMember.get(rid) ?? [];
                return (
                  <div
                    key={rid}
                    className="min-w-[220px] border-r border-dashed flex-shrink-0 bg-white rounded-lg p-3"
                  >
                    <ResourceHeader member={member} />

                    <div className="mt-3 flex flex-col gap-3">
                      {pmForThis.length === 0 ? (
                        <div className="text-sm text-gray-500 italic">
                          {t("No PM tasks")}
                        </div>
                      ) : (
                        pmForThis.map((pm) => (
                          <div
                            key={`${pm.PMTransId}-${rid}`}
                            className="w-full"
                          >
                            <PocketMoneyEventUi
                              PMEventData={pm}
                              familyDetails={familyDetails}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* To-Do Columns */}
        <section className="bg-blue-100 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-emerald-700">
              {t("To-Do Tasks")}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-4 items-start">
              {members.length === 0 && (
                <div className="py-6 px-4 text-sm text-gray-500 italic">
                  {t("No members")}
                </div>
              )}

              {members.map((member) => {
                const rid = memberResourceId(member);
                const todosForThis = todosByMember.get(rid) ?? [];
                return (
                  <div
                    key={rid}
                    className="min-w-[220px] flex-shrink-0 bg-white rounded-lg p-3 "
                  >
                    <ResourceHeader member={member} />

                    <div className="mt-3 flex flex-col gap-3">
                      {todosForThis.length === 0 ? (
                        <div className="text-sm text-gray-500 italic">
                          {t("No To-dos")}
                        </div>
                      ) : (
                        todosForThis.map((todo) => (
                          <div
                            key={`${todo.ToDoTaskId}-${rid}`}
                            className="w-full"
                          >
                            <TodoEventUi
                              ToDoData={todo}
                              familyDetails={familyDetails}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ToDoAndPMComponent;
