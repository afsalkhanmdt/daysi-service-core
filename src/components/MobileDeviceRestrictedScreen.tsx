"use client";

import React from "react";
import Image from "next/image";
import mainIcon from "@/app/admin/assets/2026-03-06 NEW MyFamilii Header - ONLY Logo Black TAG line CROP.png";

export default function MobileDeviceRestrictedScreen() {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-600 p-6">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md flex flex-col items-center text-center border border-white/40 animate-fade-in">
        {/* Brand Logo */}
        <div className="mb-6">
          <Image
            src={mainIcon.src}
            alt="MyFamilii"
            width={280}
            height={70}
            className="w-64 h-16 object-contain"
            priority
          />
        </div>

        {/* Device Icon Graphic */}
        <div className="w-20 h-20 rounded-2xl bg-sky-50 border-2 border-sky-100 flex items-center justify-center mb-6 shadow-inner text-sky-500">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"
            />
          </svg>
        </div>

        {/* Primary Notice */}
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug mb-4">
          The MyFamilii Webplatform can only be accessed through a browser on a Tablet or a Computer.
        </h2>

        {/* Secondary Notice */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 w-full mb-6">
          <p className="text-sm font-semibold text-emerald-800 leading-relaxed">
            From a mobile device you can access the calendar from The MyFamilii App.
          </p>
        </div>

        {/* App Download Buttons / Badges */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center items-center">
          {/* App Store Badge */}
          <div
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-4 py-2.5 bg-black text-white rounded-xl shadow hover:opacity-90 transition-opacity cursor-pointer select-none"
            title="App Store link coming soon"
          >
            <svg
              className="w-6 h-6 fill-current flex-shrink-0"
              viewBox="0 0 24 24"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-.99 1.74-.88 2.76 1.02.08 2-.51 2.61-1.26z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] leading-3 uppercase tracking-wider text-gray-300 font-medium">
                Download on the
              </div>
              <div className="text-sm font-semibold leading-4">App Store</div>
            </div>
          </div>

          {/* Google Play Badge */}
          <div
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-4 py-2.5 bg-black text-white rounded-xl shadow hover:opacity-90 transition-opacity cursor-pointer select-none"
            title="Google Play link coming soon"
          >
            <svg
              className="w-6 h-6 fill-current flex-shrink-0"
              viewBox="0 0 24 24"
            >
              <path d="M3.609 1.814L13.793 12 3.61 22.186c-.366-.355-.61-.852-.61-1.408V3.222c0-.556.244-1.053.61-1.408zm11.233 11.235l2.257-2.257-11.45-6.61 9.193 8.867zm0 1.898l-9.193 8.867 11.45-6.61-2.257-2.257zm1.34-1.341l2.846 1.644c.82.474.82 1.246 0 1.72l-2.846 1.644-2.025-2.025 2.025-2.025c.001 0 .001 0 0 .042z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] leading-3 uppercase tracking-wider text-gray-300 font-medium">
                Get it on
              </div>
              <div className="text-sm font-semibold leading-4">Google Play</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
