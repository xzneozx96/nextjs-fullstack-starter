'use client';
import { useModal } from '@/hooks/useModal';
import React from 'react';

import ComponentCard from '../../common/ComponentCard';
import Button from '../../ui/button/Button';
import { Modal } from '../../ui/modal';

export default function DefaultModal() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.warn('Saving changes...');
    closeModal();
  };
  return (
    <div>
      <ComponentCard title="Default Modal">
        <Button size="sm" onClick={openModal}>
          Open Modal
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[600px] p-5 lg:p-10"
        >
          <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
            Modal Heading
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque euismod est quis mauris lacinia pharetra. Sed a ligula
            ac odio condimentum aliquet a nec nulla. Aliquam bibendum ex sit
            amet ipsum rutrum feugiat ultrices enim quam.
          </p>
          <p className="mt-5 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque euismod est quis mauris lacinia pharetra. Sed a ligula
            ac odio.
          </p>
          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </Modal>
      </ComponentCard>
    </div>
  );
}
