"use client";

import React from "react";
import { useIsSmartphone } from "@/app/hooks/useIsSmartphone";
import MobileDeviceRestrictedScreen from "./MobileDeviceRestrictedScreen";

export default function DeviceGuard({ children }: { children: React.ReactNode }) {
  const { isSmartphone, isLoaded } = useIsSmartphone();

  if (isLoaded && isSmartphone) {
    return <MobileDeviceRestrictedScreen />;
  }

  return <>{children}</>;
}
