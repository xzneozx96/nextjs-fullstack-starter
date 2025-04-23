import { openRouter } from '@/core/ai/OpenRouter';
import { useProjectContext } from '@/features/project-monitoring-demo/contexts/ProjectContext';
import { MarkdownRenderer } from '@/shared/components/ui/markdown/MarkdownRenderer';
import ModelSelector from '@/shared/components/ui/model-selector';
import React, { useState } from 'react';
import AIContentApproval from './AIContentApproval';

const PreliminaryResearchForm: React.FC = () => {
  const {
    updateSubtaskStatus,
    preliminaryResearchFormData,
    setPreliminaryResearchFormData,
    subtasks,
    setSelectedTask,
    selectedModel,
    setSelectedModel,
  } = useProjectContext();

  const [isGeneratingResearch, setIsGeneratingResearch] = useState(false);
  const [isAIEditing, setIsAIEditing] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [_, setFormSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPreliminaryResearchFormData({ [name]: value });
  };

  // Function to process streaming response
  const processResearchResponse = async (stream: any): Promise<void> => {
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
          setPreliminaryResearchFormData({ researchResult: accumulatedContent });
        }
      }

      // When the stream is complete, mark form as submitted
      // Note: We don't mark the task as completed until the user approves the content
      setFormSubmitted(true);
    } catch (error) {
      console.error('Error processing stream:', error);
      setResearchError('Error processing response stream');
    }
  };

  const handleGenerateResearch = async () => {
    // Validate form
    if (!preliminaryResearchFormData.clientName || !preliminaryResearchFormData.clientDomain || !preliminaryResearchFormData.clientLocation) {
      alert('Please fill out all required fields');
      return;
    }

    // Show loading state and start the generation process
    setIsGeneratingResearch(true);
    setResearchError(null);
    setPreliminaryResearchFormData({ researchResult: 'Initializing AI research generation...' });

    // Mark task as in-progress
    updateSubtaskStatus('1.2', 'in-progress');
    // Parent task status will be updated automatically

    // Replace placeholders in the prompt template
    const prompt = preliminaryResearchFormData.promptTemplate
      .replace('{name}', preliminaryResearchFormData.clientName)
      .replace('{domain}', preliminaryResearchFormData.clientDomain)
      .replace('{location}', preliminaryResearchFormData.clientLocation);

    // Set a timeout to prevent infinite loops
    const timeoutId = setTimeout(() => {
      setIsGeneratingResearch(false);
      setResearchError('The request is taking longer than expected. It has been cancelled to prevent excessive API usage.');
    }, 60000); // 60 seconds timeout

    try {
      // Create a streaming response using OpenRouter
      const stream = await openRouter.completions.create({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'You are a professional business analyst specializing in market research and competitive analysis.',
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
      await processResearchResponse(stream);
    } catch (error) {
      // Clear the timeout
      clearTimeout(timeoutId);
      console.error('Error generating research:', error);
      setResearchError(`Error generating research: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingResearch(false);
    }
  };

  // Handle approval of the research content
  const handleApproveResearch = () => {
    setPreliminaryResearchFormData({ isApproved: true });

    // Mark the task as completed
    updateSubtaskStatus('1.2', 'completed');

    // Find the next task (Define Meeting Objectives) and select it to redirect
    const nextTask = subtasks.find(subtask => subtask.id === '1.3');
    if (nextTask) {
      setSelectedTask(nextTask);
    }
  };

  // Handle editing of the research content
  const handleEditResearch = (editedContent: string) => {
    setPreliminaryResearchFormData({ researchResult: editedContent });
  };

  // Handle AI editing of the research content
  const handleAIEditResearch = async (instructions: string) => {
    // Show loading state
    setIsAIEditing(true);
    setResearchError(null);

    // Set a timeout to prevent infinite loops
    const timeoutId = setTimeout(() => {
      setIsAIEditing(false);
      setResearchError('The request is taking longer than expected. It has been cancelled to prevent excessive API usage.');
    }, 60000); // 60 seconds timeout

    try {
      // Create a streaming response using OpenRouter
      const stream = await openRouter.completions.create({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'You are a professional business analyst specializing in market research and competitive analysis. Your task is to edit and improve the content based on the user\'s instructions.',
          },
          {
            role: 'user',
            content: `Here is the current content:\n\n${preliminaryResearchFormData.researchResult}\n\nPlease edit this content based on the following instructions:\n${instructions}\n\nProvide the complete edited content in your response.`,
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
            setPreliminaryResearchFormData({ researchResult: accumulatedContent });
          }
        }
      } catch (error) {
        console.error('Error processing stream:', error);
        setResearchError('Error processing response stream');
      }
    } catch (error) {
      // Clear the timeout
      clearTimeout(timeoutId);
      console.error('Error editing research with AI:', error);
      setResearchError(`Error editing research with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAIEditing(false);
    }
  };

  // If approved, show success message and the research content
  if (preliminaryResearchFormData.isApproved) {
    return (
      <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
        <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-lg text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-500">
          <p className="text-sm">Research approved! You can now proceed to the next task.</p>
        </div>

        {/* Display the approved research content */}
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Preliminary Research Results</h6>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <MarkdownRenderer content={preliminaryResearchFormData.researchResult} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
      <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Conduct Preliminary Research</h6>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Enter client information to generate preliminary research on market landscape, competitors, and SWOT analysis.
      </p>

      <div className="space-y-4">
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
            value={preliminaryResearchFormData.clientName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Enter client name"
          />
        </div>

        {/* Client Domain */}
        <div>
          <label htmlFor="clientDomain" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Client Domain
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="clientDomain"
            name="clientDomain"
            value={preliminaryResearchFormData.clientDomain}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Enter client industry/domain"
          />
        </div>

        {/* Client Location */}
        <div>
          <label htmlFor="clientLocation" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Client Location
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="clientLocation"
            name="clientLocation"
            value={preliminaryResearchFormData.clientLocation}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Enter client location"
          />
        </div>

        {/* Prompt Template */}
        <div>
          <label htmlFor="promptTemplate" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Prompt Template
          </label>
          <textarea
            id="promptTemplate"
            name="promptTemplate"
            value={preliminaryResearchFormData.promptTemplate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            rows={4}
            placeholder="Enter prompt template for research generation"
          />
        </div>

        {/* Generate Button */}
        <div className="mt-4">
          <div className="flex items-center">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={handleGenerateResearch}
              disabled={isGeneratingResearch}
            >
              {isGeneratingResearch ? 'Generating Research...' : 'Generate Research'}
            </button>
            <ModelSelector
              selectedModel={selectedModel}
              onChange={setSelectedModel}
              disabled={isGeneratingResearch}
            />
          </div>
        </div>

        {/* Research Results */}
        {(preliminaryResearchFormData.researchResult || isGeneratingResearch) && (
          <div className="mt-6">
            <AIContentApproval
              content={preliminaryResearchFormData.researchResult}
              isLoading={isGeneratingResearch}
              error={researchError}
              title="Preliminary Research Results"
              onApprove={handleApproveResearch}
              onEdit={handleEditResearch}
              onAIEdit={handleAIEditResearch}
              isApproved={preliminaryResearchFormData.isApproved}
              isAIEditing={isAIEditing}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PreliminaryResearchForm;
