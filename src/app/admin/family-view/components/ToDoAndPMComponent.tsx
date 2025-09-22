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
  MemberType: number;
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
  CreatedOn: string;
  ActivityDate: string;
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

  const memberResourceId = (member: any) =>
    String(member.MemberId ?? member.Id);
  const normalizeId = (id: any) => String(id ?? "");

  const members = useMemo(() => {
    if (!familyDetails?.Members) return [];
    return selectedMember
      ? familyDetails.Members.filter(
          (m) => Number(m.Id) === Number(selectedMember)
        )
      : familyDetails.Members;
  }, [familyDetails?.Members, selectedMember]);

  const todosArr: ToDoTaskType[] = todoDetails
    ? Array.isArray(todoDetails)
      ? todoDetails
      : [todoDetails]
    : [];

  const pmTasksArr: PMTask[] = PMTaskDetails?.PMTasks ?? [];

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

  const todosByMember = useMemo(() => {
    const map = new Map<string, ToDoTaskType[]>();
    for (const t of todosArr) {
      const mid = normalizeId(t.AssignedTo);
      if (!map.has(mid)) map.set(mid, []);
      map.get(mid)!.push(t);
    }
    return map;
  }, [todosArr]);

  const ResourceHeader = ({ member }: { member: any }) => {
    const img = member.ResourceUrl || dp.src;
    const title = member.FirstName || member.MemberName || "Unknown";
    return (
      <div className="hidden sm:flex items-center gap-2 p-2 bg-white rounded-full w-60">
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
    <div className="relative overflow-auto">
      {!isSmallScreen && (
        <div className="sticky top-0 left-0 z-10 flex justify-center bg-slate-100">
          <button
            onClick={() => setIsTasksOpen((s) => !s)}
            className="px-4 py-1 bg-gradient-to-r from-emerald-400 to-sky-500 text-white text-xs rounded-t-lg shadow-md w-28"
          >
            {isTasksOpen ? t("Hide") : t("PullForTask")}
          </button>
        </div>
      )}

      {(!isSmallScreen || (isSmallScreen && selectedMember)) && (
        <div
          className={`flex flex-col gap-4 transition-all duration-300 ${
            isSmallScreen
              ? "max-h-[80rem]"
              : isTasksOpen
              ? "max-h-[80rem]"
              : "max-h-0 overflow-hidden"
          }`}
        >
          {/* Pocket Money Section */}
          <section className="bg-blue-100 rounded-xl sm:p-1 shadow-md">
            <div className="flex overflow-auto min-h-28 sm:min-h-0 ">
              {(!isSmallScreen ||
                members.some(
                  (m) =>
                    (pmTasksByMember.get(memberResourceId(m)) ?? []).length > 0
                )) && (
                <div className="flex sm:items-center  justify-between sm:pr-1">
                  <div className="font-semibold w-min sm:w-11 rounded-lg p-1 sm:flex sm:items-center sm:justify-center text-xs bg-gradient-to-r from-emerald-400 to-sky-500 text-white text-center [writing-mode:vertical-rl] [transform:rotate(180deg)] sm:[writing-mode:horizontal-tb] sm:[transform:none]">
                    {t("Pocket Money Tasks")}
                  </div>
                </div>
              )}

              <div className="sm:overflow-x-auto pl-2 sm:pl-0 flex flex-col overflow-auto">
                <div className="sm:flex sm:items-start my-auto sm:h-full">
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
                        key={`pm-${rid}`}
                        className="my-auto border-dashed sm:border-l-2 border-gray-400 h-full"
                      >
                        <div className="w-full sm:min-w-[220px] flex-shrink-0 bg-blue-100 rounded-lg sm:p-3 h-full">
                          <ResourceHeader member={member} />
                          <div className="sm:mt-3 flex sm:flex-col gap-3 flex-1 max-h-44 overflow-auto h-full ">
                            {pmForThis.length === 0 ? (
                              <div className="text-sm text-gray-500 italic text-center w-full h-full">
                                {t("No PM tasks")}
                              </div>
                            ) : (
                              pmForThis.map((pm) => (
                                <div
                                  key={`${pm.PMTransId}-${rid}`}
                                  className="w-full my-auto sm:my-0"
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
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* To-Do Section */}
          <section className="bg-blue-100 rounded-xl sm:p-1 shadow-md">
            <div className="flex overflow-auto min-h-28 sm:min-h-0">
              {(!isSmallScreen ||
                members.some(
                  (m) =>
                    (todosByMember.get(memberResourceId(m)) ?? []).length > 0
                )) && (
                <div className="flex sm:items-center justify-between sm:pr-1">
                  <div className="font-semibold w-min sm:w-11 rounded-lg p-1 sm:flex sm:items-center sm:justify-center text-xs bg-gradient-to-r from-emerald-400 to-sky-500 text-white text-center [writing-mode:vertical-rl] [transform:rotate(180deg)] sm:[writing-mode:horizontal-tb] sm:[transform:none]">
                    {t("To-Do Tasks")}
                  </div>
                </div>
              )}

              {todosByMember ? (
                <div className="sm:overflow-x-auto pl-2 sm:pl-0 flex flex-col overflow-auto">
                  <div className="sm:flex sm:items-start my-auto sm:h-full">
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
                          key={`todo-${rid}`}
                          className="my-auto border-dashed sm:border-l-2 border-gray-400 h-full"
                        >
                          <div className="w-full sm:min-w-[220px] flex-shrink-0 bg-blue-100 rounded-lg sm:p-3 h-full">
                            <ResourceHeader member={member} />
                            <div className="sm:mt-3 flex sm:flex-col gap-3 flex-1 max-h-44 overflow-auto h-full ">
                              {todosForThis.length === 0 ? (
                                <div className="text-sm text-gray-500 italic text-center w-full h-full">
                                  {t("No To-dos")}
                                </div>
                              ) : (
                                todosForThis.map((todo) => (
                                  <div
                                    key={`${todo.ToDoTaskId}-${rid}`}
                                    className="w-full my-auto sm:my-0"
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic text-center w-full">
                  {t("No To-dos")}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ToDoAndPMComponent;
