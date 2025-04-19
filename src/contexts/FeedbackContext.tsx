'use client';

import type { Message } from '@/types/vapi-conversation';
import { createContext, useMemo, useState } from 'react';

type FeedbackContextType = {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  feedbackText: string;
  setFeedbackText: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <FeedbackContext
      value={useMemo(() => ({
        messages,
        setMessages,
        feedbackText,
        setFeedbackText,
        isLoading,
        setIsLoading,
      }), [messages, feedbackText, isLoading])}
    >
      {children}
    </FeedbackContext>
  );
}
