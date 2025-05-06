'use client';

import type { QuestionBank, Topic } from '../types/question-bank';
import { MarkdownRenderer } from '@/shared/components/ui/markdown/MarkdownRenderer';
import { ShinyText } from '@/shared/components/ui/shiny-text/ShinyText';
import { SendIcon } from '@/shared/icons';
import { useChat } from '@ai-sdk/react';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

type ChatBoxProps = {
  topic: Topic;
  questions: QuestionBank[];
  aiFeedback?: string;
  className?: string;
};

// Memoized message component to prevent unnecessary re-renders
const ChatMessage = memo(({ message }: { message: any }) => {
  const content = useMemo(() => {
    return (
      // For backward compatibility with the old format
      message.content
      // For the new format with parts
      || message.parts
        ?.filter((part: any) => part.type === 'text')
        .map((part: any) => (part.type === 'text' ? part.text : ''))
        .join('')
    );
  }, [message]);

  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[95%] p-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-orange-100 rounded-tr-none'
            : 'bg-gray-50 rounded-tl-none'
        }`}
      >
        {message.role === 'assistant'
          ? (
              <MarkdownRenderer content={content} />
            )
          : (
              <p className="whitespace-pre-wrap">{content}</p>
            )}
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

// Memoized loading indicator component to prevent unnecessary re-renders
const LoadingIndicator = memo(() => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none flex items-center space-x-2">
        <ShinyText>AI is thinking</ShinyText>
      </div>
    </div>
  );
});

LoadingIndicator.displayName = 'LoadingIndicator';

export function ChatWithAISpeakingTutor({
  aiFeedback,
  topic,
  questions,
  className,
}: ChatBoxProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Initialize the chat with the initial feedback message if available
  const feedbackMessage = aiFeedback
    ? [
        {
          id: 'initial-assistant',
          role: 'assistant' as const,
          content: aiFeedback,
        },
      ]
    : [];

  const { messages, input, handleInputChange, handleSubmit, status, error } = useChat({
    api: '/api/chat',
    body: {
      systemMessage: `You are an IELTS speaking tutor named Mark. You are helping a student with their IELTS speaking test on topic ${topic.title} that includes following questions: ${questions
        .map(question => question.questionText)
        .join(', ')}. Be supportive, encouraging, and provide constructive feedback with clear examples when necessary. The initial message contains important feedback about the student\'s speaking test that you should reference in your responses.`,
    },
    initialMessages: feedbackMessage,
    experimental_throttle: 200, // Throttle updates to reduce re-renders
  });

  // Check if the chat is loading
  const isLoading = status === 'streaming' || status === 'submitted';

  // Optimized auto-scroll using requestAnimationFrame
  const smoothScrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      if (scrollTimeoutRef.current) {
        window.cancelAnimationFrame(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = window.requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      });
    }
  }, []);

  // Auto-scroll to the bottom when new messages arrive or when streaming
  useEffect(() => {
    smoothScrollToBottom();

    // Clean up the animation frame on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        window.cancelAnimationFrame(scrollTimeoutRef.current);
      }
    };
  }, [messages, isLoading, smoothScrollToBottom]);

  // Focus the input field when the component mounts or when streaming completes
  useEffect(() => {
    if (inputRef.current && messages.length > 0 && !isLoading) {
      inputRef.current.focus();
    }
  }, [messages.length, isLoading]);

  // Memoize the messages list to prevent unnecessary re-renders
  const messagesList = useMemo(() => {
    return messages.map(message => (
      <ChatMessage key={message.id} message={message} />
    ));
  }, [messages]);

  return (
    <div className={`flex flex-col h-full overflow-auto ${className}`}>
      {/* Chat messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-auto space-y-4"
      >
        <>
          {/* Regular message list */}
          {messagesList}

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-100 text-red-800 rounded-lg">
              <p className="font-medium mb-1">Error:</p>
              <p>{error.message || 'Something went wrong. Please try again.'}</p>
            </div>
          )}

          {/* Loading indicator for ongoing conversation */}
          {isLoading && <LoadingIndicator />}
        </>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask Mark a question..."
            className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            disabled={isLoading || messages.length === 0}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || messages.length === 0}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="size-5 -rotate-45" />
          </button>
        </div>
      </form>
    </div>
  );
}
