import { openRouter } from '@/core/ai/OpenRouter';
import { useProjectContext } from '@/features/project-monitoring-demo/contexts/ProjectContext';
import { MarkdownRenderer } from '@/shared/components/ui/markdown/MarkdownRenderer';
import ModelSelector from '@/shared/components/ui/model-selector';
import React, { useState } from 'react';
import AIContentApproval from './AIContentApproval';
import StaffSelectionInput from './StaffSelectionInput';

const ClientQuestionnaireForm: React.FC = () => {
  const {
    updateSubtaskStatus,
    clientQuestionnaireFormData,
    setClientQuestionnaireFormData,
    meetingObjectivesFormData,
    subtasks,
    setSelectedTask,
    selectedModel,
    setSelectedModel,
  } = useProjectContext();

  const [isGeneratingQuestionnaire, setIsGeneratingQuestionnaire] = useState(false);
  const [questionnaireError, setQuestionnaireError] = useState<string | null>(null);
  const [_, setFormSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientQuestionnaireFormData({ [name]: value });
  };

  const handleStaffChange = (selectedStaff: string[]) => {
    setClientQuestionnaireFormData({ selectedStaff });
  };

  // Function to process streaming response
  const processQuestionnaireResponse = async (stream: any): Promise<void> => {
    let accumulatedContent = '';

    try {
      // Process the stream
      for await (const chunk of stream) {
        // Extract the content from the chunk
        const content = chunk.choices[0]?.delta?.content || '';

        // Append the content to the accumulated content
        accumulatedContent += content;

        // Update the state with the accumulated content
        setClientQuestionnaireFormData({ questionnaireResult: accumulatedContent });
      }

      // When the stream is complete, mark form as submitted
      // Note: We don't mark the task as completed until the user approves the content
      setFormSubmitted(true);
    } catch (error) {
      console.error('Error processing stream:', error);
      setQuestionnaireError('Error processing response stream');
    }
  };

  const handleGenerateQuestionnaire = async () => {
    // Validate form
    if (
      clientQuestionnaireFormData.selectedStaff.length === 0
      || !clientQuestionnaireFormData.deadline
      || !clientQuestionnaireFormData.promptTemplate
    ) {
      alert('Please fill out all required fields');
      return;
    }

    // Show loading state and start the generation process
    setIsGeneratingQuestionnaire(true);
    setQuestionnaireError(null);
    setClientQuestionnaireFormData({ questionnaireResult: 'Initializing AI questionnaire generation...' });

    // Mark task as in-progress
    updateSubtaskStatus('1.4', 'in-progress');
    // Parent task status will be updated automatically

    // Set a timeout to prevent infinite loops
    const timeoutId = setTimeout(() => {
      setIsGeneratingQuestionnaire(false);
      setQuestionnaireError('The request is taking longer than expected. It has been cancelled to prevent excessive API usage.');
    }, 60000); // 60 seconds timeout

    try {
      // Get meeting objectives from step 1.3
      const meetingObjectives = meetingObjectivesFormData.meetingGoals;

      // Create a prompt that incorporates the meeting objectives
      const enhancedPrompt = `${clientQuestionnaireFormData.promptTemplate}\n\nThe meeting has the following objectives:\n${meetingObjectives}\n\nPlease generate a questionnaire that will help achieve these specific objectives.`;

      // Create a streaming response using OpenRouter
      const stream = await openRouter.completions.create({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'You are a professional business analyst specializing in creating comprehensive client questionnaires.',
          },
          {
            role: 'user',
            content: enhancedPrompt,
          },
        ],
        stream: true,
      });

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      // Process the streaming response
      await processQuestionnaireResponse(stream);
    } catch (error) {
      // Clear the timeout
      clearTimeout(timeoutId);
      console.error('Error generating questionnaire:', error);
      setQuestionnaireError(`Error generating questionnaire: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingQuestionnaire(false);
    }
  };

  // Handle approval of the questionnaire content
  const handleApproveQuestionnaire = () => {
    setClientQuestionnaireFormData({ isApproved: true });

    // Mark the task as completed
    updateSubtaskStatus('1.4', 'completed');

    // Find the next task (Prepare Presentation Deck) and select it to redirect
    const nextTask = subtasks.find(subtask => subtask.id === '1.5');
    if (nextTask) {
      setSelectedTask(nextTask);
    }
  };

  // Handle editing of the questionnaire content
  const handleEditQuestionnaire = (editedContent: string) => {
    setClientQuestionnaireFormData({ questionnaireResult: editedContent });
  };

  // If approved, show success message and the questionnaire content
  if (clientQuestionnaireFormData.isApproved) {
    return (
      <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
        <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-lg text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-500">
          <p className="text-sm">Questionnaire approved! You can now proceed to the next task.</p>
        </div>

        {/* Display the approved questionnaire content */}
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Client Questionnaire</h6>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <MarkdownRenderer content={clientQuestionnaireFormData.questionnaireResult} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
      <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Generate Client Questionnaire</h6>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Assign staff members, set a deadline, and generate a comprehensive questionnaire for the client meeting.
      </p>

      <div className="space-y-6">
        {/* Staff Selection */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Assigned To
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <StaffSelectionInput
            selectedStaff={clientQuestionnaireFormData.selectedStaff}
            onChange={handleStaffChange}
          />
        </div>

        {/* Deadline */}
        <div>
          <label htmlFor="deadline" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Deadline
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="deadline"
            name="deadline"
            value={clientQuestionnaireFormData.deadline}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Prompt Template */}
        <div>
          <label htmlFor="promptTemplate" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Prompt Template
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="promptTemplate"
            name="promptTemplate"
            value={clientQuestionnaireFormData.promptTemplate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            rows={4}
            placeholder="Enter prompt template for questionnaire generation"
          />
        </div>

        {/* Generate Button */}
        <div className="mt-4">
          <div className="flex items-center">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={handleGenerateQuestionnaire}
              disabled={isGeneratingQuestionnaire}
            >
              {isGeneratingQuestionnaire ? 'Generating Questionnaire...' : 'Generate Questionnaire'}
            </button>
            <ModelSelector
              selectedModel={selectedModel}
              onChange={setSelectedModel}
              disabled={isGeneratingQuestionnaire}
            />
          </div>
        </div>

        {/* Questionnaire Results */}
        {(clientQuestionnaireFormData.questionnaireResult || isGeneratingQuestionnaire) && (
          <div className="mt-6">
            <AIContentApproval
              content={clientQuestionnaireFormData.questionnaireResult}
              isLoading={isGeneratingQuestionnaire}
              error={questionnaireError}
              title="Client Questionnaire"
              onApprove={handleApproveQuestionnaire}
              onEdit={handleEditQuestionnaire}
              isApproved={clientQuestionnaireFormData.isApproved}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientQuestionnaireForm;
