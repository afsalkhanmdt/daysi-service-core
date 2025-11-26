"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import SunIcon from "@/app/admin/assets/sun-2-svgrepo-com 1.svg";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface ToggleThemeAndLogoutProps {
  reload: () => void;
  onNewAppointment: () => void;
  onNewToDo: () => void;
  onNewPocketMoney: () => void;
}

export default function ToggleThemeAndLogout({
  reload,
  onNewAppointment,
  onNewToDo,
  onNewPocketMoney,
}: ToggleThemeAndLogoutProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/admin/login");
  };

  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setIsDark(true);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
    reload();
  };

  const handleCreateOptionClick = (action: () => void) => {
    action();
    setShowCreateDropdown(false);
  };

  return (
    <div className="grid grid-flow-col sm:grid-flow-row border-t border-slate-100 dark:border-gray-700 sm:p-1.5 gap-1.5 place-items-center">
      {/* Create Button with Dropdown */}
      <div className="relative w-full">
        <button
          onClick={() => setShowCreateDropdown(!showCreateDropdown)}
          className={`sm:flex sm:justify-between sm:shadow-md ${
            isDark ? `shadow-gray-900` : `shadow-gray-300`
          } sm:px-3 sm:py-1.5 grid place-items-center gap-1.5 w-full rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
        >
          <div className="sm:block hidden text-center font-semibold text-sm text-stone-500">
            {t("Create")}
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke={`${isDark ? `white` : `#228FE5`}`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Create Dropdown Menu */}
        {showCreateDropdown && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-2 space-y-1">
              <button
                onClick={() => handleCreateOptionClick(onNewAppointment)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.6947 13.7H15.7037M15.6947 16.7H15.7037M11.9955 13.7H12.0045M11.9955 16.7H12.0045M8.29431 13.7H8.30329M8.29431 16.7H8.30329"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                New Appointment
              </button>

              <button
                onClick={() => handleCreateOptionClick(onNewToDo)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 12H16M8 16H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                New ToDo
              </button>

              <button
                onClick={() => handleCreateOptionClick(onNewPocketMoney)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14M12 8.5V8M12 8C12.5523 8 13 8.44772 13 9C13 9.55228 12.5523 10 12 10C11.4477 10 11 9.55228 11 9C11 8.44772 11.4477 8 12 8ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                New Pocket Money
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        className={`sm:flex sm:justify-between sm:shadow-md sm:px-3 sm:py-1.5 grid place-items-center gap-1.5 w-full rounded-full transform transition-all duration-150 active:scale-95 ${
          refreshing ? "scale-90" : "scale-100"
        }`}
      >
        <div className="sm:block hidden text-center font-semibold text-sm text-stone-500">
          {t("Refresh")}
        </div>

        <div
          className={`w-4 h-4 rounded-full bg-green-600 transition-transform duration-500 ${
            refreshing ? "animate-spin" : ""
          }`}
        ></div>
      </button>

      {/* Dark Mode Toggle */}
      <div
        className={`sm:flex sm:justify-between sm:shadow-md ${
          isDark ? `shadow-gray-900` : `shadow-gray-300`
        } sm:px-3 sm:py-1.5 grid place-items-center gap-1.5 w-full rounded-full`}
      >
        <div className="sm:block hidden text-center font-semibold text-sm text-stone-500">
          {t("DarkMode")}
        </div>

        <button
          onClick={toggleTheme}
          className="relative flex items-center gap-1 rounded-full px-1.5 py-0.5 border border-slate-200 bg-slate-300 shadow-inner shadow-black dark:bg-gray-800 transition-colors duration-300"
        >
          {/* Sun */}
          <div
            className={`p-0.5 rounded-full transition-colors duration-300 ${
              !isDark ? "bg-sky-500" : "bg-transparent"
            }`}
          >
            <Image
              src={SunIcon}
              alt="Light"
              className={`w-4 h-4 ${isDark ? "invert brightness-0" : ""}`}
            />
          </div>

          {/* Moon */}
          <div
            className={`p-0.5 rounded-full transition-colors duration-300 ${
              isDark ? "bg-sky-500" : "bg-transparent"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 14 14"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
            >
              <path
                d="M6.99999 12.8334C10.2216 12.8334 12.8333 10.2217 12.8333 7.00008C12.8333 6.73017 12.4288 6.68555 12.2892 6.91655C11.6252 8.01543 10.4192 8.75008 9.04165 8.75008C6.94755 8.75008 5.24999 7.05252 5.24999 4.95841C5.24999 3.58084 5.98464 2.37486 7.08352 1.71086C7.31452 1.57127 7.2699 1.16675 6.99999 1.16675C3.77833 1.16675 1.16666 3.77842 1.16666 7.00008C1.16666 10.2217 3.77833 12.8334 6.99999 12.8334Z"
                className="fill-gray-600 dark:fill-white"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className={`sm:flex sm:justify-between shadow-md ${
          isDark ? `shadow-gray-900` : `shadow-gray-300`
        } px-1.5 sm:px-3 py-1.5 grid place-items-center sm:items-center gap-1.5 sm:w-full rounded-lg sm:rounded-full`}
      >
        <div className="sm:block hidden text-center font-semibold text-sm text-stone-500">
          {t("Logout")}
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 29 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.0023 8.16659C11.0164 5.62905 11.1289 4.25482 12.0254 3.35838C13.0505 2.33325 14.7004 2.33325 18.0002 2.33325H19.1669C22.4667 2.33325 24.1167 2.33325 25.1418 3.35838C26.1669 4.38351 26.1669 6.03342 26.1669 9.33325V18.6666C26.1669 21.9664 26.1669 23.6163 25.1418 24.6414C24.1167 25.6666 22.4667 25.6666 19.1669 25.6666H18.0002C14.7004 25.6666 13.0505 25.6666 12.0254 24.6414C11.1289 23.745 11.0164 22.3708 11.0023 19.8333"
            stroke={`${isDark ? `white` : `#228FE5`}`}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M18 14H2.83334M2.83334 14L6.91668 10.5M2.83334 14L6.91668 17.5"
            stroke={`${isDark ? `white` : `#228FE5`}`}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Overlay to close dropdown when clicking outside */}
      {showCreateDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCreateDropdown(false)}
        />
      )}
    </div>
  );
}
