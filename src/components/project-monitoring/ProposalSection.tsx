import StreamingAIResponse from '@/components/StreamingAIResponse';
import { useProjectContext } from '@/contexts/ProjectContext';
import { generateProposal } from '@/services/proposalService';
import React, { useCallback } from 'react';
import ModelSelector from '../ui/model-selector';

type ProposalSectionProps = {
  surveyCompleted: boolean;
};

const ProposalSection: React.FC<ProposalSectionProps> = ({ surveyCompleted }) => {
  const {
    clientData,
    surveyResult,
    isGeneratingProposal,
    setIsGeneratingProposal,
    proposalResult,
    setProposalResult,
    proposalError,
    setProposalError,
    updateSubtaskStatus,
    selectedModel,
    setSelectedModel,
  } = useProjectContext();

  // Function to process streaming response for proposal
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
        setProposalResult(accumulatedContent);
      }

      // When the stream is complete, mark the proposal task as completed
      updateSubtaskStatus('1.3', 'completed');

      // Parent task status will be updated automatically
    } catch (error) {
      console.error('Error processing stream:', error);
      setProposalError('Error processing response stream');
    }
  }, [setProposalResult, setProposalError, updateSubtaskStatus]);

  // Function to handle generating project proposal with AI
  const handleGenerateProposal = useCallback(() => {
    if (!surveyCompleted) {
      console.log('Please complete the "Market Survey" task first.');
      return;
    }

    console.log('Generating project proposal based on market survey results');

    // Show loading state and start the generation process
    setIsGeneratingProposal(true);
    setProposalError(null);
    setProposalResult('Initializing AI proposal generation...');

    // Mark proposal task as in-progress if it's not already
    updateSubtaskStatus('1.3', 'in-progress');
    // Parent task status will be updated automatically

    // Prepare parameters for the proposal generation
    const params = {
      model: selectedModel,
      clientBusiness: clientData.businessInfo,
      clientIndustry: '', // Already included in businessInfo
      clientChallenges: clientData.challenges,
      clientTechnologies: clientData.technologies,
      marketSurveyResults: surveyResult,
    };

    // Set a timeout to prevent infinite loops
    const timeoutId = setTimeout(() => {
      setIsGeneratingProposal(false);
      setProposalError('The request is taking longer than expected. It has been cancelled to prevent excessive API usage.');
    }, 60000); // 60 seconds timeout

    // Call the proposal service
    generateProposal(params)
      .then((stream) => {
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        // Process the streaming response
        return processProposalResponse(stream);
      })
      .catch((error) => {
        // Clear the timeout
        clearTimeout(timeoutId);
        console.error('Error generating project proposal:', error);
        setProposalError(`Error generating project proposal: ${error.message}`);
      })
      .finally(() => {
        setIsGeneratingProposal(false);
      });
  }, [
    surveyCompleted,
    clientData,
    surveyResult,
    setIsGeneratingProposal,
    setProposalError,
    setProposalResult,
    updateSubtaskStatus,
    selectedModel,
    processProposalResponse,
  ]);

  return (
    <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
      <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Generate Project Proposal with AI</h6>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Create a comprehensive project proposal based on the client information and market survey results.
      </p>

      {!surveyCompleted && (
        <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-500">
          <p className="text-sm">Please complete the "Market Survey" task first to generate a project proposal.</p>
        </div>
      )}

      {/* Proposal Results */}
      <div className="mt-6">
        <StreamingAIResponse
          content={proposalResult}
          isLoading={isGeneratingProposal}
          error={proposalError}
          title="AI Project Proposal"
          height="600px"
        />
      </div>

      {surveyCompleted && (
        <div className="mt-6 flex space-x-3">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className={`
                px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              `}
              onClick={handleGenerateProposal}
              disabled={isGeneratingProposal}
            >
              {isGeneratingProposal ? 'Generating Proposal...' : 'Regenerate Proposal'}
            </button>
            <ModelSelector
              selectedModel={selectedModel}
              onChange={setSelectedModel}
              disabled={isGeneratingProposal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalSection;
