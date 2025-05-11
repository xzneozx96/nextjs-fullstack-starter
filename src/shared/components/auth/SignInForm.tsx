'use client';
import type { z } from 'zod';
import { useHttp } from '@/core/http/useHttp';
import { signInSchema } from '@/features/auth/actions/auth-actions.validation';
import Input from '@/shared/components/form/input/InputField';
import Label from '@/shared/components/form/Label';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '@/shared/icons';
import { isApiSuccess } from '@/shared/types/api-response';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Alert from '../ui/alert/Alert';

export default function SignInForm() {
  const router = useRouter();
  // const [isChecked, setIsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { post, loading, error: httpError, resetError } = useHttp();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(data: z.infer<typeof signInSchema>) {
    resetError();

    const result = await post({
      url: '/auth/login',
      data,
      schemaValidation: signInSchema,
      showErrorToast: false,
    });

    if (isApiSuccess(result)) {
      router.push('/dashboard');
    }
  }

  // Use httpError if available, otherwise use local error state
  const displayError = httpError?.message || null;

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to Home
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-medium text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div>
                <Label>
                  Email
                  {' '}
                  <span className="text-error-500">*</span>
                  {' '}
                </Label>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="info@gmail.com"
                      type="email"
                      error={!!errors.email?.message}
                      hint={errors.email?.message}
                    />
                  )}
                />
              </div>
              <div>
                <Label>
                  Password
                  {' '}
                  <span className="text-error-500">*</span>
                  {' '}
                </Label>
                <div className="relative">
                  <Controller
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter your password"
                        type={showPassword ? 'text' : 'password'}
                        error={!!errors.password?.message}
                        hint={errors.password?.message}
                      />
                    )}
                  />
                  <span
                    tabIndex={0}
                    role="button"
                    onClick={() => setShowPassword(!showPassword)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowPassword(!showPassword);
                      }
                    }}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword
                      ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        )
                      : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                  </span>
                </div>
              </div>

              {/* <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div> */}

              {displayError && <Alert variant="error" title="Error" message={displayError} />}

              <div>
                <Button className="w-full" size="sm" type="submit" disabled={isSubmitting || loading}>
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
