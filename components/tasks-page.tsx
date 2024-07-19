'use client';

import { Button } from '@/components/ui/button';
import CreateTaskForm from './create-task-form';
import { ListIcon, MenuIcon } from 'lucide-react';
import Sidebar from './sidebar';
import { db, Task } from '../lib/db';
import {
  addDays,
  isAfter,
  isSameDay,
  startOfDay,
  isWithinInterval,
} from 'date-fns';
import useSWR from 'swr';
import { produce } from 'immer';
import TaskCard from './task-card';

const getTaskGroups = (tasks: Task[]) =>
  [
    {
      id: 'today',
      name: 'Today',
      noTasksLabel: 'No tasks for today',
      getTasks: () => {
        function isToday(date: Date) {
          const today = new Date();
          return isSameDay(date, today);
        }

        return tasks.filter(
          (task) => task.dueDate !== null && isToday(task.dueDate)
        );
      },
    },
    {
      id: 'tomorrow',
      name: 'Tomorrow',
      noTasksLabel: 'No tasks for tomorrow',
      getTasks: () => {
        function isTomorrow(date: Date) {
          const today = new Date();
          const tomorrow = addDays(today, 1);
          return isSameDay(date, tomorrow);
        }
        return tasks.filter(
          (task) => task.dueDate !== null && isTomorrow(task.dueDate)
        );
      },
    },
    {
      id: 'next-7-days',
      name: 'Next 7 days',
      noTasksLabel: 'No tasks for the next 7 days',
      getTasks: () => {
        function isNext7Days(date: Date) {
          const today = startOfDay(new Date());
          const tomorrow = addDays(today, 1);
          const endOfNext7Days = addDays(tomorrow, 6);
          return (
            isWithinInterval(date, {
              start: tomorrow,
              end: endOfNext7Days,
            }) && !isSameDay(date, tomorrow)
          );
        }
        return tasks.filter(
          (task) => task.dueDate !== null && isNext7Days(task.dueDate)
        );
      },
    },
    {
      id: 'upcoming',
      name: 'Upcoming',
      noTasksLabel: 'No upcoming tasks',
      getTasks: () => {
        function isUpcoming(date: Date) {
          const today = startOfDay(new Date());
          const tomorrow = addDays(today, 1);
          const endOfNext7Days = addDays(today, 7);
          return (
            isAfter(date, endOfNext7Days) ||
            (isAfter(date, tomorrow) && !isNext7Days(date))
          );
        }

        function isNext7Days(date: Date) {
          const today = startOfDay(new Date());
          const endOfNext7Days = addDays(today, 7);
          return (
            isWithinInterval(date, {
              start: today,
              end: endOfNext7Days,
            }) && !isSameDay(date, today)
          );
        }

        return tasks.filter(
          (task) => task.dueDate !== null && isUpcoming(task.dueDate)
        );
      },
    },
    {
      id: 'unscheduled',
      name: 'Unscheduled',
      noTasksLabel: 'No unscheduled tasks',
      getTasks: () => {
        return tasks.filter((task) => task.dueDate === null);
      },
    },
  ] satisfies Array<{
    id: string;
    name: string;
    noTasksLabel: string;
    getTasks: () => Array<Task>;
  }>;

const tasksQueryKey = '/tasks';

function mapArrayToEntities<
  T extends Object[],
  K extends string | number | symbol
>(array: T, getId: (element: T[number]) => K) {
  const ids = array.map(getId);
  const record = array.reduce<Record<K, T[number]>>((record, element) => {
    record[getId(element)] = element;
    return record;
  }, {} as Record<K, T[number]>);

  return {
    ids,
    record,
    toArray: () => ids.map((id) => record[id]),
  };
}

function getTaskKey(task: Task) {
  return task.id;
}

export function TasksPage() {
  const tasksQuery = useSWR(tasksQueryKey, async () => {
    const tasks = await db.tasks.toArray();
    return mapArrayToEntities(tasks, getTaskKey);
  }, {
    suspense: true,
    fallback: [],
  });

  if (tasksQuery.error) {
    return <p>Error... {JSON.stringify(tasksQuery.error)}</p>;
  }

  function handleTaskUpdated(updatedTask: Task) {
    const updatedTasks = produce(tasksQuery.data, (draft) => {
      draft.record[updatedTask.id] = updatedTask;
    });
    tasksQuery.mutate(
      async () => {
        await db.tasks.update(updatedTask.id, updatedTask);
        return updatedTasks;
      },
      {
        optimisticData: updatedTasks,
      }
    );
  }

  function handleTaskDeleted(deletedTask: Task) {
    const updatedTasks = produce(tasksQuery.data, (draft) => {
      delete draft.record[deletedTask.id];
      draft.ids.splice(draft.ids.indexOf(deletedTask.id), 1);
    });
    tasksQuery.mutate(
      async () => {
        await db.tasks.delete(deletedTask.id);
        return updatedTasks;
      },
      {
        optimisticData: updatedTasks,
      }
    );
  }

  function handleTaskCreated(newTask: Omit<Task, 'id'>) {
    const tempId = -1;
    const tempTasks = produce(tasksQuery.data, (draft) => {
      const taskWithTempId = { ...newTask, id: tempId };
      draft.record[tempId] = taskWithTempId;
      draft.ids.push(tempId);
    });
    tasksQuery.mutate(
      async () => {
        const taskId = await db.tasks.add(newTask);
        return produce(tasksQuery.data, draft => {
          draft.ids.push(taskId);
          draft.record[taskId] = { id: taskId, ...newTask };
        });
      },
      {
        optimisticData: tempTasks,
      }
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="bg-neutral-800 text-white sticky top-0 z-10 flex h-14 items-center justify-between bg-card px-4 shadow-sm md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <div>
                <ListIcon className="h-5 w-5" />
              </div>
              <div>My Tasks</div>
            </h1>
          </div>
        </header>
        <main className="bg-gradient-to-br from-[#fdd6bd] to-[#f794a4] overflow-auto flex-1">
          <div className="p-4 md:p-6 max-w-screen-lg mx-auto">
            <div className="mb-4">
              <CreateTaskForm
                onCreateTask={async (taskValues) => {
                  const newTask = {
                    completed: false,
                    description: taskValues.description,
                    dueDate: taskValues.dueDate,
                    projectId: taskValues.projectId,
                  };
                  handleTaskCreated(newTask);
                }}
              />
            </div>
            <div className="grid gap-4">
              {getTaskGroups(tasksQuery.data?.toArray()).map((group) => (
                <div key={group.id}>
                  <h2 className="mb-2 text-lg font-semibold">{group.name}</h2>
                  <div className="space-y-2">
                    {group.getTasks().map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onTaskUpdated={handleTaskUpdated}
                        onTaskDeleted={() => handleTaskDeleted(task)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
