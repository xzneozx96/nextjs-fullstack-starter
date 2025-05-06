import type { Metadata } from 'next';
import ComponentCard from '@/shared/components/common/ComponentCard';
import PageBreadcrumb from '@/shared/components/common/PageBreadCrumb';
import { Avatar, AvatarImage } from '@/shared/components/ui/avatar/Avatar';
import React from 'react';

export const metadata: Metadata = {
  title: 'Next.js Avatars | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Avatars page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
};

export default function AvatarPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Avatar" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Default Avatar">
          {/* Default Avatar (No Status) */}
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar className="size-6">
              <AvatarImage src="/images/user/user-01.jpg" />
            </Avatar>
            <Avatar className="size-8">
              <AvatarImage src="/images/user/user-01.jpg" />
            </Avatar>
            <Avatar className="size-10">
              <AvatarImage src="/images/user/user-01.jpg" />
            </Avatar>
            <Avatar className="size-12">
              <AvatarImage src="/images/user/user-01.jpg" />
            </Avatar>
            <Avatar className="size-14">
              <AvatarImage src="/images/user/user-01.jpg" />
            </Avatar>
            <Avatar className="size-16">
              <AvatarImage src="/images/user/user-01.jpg" />
            </Avatar>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
