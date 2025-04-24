import { useProjectContext } from '@/features/project-monitoring-demo/contexts/ProjectContext';
import React, { useState } from 'react';
import StaffSelectionInput from './StaffSelectionInput';

const AssembleTeamForm: React.FC = () => {
  const {
    updateSubtaskStatus,
    assembleTeamFormData,
    setAssembleTeamFormData,
    subtasks,
    setSelectedTask,
  } = useProjectContext();

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAssembleTeamFormData({ [name]: value });
  };

  const handleStaffChange = (selectedStaff: string[]) => {
    setAssembleTeamFormData({ selectedStaff });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!assembleTeamFormData.projectDescription || assembleTeamFormData.selectedStaff.length === 0) {
      alert('Please fill out all required fields');
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
          <p className="text-sm">Project team assembled successfully! You can now proceed to the next task.</p>
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
