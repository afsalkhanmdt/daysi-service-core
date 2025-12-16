"use client";
import { PocketMoney, PocketMoneyPopupProps } from "@/app/types/pocketMoney";
import React, { useState, useEffect } from "react";

const EditPocketMoneyPopup: React.FC<PocketMoneyPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pocketMoney,
}) => {
  const [formData, setFormData] = useState<PocketMoney>({
    id: "",
    title: "",
    description: "",
    amount: 0,
    currency: "RAY",
    checkerResponsible: [],
    repeat: "Never",
    notes: "",
    standardTask: "",
    firstComeFirstServe: false,
  });

  const standardTasks = [
    {
      category: "Client up the Exam",
      tasks: ["With the Buy", "Warrant the Boom", "With Up"],
    },
    {
      category: "Empty the Shareholder",
      tasks: ["With the Car", "Make the Bad", "Do Morework"],
    },
  ];

  const checkerOptions = ["ChatMan", "Save", "Guns", "Draw"];
  const repeatOptions = [
    "Never",
    "Everyday",
    "Every Week",
    "Every Month",
    "Every Year",
  ];

  useEffect(() => {
    if (pocketMoney) {
      setFormData(pocketMoney);
    }
  }, [pocketMoney]);

  const handleCheckerToggle = (checker: string) => {
    setFormData((prev) => ({
      ...prev,
      checkerResponsible: prev.checkerResponsible.includes(checker)
        ? prev.checkerResponsible.filter((c) => c !== checker)
        : [...prev.checkerResponsible, checker],
    }));
  };

  const handleTaskSelect = (task: string) => {
    setFormData((prev) => ({ ...prev, standardTask: task }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !pocketMoney) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold">Edit Pocket Money</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Choose Standard Task */}
          <div>
            <h3 className="text-lg font-medium mb-3">Choose Standard Task</h3>
            <div className="space-y-4">
              {standardTasks.map((group, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="font-semibold mb-2">{group.category}</div>
                  <div className="space-y-2">
                    {group.tasks.map((task, taskIndex) => (
                      <label
                        key={taskIndex}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="radio"
                          name="standardTask"
                          value={task}
                          checked={formData.standardTask === task}
                          onChange={() => handleTaskSelect(task)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>{task}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pocket Money Amount */}
          <div>
            <h3 className="text-lg font-medium mb-2">Pocket Money Amount</h3>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currency: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="RAY">RAY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {/* Checker Responsible */}
          <div>
            <h3 className="text-lg font-medium mb-2">Checker Responsible</h3>
            <div className="space-y-2">
              <div className="font-medium">Add Add</div>
              <div className="grid grid-cols-2 gap-2 ml-4">
                {checkerOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.checkerResponsible.includes(option)}
                      onChange={() => handleCheckerToggle(option)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Repeat Sequence */}
          <div>
            <h3 className="text-lg font-medium mb-2">Repeat Sequence</h3>
            <div className="space-y-2">
              {repeatOptions.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="repeatSequence"
                    value={option}
                    checked={formData.repeat === option}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        repeatSequence: e.target.value as any,
                      }))
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <h3 className="text-lg font-medium mb-2">Note</h3>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Divider and Buttons */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPocketMoneyPopup;
