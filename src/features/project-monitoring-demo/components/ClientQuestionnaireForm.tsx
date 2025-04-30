import { openRouter } from '@/core/ai/OpenRouter';
import { useProjectContext } from '@/features/project-monitoring-demo/contexts/ProjectContext';
import { MarkdownRenderer } from '@/shared/components/ui/markdown/MarkdownRenderer';
import ModelSelector from '@/shared/components/ui/model-selector';
import React, { useState } from 'react';
import { toast } from 'sonner';
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
    isPreviousTasksCompleted,
    resetTaskState,
    resetSubsequentTasks,
    resetTaskApproval,
  } = useProjectContext();

  // Toast functionality is now imported directly from sonner

  const [isGeneratingQuestionnaire, setIsGeneratingQuestionnaire] = useState(false);
  const [isAIEditing, setIsAIEditing] = useState(false);
  const [questionnaireError, setQuestionnaireError] = useState<string | null>(null);
  const [_, setFormSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.4')) {
      toast.warning('You must complete all previous tasks before editing this one.', {
        duration: 3000,
      });
      return;
    }

    const { name, value } = e.target;
    setClientQuestionnaireFormData({ [name]: value });
  };

  const handleStaffChange = (selectedStaff: string[]) => {
    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.4')) {
      toast.warning('You must complete all previous tasks before editing this one.', {
        duration: 3000,
      });
      return;
    }

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

        // Only update if there's actual content
        if (content) {
          // Append the content to the accumulated content
          accumulatedContent += content;

          // Update the state with the accumulated content
          setClientQuestionnaireFormData({ questionnaireResult: accumulatedContent });
        }
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
    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.4')) {
      toast.warning('You must complete all previous tasks before generating a questionnaire.', {
        duration: 3000,
      });
      return;
    }

    // Validate form
    if (
      clientQuestionnaireFormData.selectedStaff.length === 0
      || !clientQuestionnaireFormData.deadline
      || !clientQuestionnaireFormData.promptTemplate
    ) {
      toast.error('Please fill out all required fields', {
        duration: 3000,
      });
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
    // If the content was previously approved, reset subsequent tasks
    if (clientQuestionnaireFormData.isApproved) {
      // Reset approval state
      resetTaskApproval('1.4');

      // Reset task status
      resetTaskState('1.4');

      // Reset all subsequent tasks
      resetSubsequentTasks('1.4');

      toast.info('Content edited. All subsequent tasks have been reset.', {
        duration: 3000,
      });
    }

    setClientQuestionnaireFormData({ questionnaireResult: editedContent });
  };

  // Handle AI editing of the questionnaire content
  const handleAIEditQuestionnaire = async (instructions: string) => {
    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.4')) {
      toast.warning('You must complete all previous tasks before editing this one.', {
        duration: 3000,
      });
      return;
    }

    // If the content was previously approved, reset subsequent tasks
    if (clientQuestionnaireFormData.isApproved) {
      // Reset approval state
      resetTaskApproval('1.4');

      // Reset task status
      resetTaskState('1.4');

      // Reset all subsequent tasks
      resetSubsequentTasks('1.4');

      toast.info('Content being edited. All subsequent tasks have been reset.', {
        duration: 3000,
      });
    }

    // Show loading state
    setIsAIEditing(true);
    setQuestionnaireError(null);

    // Set a timeout to prevent infinite loops
    const timeoutId = setTimeout(() => {
      setIsAIEditing(false);
      setQuestionnaireError('The request is taking longer than expected. It has been cancelled to prevent excessive API usage.');
    }, 60000); // 60 seconds timeout

    try {
      // Get meeting objectives from step 1.3
      const meetingObjectives = meetingObjectivesFormData.meetingGoals;

      // Create a streaming response using OpenRouter
      const stream = await openRouter.completions.create({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'You are a professional business analyst specializing in creating comprehensive client questionnaires. Your task is to edit and improve the questionnaire based on the user\'s instructions.',
          },
          {
            role: 'user',
            content: `Here is the current questionnaire:\n\n${clientQuestionnaireFormData.questionnaireResult}\n\nThe meeting has the following objectives:\n${meetingObjectives}\n\nPlease edit this questionnaire based on the following instructions:\n${instructions}\n\nProvide the complete edited questionnaire in your response.`,
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
            setClientQuestionnaireFormData({ questionnaireResult: accumulatedContent });
          }
        }
      } catch (error) {
        console.error('Error processing stream:', error);
        setQuestionnaireError('Error processing response stream');
      }
    } catch (error) {
      // Clear the timeout
      clearTimeout(timeoutId);
      console.error('Error editing questionnaire with AI:', error);
      setQuestionnaireError(`Error editing questionnaire with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAIEditing(false);
    }
  };

  // If approved, show success message and the questionnaire content with edit button
  if (clientQuestionnaireFormData.isApproved) {
    return (
      <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
        <div className="p-4 mb-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-500">
          <div className="flex justify-between items-center">
            <p className="text-sm">Questionnaire approved! You can now proceed to the next task.</p>
            <button
              type="button"
              onClick={() => {
                // Reset approval state
                resetTaskApproval('1.4');

                // Reset task status
                resetTaskState('1.4');

                // Reset all subsequent tasks
                resetSubsequentTasks('1.4');

                toast.info('Editing mode activated. All subsequent tasks have been reset.', {
                  duration: 3000,
                });
              }}
              className="px-3 py-1.5 text-xs border border-amber-300 rounded-md hover:bg-amber-100 dark:border-amber-600 dark:hover:bg-amber-800/30 dark:text-amber-300"
            >
              Edit Questionnaire
            </button>
          </div>
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
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-amber-700 dark:text-white"
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
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-amber-700 dark:text-white"
            rows={4}
            placeholder="Enter prompt template for questionnaire generation"
          />
        </div>

        {/* Generate Button */}
        <div className="mt-4">
          <div className="flex items-center">
            <button
              type="button"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
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
              onAIEdit={handleAIEditQuestionnaire}
              isApproved={clientQuestionnaireFormData.isApproved}
              isAIEditing={isAIEditing}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientQuestionnaireForm;
