"use client";
import CalendarView from "@/app/admin/family-view/components/CalendarView";
import CelebrationDisplayCard from "@/app/admin/family-view/components/CelebrationDisplayCard";
import PMDisplayCard from "./components/PMDisplayCard";
import Image from "next/image";
import mainIcon from "@/app/admin/assets/MyFamilii Brand Guide (1)-2 1.png";
import ToggleThemeAndLogout from "./components/ToggleThemeAndLogout";
import { useEffect, useState } from "react";

export default function FamilyPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;

      try {
        const res = await fetch(
          "https://dev.daysi.dk/api/Families/GetAllFamilies?familyId=935",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const json = await res.json();
        console.log("Families Data:", json);
        setData(json);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  console.log("data", data);

  return (
    <div className="flex w-screen h-screen py-5 pr-5 bg-white dark:bg-gray-800 transition-colors">
      {/* Sidebar */}
      <div
        className="
          flex flex-col flex-shrink 
          min-w-[200px] max-w-[330px] w-[25%] 
          bg-white dark:bg-gray-800 border-r dark:border-gray-700
          text-gray-800 dark:text-gray-100
        "
      >
        {/* Logo */}
        <div className="border-b-2 border-slate-100 dark:border-gray-700 pb-5 grid place-items-center">
          <Image src={mainIcon.src} alt={"mainIcon"} width={172} height={68} />
        </div>

        {/* Celebration Section */}
        <div className="flex-1 min-h-0 flex flex-col border-b-2 border-slate-100 dark:border-gray-700">
          <div className="p-5 text-xl font-semibold grid place-content-center border-b dark:border-gray-700">
            Celebration’s Today 🎉
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid gap-4">
              {[...Array(10)].map((_, i) => (
                <CelebrationDisplayCard key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Pocket Money Section */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="p-5 text-xl font-semibold grid place-content-center border-b dark:border-gray-700">
            Pocket Money 💸
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid gap-4">
              {[...Array(20)].map((_, i) => (
                <PMDisplayCard key={i} />
              ))}
            </div>
          </div>
        </div>

        <ToggleThemeAndLogout />
      </div>

      {/* Calendar */}
      <div className="flex-1 min-w-0 h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading...
          </div>
        ) : (
          <CalendarView />
        )}
      </div>
    </div>
  );
}
