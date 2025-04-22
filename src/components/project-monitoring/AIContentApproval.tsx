import { MarkdownRenderer } from '@/components/ui/markdown/MarkdownRenderer';
import React, { useRef, useState } from 'react';

type AIContentApprovalProps = {
  content: string;
  isLoading: boolean;
  error: string | null;
  title: string;
  onApprove: () => void;
  onEdit: (editedContent: string) => void;
  isApproved: boolean;
};

const AIContentApproval: React.FC<AIContentApprovalProps> = ({
  content,
  isLoading,
  error,
  title,
  onApprove,
  onEdit,
  isApproved,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update edited content when original content changes (e.g., during streaming)
  React.useEffect(() => {
    if (!isEditing) {
      setEditedContent(content);
    }
  }, [content, isEditing]);

  // Focus textarea when entering edit mode
  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedContent(content);
  };

  const handleSaveEdit = () => {
    onEdit(editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      {/* Header */}
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

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ height: '500px' }}>
        {error
          ? (
              <div className="p-3 bg-red-50 text-red-700 rounded-md">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )
          : isEditing
            ? (
                <textarea
                  ref={textareaRef}
                  value={editedContent}
                  onChange={e => setEditedContent(e.target.value)}
                  className="w-full h-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  style={{ minHeight: '400px' }}
                />
              )
            : content
              ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <MarkdownRenderer content={isEditing ? editedContent : content} />
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

      {/* Action Buttons */}
      {!isLoading && content && !error && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
          {isEditing
            ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </>
              )
            : (
                <>
                  <button
                    onClick={handleStartEditing}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300"
                    disabled={isApproved}
                  >
                    Edit
                  </button>
                  <button
                    onClick={onApprove}
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      isApproved
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={isApproved}
                  >
                    {isApproved ? 'Approved' : 'Approve & Continue'}
                  </button>
                </>
              )}
        </div>
      )}
    </div>
  );
};

export default AIContentApproval;
