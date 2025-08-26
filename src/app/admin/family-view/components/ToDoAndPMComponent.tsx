"use client";
import PocketMoneyEventUi from "./PocketMoneyEventsUi";
import TodoEventUi from "./TodoEventsUi";
import { FamilyData } from "../page";
import { useEffect, useState } from "react";
import { ToDoTaskType } from "./CalendarView";

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

// ✅ Each family member assigned to a task
export type FamilyMemberPlanned = {
  MemberId: string;
  FinishedDate: string | null;
  ApprovedDate: string | null;
  Status: number; // could also be enum
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
  UpdatedOn: string; // looks like ticks, but keep as string
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
  const todos = Array.isArray(todoDetails)
    ? todoDetails
    : todoDetails
    ? [todoDetails]
    : [];

  const taskMember = familyDetails.Members.find((m) => m.Id === selectedMember);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(true); // default true until checked

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640); // Tailwind sm = 640px
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="relative w-full">
      {/* Show pull-up button only on sm and above */}
      {!isSmallScreen && (
        <div className="sticky top-0 left-0 z-10 flex justify-center py-2 bg-white">
          <button
            onClick={() => setIsTasksOpen(!isTasksOpen)}
            className="px-4 py-1 bg-gradient-to-r from-emerald-400 to-sky-500 text-white text-xs rounded-full shadow-md"
          >
            {isTasksOpen ? "Hide" : "Pull Me Up"}
          </button>
        </div>
      )}

      {/* Rows */}
      <div
        className={`flex flex-col w-full transition-all duration-500 ${
          isSmallScreen
            ? "max-h-[28rem]" // Always visible on small screens
            : isTasksOpen
            ? "max-h-[28rem]" // Expand when open
            : "max-h-0 overflow-hidden" // Collapsed
        }`}
      >
        {/* Pocket Money */}
        <div className="flex border-dashed border-b-2 h-24">
          <div className="w-7 flex items-center justify-center pr-2">
            <span className="text-xs px-2 rounded-xl py-0.5 bg-gradient-to-r from-emerald-400 to-sky-500 text-white whitespace-nowrap transform -rotate-90 ">
              Pocket Money
            </span>
          </div>

          <div className="w-full h-full flex overflow-x-auto gap-3 p-2">
            {(() => {
              // filter tasks based on selectedMember
              const filteredTasks = PMTaskDetails.PMTasks.filter((PMTask) =>
                selectedMember
                  ? PMTask.FamilyMembersPlanned.some(
                      (member) => member.MemberId === taskMember?.MemberId
                    )
                  : true
              );

              if (filteredTasks.length === 0) {
                return (
                  <div className="flex items-center justify-center w-full h-24 text-gray-500 text-sm italic">
                    {selectedMember
                      ? "No Pocket Money tasks for this member"
                      : "No Pocket Money tasks available"}
                  </div>
                );
              }

              return filteredTasks.map((PMTask, index) => (
                <div key={index} className="shrink-0">
                  <PocketMoneyEventUi
                    PMEventData={PMTask}
                    familyDetails={familyDetails}
                  />
                </div>
              ));
            })()}
          </div>
        </div>

        {/* To-Do */}
        <div className="flex border-dashed border-b-2">
          <div className="w-7 flex items-center justify-center pr-2">
            <span className="text-xs px-2 rounded-xl py-0.5 bg-gradient-to-r from-emerald-400 to-sky-500 text-white whitespace-nowrap transform -rotate-90 ">
              To Do
            </span>
          </div>

          <div className="w-full h-full flex overflow-x-auto gap-3 p-2">
            {(() => {
              const filteredTodos = todos.filter((todo) =>
                selectedMember
                  ? todo.AssignedTo === taskMember?.MemberId // assuming AssignedTo matches Member.Id
                  : true
              );

              if (filteredTodos.length === 0) {
                return (
                  <div className="flex items-center justify-center w-full h-24 text-gray-500 text-sm italic">
                    {selectedMember
                      ? "No To-Do tasks for this member"
                      : "No To-Do tasks available"}
                  </div>
                );
              }

              return filteredTodos.map((todo, index) => (
                <div key={index} className="shrink-0">
                  <TodoEventUi ToDoData={todo} familyDetails={familyDetails} />
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToDoAndPMComponent;
