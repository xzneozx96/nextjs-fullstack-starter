'use client';

import FancyLoader from '@/shared/components/ui/fancy-loader/FancyLoader';
import { MarkdownRenderer } from '@/shared/components/ui/markdown/MarkdownRenderer';
import { SendIcon } from '@/shared/icons';
import { useChat } from '@ai-sdk/react';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

type ChatBoxProps = {
  initialMessage?: string;
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

export function ChatBox({
  initialMessage,
  className,
}: ChatBoxProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Initialize the chat with the initial feedback message if available
  const initialSystemMessage = initialMessage
    ? [
        {
          id: 'initial-assistant',
          role: 'assistant' as const,
          content: initialMessage,
        },
      ]
    : [];

  const { messages, input, handleInputChange, handleSubmit, status, error } = useChat({
    api: '/api/chat',
    initialMessages: initialSystemMessage,
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
        {messages.length === 0 && isLoading
          ? (
              <div className="flex flex-col items-center justify-center h-full">
                <FancyLoader />
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  Preparing feedback...
                </p>
              </div>
            )
          : (
              messagesList
            )}
        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded-lg">
            <p>
              Error:
              {error.message || 'Something went wrong. Please try again.'}
            </p>
          </div>
        )}
        {isLoading && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none">
              <FancyLoader />
            </div>
          </div>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask Mark a question"
            className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            disabled={isLoading || messages.length === 0}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || messages.length === 0}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="size-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
