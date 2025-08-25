"use client";
import PocketMoneyEventUi from "./PocketMoneyEventsUi";
import TodoEventUi from "./TodoEventsUi";
import { FamilyData } from "../page";
import { useEffect, useState } from "react";

const ToDoAndPMComponent = ({
  familyDetails,
}: {
  familyDetails: FamilyData;
}) => {
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
        <div className="flex border-dashed border-b-2">
          <div className="w-7 flex items-center justify-center pr-2">
            <span className="text-xs px-2 rounded-xl py-0.5 bg-gradient-to-r from-emerald-400 to-sky-500 text-white whitespace-nowrap transform -rotate-90 ">
              Pocket Money
            </span>
          </div>
          <div className="w-full h-full flex overflow-x-auto gap-3 p-2">
            {familyDetails.Family.PMStdFamilyTasks.map((group, index) => (
              <div key={index} className="shrink-0">
                <PocketMoneyEventUi />
              </div>
            ))}
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
            {familyDetails.Family.ToDoFamilyGroups.map((group, index) => (
              <div key={index} className="shrink-0">
                <TodoEventUi />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToDoAndPMComponent;
