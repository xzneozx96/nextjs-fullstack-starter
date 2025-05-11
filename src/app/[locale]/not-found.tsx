import type { Metadata } from 'next';
import GridShape from '@/shared/components/common/GridShape';
import { Button } from '@/shared/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
  title: 'Error 404 | IELTS MentorPro',
  description:
    'This is Error 404 page for IELTS MentorPro',
};

export default function Error404() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 className="mb-8 font-medium text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
          ERROR
        </h1>

        <Image
          src="/images/error/404.svg"
          alt="404"
          className="dark:hidden"
          width={472}
          height={152}
        />
        <Image
          src="/images/error/404-dark.svg"
          alt="404"
          className="hidden dark:block"
          width={472}
          height={152}
        />

        <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          We can’t seem to find the page you are looking for!
        </p>

        <Link
          href="/"
        >
          <Button>
            Back to Home Page
          </Button>
        </Link>
      </div>
    </div>
  );
}
