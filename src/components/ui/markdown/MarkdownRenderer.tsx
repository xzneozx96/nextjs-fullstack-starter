'use client';

import { cn } from '@/libs/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, children, ...props }) => children ? <h1 className="text-2xl font-bold my-4" {...props}>{children}</h1> : null,
          h2: ({ node, children, ...props }) => children ? <h2 className="text-xl font-bold my-3" {...props}>{children}</h2> : null,
          h3: ({ node, children, ...props }) => children ? <h3 className="text-lg font-bold my-2" {...props}>{children}</h3> : null,
          h4: ({ node, children, ...props }) => children ? <h4 className="text-base font-bold my-2" {...props}>{children}</h4> : null,
          p: ({ node, ...props }) => <p className="my-2" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2" {...props} />,
          li: ({ node, ...props }) => <li className="my-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {props.children}
            </a>
          ),
          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-4 border-t border-gray-300" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => <tr className="border-b border-gray-300" {...props} />,
          th: ({ node, ...props }) => (
            <th className="border border-gray-300 px-4 py-2 text-left font-bold" {...props} />
          ),
          td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
