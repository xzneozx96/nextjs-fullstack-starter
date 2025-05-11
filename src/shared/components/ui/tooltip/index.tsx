'use client';

import React, { useState } from 'react';

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
};

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2';
    }
  };

  return (
    <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-sm dark:bg-gray-700 whitespace-nowrap ${getPositionClasses()}`}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 ${
              position === 'top'
                ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2'
                : position === 'right'
                  ? 'right-full top-1/2 -translate-y-1/2 translate-x-1/2'
                  : position === 'bottom'
                    ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2'
                    : 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
}
