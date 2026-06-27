"use client";
import { deleteCalendarFeedCall } from "@/services/api";
import { useTranslation } from "react-i18next";

type ExternalCalendarProvider = {
  Id: number;
  Language: string;
  SequenceNumber: number;
  Name: string;
  Link: string;
  Logo: string;
};

const ExternalCalendarDisplayCard = ({
  calendarDescription,
}: {
  calendarDescription: ExternalCalendarProvider;
}) => {
  const { t } = useTranslation("common");
  console.log(calendarDescription, "calendarDescription");

  const handleDelete = async () => {
    try {
      const response = await deleteCalendarFeedCall(
        calendarDescription.Id,
        "",
        calendarDescription.Language,
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-between gap-[0.25rem] p-[0.35rem] border rounded-lg border-slate-200 ">
      <div className="flex gap-[0.5rem]">
        <img
          className="rounded-full w-7 h-7"
          src={calendarDescription.Logo}
          alt=""
        />
        <div className="flex justify-between flex-wrap w-full">
          <div className="grid gap-[0.35rem]">
            <div className="font-semibold text-base">
              {calendarDescription.Name}{" "}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <button
          onClick={handleDelete}
          className="bg-sky-500 px-2 py-0.5 text-white italic text-[8px] sm:text-sm rounded-2xl cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ExternalCalendarDisplayCard;
