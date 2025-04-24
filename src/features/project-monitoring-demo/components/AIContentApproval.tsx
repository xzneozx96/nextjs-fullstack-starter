import { MarkdownRenderer } from '@/shared/components/ui/markdown/MarkdownRenderer';
import React, { useRef, useState } from 'react';

type AIContentApprovalProps = {
  content: string;
  isLoading: boolean;
  error: string | null;
  title: string;
  onApprove: () => void;
  onEdit: (editedContent: string) => void;
  onAIEdit?: (instructions: string) => void;
  isApproved: boolean;
  isAIEditing?: boolean;
};

const AIContentApproval: React.FC<AIContentApprovalProps> = ({
  content,
  isLoading,
  error,
  title,
  onApprove,
  onEdit,
  onAIEdit,
  isApproved,
  isAIEditing = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAIEditModalOpen, setIsAIEditModalOpen] = useState(false);
  const [aiEditInstructions, setAIEditInstructions] = useState('');
  const [editedContent, setEditedContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const instructionsRef = useRef<HTMLTextAreaElement>(null);

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

  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  const handleOpenAIEditModal = (event: React.MouseEvent) => {
    // Calculate position relative to the button
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      top: buttonRect.top - 10, // Position slightly above the button
      left: buttonRect.left - 300 + buttonRect.width, // Align right edge with button
    });

    setIsAIEditModalOpen(true);
    setAIEditInstructions('');
    // Focus the instructions textarea when the modal opens
    setTimeout(() => {
      if (instructionsRef.current) {
        instructionsRef.current.focus();
      }
    }, 100);
  };

  const handleCloseAIEditModal = () => {
    setIsAIEditModalOpen(false);
    setAIEditInstructions('');
  };

  const handleSubmitAIEdit = () => {
    if (onAIEdit && aiEditInstructions.trim()) {
      onAIEdit(aiEditInstructions.trim());
      setIsAIEditModalOpen(false);
    }
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
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700"
                  >
                    Save Changes
                  </button>
                </>
              )
            : (
                <>
                  {onAIEdit && (
                    <button
                      type="button"
                      onClick={e => handleOpenAIEditModal(e)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300 flex items-center"
                      disabled={isApproved || isAIEditing}
                    >
                      {isAIEditing
                        ? (
                            <>
                              <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-amber-500 rounded-full"></div>
                              AI Editing...
                            </>
                          )
                        : (
                            <>Ask AI to Edit</>
                          )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300"
                    disabled={isApproved || isAIEditing}
                  >
                    Edit Manually
                  </button>
                  <button
                    type="button"
                    onClick={onApprove}
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      isApproved
                        ? 'bg-amber-700 text-white'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                    disabled={isApproved || isAIEditing}
                  >
                    {isApproved ? 'Approved' : 'Approve & Continue'}
                  </button>
                </>
              )}
        </div>
      )}

      {/* AI Edit Modal - Popup style */}
      {isAIEditModalOpen && (
        <>
          {/* Backdrop to capture clicks outside the popup */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleCloseAIEditModal}
            role="button"
            tabIndex={0}
            aria-label="Close popup"
            onKeyDown={e => e.key === 'Escape' && handleCloseAIEditModal()}
          />
          <div className="fixed z-50" style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 flex flex-col border border-gray-200 dark:border-gray-700">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Ask AI to Edit Content</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Provide instructions for AI to modify the content.
                </p>
              </div>
              <div className="p-3">
                <textarea
                  ref={instructionsRef}
                  value={aiEditInstructions}
                  onChange={e => setAIEditInstructions(e.target.value)}
                  placeholder="Example: Make it more concise, add a section about market trends, fix the formatting issues, etc."
                  className="w-full h-32 p-2 text-sm border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-amber-600 dark:text-white"
                />
              </div>
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseAIEditModal}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAIEdit}
                  className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!aiEditInstructions.trim()}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIContentApproval;
