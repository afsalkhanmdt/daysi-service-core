"use client";
import React from "react";
import Image from "next/image";
import { FamilyData } from "./FamilyViewWrapper";
import { useTranslation } from "react-i18next";
import { PMTask, PMTransStatus } from "@/app/types/pocketMoney";
import { MemberResponse, MemberType } from "@/app/types/familyMemberTypes";

const PocketMoneyEventUi = ({
  PMEventData,
  familyDetails,
  currentMemberId,
  currentMember,
}: {
  PMEventData: PMTask;
  familyDetails: FamilyData;
  currentMemberId?: string;
  currentMember?: MemberResponse | null;
}) => {
  const { t } = useTranslation("common");

  if (!PMEventData || !familyDetails) return null;

  const plannedMembers = PMEventData.FamilyMembersPlanned || [];
  const participants = (familyDetails.Members || []).filter((m) =>
    plannedMembers.some((pm) => String(pm.MemberId) === String(m.MemberId))
  );

  // Determine status for this specific member column if currentMemberId is provided
  const memberPlanned = currentMemberId
    ? plannedMembers.find((p) => String(p.MemberId) === String(currentMemberId))
    : null;

  const effectiveStatus =
    memberPlanned && memberPlanned.Status !== undefined && memberPlanned.Status !== null
      ? Number(memberPlanned.Status)
      : Number(PMEventData.Status || 0);

  const isFamilyAdmin =
    (currentMember?.MemberType ?? MemberType.Member) === MemberType.FamilyAdmin;

  const isFamilyWide = Boolean(
    PMEventData.FirstComeFirstServe ||
      (PMEventData as any).firstComeFirstServe ||
      (PMEventData as any).isForAll ||
      (plannedMembers.length > 0 &&
        plannedMembers.length >= (familyDetails.Members?.length || 0))
  );

  // Status colors & labels
  const getStatusTickColor = (status: number) => {
    switch (status) {
      case PMTransStatus.Open:
        return "#9CA3AF"; // Grey
      case PMTransStatus.Finished:
        return "#EAB308"; // Yellow
      case PMTransStatus.Approved:
        return "#22C55E"; // Green
      default:
        return "#9CA3AF";
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case PMTransStatus.Open:
        return "Open";
      case PMTransStatus.Finished:
        return !isFamilyAdmin ? "Pending Approval" : "Finished";
      case PMTransStatus.Approved:
        return "Approved";
      default:
        return "Open";
    }
  };

  const tickColor = getStatusTickColor(effectiveStatus);
  const statusLabel = getStatusLabel(effectiveStatus);

  return (
    <div className="min-w-52 sm:min-w-0 h-24 sm:h-20 border-t-2 sm:border-t-4 shadow-gray-300 rounded-xl border-sky-800 bg-white shadow-md flex flex-col justify-between gap-1 p-1 relative">
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <div className="text-center py-0.5 px-1.5 bg-slate-200 text-sky-800 w-fit text-[7px] rounded-2xl">
              {t("Pocket Money Tasks")}
            </div>
            {isFamilyWide && (
              <span className="text-center py-0.5 px-1.5 bg-purple-100 text-purple-700 border border-purple-200 w-fit text-[7px] font-bold rounded-2xl uppercase tracking-wider">
                Family
              </span>
            )}
            {effectiveStatus === PMTransStatus.Finished && !isFamilyAdmin && (
              <span className="text-center py-0.5 px-1 bg-amber-100 text-amber-700 border border-amber-300 text-[7px] font-bold rounded-full">
                Pending Approval
              </span>
            )}
            {effectiveStatus === PMTransStatus.Approved && (
              <span className="text-center py-0.5 px-1 bg-emerald-100 text-emerald-700 border border-emerald-300 text-[7px] font-bold rounded-full">
                Approved
              </span>
            )}
          </div>

          {/* Status Tick Mark */}
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
