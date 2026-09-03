"use client";

import { useState, useEffect } from "react";

/**
 * Detects if the current client is accessing from a smartphone (mobile device).
 * Permits Tablets (iPad, Android Tablet, etc.) and Computers (desktop/laptop).
 */
export function checkIsSmartphone(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";

  // 1. Tablet Detection (Tablets are allowed)
  const isTabletUA =
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(
      ua
    );

  // iPad OS 13+ desktop-class browser detection (Macintosh with touch points)
  const isIPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  if (isTabletUA || isIPadOS) {
    return false; // Tablet is allowed
  }

  // 2. Mobile Phone (Smartphone) User-Agent Detection
  const isMobilePhoneUA =
    /(iphone|ipod|android.*mobile|blackberry|bb10|mini|windows\sce|palm|smartphone|iemobile|opera\smobi)/i.test(
      ua
    );

  if (isMobilePhoneUA) {
    return true;
  }

  // 3. Screen Dimension fallback for mobile phone viewport with touch support (< 768px in portrait)
  const isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

  const screenWidth = Math.min(window.innerWidth, window.screen?.width || window.innerWidth);

  if (isTouchDevice && screenWidth < 768) {
    return true;
  }

  return false;
}

export function useIsSmartphone() {
  const [isSmartphone, setIsSmartphone] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const evaluate = () => {
      setIsSmartphone(checkIsSmartphone());
      setIsLoaded(true);
    };

    evaluate();

    window.addEventListener("resize", evaluate);
    window.addEventListener("orientationchange", evaluate);

    return () => {
      window.removeEventListener("resize", evaluate);
      window.removeEventListener("orientationchange", evaluate);
    };
  }, []);

  return { isSmartphone, isLoaded };
}
