import { useProjectContext } from '@/contexts/ProjectContext';
import { openRouter } from '@/libs/OpenRouter';
import React, { useCallback, useState } from 'react';
import { MarkdownRenderer } from '../ui/markdown/MarkdownRenderer';
import ModelSelector from '../ui/model-selector';
import AIContentApproval from './AIContentApproval';

const DraftProposalForm: React.FC = () => {
  const {
    updateSubtaskStatus,
    draftProposalFormData,
    setDraftProposalFormData,
    selectedModel,
    setSelectedModel,
  } = useProjectContext();

  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [_, setFormSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDraftProposalFormData({ [name]: value });
  };

  // Function to process streaming response
  const processProposalResponse = useCallback(async (stream: any): Promise<void> => {
    let accumulatedContent = '';

    try {
      // Process the stream
      for await (const chunk of stream) {
        // Extract the content from the chunk
        const content = chunk.choices[0]?.delta?.content || '';

        // Append the content to the accumulated content
        accumulatedContent += content;

        // Update the state with the accumulated content
        setDraftProposalFormData({ proposalResult: accumulatedContent });
      }

      // When the stream is complete, mark form as submitted
      // Note: We don't mark the task as completed until the user approves the content
      setFormSubmitted(true);
    } catch (error) {
      console.error('Error processing stream:', error);
      setProposalError('Error processing response stream');
    }
  }, [setDraftProposalFormData, setFormSubmitted, setProposalError]);

  const handleGenerateProposal = useCallback(async () => {
    // Validate form
    if (!draftProposalFormData.clientName || !draftProposalFormData.goal || !draftProposalFormData.proposalLocation || !draftProposalFormData.proposalTime) {
      alert('Please fill out all required fields');
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
      .replace('{client\'s name}', draftProposalFormData.clientName)
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
  }, [draftProposalFormData, processProposalResponse, updateSubtaskStatus, selectedModel, setDraftProposalFormData]);

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
    setDraftProposalFormData({ proposalResult: editedContent });
  };

  // If approved, show success message and the proposal content
  if (draftProposalFormData.isApproved) {
    return (
      <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
        <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-lg text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-500">
          <p className="text-sm">Proposal approved! You can now proceed to the next task.</p>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            rows={3}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
          <input
            type="text"
            id="goal"
            name="goal"
            value={draftProposalFormData.goal}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Generate Button */}
        <div className="mt-4">
          <div className="flex items-center">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
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
              isApproved={draftProposalFormData.isApproved}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftProposalForm;
