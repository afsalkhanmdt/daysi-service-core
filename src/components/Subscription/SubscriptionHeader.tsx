'use client';

import React from 'react';
import Image from 'next/image';

interface SubscriptionHeaderProps {
  title: string;
  description: string;
  logoUrl?: string;
}

const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
  title,
  description,
  logoUrl,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8">
      {/* Logo Section */}
      {logoUrl && (
        <div className="mb-6">
          <Image
            src={logoUrl}
            alt="Daysi Logo"
            width={120}
            height={40}
            className="h-auto w-auto object-contain"
            priority
          />
        </div>
      )}

      {/* Title Section */}
      <h1 className="mb-3 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>

      {/* Description Section */}
      <p className="max-w-md text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
        {description}
      </p>
    </div>
  );
};

export default SubscriptionHeader;
