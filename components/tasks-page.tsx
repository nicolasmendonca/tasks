'use client';

import {
  addDays,
  isAfter,
  isSameDay,
  startOfDay,
  isWithinInterval,
} from "date-fns";
import { produce } from "immer";
import { db, Task } from "@/lib/db";
import TaskCard from "./task-card";
import { useProjectsQuery, useTasksQuery } from "../lib/queries";
import { CreateTask } from "./create-task-form/fields";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";

const getTaskGroups = (tasks: Task[]) =>
  [
    {
      id: "today",
      name: "Today",
      noTasksLabel: "No tasks for today",
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
      id: "tomorrow",
      name: "Tomorrow",
      noTasksLabel: "No tasks for tomorrow",
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
      id: "next-7-days",
      name: "Next 7 days",
      noTasksLabel: "No tasks for the next 7 days",
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
      id: "upcoming",
      name: "Upcoming",
      noTasksLabel: "No upcoming tasks",
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
      id: "unscheduled",
      name: "Unscheduled",
      noTasksLabel: "No unscheduled tasks",
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

export function TasksPage() {
  const tasksQuery = useTasksQuery();
  const projectsQuery = useProjectsQuery();

  if (tasksQuery.error || projectsQuery.error) {
    return <p>Error... {JSON.stringify(tasksQuery.error)}</p>;
  }

  function handleTaskUpdated(updatedTask: Task) {
    const updatedTasks = produce(tasksQuery.data!, (draft) => {
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
    const updatedTasks = produce(tasksQuery.data!, (draft) => {
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

  function handleTaskCreated(newTask: Omit<Task, "id">) {
    const tempId = -1;
    const tempTasks = produce(tasksQuery.data!, (draft) => {
      const taskWithTempId = { ...newTask, id: tempId };
      draft.record[tempId] = taskWithTempId;
      draft.ids.push(tempId);
    });
    tasksQuery.mutate(
      async () => {
        const taskId = await db.tasks.add(newTask);
        return produce(tasksQuery.data!, (draft) => {
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
    <main className="bg-gradient-to-br from-[#fdd6bd] to-[#f794a4] overflow-auto flex-1">
      <div className="p-4 md:p-6 max-w-screen-lg mx-auto">
        <div className="mb-4">
          <CreateTask.Form
            onCreateTask={async (taskValues) => {
              const newTask = {
                completed: false,
                description: taskValues.description,
                dueDate: taskValues.dueDate,
                projectId: taskValues.projectId,
              };
              handleTaskCreated(newTask);
            }}>
            <CreateTask.Description />
            <CreateTask.DueDate />
            <CreateTask.Project
              projects={projectsQuery.data?.toArray() ?? []}
            />

            <Button type="submit">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </CreateTask.Form>
        </div>
        <div className="grid gap-4">
          {getTaskGroups(tasksQuery.data?.toArray() ?? []).map((group) => (
            <div key={group.id}>
              <h2 className="mb-2 text-lg font-semibold">{group.name}</h2>
              <div className="space-y-2">
                {group.getTasks().map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projects={projectsQuery.data?.toArray() ?? []}
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
  );
}
