import Image from "next/image";
import dp from "@/app/admin/assets/MyFamilii Brand Guide (1)-2 1.png";
type resourcesType = {
  id: any;
  title: any;
  image: any;
}[];

const MobileViewComponent = ({ resources }: { resources: resourcesType }) => {
  return (
    <div>
      <div className="flex  gap-4 p-3 sm:hidden overflow-x-auto">
        {resources.map((res) => (
          <div
            key={res.id}
            className="flex items-center gap-2 min-w-32 bg-white rounded-full shadow-md px-3 py-2 hover:shadow-lg "
          >
            <Image
              src={res.image || "/fallback.png"}
              alt={res.title}
              width={32}
              height={32}
              className="rounded-full border w-8 h-8"
            />
            <span className="text-sm font-semibold truncate w-full">
              {res.title}
            </span>
          </div>
        ))}
      </div>

      <div className="sm:hidden grid  gap-2 sm:gap-4">
        {[...Array(3)].map((_, index) => (
          <div className=" border-t-4 rounded-xl border-sky-500 bg-white shadow-sm overflow-auto ">
            <div className="flex flex-col   p-3 h-full w-full">
              <div className="text-center py-0.5 px-1.5   bg-indigo-50 text-sky-500 w-fit text-[7px] text-xs rounded-2xl">
                Event
              </div>
              <div className="grid">
                <div className="font-semibold text-md  text-black">title</div>
                <div className="font-normal text-[9px] md:text-xs text-stone-500">
                  <div className="text-sm text-stone-500">10:00-12:00 UTC</div>
                </div>
              </div>
              <div className="flex flex-wrap justify-between max-w-full gap-2">
                <div className="flex -space-x-2">
                  <Image
                    src={dp.src}
                    alt={`avatar`}
                    width={22}
                    height={22}
                    className="rounded-full border-2 border-white"
                  />
                </div>
                <div className=" rounded-xs py-0.5 px-1 text-sky-500 text-[9px] font-semibold bg-slate-100 h-fit w-fit">
                  3
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MobileViewComponent;
