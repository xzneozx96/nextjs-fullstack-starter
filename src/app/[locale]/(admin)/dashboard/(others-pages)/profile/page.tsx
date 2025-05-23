import type { Metadata } from 'next';
import UserAddressCard from '@/shared/components/user-profile/UserAddressCard';
import UserInfoCard from '@/shared/components/user-profile/UserInfoCard';
import UserMetaCard from '@/shared/components/user-profile/UserMetaCard';
import React from 'react';

export const metadata: Metadata = {
  title: 'Next.js Profile | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
};

export default function Profile() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>
    </div>
  );
}
