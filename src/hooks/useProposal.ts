import type { ClientData } from '@/types/project-monitoring';
import { generateProposal } from '@/services/proposalService';
import { useCallback, useState } from 'react';

export const useProposal = (
  clientData: ClientData,
  marketSurveyResults: string,
  onProposalCompleted: () => void,
) => {
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [proposalResult, setProposalResult] = useState('');
  const [proposalError, setProposalError] = useState<string | null>(null);

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

      // When the stream is complete, call the completion callback
      onProposalCompleted();
    } catch (error) {
      console.error('Error processing stream:', error);
      setProposalError('Error processing response stream');
    }
  }, [onProposalCompleted]);

  // Function to handle generating project proposal with AI
  const generateProjectProposal = useCallback(() => {
    console.log('Generating project proposal based on market survey results');

    // Show loading state and start the generation process
    setIsGeneratingProposal(true);
    setProposalError(null);
    setProposalResult('Initializing AI proposal generation...');

    // Prepare parameters for the proposal generation
    const params = {
      clientBusiness: clientData.businessInfo,
      clientIndustry: '', // Already included in businessInfo
      clientChallenges: clientData.challenges,
      clientTechnologies: clientData.technologies,
      marketSurveyResults,
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
  }, [clientData, marketSurveyResults, processProposalResponse]);

  return {
    isGeneratingProposal,
    proposalResult,
    proposalError,
    generateProjectProposal,
    setProposalResult,
    setProposalError,
  };
};
