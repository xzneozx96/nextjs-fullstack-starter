import StreamingAIResponse from '@/components/StreamingAIResponse';
import { useProjectContext } from '@/contexts/ProjectContext';
import { generateMarketSurvey } from '@/services/marketSurveyService';
import React, { useCallback } from 'react';
import ModelSelector from '../ui/model-selector';

type MarketSurveySectionProps = {
  formSubmitted: boolean;
};

const MarketSurveySection: React.FC<MarketSurveySectionProps> = ({ formSubmitted }) => {
  const {
    clientData,
    isGeneratingSurvey,
    setIsGeneratingSurvey,
    surveyResult,
    setSurveyResult,
    surveyError,
    setSurveyError,
    updateSubtaskStatus,
    setSelectedTask,
    subtasks,
    setSurveyCompleted,
    selectedModel,
    setSelectedModel,
  } = useProjectContext();

  // Function to process streaming response for market survey
  const processMarketSurveyResponse = useCallback(async (stream: any): Promise<void> => {
    let accumulatedContent = '';

    try {
      // Process the stream
      for await (const chunk of stream) {
        // Extract the content from the chunk
        const content = chunk.choices[0]?.delta?.content || '';

        // Append the content to the accumulated content
        accumulatedContent += content;

        // Update the state with the accumulated content
        setSurveyResult(accumulatedContent);
      }

      // When the stream is complete, mark the survey as completed
      setSurveyCompleted(true);

      // Update the Market Survey task status to completed
      const updatedSubtasks = [...subtasks];
      const marketSurveyTask = updatedSubtasks.find(subtask => subtask.id === '1.2');
      if (marketSurveyTask) {
        marketSurveyTask.status = 'completed';
        updateSubtaskStatus('1.2', 'completed');
      }

      // Find and update the proposal task status to in-progress
      const proposalTask = updatedSubtasks.find(subtask => subtask.id === '1.3');
      if (proposalTask) {
        updateSubtaskStatus('1.3', 'in-progress');

        // Parent task status will be updated automatically

        // Select the Write Proposal task to redirect to step 3
        setSelectedTask(proposalTask);
      }
    } catch (error) {
      console.error('Error processing stream:', error);
      setSurveyError('Error processing response stream');
    }
  }, [subtasks, updateSubtaskStatus, setSelectedTask, setSurveyResult, setSurveyCompleted, setSurveyError]);

  // Function to handle generating market survey with AI
  const handleGenerateMarketSurvey = useCallback(() => {
    if (!formSubmitted) {
      console.log('Please complete and submit the "Gather Information" task first.');
      return;
    }

    // Show loading state and start the generation process
    setIsGeneratingSurvey(true);
    setSurveyError(null);
    setSurveyResult('Initializing AI market survey generation...');

    // Mark market survey task as in-progress if it's not already
    updateSubtaskStatus('1.2', 'in-progress');
    // Parent task status will be updated automatically

    // Prepare parameters for the market survey
    const params = {
      model: selectedModel,
      clientBusiness: clientData.businessInfo,
      clientIndustry: '', // Already included in businessInfo
      clientChallenges: clientData.challenges,
      clientTechnologies: clientData.technologies,
      targetCustomers: '', // Using industry as target customers for now
      marketPosition: '',
      differentiators: '',
      organizationStructure: '',
      painPoints: '',
      previousSolutions: '',
      legacySystems: '',
      businessObjectives: '',
      projectAlignment: '',
      successOutcomes: '',
    };

    // Set a timeout to prevent infinite loops
    const timeoutId = setTimeout(() => {
      setIsGeneratingSurvey(false);
      setSurveyError('The request is taking longer than expected. It has been cancelled to prevent excessive API usage.');
    }, 60000); // 60 seconds timeout

    // Call the market survey service
    generateMarketSurvey(params)
      .then((stream) => {
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        // Process the streaming response
        return processMarketSurveyResponse(stream);
      })
      .catch((error) => {
        // Clear the timeout
        clearTimeout(timeoutId);
        console.error('Error generating market survey:', error);
        setSurveyError(`Error generating market survey: ${error.message}`);
      })
      .finally(() => {
        setIsGeneratingSurvey(false);
      });
  }, [
    formSubmitted,
    clientData,
    setIsGeneratingSurvey,
    setSurveyError,
    setSurveyResult,
    updateSubtaskStatus,
    selectedModel,
    processMarketSurveyResponse,
  ]);

  return (
    <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
      <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">
        Generate Market Survey with AI
      </h6>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Use the information gathered from the client to generate a comprehensive market survey report.
      </p>

      {!formSubmitted && (
        <div
          className={`
            p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800
            dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-500
          `}
        >
          <p className="text-sm">
            Please complete and submit the "Gather Information" task first to generate a market survey.
          </p>
        </div>
      )}

      {/* Market Survey Results */}
      <div className="mt-6">
        <StreamingAIResponse
          content={surveyResult}
          isLoading={isGeneratingSurvey}
          error={surveyError}
          title="AI Market Survey Results"
          height="600px"
        />
      </div>

      {formSubmitted && (
        <div className="mt-6 flex space-x-3">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className={`
                px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              `}
              onClick={handleGenerateMarketSurvey}
              disabled={isGeneratingSurvey}
            >
              {isGeneratingSurvey ? 'Generating Market Survey...' : 'Regenerate Market Survey'}
            </button>
            <ModelSelector
              selectedModel={selectedModel}
              onChange={setSelectedModel}
              disabled={isGeneratingSurvey}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketSurveySection;
