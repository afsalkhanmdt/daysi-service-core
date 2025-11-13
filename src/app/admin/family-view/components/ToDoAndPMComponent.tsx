"use client";

import { useEffect, useMemo, useState } from "react";

import PocketMoneyEventUi from "./PocketMoneyEventsUi";
import TodoEventUi from "./TodoEventsUi";
import { ToDoTaskType } from "./CalendarView";
import { FamilyData } from "./FamilyViewWrapper";
import { useTranslation } from "react-i18next";
import { PMData, PMTask } from "@/app/types/ToDoAndPMTypes";

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

  return (
    <div className="relative ">
      {!isSmallScreen && (
        <div className="sticky top-0 left-0 z-10 flex justify-center bg-transparent">
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
          className={`sticky grid gap-4 transition-all duration-300 bg-white ${
            isSmallScreen
              ? "max-h-[80rem] overflow-auto"
              : isTasksOpen
              ? "max-h-[80rem]"
              : "max-h-0 overflow-hidden"
          }`}
        >
          {/* Pocket Money Section */}
          <section className="bg-blue-100  sm:p-1 shadow-md ">
            <div className="flex  min-h-28 sm:min-h-0 ">
              {(!isSmallScreen ||
                members.some(
                  (m) =>
                    (pmTasksByMember.get(memberResourceId(m)) ?? []).length > 0
                )) && (
                <div className="flex sm:items-center  justify-between sm:pr-1">
                  <div className="font-semibold break-words w-min sm:w-[55px] rounded-lg p-1 sm:flex sm:items-center sm:justify-center text-xs bg-gradient-to-r from-emerald-400 to-sky-500 text-white text-center [writing-mode:vertical-rl] [transform:rotate(180deg)] sm:[writing-mode:horizontal-tb] sm:[transform:none]">
                    {t("Pocket Money Tasks")}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto flex-1 min-w-0">
                <div className="flex sm:grid sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))] sm:items-start my-auto sm:h-full w-full">
                  {members.length === 0 && (
                    <div className="text-sm text-gray-500 italic text-center w-full h-24 sm:h-20 border-t-2 sm:mx-6 sm:border-t-4 rounded-xl flex flex-col justify-between gap-1 p-1">
                      {t("No members")}
                    </div>
                  )}
                  {members.map((member) => {
                    const rid = memberResourceId(member);
                    const pmForThis = pmTasksByMember.get(rid) ?? [];

                    return (
                      <div
                        key={`pm-${rid}`}
                        className="flex-shrink-0 w-full my-auto border-dashed sm:border-l-2 border-gray-400 h-full"
                      >
                        <div className="w-full bg-blue-100 rounded-lg sm:p-3 h-full min-h-[120px] flex items-center justify-center">
                          {pmForThis.length === 0 ? (
                            <div className="text-sm text-gray-500 italic text-center w-full">
                              {t("No PM tasks")}
                            </div>
                          ) : (
                            <div className="sm:mt-3 flex sm:flex-col gap-3 flex-1 max-h-44 overflow-auto h-full w-full sm:max-w-[300px]">
                              {pmForThis.map((pm) => (
                                <div
                                  key={`${pm.PMTransId}-${rid}`}
                                  className="w-full my-auto sm:my-0"
                                >
                                  <PocketMoneyEventUi
                                    PMEventData={pm}
                                    familyDetails={familyDetails}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* To-Do Section */}
          <section className="bg-blue-100 sm:p-1 shadow-md">
            <div className="flex min-h-28 sm:min-h-0">
              {(!isSmallScreen ||
                members.some(
                  (m) =>
                    (todosByMember.get(memberResourceId(m)) ?? []).length > 0
                )) && (
                <div className="flex sm:items-center justify-between sm:pr-1">
                  <div className="font-semibold break-words w-min sm:w-[55px] rounded-lg p-1 sm:flex sm:items-center sm:justify-center text-xs bg-gradient-to-r from-emerald-400 to-sky-500 text-white text-center [writing-mode:vertical-rl] [transform:rotate(180deg)] sm:[writing-mode:horizontal-tb] sm:[transform:none]">
                    {t("To-Do Tasks")}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto flex-1 min-w-0">
                <div className="flex sm:grid sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))] sm:items-start my-auto sm:h-full w-full">
                  {members.length === 0 && (
                    <div className="text-sm text-gray-500 italic text-center w-full h-24 sm:h-20 border-t-2 sm:mx-6 sm:border-t-4 rounded-xl flex flex-col justify-between gap-1 p-1">
                      {t("No members")}
                    </div>
                  )}

                  {members.map((member) => {
                    const rid = memberResourceId(member);
                    const todosForThis = todosByMember.get(rid) ?? [];

                    return (
                      <div
                        key={`todo-${rid}`}
                        className="flex-shrink-0 w-full my-auto border-dashed sm:border-l-2 border-gray-400 h-full"
                      >
                        <div className="w-full bg-blue-100 rounded-lg sm:p-3 h-full min-h-[120px] flex items-center justify-center">
                          {todosForThis.length === 0 ? (
                            <div className="text-sm text-gray-500 italic text-center w-full">
                              {t("No To-dos")}
                            </div>
                          ) : (
                            <div className="sm:mt-3 flex sm:flex-col gap-3 flex-1 max-h-44 overflow-auto h-full w-full sm:max-w-[300px]">
                              {todosForThis.map((todo) => (
                                <div
                                  key={`${todo.ToDoTaskId}-${rid}`}
                                  className="w-full my-auto sm:my-0"
                                >
                                  <TodoEventUi
                                    ToDoData={todo}
                                    familyDetails={familyDetails}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ToDoAndPMComponent;
