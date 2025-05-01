'use client';

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

export function ChatWithAISpeakingTutor({
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

  // Check if this is the initial loading state
  const isInitialLoading = messages.length === 0 && initialMessage && !error;

  // Check if we should show the loading indicator
  const showLoadingIndicator = isInitialLoading || (messages.length === 0 && isLoading);

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
        {/* Initial loading state - when there are no messages yet but we have an initial message */}
        {showLoadingIndicator
          ? (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-8">
                <div className="relative mb-4">
                  <div className="animate-pulse bg-blue-100 rounded-full size-16 flex items-center justify-center">
                    <div className="animate-spin rounded-full size-10 border-4 border-t-transparent border-blue-500"></div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    AI Tutor
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Preparing your feedback</h3>
                <p className="text-sm text-gray-600 text-center max-w-xs">
                  Our AI tutor is analyzing your speaking test and preparing detailed feedback on your performance.
                </p>
                <div className="mt-4 flex space-x-1">
                  <div className="animate-bounce size-2 bg-blue-400 rounded-full" style={{ animationDelay: '0ms' }}></div>
                  <div className="animate-bounce size-2 bg-blue-500 rounded-full" style={{ animationDelay: '150ms' }}></div>
                  <div className="animate-bounce size-2 bg-blue-600 rounded-full" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )
          : (
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
                {isLoading && messages.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none flex items-center space-x-2">
                      <div className="relative flex items-center justify-center">
                        <div className="animate-spin rounded-full size-5 border-2 border-t-transparent border-blue-500"></div>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">AI is thinking...</span>
                    </div>
                  </div>
                )}
              </>
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
            placeholder="Ask a follow-up question about your feedback..."
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
