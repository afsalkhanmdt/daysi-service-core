import eventIcon from "../../assets/cake-svgrepo-com 1.svg";
import dp from "../../assets/try.jpg";

const CelebrationDisplayCard = () => {
  return (
    <div className="grid gap-[0.25rem] p-[0.35rem] border rounded-lg border-slate-200">
      <div className="flex gap-[0.5rem]">
        <img className="rounded-full w-7 h-7" src={dp.src} alt="" />
        <div className="grid gap-[0.35rem]">
          <div className="font-semibold text-base">Johnson Birthday</div>
          <div className="font-normal text-[10px] text-stone-500">
            03:00 PM - 05:00 PM
          </div>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="text-stone-500 italic text-[10px]">25 years old</div>
        <img className="w-6 h-6" src={eventIcon.src} alt="" />
      </div>
    </div>
  );
};

export default CelebrationDisplayCard;
