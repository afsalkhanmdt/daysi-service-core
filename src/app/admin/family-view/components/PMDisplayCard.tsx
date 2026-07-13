"use client";
import { MemberResponse } from "@/app/types/familyMemberTypes";
import { useTranslation } from "react-i18next";

const PMDisplayCard = ({
  memberDetails,
}: {
  memberDetails: MemberResponse;
}) => {
  const { t } = useTranslation("common");
  return (
    <div className="flex items-center justify-between p-2 border rounded-xl border-slate-200 bg-white shadow-sm gap-2">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <img
          className="rounded-full w-8 h-8 object-cover shrink-0 ring-2 ring-gray-50"
          src={memberDetails.ResourceUrl}
          alt=""
        />
        <div className="flex flex-col min-w-0">
          <div className="font-semibold text-sm text-gray-800 truncate">
            {memberDetails.FirstName}
          </div>
          <div className="font-medium text-xs text-emerald-500">
            {t("Paid")}
          </div>
        </div>
      </div>
      <div className="shrink-0 flex items-center justify-center gap-1 bg-sky-500 px-3 py-1.5 rounded-full text-white shadow-sm min-w-[4rem]">
        <div className="font-bold text-xs">
          {memberDetails.AmountEarned}
        </div>
        <div className="font-medium text-[10px] uppercase tracking-wider opacity-90">
          Dkk
        </div>
      </div>
    </div>
  );
};

export default PMDisplayCard;
