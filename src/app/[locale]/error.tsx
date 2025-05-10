'use client';

import GridShape from '@/shared/components/common/GridShape';
import Button from '@/shared/components/ui/button/Button';
import * as Sentry from '@sentry/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError(props: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(props.error);
  }, [props.error]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">

        <div className="mx-auto mb-10 w-full max-w-[155px] text-center sm:max-w-[204px]">
          <Image
            src="/images/error/maintenance.svg"
            alt="404"
            className="dark:hidden"
            width={472}
            height={152}
          />
          <Image
            src="/images/error/maintenance-dark.svg"
            alt="404"
            className="hidden dark:block"
            width={472}
            height={152}
          />
        </div>

        <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
          ERROR
        </h1>

        <p className="mt-6 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          {props.error?.message}
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
