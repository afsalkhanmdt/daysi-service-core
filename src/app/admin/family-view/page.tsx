"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const FamilyViewWrapper = dynamic(
  () => import("./components/FamilyViewWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading...
      </div>
    ),
  }
);

export default function Page({
  searchParams,
}: {
  searchParams: { familyId?: string; memberId?: string };
}) {
  const router = useRouter();

  const urlFamilyId = searchParams.familyId ?? "";
  const urlMemberId = searchParams.memberId ?? "";

  useEffect(() => {
    const storedFamilyId = localStorage.getItem("familyId");
    const storedMemberId = localStorage.getItem("memberId");

    // CASE 1: User not logged in → force logout
    if (!storedFamilyId || !storedMemberId) {
      localStorage.clear();
      router.replace("/admin/login");
      return;
    }

    // CASE 2: User edited URL manually → force logout
    if (storedFamilyId !== urlFamilyId || storedMemberId !== urlMemberId) {
      localStorage.clear();
      router.replace("/admin/login");
      return;
    }
  }, [router, urlFamilyId, urlMemberId]);

  return <FamilyViewWrapper familyId={urlFamilyId} userId={urlMemberId} />;
}
