import FamilyViewWrapper from "./components/FamilyViewWrapper";

export default function Page({
  searchParams,
}: {
  searchParams: { familyId?: string; memberId?: string };
}) {
  const familyId = searchParams.familyId ?? "";
  const memberId = searchParams.memberId ?? "";
  return <FamilyViewWrapper familyId={familyId} userId={memberId} />;
}
