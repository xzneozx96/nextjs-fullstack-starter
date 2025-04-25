import { useProjectContext } from '@/features/project-monitoring-demo/contexts/ProjectContext';
import { useToast } from '@/shared/components/ui/toast/ToastContainer';
import React, { useState } from 'react';
import StaffSelectionInput from './StaffSelectionInput';

const PresentationDeckForm: React.FC = () => {
  const {
    updateSubtaskStatus,
    presentationDeckFormData,
    setPresentationDeckFormData,
    subtasks,
    setSelectedTask,
    isPreviousTasksCompleted,
    resetTaskState,
    resetSubsequentTasks,
  } = useProjectContext();

  // Access toast functionality
  const { showToast } = useToast();

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleStaffChange = (selectedStaff: string[]) => {
    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.5')) {
      showToast({
        message: 'You must complete all previous tasks before editing this one.',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    setPresentationDeckFormData({ selectedStaff });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.5')) {
      showToast({
        message: 'You must complete all previous tasks before editing this one.',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    setPresentationDeckFormData({ deadline: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.5')) {
      showToast({
        message: 'You must complete all previous tasks before editing this one.',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Store the file name in the form data
      setPresentationDeckFormData({ file: e.target.files[0].name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if previous tasks are completed
    if (!isPreviousTasksCompleted('1.5')) {
      showToast({
        message: 'You must complete all previous tasks before submitting this one.',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    // Validate form
    if (presentationDeckFormData.selectedStaff.length === 0 || !presentationDeckFormData.deadline || !file) {
      showToast({
        message: 'Please fill out all required fields',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    // Mark form as submitted
    setFormSubmitted(true);

    // Update task status - mark Prepare Presentation Deck as completed
    updateSubtaskStatus('1.5', 'completed');

    // Find the next task (Draft Proposal Generation) and select it to redirect
    const nextTask = subtasks.find(subtask => subtask.id === '1.6');
    if (nextTask) {
      setSelectedTask(nextTask);
    }
  };

  const handleDownloadTemplate = () => {
    // In a real app, this would download a template file
    showToast({
      message: 'In a real application, this would download a presentation template file.',
      type: 'info',
      duration: 3000,
    });
  };

  if (formSubmitted) {
    return (
      <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-500">
          <div className="flex justify-between items-center">
            <p className="text-sm">Presentation deck uploaded successfully! You can now proceed to the next task.</p>
            <button
              type="button"
              onClick={() => {
                // Reset form submission state
                setFormSubmitted(false);

                // Reset task status
                resetTaskState('1.5');

                // Reset all subsequent tasks
                resetSubsequentTasks('1.5');

                showToast({
                  message: 'Editing mode activated. All subsequent tasks have been reset.',
                  type: 'info',
                  duration: 3000,
                });
              }}
              className="px-3 py-1.5 text-xs border border-amber-300 rounded-md hover:bg-amber-100 dark:border-amber-600 dark:hover:bg-amber-800/30 dark:text-amber-300"
            >
              Edit Presentation
            </button>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h6 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Uploaded File:</h6>
          <p className="text-gray-600 dark:text-gray-400">{file?.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
      <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Prepare Presentation Deck</h6>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Assign staff members, set a deadline, and upload the final presentation deck for the client meeting.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Staff Selection */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Assigned To
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <StaffSelectionInput
            selectedStaff={presentationDeckFormData.selectedStaff}
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
            value={presentationDeckFormData.deadline}
            onChange={handleDateChange}
            required
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-amber-700 dark:text-white"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Presentation Deck
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-amber-300 border-dashed rounded-lg cursor-pointer bg-amber-50/50 hover:bg-amber-100/50 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 dark:border-amber-700 dark:hover:border-amber-600"
              aria-label="Upload presentation file"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-amber-600 dark:text-amber-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-amber-700 dark:text-amber-300">
                  <span className="font-semibold">Click to upload</span>
                  {' '}
                  or drag and drop
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  PowerPoint, PDF, or other presentation formats
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pptx,.ppt,.pdf,.key"
              />
            </label>
          </div>
          {file && (
            <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
              Selected file:
              {' '}
              {file.name}
            </div>
          )}
        </div>

        {/* Download Template Button */}
        <div>
          <button
            type="button"
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 text-sm font-medium"
            onClick={handleDownloadTemplate}
          >
            Download Presentation Template
          </button>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
          >
            Upload Presentation
          </button>
        </div>
      </form>
    </div>
  );
};

export default PresentationDeckForm;
