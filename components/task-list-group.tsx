"use client";

import type { Task } from "../lib/db";
import TaskCard from "./task-card";
import useSWR from "swr";

type Props = Readonly<{
  group: {
    id: string;
    name: string;
    noTasksLabel: string;
    loadTasks: () => Promise<Task[]>;
  };
}>;

export default function TaskListGroup(props: Props) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">{props.group.name}</h2>
      <div className="space-y-2">
        <TaskList group={props.group} />
      </div>
    </div>
  );
}

function TaskList(props: Props) {
  const { data, error, isLoading } = useSWR(
    `tasks-${props.group.id}`,
    props.group.loadTasks
  );

  if (error) {
    return <p className="text-sm text-red-500">Failed to load tasks</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading tasks...</p>;
  }

  if (data!.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {props.group.noTasksLabel}
      </p>
    );
  }

  return data!.map((task) => <TaskCard key={task.id} task={task} />);
}
