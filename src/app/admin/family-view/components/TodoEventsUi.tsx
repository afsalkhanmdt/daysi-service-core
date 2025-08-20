"use client";
import Image from "next/image";
import eventIcon from "../../assets/cake-svgrepo-com 1.svg";
import dp from "../../assets/MyFamilii Brand Guide (1)-2 1.png";
import icon from "../../assets/try.jpg";

const imageArray = [icon.src, dp.src, eventIcon.src];

const TodoEventUi = () => {
  return (
    <div className="h-full border-t-4 rounded-xl border-sky-500 bg-white shadow-sm overflow-x-auto">
      <div className="flex flex-col flex-wrap gap-3 p-3 h-full">
        <div className="text-center py-0.5 px-1.5 bg-indigo-50 text-sky-500 w-fit text-[7px] rounded-2xl">
          Event
        </div>
        <div className="grid gap-0.5">
          <div className="font-semibold text-[13px] text-black">
            book vayikk mona
          </div>
          <div className="font-normal text-[9px] text-stone-500">
            paisa thara mona
          </div>
        </div>
        <div className="flex flex-wrap justify-between w-full gap-1.5">
          <div className="flex -space-x-1.5">
            {imageArray.map((src, i) => (
              <Image
                key={i}
                src={src}
                alt={`avatar-${i}`}
                width={22}
                height={22}
                className="rounded-full border-[1.4px] border-white"
              />
            ))}
          </div>
          <div className="rounded-[3px] py-0.5 px-1 text-sky-500 text-[9px] font-semibold bg-slate-100 h-fit w-fit">
            {imageArray.length}
          </div>
        </div>
      </div>
    </div>
  );
};
export default TodoEventUi;
