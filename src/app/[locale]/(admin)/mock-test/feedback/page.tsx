'use client';

import { FeedbackContent } from '@/features/mock-test/components/FeedbackContent';
import { FeedbackProvider } from '@/features/mock-test/contexts/FeedbackContext';

export default function FeedbackPage() {
  return (
    <FeedbackProvider>
      <FeedbackContent />
    </FeedbackProvider>
  );
}
