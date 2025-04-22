import React, { useEffect, useRef } from 'react';
import { MarkdownRenderer } from '../../../shared/components/ui/markdown/MarkdownRenderer';

type StreamingAIResponseProps = {
  content: string;
  isLoading: boolean;
  error?: string | null;
  title?: string;
  height?: string;
};

const StreamingAIResponse: React.FC<StreamingAIResponseProps> = ({
  content,
  isLoading,
  error = null,
  title = 'AI Response',
  height = '500px',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h3>
        {isLoading && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-blue-600 dark:text-blue-400 animate-pulse">Processing</span>
            <div className="flex items-center">
              <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-blue-500"></div>
              <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-blue-500" style={{ animationDelay: '0.2s' }}></div>
              <div className="animate-pulse h-2 w-2 rounded-full bg-blue-500" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="p-4 overflow-y-auto"
        style={{ height }}
      >
        {error
          ? (
              <div className="p-3 bg-red-50 text-red-700 rounded-md">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )
          : content
            ? (
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={content} />
                </div>
              )
            : isLoading
              ? (
                  <div className="flex flex-col justify-center items-center h-full text-gray-500 dark:text-gray-400">
                    <div className="w-8 h-8 mb-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                    <p>Generating content...</p>
                  </div>
                )
              : (
                  <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                    <p>Results will appear here</p>
                  </div>
                )}
      </div>
    </div>
  );
};

export default StreamingAIResponse;
