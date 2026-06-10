import SingleSelector from "./SingleSelector";
import { SelectableOption } from "./MultipleSelector";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";

type SingleResponsiblePersonSelectorProps = {
  options: SelectableOption[];
  onSelectionChange: (selectedOption: SelectableOption) => void;
  subHeading?: string;
};

export default function SingleResponsiblePersonSelector({
  options,
  onSelectionChange,
  subHeading = "Select Responsible Person",
}: SingleResponsiblePersonSelectorProps) {
  return (
    <SingleSelector
      options={options}
      onSelectionChange={(selected) => onSelectionChange(selected)}
      mainHeading={subHeading}
      selectedBorderColor="blue"
      selectedBadgeColor="blue"
    />
  );
}
