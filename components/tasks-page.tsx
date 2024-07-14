"use client";

import { Button } from "@/components/ui/button";
import CreateTaskForm from "./create-task-form";
import { ListIcon, MenuIcon } from "lucide-react";
import Sidebar from "./sidebar";
import TaskListGroup from "./task-list-group";
import { db, Task } from "../lib/db";
import { addDays, isAfter, isSameDay, startOfDay, startOfWeek, endOfWeek, isWithinInterval, addWeeks } from 'date-fns'
import { mutate } from 'swr'


const groups = [
  {
    id: "today",
    name: "Today",
    noTasksLabel: "No tasks for today",
    loadTasks: async () => {
      function isToday(date: Date) {
        const today = new Date();
        return isSameDay(date, today);
      }


      return db.tasks.filter((task) => task.dueDate !== null && isToday(task.dueDate)).toArray();
    },
  },
  {
    id: "tomorrow",
    name: "Tomorrow",
    noTasksLabel: "No tasks for tomorrow",
    loadTasks: async () => {

  function isTomorrow(date: Date) {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    return isSameDay(date, tomorrow);
  }
      return db.tasks.filter((task) => task.dueDate !== null && isTomorrow(task.dueDate)).toArray();
    },
  },
  {
    id: "this-week",
    name: "This week",
    noTasksLabel: "No tasks for this week",
    loadTasks: async () => {
      function isRestOfWeek(date: Date) {
        const today = new Date();
        const startOfTomorrow = startOfDay(addDays(today, 1));
        const startOfRestOfWeek = addDays(startOfTomorrow, 1);
        const endOfRestOfWeek = endOfWeek(today);
        return isWithinInterval(date, { start: startOfRestOfWeek, end: endOfRestOfWeek });
      }
      return db.tasks.filter((task) => task.dueDate !== null && isRestOfWeek(task.dueDate)).toArray();
    },
  },
  {
    id: "next-15-days",
    name: "Next 15 days",
    noTasksLabel: "No tasks for the next 15 days",
    loadTasks: async () => {
      function isUpcomingTwoWeeks(date: Date) {
        const today = new Date();
        const startOfNextWeek = startOfWeek(addWeeks(today, 1));
        const endOfUpcomingTwoWeeks = endOfWeek(addWeeks(today, 2));
        return isWithinInterval(date, { start: startOfNextWeek, end: endOfUpcomingTwoWeeks });
      }
      return db.tasks.filter((task) => task.dueDate !== null && isUpcomingTwoWeeks(task.dueDate)).toArray();
    },
  },
  {
    id: "upcoming",
    name: "Upcoming",
    noTasksLabel: "No upcoming tasks",
    loadTasks: async () => {
      function isUpcoming(date: Date) {
        const today = new Date();
        const endOfUpcomingTwoWeeks = endOfWeek(addWeeks(today, 2));
        return isAfter(date, endOfUpcomingTwoWeeks);
      }
      return db.tasks.filter((task) => task.dueDate !== null && isUpcoming(task.dueDate)).toArray();
    },
  },
  {
    id: "unscheduled",
    name: "Unscheduled",
    noTasksLabel: "No unscheduled tasks",
    loadTasks: async () => {
      return db.tasks.filter(task => task.dueDate === null).toArray();
    },
  },
] satisfies Array<{
  id: string;
  name: string;
  noTasksLabel: string;
  loadTasks: () => Promise<Task[]>;
}>;

export function TasksPage() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="bg-neutral-800 text-white sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
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
        <main className="bg-gradient-to-br from-cyan-100 to-purple-400 overflow-auto flex-1">
          <div className="p-4 md:p-6 max-w-screen-lg mx-auto">
            <div className="mb-4">
              <CreateTaskForm onCreateTask={async (taskValues) => {
                await db.tasks.add({
                  completed: false,
                  description: taskValues.description,
                  dueDate: taskValues.dueDate,
                  projectId: taskValues.projectId
                })
                await mutate(key => (key as string).startsWith('tasks'), undefined, {
                  revalidate: true
                })
              }} />
            </div>
            <div className="grid gap-4">
              {groups.map((group) => (
                <TaskListGroup key={group.id} group={group} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
