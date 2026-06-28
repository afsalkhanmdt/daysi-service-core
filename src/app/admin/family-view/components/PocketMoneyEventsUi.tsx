"use client";
import Image from "next/image";
import { FamilyData } from "./FamilyViewWrapper";
import { useTranslation } from "react-i18next";
import { PMTask } from "@/app/types/pocketMoney";

const PocketMoneyEventUi = ({
  PMEventData,
  familyDetails,
}: {
  PMEventData: PMTask;
  familyDetails: FamilyData;
}) => {
  const { t } = useTranslation("common");

  if (!PMEventData || !familyDetails) return null;

  const plannedMembers = PMEventData.FamilyMembersPlanned || [];
  const participants = (familyDetails.Members || []).filter((m) =>
    plannedMembers.some((pm) => String(pm.MemberId) === String(m.MemberId)),
  );

  // Get status and corresponding tick mark color
  // Status: 0=OPEN (Grey), 1=FINISHED (Yellow), 2=APPROVED (Green)
  const getStatusTickColor = (status: number) => {
    switch (status) {
      case 0: // OPEN
        return "#9CA3AF"; // Grey
      case 1: // FINISHED
        return "#EAB308"; // Yellow
      case 2: // APPROVED
        return "#22C55E"; // Green
      default:
        return "#9CA3AF"; // Grey
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return "Open";
      case 1:
        return "Finished";
      case 2:
        return "Approved";
      default:
        return "Open";
    }
  };

  const tickColor = getStatusTickColor(PMEventData.Status || 0);
  const statusLabel = getStatusLabel(PMEventData.Status || 0);

  return (
    <div className="min-w-52 sm:min-w-0 h-24 sm:h-20 border-t-2 sm:border-t-4 shadow-gray-300 rounded-xl border-sky-800 bg-white shadow-md flex flex-col justify-between gap-1 p-1 relative">
      <div>
        <div className="flex justify-between items-center">
          <div className="text-center py-0.5 px-1.5 bg-slate-200 text-sky-800 w-fit text-[7px] rounded-2xl">
            {t("Pocket Money Tasks")}
          </div>
          {/* Status Tick Mark - Inline SVG */}
          <div
            className="mr-2 flex items-center"
            title={`Status: ${statusLabel}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke={tickColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="font-semibold text-[13px] text-black max-w-40 truncate">
          {PMEventData.PMDescription || "No Description"}
        </div>
      </div>
      <div className="flex flex-wrap justify-between w-full">
        <div className="flex items-center min-w-0 flex-1 mr-2">
          <div className="flex gap-2 overflow-hidden">
            {participants.map((participant, index) => (
              <div
                key={participant.MemberId || participant.Id}
                className={`flex-shrink-0 transition-all duration-200 ${
                  index > 0 ? "ml-[-4px]" : ""
                }`}
                style={{
                  zIndex: participants.length - index,
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

          {/* Show count badge if there are many participants */}
          {participants.length > 3 && (
            <div className="flex-shrink-0 ml-1 bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 text-[10px] font-medium border border-gray-300">
              +{participants.length - 3}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-0.5 bg-sky-500 text-center px-2 py-1 rounded-2xl text-white w-14 flex-shrink-0">
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
