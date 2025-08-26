import { MemberResponse } from "@/app/types/familyMemberTypes";
import dp from "../../assets/try.jpg";

const PMDisplayCard = ({
  memberDetails,
}: {
  memberDetails: MemberResponse;
}) => {
  return (
    <div className="flex justify-between p-1.5 border rounded-lg border-slate-200">
      <div className="grid grid-flow-col place-items-center gap-2">
        <img
          className="rounded-full w-7 h-7"
          src={memberDetails.ResourceUrl}
          alt=""
        />
        <div className="grid gap-1">
          <div className="font-semibold text-xs">{memberDetails.FirstName}</div>
          <div className="font-medium text-xs text-emerald-400">Paid</div>
        </div>
      </div>
      <div className="grid place-items-center">
        <div className="flex  items-center justify-center gap-0.5 bg-sky-500 text-center px-2 py-1 rounded-2xl text-white w-14">
          <div className="font-semibold text-[10px]">
            {memberDetails.AmountEarned}
          </div>
          <div className="font-normal text-[10px]">Dkk</div>
        </div>
      </div>
    </div>
  );
};

export default PMDisplayCard;
