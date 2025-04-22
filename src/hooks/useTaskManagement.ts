import type { SubTask, Task, TaskStatus } from '@/types/project-monitoring';
import { initialSubtasks, initialTasks } from '@/data/project-monitoring-data';
import { useCallback, useState } from 'react';

export const useTaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [subtasks, setSubtasks] = useState<SubTask[]>(initialSubtasks);
  const [selectedTask, setSelectedTask] = useState<Task | SubTask | null>(null);

  // Update task status
  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status } : task,
      ),
    );
  }, []);

  // Update subtask status
  const updateSubtaskStatus = useCallback((subtaskId: string, status: TaskStatus) => {
    setSubtasks(prevSubtasks =>
      prevSubtasks.map(subtask =>
        subtask.id === subtaskId ? { ...subtask, status } : subtask,
      ),
    );
  }, []);

  // Update parent task status based on subtask statuses
  const updateParentTaskStatus = useCallback(() => {
    // Group subtasks by parent ID
    const subtasksByParent: Record<string, SubTask[]> = {};
    subtasks.forEach((subtask) => {
      if (subtask.parentId) {
        if (!subtasksByParent[subtask.parentId]) {
          subtasksByParent[subtask.parentId] = [];
        }
        subtasksByParent[subtask.parentId]?.push(subtask);
      }
    });

    // Update each parent task's status based on its subtasks
    const updatedTasks = [...tasks];
    Object.entries(subtasksByParent).forEach(([parentId, parentSubtasks]) => {
      const parentTask = updatedTasks.find(task => task.id === parentId);
      if (parentTask) {
        // Check if all subtasks are completed
        const allCompleted = parentSubtasks.every(subtask => subtask.status === 'completed');
        // Check if any subtask is in-progress
        const anyInProgress = parentSubtasks.some(subtask => subtask.status === 'in-progress');

        if (allCompleted) {
          parentTask.status = 'completed';
        } else if (anyInProgress) {
          parentTask.status = 'in-progress';
        } else {
          parentTask.status = 'pending';
        }
      }
    });

    setTasks(updatedTasks);
  }, [subtasks, tasks]);

  // Handle task selection
  const handleTaskSelect = useCallback((task: Task | SubTask) => {
    setSelectedTask(task);
  }, []);

  return {
    tasks,
    subtasks,
    selectedTask,
    setSelectedTask,
    updateTaskStatus,
    updateSubtaskStatus,
    updateParentTaskStatus,
    handleTaskSelect,
  };
};
