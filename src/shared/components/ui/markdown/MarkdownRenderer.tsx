'use client';

import { cn } from '@/shared/utils/utils';
import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

// Memoize the component to prevent unnecessary re-renders
export const MarkdownRenderer = memo(({ content, className }: MarkdownRendererProps) => {
  // Ensure content is a string
  const safeContent = typeof content === 'string' ? content : '';
  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml={false}
        components={{
          h1: ({ node, children, ...props }) => children
            ? (
                <h1
                  className="text-lg font-medium md:text-2xl my-3 sm:my-4 pb-1 sm:pb-2 border-b
                  border-gray-200 dark:border-gray-800"
                  {...props}
                >
                  {children}
                </h1>
              )
            : null,
          h2: ({ node, children, ...props }) => children
            ? (
                <h2 className="text-lg font-medium md:text-xl my-3 sm:my-4 pb-1" {...props}>
                  {children}
                </h2>
              )
            : null,
          h3: ({ node, children, ...props }) => children
            ? (
                <h3 className="text-base font-medium md:text-lg my-2 sm:my-3" {...props}>
                  {children}
                </h3>
              )
            : null,
          h4: ({ node, children, ...props }) => children
            ? (
                <h4 className="text-sm font-medium md:text-base my-1 sm:my-2" {...props}>
                  {children}
                </h4>
              )
            : null,
          p: ({ node, ...props }) => (
            <p className="text-sm sm:text-base my-2 sm:my-3 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="text-sm sm:text-base list-disc pl-4 sm:pl-6 my-2 sm:my-3 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="text-sm sm:text-base list-decimal pl-4 sm:pl-6 my-2 sm:my-3 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-2 sm:my-4 py-1
              text-sm sm:text-base text-gray-700 dark:text-gray-300"
              {...props}
            />
          ),
          a: ({ node, href, ...props }) => (
            <a
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {props.children}
            </a>
          ),
          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-6 border-t border-gray-200 dark:border-gray-800" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-50 dark:bg-gray-800" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />,
          tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50" {...props} />,
          th: ({ node, ...props }) => (
            <th
              className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500
              dark:text-gray-400 uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-normal text-xs sm:text-sm" {...props} />
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the content has changed
  return prevProps.content === nextProps.content;
});
