import type { SubTask, Task } from '@/types/project-monitoring';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import React from 'react';
import TaskStatusIndicator from './TaskStatusIndicator';

type TaskListProps = {
  tasks: Task[];
  subtasks: SubTask[];
  selectedTask: Task | SubTask | null;
  onTaskSelect: (task: Task | SubTask) => void;
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  subtasks,
  selectedTask,
  onTaskSelect,
}) => {
  return (
    <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-theme-xs"
              >
                Task
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tasks.map(task => (
              <React.Fragment key={task.id}>
                <TableRow
                  onClick={() => onTaskSelect(task)}
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedTask?.id === task.id ? 'bg-gray-50 dark:bg-gray-800' : ''
                  }`}
                >
                  <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {task.id}
                        .
                        {task.name}
                      </div>
                      <TaskStatusIndicator status={task.status} />
                    </div>
                  </TableCell>
                </TableRow>

                {/* Render subtasks */}
                {subtasks
                  .filter(subtask => subtask.parentId === task.id)
                  .map(subtask => (
                    <TableRow
                      key={subtask.id}
                      onClick={() => onTaskSelect(subtask)}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        selectedTask?.id === subtask.id ? 'bg-gray-50 dark:bg-gray-800' : ''
                      }`}
                    >
                      <TableCell className="px-5 py-4 text-start pl-10 text-gray-800 dark:text-white/90">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {subtask.id}
                            {' '}
                            {subtask.name}
                          </div>
                          <TaskStatusIndicator status={subtask.status} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TaskList;
