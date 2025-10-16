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
  const familyId = searchParams.familyId ?? "";
  const memberId = searchParams.memberId ?? "";
  return <FamilyViewWrapper familyId={familyId} userId={memberId} />;
}
