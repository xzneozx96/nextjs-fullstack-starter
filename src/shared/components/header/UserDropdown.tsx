'use client';
import { useRouter } from '@/core/config/i18nNavigation';
import { useHttp } from '@/core/http/useHttp';
import { CogIcon, SignOutIcon } from '@/shared/icons';
import { isApiSuccess } from '@/shared/types/api-response';
import Image from 'next/image';
import React, { useState } from 'react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { loading, post } = useHttp();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    closeDropdown();

    try {
      const response = await post({
        url: '/auth/logout',
      });

      // If the logout was successful, redirect to signin page
      if (isApiSuccess(response)) {
        router.push('/signin');
      }
    } catch (err) {
      // The error has already been handled by the onError callback and toast
      // We're just catching it here to prevent the unhandled promise rejection
      console.log('Error while log out', err);
    }
  }
  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <Image
            width={44}
            height={44}
            src="/images/user/user-01.jpg"
            alt="User"
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">Ross</span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            Ross and Zober
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            rossandzober@gmail.com
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/dashboard/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <CogIcon className="size-6" />
              Account settings
            </DropdownItem>
          </li>
        </ul>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
          disabled={loading}
        >
          <SignOutIcon className="size-6" />
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
