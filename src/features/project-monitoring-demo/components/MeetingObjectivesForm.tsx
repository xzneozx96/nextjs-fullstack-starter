import { useProjectContext } from '@/features/project-monitoring-demo/contexts/ProjectContext';
import React, { useState } from 'react';
import { toast } from 'sonner';

const MeetingObjectivesForm: React.FC = () => {
  const {
    updateSubtaskStatus,
    meetingObjectivesFormData,
    setMeetingObjectivesFormData,
    subtasks,
    setSelectedTask,
    isPreviousTasksCompleted,
    resetTaskState,
    resetSubsequentTasks,
  } = useProjectContext();

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.3')) {
      toast.warning('You must complete all previous tasks before submitting this one');
      return;
    }

    // Validate form
    if (!meetingObjectivesFormData.meetingGoals.trim()) {
      toast.error('Please define meeting objectives');
      return;
    }

    // Mark form as submitted
    setFormSubmitted(true);

    // Update task status - mark Define Meeting Objectives as completed
    updateSubtaskStatus('1.3', 'completed');

    // Find the next task (Generate Client Questionnaire) and select it to redirect
    const nextTask = subtasks.find(subtask => subtask.id === '1.4');
    if (nextTask) {
      setSelectedTask(nextTask);
    }
  };

  if (formSubmitted) {
    return (
      <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-500">
          <div className="flex justify-between items-center">
            <p className="text-sm">Meeting objectives defined successfully! You can now proceed to the next task.</p>
            <button
              type="button"
              onClick={() => {
                // Reset form submission state
                setFormSubmitted(false);

                // Reset task status
                resetTaskState('1.3');

                // Reset all subsequent tasks
                resetSubsequentTasks('1.3');

                toast.info('Editing mode activated. All subsequent tasks have been reset.');
              }}
              className="px-3 py-1.5 text-xs border border-amber-300 rounded-md hover:bg-amber-100 dark:border-amber-600 dark:hover:bg-amber-800/30 dark:text-amber-300"
            >
              Edit Objectives
            </button>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h6 className="text-sm font-medium text-gray-800 dark:text-white mb-2">Defined Meeting Objectives:</h6>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{meetingObjectivesFormData.meetingGoals}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
      <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Define Meeting Objectives</h6>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Set clear goals and objectives for the upcoming client meeting. This will help guide the discussion and ensure all important topics are covered.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="meetingGoals" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Meeting Goals and Objectives
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="meetingGoals"
            value={meetingObjectivesFormData.meetingGoals}
            onChange={(e) => {
              // Check if previous tasks are completed
              if (!isPreviousTasksCompleted('1.3')) {
                toast.warning('You must complete all previous tasks before editing this one.');
                return;
              }
              setMeetingObjectivesFormData({ meetingGoals: e.target.value });
            }}
            required
            className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-amber-700 dark:text-white"
            rows={6}
            placeholder="Define the key objectives and goals for the client meeting..."
          />
        </div>

        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <h6 className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">Tips for Effective Meeting Objectives:</h6>
          <ul className="list-disc pl-5 text-sm text-amber-700 dark:text-amber-300 space-y-1">
            <li>Be specific and measurable</li>
            <li>Focus on outcomes rather than activities</li>
            <li>Prioritize objectives by importance</li>
            <li>Ensure objectives are aligned with overall project goals</li>
            <li>Consider both business and technical objectives</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingObjectivesForm;
