"use client";
import Image from "next/image";
import icon from "../../assets/try.jpg";
import { FamilyData } from "./FamilyViewWrapper";
import { ToDoTaskType } from "@/app/types/todo";

const TodoEventUi = ({
  ToDoData,
  familyDetails,
}: {
  ToDoData: ToDoTaskType;
  familyDetails: FamilyData;
}) => {
  const assignedMembers = familyDetails.Members.filter((m) =>
    ToDoData.AssignedTo.includes(m.MemberId)
  );

  return (
    <div className="min-w-52 sm:min-w-0 h-20 border-t-2 sm:border-t-4 rounded-xl border-emerald-500 bg-white shadow-md shadow-gray-300 flex flex-col justify-between gap-1 p-1">
      <div>
        <div className="flex justify-between items-center">
          <div className="text-center py-0.5 px-1.5 bg-emerald-50 text-emerald-500 w-fit text-[7px] rounded-2xl">
            To-Do
          </div>
          <input
            type="checkbox"
            className="w-3 h-3 accent-sky-500 rounded mr-2"
          />
        </div>
        <div className="font-semibold text-[13px] text-black max-w-40 truncate">
          {ToDoData.Description}
        </div>
      </div>
      <div className="flex flex-wrap justify-between w-full gap-1.5">
        {assignedMembers.map((m) => (
          <Image
            key={m.MemberId}
            src={m.ResourceUrl || icon.src}
            alt=""
            width={32}
            height={32}
            className="rounded-full"
          />
        ))}
      </div>
    </div>
  );
};
export default TodoEventUi;
