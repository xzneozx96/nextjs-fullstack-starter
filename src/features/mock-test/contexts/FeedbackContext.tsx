'use client';

import type { Message } from '../types/vapi-conversation';
import { createContext, useCallback, useMemo, useState } from 'react';

type FeedbackContextType = {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  feedbackText: string;
  processedFeedback: string;
  setFeedbackText: (text: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  clearFeedback: () => void;
};

export const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// Helper function to clean markdown content
const cleanMarkdownContent = (content: string): string => {
  // Check if content is wrapped in a code block and extract it
  const codeBlockRegex = /```(?:markdown)?\n([\s\S]*)\n```/;
  const match = content.match(codeBlockRegex);

  if (match && match[1]) {
    // Return the content inside the code block
    return match[1].trim();
  }

  // Check if content is wrapped in HTML pre/code tags
  const htmlCodeBlockRegex = /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/;
  const htmlMatch = content.match(htmlCodeBlockRegex);

  if (htmlMatch && htmlMatch[1]) {
    // Return the content inside the HTML code block
    return htmlMatch[1].trim();
  }

  // If no code block wrapping is detected, return the original content
  return content;
};

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedbackText, setFeedbackTextState] = useState('');
  const [processedFeedback, setProcessedFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Process feedback text when it changes
  const setFeedbackText = useCallback((text: string) => {
    setFeedbackTextState(text);
    setProcessedFeedback(cleanMarkdownContent(text));
  }, []);

  // Clear feedback data
  const clearFeedback = useCallback(() => {
    setFeedbackTextState('');
    setProcessedFeedback('');
  }, []);

  const contextValue = useMemo(() => ({
    messages,
    setMessages,
    feedbackText,
    processedFeedback,
    setFeedbackText,
    isLoading,
    setIsLoading,
    clearFeedback,
  }), [messages, feedbackText, processedFeedback, isLoading, setFeedbackText, clearFeedback]);

  return (
    <FeedbackContext value={contextValue}>
      {children}
    </FeedbackContext>
  );
}
