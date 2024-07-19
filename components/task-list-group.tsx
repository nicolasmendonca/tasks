"use client";

import TaskCard from "./task-card";
import useSWR from "swr";
import type { Task } from "../lib/db";

type Props = Readonly<{
  group: {
    id: string;
    name: string;
    noTasksLabel: string;
    loadTaskIds: () => Promise<Array<Task['id']>>;
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
  const taskGroupQuery = useSWR(
    `/task-groups/${props.group.id}`,
    props.group.loadTaskIds
  );

  if (taskGroupQuery.error) {
    return <p className="text-sm text-red-500">Failed to load tasks</p>;
  }

  if (taskGroupQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading tasks...</p>;
  }

  if (taskGroupQuery.data!.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {props.group.noTasksLabel}
      </p>
    );
  }

  return taskGroupQuery.data!.map((taskId) => <TaskCard key={taskId} taskId={taskId} onTaskDeleted={() => {
    taskGroupQuery.mutate(taskGroupQuery.data?.filter(id => id !== taskId))
  }} />);
}
