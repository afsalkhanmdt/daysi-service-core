import eventIcon from "../assets/cake-svgrepo-com 1.svg";
import dp from "../assets/try.jpg";
const PMDisplayCard = () => {
  return (
    <div className="flex justify-between p-2">
      <div className="grid grid-flow-col place-items-center gap-3 ">
        <img className="rounded-full w-10 h-10" src={dp.src} alt="" />
        <div className="grid gap-2">
          <div className="font-semibold text-lg">Johnson Birthday </div>
          <div className="font-normal text-sm text-stone-500">
            03:00 PM - 05:00 PM
          </div>
        </div>
      </div>
      <div className="grid place-items-center">
        <div className="flex items-center justify-center gap-1 bg-sky-500 text-center p-2 rounded-3xl text-white w-20">
          <div className="font-semibold text-lg text-center">100</div>
          <div className="font-normal text-sm text-center">Dkk</div>
        </div>
      </div>
    </div>
  );
};

export default PMDisplayCard;
