import type { ClientData } from '@/types/project-monitoring';
import { generateMarketSurvey } from '@/services/marketSurveyService';
import { useCallback, useState } from 'react';

export const useMarketSurvey = (
  clientData: ClientData,
  onSurveyCompleted: () => void,
) => {
  const [isGeneratingSurvey, setIsGeneratingSurvey] = useState(false);
  const [surveyResult, setSurveyResult] = useState('');
  const [surveyError, setSurveyError] = useState<string | null>(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

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
      onSurveyCompleted();
    } catch (error) {
      console.error('Error processing stream:', error);
      setSurveyError('Error processing response stream');
    }
  }, [onSurveyCompleted]);

  // Function to handle generating market survey with AI
  const generateSurvey = useCallback(() => {
    // Show loading state and start the generation process
    setIsGeneratingSurvey(true);
    setSurveyError(null);
    setSurveyResult('Initializing AI market survey generation...');

    // Prepare parameters for the market survey
    const params = {
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
  }, [clientData, processMarketSurveyResponse]);

  return {
    isGeneratingSurvey,
    surveyResult,
    surveyError,
    surveyCompleted,
    generateSurvey,
    setSurveyResult,
    setSurveyError,
    setSurveyCompleted,
  };
};
