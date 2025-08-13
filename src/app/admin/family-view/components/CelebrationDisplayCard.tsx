import eventIcon from "../../assets/cake-svgrepo-com 1.svg";
import dp from "../../assets/try.jpg";
const CelebrationDisplayCard = () => {
  return (
    <div className="grid gap-1 p-2">
      <div className="flex  gap-3 ">
        <img className="rounded-full w-10 h-10" src={dp.src} alt="" />
        <div className="grid gap-2">
          <div className="font-semibold text-lg">Johnson Birthday </div>
          <div className="font-normal text-sm text-stone-500">
            03:00 PM - 05:00 PM
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="text-stone-500 italic">25 years old</div>
        <img src={eventIcon.src} alt="" />
      </div>
    </div>
  );
};

export default CelebrationDisplayCard;
