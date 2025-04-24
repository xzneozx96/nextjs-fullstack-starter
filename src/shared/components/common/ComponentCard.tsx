import React from 'react';

type ComponentCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
};

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = '',
  desc = '',
}) => {
  // Check if this is a project monitoring component by looking for amber border in className
  const isProjectMonitoring = className?.includes('border-amber');

  return (
    <div
      className={`rounded-2xl border ${isProjectMonitoring ? 'border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-900/10' : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]'} ${className}`}
    >
      {/* Card Header */}
      <div className={`px-6 py-5 ${isProjectMonitoring ? 'bg-amber-100/50 dark:bg-amber-900/20' : ''}`}>
        <h3 className={`text-base font-medium ${isProjectMonitoring ? 'text-amber-900 dark:text-amber-200' : 'text-gray-800 dark:text-white/90'}`}>
          {title}
        </h3>
        {desc && (
          <p className={`mt-1 text-sm ${isProjectMonitoring ? 'text-amber-800 dark:text-amber-300/80' : 'text-gray-500 dark:text-gray-400'}`}>
            {desc}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className={`p-4 border-t ${isProjectMonitoring ? 'border-amber-200 dark:border-amber-800/50' : 'border-gray-100 dark:border-gray-800'} sm:p-6`}>
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
