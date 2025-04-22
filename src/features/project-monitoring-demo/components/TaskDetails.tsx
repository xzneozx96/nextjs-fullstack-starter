import type { SubTask, Task } from '../types/project-monitoring';
import React from 'react';
import AssembleTeamForm from './AssembleTeamForm';
import ClientQuestionnaireForm from './ClientQuestionnaireForm';
import DraftProposalForm from './DraftProposalForm';
import MeetingObjectivesForm from './MeetingObjectivesForm';
import PreliminaryResearchForm from './PreliminaryResearchForm';
import PresentationDeckForm from './PresentationDeckForm';

type TaskDetailsProps = {
  selectedTask: Task | SubTask | null;
  formSubmitted?: boolean;
  surveyCompleted?: boolean;
};

const TaskDetails: React.FC<TaskDetailsProps> = ({
  selectedTask,
}) => {
  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (!selectedTask) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Select a task to view details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Header */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          {selectedTask.id}
          {' '}
          {selectedTask.name}
        </h3>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedTask.description}</p>
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Assignee */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Assignee</h4>
          <p className="text-gray-600 dark:text-gray-400">{selectedTask.assignee}</p>
        </div>

        {/* Status */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Status</h4>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTask.status)}`}>
            {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
          </span>
        </div>

        {/* Deadline */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Deadline</h4>
          <p className="text-gray-600 dark:text-gray-400">{selectedTask.deadline}</p>
        </div>

        {/* Input Required */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Input Required</h4>
          <p className="text-gray-600 dark:text-gray-400">{selectedTask.input}</p>
        </div>
      </div>

      {/* Task-specific content */}
      {selectedTask.id === '1.1' && (
        <AssembleTeamForm />
      )}

      {selectedTask.id === '1.2' && (
        <PreliminaryResearchForm />
      )}

      {selectedTask.id === '1.3' && (
        <MeetingObjectivesForm />
      )}

      {selectedTask.id === '1.4' && (
        <ClientQuestionnaireForm />
      )}

      {selectedTask.id === '1.5' && (
        <PresentationDeckForm />
      )}

      {selectedTask.id === '1.6' && (
        <DraftProposalForm />
      )}

      {/* Input Details */}
      {selectedTask.inputDetails && (
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Input Details</h4>
          <p className="text-gray-600 dark:text-gray-400">{selectedTask.inputDetails}</p>
        </div>
      )}

      {/* Expected Output */}
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Expected Output</h4>
        <p className="text-gray-600 dark:text-gray-400">{selectedTask.output}</p>
      </div>
    </div>
  );
};

export default TaskDetails;
