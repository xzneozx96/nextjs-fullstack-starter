import type { Metadata } from 'next';
import LineChartOne from '@/shared/components/charts/line/LineChartOne';
import ComponentCard from '@/shared/components/common/ComponentCard';
import PageBreadcrumb from '@/shared/components/common/PageBreadCrumb';
import React from 'react';

export const metadata: Metadata = {
  title: 'Next.js Line Chart | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Line Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
};
export default function LineChart() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Line Chart" />
      <div className="space-y-6">
        <ComponentCard title="Line Chart 1">
          <LineChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
