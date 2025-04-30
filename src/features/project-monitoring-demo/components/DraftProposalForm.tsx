import { openRouter } from '@/core/ai/OpenRouter';
import { useProjectContext } from '@/features/project-monitoring-demo/contexts/ProjectContext';
import { MarkdownRenderer } from '@/shared/components/ui/markdown/MarkdownRenderer';
import ModelSelector from '@/shared/components/ui/model-selector';
import React, { useState } from 'react';
import { toast } from 'sonner';
import AIContentApproval from './AIContentApproval';

const DraftProposalForm: React.FC = () => {
  const {
    updateSubtaskStatus,
    draftProposalFormData,
    setDraftProposalFormData,
    selectedModel,
    setSelectedModel,
    isPreviousTasksCompleted,
    resetTaskState,
    resetSubsequentTasks,
    resetTaskApproval,
  } = useProjectContext();

  // Toast functionality is now imported directly from sonner

  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [isAIEditing, setIsAIEditing] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [_, setFormSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.6')) {
      toast.warning('You must complete all previous tasks before editing this one.', {
        duration: 3000,
      });
      return;
    }

    const { name, value } = e.target;
    // Use the correct way to update the form data
    setDraftProposalFormData({
      [name]: value,
    });
  };

  // Function to process streaming response
  const processProposalResponse = async (stream: any): Promise<void> => {
    let accumulatedContent = '';

    try {
      // Process the stream
      for await (const chunk of stream) {
        // Extract the content from the chunk
        const content = chunk.choices[0]?.delta?.content || '';

        // Only update if there's actual content
        if (content) {
          // Append the content to the accumulated content
          accumulatedContent += content;

          // Update the state with the accumulated content
          setDraftProposalFormData({ proposalResult: accumulatedContent });
        }
      }

      // When the stream is complete, mark form as submitted
      // Note: We don't mark the task as completed until the user approves the content
      setFormSubmitted(true);
    } catch (error) {
      console.error('Error processing stream:', error);
      setProposalError('Error processing response stream');
    }
  };

  const handleGenerateProposal = async () => {
    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.6')) {
      toast.warning('You must complete all previous tasks before generating a proposal.', {
        duration: 3000,
      });
      return;
    }

    // Validate form
    const { clientName, goal, proposalLocation, proposalTime } = draftProposalFormData;
    if (!clientName || !goal || !proposalLocation || !proposalTime) {
      toast.error('Please fill out all required fields', {
        duration: 3000,
      });
      return;
    }

    // Show loading state and start the generation process
    setIsGeneratingProposal(true);
    setProposalError(null);
    setDraftProposalFormData({ proposalResult: 'Initializing AI proposal generation...' });

    // Mark task as in-progress
    updateSubtaskStatus('1.6', 'in-progress');
    // Parent task status will be updated automatically

    // Replace placeholders in the prompt template
    const prompt = draftProposalFormData.promptTemplate
      .replace('{name}', draftProposalFormData.clientName)
      .replace('{goal}', draftProposalFormData.goal);

    // Set a timeout to prevent infinite loops
    const timeoutId = setTimeout(() => {
      setIsGeneratingProposal(false);
      setProposalError('The request is taking longer than expected. It has been cancelled to prevent excessive API usage.');
    }, 60000); // 60 seconds timeout

    try {
      // Create a streaming response using OpenRouter
      const stream = await openRouter.completions.create({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'You are a professional business consultant specializing in creating comprehensive project proposals.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
      });

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      // Process the streaming response
      await processProposalResponse(stream);
    } catch (error) {
      // Clear the timeout
      clearTimeout(timeoutId);
      console.error('Error generating proposal:', error);
      setProposalError(`Error generating proposal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  // Handle approval of the proposal content
  const handleApproveProposal = () => {
    setDraftProposalFormData({ isApproved: true });

    // Mark the task as completed
    updateSubtaskStatus('1.6', 'completed');

    // This is the last task, so we don't need to redirect to another task
    // But we could redirect to a summary page or show a completion message
  };

  // Handle editing of the proposal content
  const handleEditProposal = (editedContent: string) => {
    // If the content was previously approved, reset subsequent tasks
    if (draftProposalFormData.isApproved) {
      // Reset approval state
      resetTaskApproval('1.6');

      // Reset task status
      resetTaskState('1.6');

      // Reset all subsequent tasks
      resetSubsequentTasks('1.6');

      toast.info('Content edited. All subsequent tasks have been reset.', {
        duration: 3000,
      });
    }

    setDraftProposalFormData({ proposalResult: editedContent });
  };

  // Handle AI editing of the proposal content
  const handleAIEditProposal = async (instructions: string) => {
    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.6')) {
      toast.warning('You must complete all previous tasks before editing this one.', {
        duration: 3000,
      });
      return;
    }

    // If the content was previously approved, reset subsequent tasks
    if (draftProposalFormData.isApproved) {
      // Reset approval state
      resetTaskApproval('1.6');

      // Reset task status
      resetTaskState('1.6');

      // Reset all subsequent tasks
      resetSubsequentTasks('1.6');

      toast.info('Content being edited. All subsequent tasks have been reset.', {
        duration: 3000,
      });
    }

    // Show loading state
    setIsAIEditing(true);
    setProposalError(null);

    // Set a timeout to prevent infinite loops
    const timeoutId = setTimeout(() => {
      setIsAIEditing(false);
      setProposalError('The request is taking longer than expected. It has been cancelled to prevent excessive API usage.');
    }, 60000); // 60 seconds timeout

    try {
      // Create a streaming response using OpenRouter
      const stream = await openRouter.completions.create({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'You are a professional business consultant specializing in creating comprehensive project proposals. Your task is to edit and improve the proposal based on the user\'s instructions.',
          },
          {
            role: 'user',
            content: `Here is the current proposal:\n\n${draftProposalFormData.proposalResult}\n\nPlease edit this proposal based on the following instructions:\n${instructions}\n\nProvide the complete edited proposal in your response.`,
          },
        ],
        stream: true,
      });

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      // Process the streaming response
      let accumulatedContent = '';

      try {
        // Process the stream
        for await (const chunk of stream) {
          // Extract the content from the chunk
          const content = chunk.choices[0]?.delta?.content || '';

          // Only update if there's actual content
          if (content) {
            // Append the content to the accumulated content
            accumulatedContent += content;

            // Update the state with the accumulated content
            setDraftProposalFormData({ proposalResult: accumulatedContent });
          }
        }
      } catch (error) {
        console.error('Error processing stream:', error);
        setProposalError('Error processing response stream');
      }
    } catch (error) {
      // Clear the timeout
      clearTimeout(timeoutId);
      console.error('Error editing proposal with AI:', error);
      setProposalError(`Error editing proposal with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAIEditing(false);
    }
  };

  // If approved, show success message and the proposal content with edit button
  if (draftProposalFormData.isApproved) {
    return (
      <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
        <div className="p-4 mb-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-500">
          <div className="flex justify-between items-center">
            <p className="text-sm">Proposal approved! You can now proceed to the next task.</p>
            <button
              type="button"
              onClick={() => {
                // Reset approval state
                resetTaskApproval('1.6');

                // Reset task status
                resetTaskState('1.6');

                // Reset all subsequent tasks
                resetSubsequentTasks('1.6');

                toast.info('Editing mode activated. All subsequent tasks have been reset.', {
                  duration: 3000,
                });
              }}
              className="px-3 py-1.5 text-xs border border-amber-300 rounded-md hover:bg-amber-100 dark:border-amber-600 dark:hover:bg-amber-800/30 dark:text-amber-300"
            >
              Edit Proposal
            </button>
          </div>
        </div>

        {/* Display the approved proposal content */}
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Draft Proposal</h6>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <MarkdownRenderer content={draftProposalFormData.proposalResult} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
      <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Draft Proposal Generation</h6>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Generate a draft proposal for the client meeting, including implementation roadmap and key details.
      </p>

      <div className="space-y-4">
        {/* Prompt Template */}
        <div>
          <label htmlFor="promptTemplate" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Prompt Template
          </label>
          <textarea
            id="promptTemplate"
            name="promptTemplate"
            value={draftProposalFormData.promptTemplate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-amber-700 dark:text-white"
            rows={4}
            placeholder="Enter prompt template for proposal generation"
          />
        </div>

        {/* Client Name */}
        <div>
          <label htmlFor="clientName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Client Name
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={draftProposalFormData.clientName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-amber-700 dark:text-white"
            placeholder="Enter client name"
          />
        </div>

        {/* Project Goal */}
        <div>
          <label htmlFor="goal" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Project Goal
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="goal"
            name="goal"
            value={draftProposalFormData.goal}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-amber-700 dark:text-white"
            placeholder="Enter project goal"
          />
        </div>

        {/* Proposal Location */}
        <div>
          <label htmlFor="proposalLocation" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Proposal Location
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="proposalLocation"
            name="proposalLocation"
            value={draftProposalFormData.proposalLocation}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-amber-700 dark:text-white"
            placeholder="Enter proposal location"
          />
        </div>

        {/* Proposal Time */}
        <div>
          <label htmlFor="proposalTime" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Proposal Time
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="proposalTime"
            name="proposalTime"
            value={draftProposalFormData.proposalTime}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-amber-700 dark:text-white"
          />
        </div>

        {/* Generate Button */}
        <div className="mt-4">
          <div className="flex items-center">
            <button
              type="button"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
              onClick={handleGenerateProposal}
              disabled={isGeneratingProposal}
            >
              {isGeneratingProposal ? 'Generating Proposal...' : 'Generate Proposal'}
            </button>
            <ModelSelector
              selectedModel={selectedModel}
              onChange={setSelectedModel}
              disabled={isGeneratingProposal}
            />
          </div>
        </div>

        {/* Proposal Results */}
        {(draftProposalFormData.proposalResult || isGeneratingProposal) && (
          <div className="mt-6">
            <AIContentApproval
              content={draftProposalFormData.proposalResult}
              isLoading={isGeneratingProposal}
              error={proposalError}
              title="Draft Proposal"
              onApprove={handleApproveProposal}
              onEdit={handleEditProposal}
              onAIEdit={handleAIEditProposal}
              isApproved={draftProposalFormData.isApproved}
              isAIEditing={isAIEditing}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftProposalForm;
