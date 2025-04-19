'use client';

import { FeedbackContent } from '@/components/mock-test/FeedbackContent';
import { FeedbackProvider } from '@/contexts/FeedbackContext';

export default function FeedbackPage() {
  return (
    <FeedbackProvider>
      <FeedbackContent />
    </FeedbackProvider>
  );
}
