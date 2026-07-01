import MultipleSelector, { SelectableOption } from "./MultipleSelector";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";

type ResponsiblePersonSelectorProps = {
  options: SelectableOption[];
  onSelectionChange: (selectedOptions: SelectableOption[]) => void;
  subHeading?: string;
  disabled?: boolean;
};

export default function ResponsiblePersonSelector({
  options,
  onSelectionChange,
  subHeading = "Select Responsible Persons",
  disabled = false,
}: ResponsiblePersonSelectorProps) {
  return (
    <MultipleSelector
      options={options}
      onSelectionChange={onSelectionChange}
      subHeading={subHeading}
      subHeadingIcon={participantsIcon.src}
      showSelectAll={true}
      showCount={true}
      showImages={true}
      selectedBorderColor="blue"
      selectedBadgeColor="blue"
    />
  );
}
