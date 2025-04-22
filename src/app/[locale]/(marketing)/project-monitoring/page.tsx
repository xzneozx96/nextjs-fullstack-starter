'use client';

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import TaskDetails from '@/components/project-monitoring/TaskDetails';
import TaskList from '@/components/project-monitoring/TaskList';
import { ProjectProvider, useProjectContext } from '@/contexts/ProjectContext';
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
        <PageBreadcrumb pageTitle="Project Monitoring Dashboard" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Panel - Task List */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
            <ComponentCard title="Project Tasks">
              <ProjectTaskList />
            </ComponentCard>
          </div>

          {/* Right Panel - Task Details */}
          <div className="lg:col-span-7">
            <ComponentCard title="Task Details">
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
