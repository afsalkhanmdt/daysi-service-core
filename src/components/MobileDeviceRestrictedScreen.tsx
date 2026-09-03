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
          The MyFamilii Webplatform can only be accessed through a browser on a Tablets or a Computer.
        </h2>

        {/* Secondary Subtitle */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 w-full mb-2">
          <p className="text-sm font-semibold text-emerald-800 leading-relaxed">
            From a mobile device you can access the calendar from The MyFamilii App.
          </p>
        </div>
      </div>
    </div>
  );
}
