import type { SubTask, Task } from '../types/project-monitoring';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/shared/components/ui/table';
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
    <div className="overflow-hidden rounded-xl bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-900/10">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-amber-200 dark:border-amber-800/30">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-amber-800 dark:text-amber-300 text-start text-theme-xs"
              >
                Task
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-amber-100 dark:divide-amber-800/20">
            {tasks.map(task => (
              <React.Fragment key={task.id}>
                <TableRow
                  onClick={() => onTaskSelect(task)}
                  className={`cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-800/20 ${
                    selectedTask?.id === task.id ? 'bg-amber-100/70 dark:bg-amber-800/30' : ''
                  }`}
                >
                  <TableCell className="px-5 py-4 text-start font-medium text-amber-900 dark:text-amber-100">
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
                      className={`cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-800/20 ${
                        selectedTask?.id === subtask.id ? 'bg-amber-100/70 dark:bg-amber-800/30' : ''
                      }`}
                    >
                      <TableCell className="px-5 py-4 text-start pl-10 text-amber-900 dark:text-amber-100">
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
