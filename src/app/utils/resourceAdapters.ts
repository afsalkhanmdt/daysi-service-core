import { ResourceType } from "@/app/context/ResourceContext";
import { SelectableOption } from "../admin/family-view/components/FormComponents/MultipleSelector";


export const mapResourcesToSelectableOptions = (
  resources: ResourceType[],
  selectedIds: string[] = []
): SelectableOption[] => {
  return resources.map((r) => ({
    id:r.localId,
    memberId: r.memberId,
    label: r.title,
    imageUrl: r.image,
    isSelected: selectedIds.includes(r.localId.toString()),
  }));
};
