import { ResourceType } from "@/app/context/ResourceContext";
import { SelectableOption } from "../admin/family-view/components/FormComponents/MultipleSelector";


export const mapResourcesToSelectableOptions = (
  resources: ResourceType[],
  selectedIds: Number[] = []
): SelectableOption[] => {
  return resources.map((r) => ({
    id: r.id,
    memberId: r.extendedProps?.memberId,
    label: r.title,
    imageUrl: r.extendedProps?.image,
    isSelected: selectedIds.includes(Number(r.id)),
  }));
};
