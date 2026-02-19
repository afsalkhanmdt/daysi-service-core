"use client";

import { ToDoCreateCommand, todoPopupPropsType } from "@/app/types/todo";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import createTodoImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png";
import descriptionIcon from "@/app/admin/assets/descriptionIcon.png";
import participantsIcon from "@/app/admin/assets/participantsIcon.png";
import groupIcon from "@/app/admin/assets/groupIcon.png";
import additionalNoteIcon from "@/app/admin/assets/name.png";
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import MultipleSelector, {
  SelectableOption,
} from "./FormComponents/MultipleSelector";
import CustomDropdown from "./FormComponents/DropDown";
import {
  mapResourcesToSelectableOptions,
  mapToDoTaskToCreateCommand,
} from "@/app/utils/resourceAdapters";
import { useResources } from "@/app/context/ResourceContext";
import {
  groupOptions,
  initialToDoCreateBody,
  statusOptions,
} from "@/app/constants/toDoForm";

const EditTodoPopup: React.FC<todoPopupPropsType> = ({
  isOpen,
  onClose,
  todo,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ToDoCreateCommand>(
    initialToDoCreateBody,
  );

  const { resources } = useResources();
  const [statuses, setStatuses] = useState<SelectableOption[]>(statusOptions);
  const [responsiblePersons, setResponsiblePersons] = useState<
    SelectableOption[]
  >([]);

  /* ---------- Load family members ---------- */
  useEffect(() => {
    setResponsiblePersons(mapResourcesToSelectableOptions(resources));
  }, [resources]);

  /* ---------- Map todo → formData ---------- */
  useEffect(() => {
    if (!todo || responsiblePersons.length === 0) return;

    const mapped = mapToDoTaskToCreateCommand(todo);
    setFormData(mapped);

    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: mapped.assignedTo?.includes(String(person.memberId)),
      })),
    );

    const isClosed = todo.Status === 1 || todo.Status === 2;

    setStatuses((prev) =>
      prev.map((option) => ({
        ...option,
        isSelected: isClosed
          ? option.label === "Close"
          : option.label === "Open",
      })),
    );
  }, [todo, responsiblePersons.length]);

  /* ---------- Handlers ---------- */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGroupSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      toDoGroupId: Number(value),
    }));
  };

  const handleToggleChange = (
    field: keyof ToDoCreateCommand,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? 1 : 0,
    }));
  };

  const handleResponsiblePersonsChange = (
    selectedPersons: SelectableOption[],
  ) => {
    setResponsiblePersons((prev) =>
      prev.map((person) => ({
        ...person,
        isSelected: selectedPersons.some((sp) => sp.id === person.id),
      })),
    );

    setFormData((prev) => ({
      ...prev,
      assignedTo: selectedPersons.map((p) => String(p.id)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  useEffect(() => {
    setResponsiblePersons(mapResourcesToSelectableOptions(resources));
  }, [resources]);

  if (!isOpen || !todo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 bg-blue-200 m-2 px-6 py-4 rounded-lg flex gap-2">
          <div className="rounded-full bg-white p-2">
            <Image
              src={createTodoImage}
              alt="editTodoImage"
              width={15}
              height={15}
            />
          </div>
          <h2 className="text-xl font-semibold">Edit ToDo</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-100 rounded-md p-2">
            <div className="flex items-center gap-2 mb-2">
              <Image
                src={descriptionIcon}
                alt="Description"
                width={15}
                height={15}
              />
              <label className="text-lg font-medium">Description</label>
            </div>
            <input
              name="description"
              value={formData.description ?? ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Private</label>
              <ToggleSwitch
                checked={formData.private === 1}
                onChange={(checked) => handleToggleChange("private", checked)}
              />
            </div>
          </div>

          {/* Responsible Persons */}
          <MultipleSelector
            titleIconUrl={participantsIcon.src}
            options={responsiblePersons}
            onSelectionChange={handleResponsiblePersonsChange}
            title="Select Responsible Persons"
            showSelectAll
            showCount
            showImages
            singleSelect={false}
          />
          <div className="grid grid-cols-2 gap-4 bg-blue-100 rounded-md p-2">
            <CustomDropdown
              options={groupOptions}
              selectedValue={String(formData.toDoGroupId)}
              onSelect={handleGroupSelect}
              placeholder="Select a group"
              title="Groups"
              iconUrl={groupIcon.src}
            />
          </div>

          <MultipleSelector
            options={statuses}
            onSelectionChange={(selected) =>
              setStatuses((prev) =>
                prev.map((s) => ({
                  ...s,
                  isSelected: selected.some((sel) => sel.id === s.id),
                })),
              )
            }
            title="Status"
            showSelectAll={false}
            showCount
            singleSelect
          />

          <div className="bg-blue-100 rounded-md p-2">
            <div className="flex items-center gap-2 mb-2">
              <Image
                src={additionalNoteIcon}
                alt="Note"
                width={15}
                height={15}
              />
              <label className="text-lg font-medium">Note</label>
            </div>
            <textarea
              name="note"
              value={formData.note ?? ""}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="border-t pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTodoPopup;
