"use client";

import { useEffect, useMemo, useState } from "react";

import PocketMoneyEventUi from "./PocketMoneyEventsUi";
import TodoEventUi from "./TodoEventsUi";
import { FamilyData } from "./FamilyViewWrapper";
import { useTranslation } from "react-i18next";
import EditPocketMoneyPopup from "./EditPocketMoneyPopup";
import { PMData, PMTask } from "@/app/types/pocketMoney";
import EditTodoPopup from "./EditTodoPopup";
import { ToDoTaskType } from "@/app/types/todo";
import { updatePocketMoneyTaskCall, updateToDoTaskCall } from "@/services/api";

const ToDoAndPMComponent = ({
  todoDetails,
  selectedMember,
  familyDetails,
  PMTaskDetails,
  dataReload,
  reloadTodo,
  reloadPM,
  onFreemium,
  setCurrentDate,
  setIsLoading,
  isLoading,
  isTasksLoading,
  resourceOrder,
}: {
  todoDetails: ToDoTaskType[];
  familyDetails: FamilyData;
  selectedMember?: number;
  PMTaskDetails: PMData;
  dataReload: () => void;
  reloadTodo: () => void;
  reloadPM: () => void;
  onFreemium: () => void;
  setCurrentDate: (date: Date) => void;
  setIsLoading?: (loading: boolean) => void;
  isLoading?: boolean;
  isTasksLoading?: boolean;
  resourceOrder: {
    id: string;
    title?: string;
  }[];
}) => {
  const { t } = useTranslation("common");
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(true);
  const [showEditTodo, setShowEditTodo] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<ToDoTaskType | null>(null);

  const [showEditPocketMoney, setShowEditPocketMoney] = useState(false);
  const [selectedPocketMoney, setSelectedPocketMoney] = useState<PMTask | null>(
    null,
  );

  const checkSubscription = (callback: () => void) => {
    if (familyDetails?.Family.SubscriptionType !== "Premium") {
      onFreemium();
    } else {
      callback();
    }
  };

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

    const orderedMembers = resourceOrder
      .map((resource) =>
        familyDetails.Members.find(
          (member) => String(member.Id) === String(resource.id),
        ),
      )
      .filter(Boolean);

    return selectedMember
      ? orderedMembers.filter((m) => Number(m!.Id) === Number(selectedMember))
      : orderedMembers;
  }, [familyDetails?.Members, resourceOrder, selectedMember]);

  const todosArr: ToDoTaskType[] = todoDetails
    ? Array.isArray(todoDetails)
      ? todoDetails
      : [todoDetails]
    : [];

  const pmTasksArr: PMTask[] = useMemo(() => {
    // Only show Open (0) tasks. Finished (1), Approved (2), and Deleted (3) should be hidden.
    return (PMTaskDetails?.PMTasks ?? []).filter((pm) => pm.Status === 0);
  }, [PMTaskDetails?.PMTasks]);

  const pmTasksByMember = useMemo(() => {
    const map = new Map<string, PMTask[]>();
    const firstResourceId =
      members.length > 0 ? normalizeId(members[0]?.MemberId) : null;

    for (const pm of pmTasksArr) {
      const planned = Array.isArray(pm.FamilyMembersPlanned)
        ? pm.FamilyMembersPlanned
        : [];

      const isForAll = planned.length === (familyDetails?.Members?.length || 0);

      if (isForAll && firstResourceId) {
        if (!map.has(firstResourceId)) map.set(firstResourceId, []);
        map.get(firstResourceId)!.push(pm);
      } else {
        for (const p of planned) {
          const mid = normalizeId(p.MemberId);
          if (!map.has(mid)) map.set(mid, []);
          map.get(mid)!.push(pm);
        }
      }
    }
    return map;
  }, [pmTasksArr, familyDetails?.Members]);

  const todosByMember = useMemo(() => {
    const map = new Map<string, ToDoTaskType[]>();
    const firstResourceId =
      members.length > 0 ? normalizeId(members[0]?.MemberId) : null;

    for (const t of todosArr) {
      if (t.Status === 2) continue; // Skip closed tasks

      if (t.IsForAll && firstResourceId) {
        if (!map.has(firstResourceId)) map.set(firstResourceId, []);
        map.get(firstResourceId)!.push(t);
        continue;
      }

      let assignedIds: string[] = [];
      const assignedTo = t.AssignedTo as any;

      if (Array.isArray(assignedTo)) {
        assignedIds = assignedTo.filter((id: any) => id && String(id).trim());
      } else if (typeof assignedTo === "string") {
        const trimmed = assignedTo.trim();
        if (trimmed) {
          assignedIds = trimmed
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id);
        }
      } else {
        continue;
      }

      if (assignedIds.length === 0) {
        continue;
      }

      for (const id of assignedIds) {
        const normalizedId = normalizeId(id);
        if (!map.has(normalizedId)) map.set(normalizedId, []);
        map.get(normalizedId)!.push(t);
      }
    }

    return map;
  }, [todosArr, familyDetails?.Members]);

  const [isComponentLoading, setIsComponentLoading] = useState(false);

  const handleEditTodo = async (todoData: any) => {
    setIsComponentLoading(true);
    try {
      const response = await updateToDoTaskCall(todoData);
      if (response) {
        await Promise.all([reloadTodo(), dataReload()]);
        // Shift view to the date the todo was created
        const shiftDate = todoData.CreatedDate || todoData.createdDate;
        if (shiftDate) {
          setCurrentDate(new Date(Number(shiftDate)));
        }
      }
    } finally {
      setIsComponentLoading(false);
    }
  };

  const handleEditPocketMoney = async (pocketMoneyData: any) => {
    setIsComponentLoading(true);
    try {
      // We safely fall back to PMTransId since the backend primary key is often tracked there
      const taskId = pocketMoneyData.PMTransId || selectedPocketMoney?.PMTransId || pocketMoneyData.PMTaskId || pocketMoneyData.LocalPMTaskId || selectedPocketMoney?.LocalPMTaskId || 0;
      const familyId = familyDetails?.Family?.Id || pocketMoneyData.FamilyId || 0;

      // Ensure we have a valid PMTaskId and FamilyId
      if (!taskId || taskId === 0) {
        console.error("Invalid PMTaskId or FamilyId. Data:", { pocketMoneyData, selectedPocketMoney, familyId });
        // You might want to show an error message to the user here
        return;
      }

      const apiData = {
        PMTaskId: taskId,
        FamilyId: familyId,
        PMDescription: pocketMoneyData.PMDescription || "",
        PMAmount: pocketMoneyData.PMAmount || 0,
        FirstComeFirstServe: pocketMoneyData.FirstComeFirstServe || false,
        Note: pocketMoneyData.Note || "",
        FamilyMembersPlanned: pocketMoneyData.FamilyMembersPlanned || [],
        CreatedBy: pocketMoneyData.CreatedBy || "",
        ActivityDate: pocketMoneyData.ActivityDate || new Date().toISOString(),
        Interval: pocketMoneyData.Interval || 0,
        Repeat: pocketMoneyData.Repeat || 0,
        CurrencyCode: pocketMoneyData.CurrencyCode || "INR",
      };

      const response = await updatePocketMoneyTaskCall(apiData);
      if (response) {
        await Promise.all([reloadPM(), dataReload()]);
        if (pocketMoneyData.ActivityDate) {
          setCurrentDate(new Date(pocketMoneyData.ActivityDate));
        }
      }
    } catch (error) {
      console.error("Failed to update pocket money:", error);
      // You might want to show an error toast/notification here
    } finally {
      setIsComponentLoading(false);
    }
  };

  return (
    <div className="relative">
      {(isComponentLoading || isTasksLoading) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-b-xl">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
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
                    (pmTasksByMember.get(memberResourceId(m)) ?? []).length > 0,
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
                    const sortedPMTasks = [...(pmForThis || [])].sort(
                      (a, b) =>
                        new Date(b.CreatedOn).getTime() -
                        new Date(a.CreatedOn).getTime(),
                    );

                    return (
                      <div
                        key={`pm-${rid}`}
                        className="flex-shrink-0 w-full my-auto border-dashed sm:border-l-2 border-gray-400 h-full"
                      >
                        <div className="w-full bg-blue-100 rounded-lg sm:p-3 h-full min-h-[120px] flex items-center justify-center">
                          {sortedPMTasks.length === 0 ? (
                            <div className="text-sm text-gray-500 italic text-center w-full">
                              {t("No PM tasks")}
                            </div>
                          ) : (
                            <div className="sm:mt-3 flex sm:flex-col gap-3 flex-1 max-h-44 overflow-auto h-full w-full sm:max-w-[300px]">
                              {sortedPMTasks.map((pm) => (
                                <div
                                  key={`${pm.PMTransId}-${rid}`}
                                  className="w-full my-auto sm:my-0"
                                  onClick={() => {
                                    // checkSubscription(() => {
                                    setSelectedPocketMoney(pm);
                                    setShowEditPocketMoney(true);
                                    // });
                                  }}
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
                    (todosByMember.get(memberResourceId(m)) ?? []).length > 0,
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
                    const sortedTodos = [...(todosForThis || [])].sort(
                      (a, b) =>
                        new Date(b.CreatedDate).getTime() -
                        new Date(a.CreatedDate).getTime(),
                    );

                    return (
                      <div
                        key={`todo-${rid}`}
                        className="flex-shrink-0 w-full my-auto border-dashed sm:border-l-2 border-gray-400 h-full"
                      >
                        <div className="w-full bg-blue-100 rounded-lg sm:p-3 h-full min-h-[120px] flex items-center justify-center">
                          {sortedTodos.length === 0 ? (
                            <div className="text-sm text-gray-500 italic text-center w-full">
                              {t("No To-dos")}
                            </div>
                          ) : (
                            <div className="sm:mt-3 flex sm:flex-col gap-3 flex-1 max-h-44 overflow-auto h-full w-full sm:max-w-[300px]">
                              {sortedTodos.map((todo) => (
                                <div
                                  key={`${todo.ToDoTaskId}-${rid}`}
                                  className="w-full my-auto sm:my-0"
                                  onClick={() => {
                                    // checkSubscription(() => {
                                    setSelectedTodo(todo);
                                    setShowEditTodo(true);
                                    // });
                                  }}
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
      {selectedTodo && (
        <EditTodoPopup
          ToDoFamilyGroup={familyDetails.Family.ToDoFamilyGroups}
          isOpen={showEditTodo}
          todo={selectedTodo}
          onClose={() => {
            setShowEditTodo(false);
            setSelectedTodo(null);
          }}
          onSubmit={handleEditTodo}
          isLoading={isComponentLoading}
        />
      )}

      <EditPocketMoneyPopup
        isOpen={showEditPocketMoney}
        pocketMoney={selectedPocketMoney}
        onClose={() => {
          setShowEditPocketMoney(false);
          setSelectedPocketMoney(null);
        }}
        onSubmit={handleEditPocketMoney}
        isLoading={isComponentLoading}
      />
    </div>
  );
};

export default ToDoAndPMComponent;
