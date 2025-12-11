"use client";
import { PocketMoney, PocketMoneyPopupProps } from "@/app/types/pocketMoney";
import React, { useState } from "react";
import Image from "next/image";
import createPocketMoneyImage from "@/app/admin/assets/doctor-suitcase-with-a-cross-svgrepo-com 1.png"; // You need to add an appropriate icon
import { ToggleSwitch } from "./FormComponents/ToggleSwitch";
import SelectableOptions from "./FormComponents/SelectableOptions";
import additionalNoteIcon from "@/app/admin/assets/name.png";

const CreatePocketMoneyPopup: React.FC<PocketMoneyPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
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

  const handleRepeatChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      repeat: value as PocketMoney["repeat"],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      id: "",
      title: "",
      description: "",
      amount: 0,
      currency: "RAY",
      checkerResponsible: [],
      repeat: "Never",
      notes: "",
      standardTask: "",
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setFormData({
      id: "",
      title: "",
      description: "",
      amount: 0,
      currency: "RAY",
      checkerResponsible: [],
      repeat: "Never",
      notes: "",
      standardTask: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header - Matching Appointment Popup Style */}
        <div className="border-b border-gray-200 bg-blue-200 m-2 px-6 py-4 rounded-lg flex gap-2">
          <div className="rounded-full bg-white p-2">
            <Image
              src={createPocketMoneyImage}
              alt="createPocketMoneyImage"
              width={15}
              height={15}
            />
          </div>
          <h2 className="text-xl font-semibold">Create Pocket Money</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Choose Standard Task */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium mb-3 text-gray-800">
              Choose Standard Task
            </h3>
            <div className="space-y-4">
              {standardTasks.map((group, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="font-semibold mb-3 text-gray-700">
                    {group.category}
                  </div>
                  <div className="space-y-2">
                    {group.tasks.map((task, taskIndex) => (
                      <label
                        key={taskIndex}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded"
                      >
                        <input
                          type="radio"
                          name="standardTask"
                          value={task}
                          checked={formData.standardTask === task}
                          onChange={() => handleTaskSelect(task)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="flex-1">{task}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-800">
              Description
            </label>
            <textarea
              placeholder="While details of track here"
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
            <label className="block text-lg font-medium mb-2 text-gray-800">
              Pocket Money Amount
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Enter pocket money amount"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              >
                <option value="RAY">RAY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {/* Checker Responsible */}
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-800">
              Checker Responsible
            </label>
            <div className="space-y-3">
              <div className="font-medium text-gray-700">Attempts</div>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                {checkerOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.checkerResponsible.includes(option)}
                      onChange={() => handleCheckerToggle(option)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex-1">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <SelectableOptions
            repeat={formData.repeat}
            onRepeatChange={handleRepeatChange}
          />

          {/* Additional Notes */}
          <div>
            <div className="flex items-center gap-2 ">
              <Image
                src={additionalNoteIcon}
                alt="createAppointmentImage"
                width={15}
                height={15}
              />
              <label className="block text-lg font-medium mb-2">
                Additional Notes
              </label>
            </div>
            <textarea
              placeholder="Any additional information..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Divider and Buttons - Matching Appointment Popup Style */}
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
                Create Pocket Money
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePocketMoneyPopup;
