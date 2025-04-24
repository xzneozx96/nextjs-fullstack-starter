'use client';

import TaskDetails from '@/features/project-monitoring-demo/components/TaskDetails';
import TaskList from '@/features/project-monitoring-demo/components/TaskList';
import { ProjectProvider, useProjectContext } from '@/features/project-monitoring-demo/contexts/ProjectContext';
import ComponentCard from '@/shared/components/common/ComponentCard';
import Image from 'next/image';
import React from 'react';

/**
 * ProjectMonitoring component
 *
 * This component has been refactored to use smaller, more manageable components
 * and custom hooks for better separation of concerns.
 */
export default function ProjectMonitoring() {
  return (
    <ProjectProvider>
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Project Monitoring Dashboard
          </h2>
          <div className="flex-shrink-0">
            <Image
              src="/images/mvv-logo.png"
              alt="MVV Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Panel - Task List */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
            <ComponentCard title="Project Tasks" className="border-amber-200 dark:border-amber-800">
              <ProjectTaskList />
            </ComponentCard>
          </div>

          {/* Right Panel - Task Details */}
          <div className="lg:col-span-7">
            <ComponentCard title="Task Details" className="border-amber-200 dark:border-amber-800">
              <ProjectTaskDetails />
            </ComponentCard>
          </div>
        </div>
      </div>
    </ProjectProvider>
  );
}

/**
 * ProjectTaskList component
 *
 * This component handles rendering the task list in the left panel.
 */
function ProjectTaskList() {
  const { tasks, subtasks, selectedTask, handleTaskSelect } = useProjectContext();

  return (
    <TaskList
      tasks={tasks}
      subtasks={subtasks}
      selectedTask={selectedTask}
      onTaskSelect={handleTaskSelect}
    />
  );
}

/**
 * ProjectTaskDetails component
 *
 * This component handles rendering the task details in the right panel.
 */
function ProjectTaskDetails() {
  const { selectedTask, formSubmitted, surveyCompleted } = useProjectContext();

  return (
    <TaskDetails
      selectedTask={selectedTask}
      formSubmitted={formSubmitted}
      surveyCompleted={surveyCompleted}
    />
  );
}
