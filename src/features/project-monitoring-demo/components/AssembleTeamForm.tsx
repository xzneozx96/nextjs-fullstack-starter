import { useProjectContext } from '@/features/project-monitoring-demo/contexts/ProjectContext';
import { useToast } from '@/shared/components/ui/toast/ToastContainer';
import React, { useState } from 'react';
import StaffSelectionInput from './StaffSelectionInput';

const AssembleTeamForm: React.FC = () => {
  const {
    updateSubtaskStatus,
    assembleTeamFormData,
    setAssembleTeamFormData,
    subtasks,
    setSelectedTask,
    isPreviousTasksCompleted,
    resetTaskState,
    resetSubsequentTasks,
  } = useProjectContext();

  // Access toast functionality
  const { showToast } = useToast();

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.1')) {
      showToast({
        message: 'You must complete all previous tasks before editing this one.',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    const { name, value } = e.target;
    setAssembleTeamFormData({ [name]: value });
  };

  const handleStaffChange = (selectedStaff: string[]) => {
    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.1')) {
      showToast({
        message: 'You must complete all previous tasks before editing this one.',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    setAssembleTeamFormData({ selectedStaff });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.1')) {
      showToast({
        message: 'You must complete all previous tasks before submitting this one.',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    // Validate form
    if (!assembleTeamFormData.projectDescription || assembleTeamFormData.selectedStaff.length === 0) {
      showToast({
        message: 'Please fill out all required fields',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    // Mark form as submitted
    setFormSubmitted(true);

    // Update task status - mark Assemble Project Team as completed
    updateSubtaskStatus('1.1', 'completed');

    // Find the next task (Conduct Preliminary Research) and select it to redirect
    const nextTask = subtasks.find(subtask => subtask.id === '1.2');
    if (nextTask) {
      setSelectedTask(nextTask);
    }
  };

  if (formSubmitted) {
    return (
      <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-500">
          <div className="flex justify-between items-center">
            <p className="text-sm">Project team assembled successfully! You can now proceed to the next task.</p>
            <button
              type="button"
              onClick={() => {
                // Reset form submission state
                setFormSubmitted(false);

                // Reset task status
                resetTaskState('1.1');

                // Reset all subsequent tasks
                resetSubsequentTasks('1.1');

                showToast({
                  message: 'Editing mode activated. All subsequent tasks have been reset.',
                  type: 'info',
                  duration: 3000,
                });
              }}
              className="px-3 py-1.5 text-xs border border-amber-300 rounded-md hover:bg-amber-100 dark:border-amber-600 dark:hover:bg-amber-800/30 dark:text-amber-300"
            >
              Edit Team
            </button>
          </div>
        </div>

        {/* Display the submitted data */}
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Project Details</h6>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Description:</p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{assembleTeamFormData.projectDescription}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Members:</p>
              <ul className="mt-1 list-disc list-inside">
                {assembleTeamFormData.selectedStaff.map((staff, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{staff}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
      <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Assemble Project Team</h6>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Define the project scope and select team members who will be working on this project.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Description */}
        <div>
          <label htmlFor="projectDescription" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Project Description
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="projectDescription"
            name="projectDescription"
            value={assembleTeamFormData.projectDescription}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-amber-700 dark:text-white"
            rows={4}
            placeholder="Describe the project scope, goals, and key deliverables..."
          />
        </div>

        {/* Staff Selection */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Assigned Team Members
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <StaffSelectionInput
            selectedStaff={assembleTeamFormData.selectedStaff}
            onChange={handleStaffChange}
          />
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

export default AssembleTeamForm;
