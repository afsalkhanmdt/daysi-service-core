'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface FreemiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FreemiumModal: React.FC<FreemiumModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    router.push('/subscription');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Upgrade to Premium</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Your current Freemium plan is view-only. Upgrade to Premium to create, edit, or delete appointments and tasks.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreemiumModal;
