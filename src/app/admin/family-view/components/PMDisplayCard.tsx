import dp from "../../assets/try.jpg";

const PMDisplayCard = () => {
  return (
    <div className="flex justify-between p-1.5 border rounded-lg border-slate-200">
      <div className="grid grid-flow-col place-items-center gap-2">
        <img className="rounded-full w-7 h-7" src={dp.src} alt="" />
        <div className="grid gap-1">
          <div className="font-semibold text-xs">Johnson Birthday</div>
          <div className="font-normal text-[10px] text-stone-500">
            03:00 PM - 05:00 PM
          </div>
        </div>
      </div>
      <div className="grid place-items-center">
        <div className="flex  items-center justify-center gap-0.5 bg-sky-500 text-center px-2 py-1 rounded-2xl text-white w-14">
          <div className="font-semibold text-[10px]">100</div>
          <div className="font-normal text-[10px]">Dkk</div>
        </div>
      </div>
    </div>
  );
};

export default PMDisplayCard;
