"use client";
import Image from "next/image";
import { PMData, PMMember, PMTask } from "./ToDoAndPMComponent";
import { FamilyData } from "../page";

const PocketMoneyEventUi = ({
  PMEventData,
  familyDetails,
}: {
  PMEventData: PMTask;
  familyDetails: FamilyData;
}) => {
  console.log(familyDetails, "familyDetails in PM event");

  return (
    <div className=" min-w-40 h-20 border-t-4 rounded-xl border-sky-800 bg-white shadow-sm flex flex-col justify-between gap-1 p-1">
      <div>
        <div className="flex justify-between items-center">
          <div className="text-center py-0.5 px-1.5 bg-slate-200 text-sky-800 w-fit text-[7px] rounded-2xl">
            PocketMoneyEvent
          </div>
          <input
            type="checkbox"
            className="w-3 h-3 accent-sky-500 rounded mr-2"
          />
        </div>
        <div className="font-semibold text-[13px] text-black max-w-40 truncate">
          {PMEventData.PMDescription}
        </div>
      </div>
      <div className="flex flex-wrap justify-between w-full gap-1.5">
        <div className="flex -space-x-2">
          {familyDetails.Members.filter((m) =>
            PMEventData.FamilyMembersPlanned.some(
              (pm) => pm.MemberId === m.MemberId
            )
          ).map((participant) => (
            <Image
              key={participant.Id}
              src={participant.ResourceUrl || "/fallback.png"}
              alt={participant.MemberName}
              width={22}
              height={22}
              className="rounded-full border-2 border-white"
            />
          ))}
        </div>

        <div className="flex  items-center justify-center gap-0.5 bg-sky-500 text-center px-2 py-1 rounded-2xl text-white w-14">
          <div className="font-semibold text-[10px]">
            {PMEventData.PMAmount}
          </div>
          <div className="font-normal text-[10px]">Dkk</div>
        </div>
      </div>
    </div>
  );
};
export default PocketMoneyEventUi;
