import type { Metadata } from 'next';
import PageBreadcrumb from '@/shared/components/common/PageBreadCrumb';
import { Badge } from '@/shared/components/ui/badge';
import React from 'react';

export const metadata: Metadata = {
  title: 'Next.js Badge | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Badge page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
  // other metadata
};

export default function BadgePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Badges" />
      <div className="space-y-5 sm:space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              With Light Background
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              {/* Light Variant */}
              <Badge variant="default" color="primary">
                Primary
              </Badge>
              <Badge variant="default" color="success">
                Success
              </Badge>
              {' '}
              <Badge variant="default" color="error">
                Error
              </Badge>
              {' '}
              <Badge variant="default" color="warning">
                Warning
              </Badge>
              {' '}
              <Badge variant="default" color="info">
                Info
              </Badge>
              <Badge variant="default" color="light">
                Light
              </Badge>
              <Badge variant="default" color="dark">
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              With Solid Background
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              {/* Light Variant */}
              <Badge variant="outline" color="primary">
                Primary
              </Badge>
              <Badge variant="outline" color="success">
                Success
              </Badge>
              {' '}
              <Badge variant="outline" color="error">
                Error
              </Badge>
              {' '}
              <Badge variant="outline" color="warning">
                Warning
              </Badge>
              {' '}
              <Badge variant="outline" color="info">
                Info
              </Badge>
              <Badge variant="outline" color="light">
                Light
              </Badge>
              <Badge variant="outline" color="dark">
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Light Background with Left Icon
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge variant="default" color="primary">
                Primary
              </Badge>
              <Badge variant="default" color="success">
                Success
              </Badge>
              {' '}
              <Badge variant="default" color="error">
                Error
              </Badge>
              {' '}
              <Badge variant="default" color="warning">
                Warning
              </Badge>
              {' '}
              <Badge variant="default" color="info">
                Info
              </Badge>
              <Badge variant="default" color="light">
                Light
              </Badge>
              <Badge variant="default" color="dark">
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Solid Background with Left Icon
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge variant="outline" color="primary">
                Primary
              </Badge>
              <Badge variant="outline" color="success">
                Success
              </Badge>
              {' '}
              <Badge variant="outline" color="error">
                Error
              </Badge>
              {' '}
              <Badge variant="outline" color="warning">
                Warning
              </Badge>
              {' '}
              <Badge variant="outline" color="info">
                Info
              </Badge>
              <Badge variant="outline" color="light">
                Light
              </Badge>
              <Badge variant="outline" color="dark">
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Light Background with Right Icon
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge variant="default" color="primary">
                Primary
              </Badge>
              <Badge variant="default" color="success">
                Success
              </Badge>
              {' '}
              <Badge variant="default" color="error">
                Error
              </Badge>
              {' '}
              <Badge variant="default" color="warning">
                Warning
              </Badge>
              {' '}
              <Badge variant="default" color="info">
                Info
              </Badge>
              <Badge variant="default" color="light">
                Light
              </Badge>
              <Badge variant="default" color="dark">
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Solid Background with Right Icon
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge variant="outline" color="primary">
                Primary
              </Badge>
              <Badge variant="outline" color="success">
                Success
              </Badge>
              {' '}
              <Badge variant="outline" color="error">
                Error
              </Badge>
              {' '}
              <Badge variant="outline" color="warning">
                Warning
              </Badge>
              {' '}
              <Badge variant="outline" color="info">
                Info
              </Badge>
              <Badge variant="outline" color="light">
                Light
              </Badge>
              <Badge variant="outline" color="dark">
                Dark
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
