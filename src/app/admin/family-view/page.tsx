import FamilyViewWrapper from "./components/FamilyViewWrapper";

export default function Page({
  searchParams,
}: {
  searchParams: { familyId?: string };
}) {
  const familyId = searchParams.familyId ?? "";
  return <FamilyViewWrapper familyId={familyId} />;
}
