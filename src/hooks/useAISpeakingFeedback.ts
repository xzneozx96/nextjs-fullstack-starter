import { FeedbackContext } from '@/contexts/FeedbackContext';

import { use } from 'react';

export function useAISpeakingFeedback() {
  const context = use(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
