import useSWR from "swr";
import { db, Task } from "./db";
import { mapArrayToEntities } from "./utils";

export function useProjectQuery({ projectId }: { projectId: number }) {
  return useSWR(`/projects/${projectId}`, async () => {
    const project = await db.projects.get(projectId);
    return project;
  });
}

export function useProjectTasksQuery({ projectId }: { projectId: string }) {
  return useSWR(`/projects/${projectId}/tasks`, async () => {
    const tasks = await db.tasks.where("projectId").equals(projectId).toArray();
    return mapArrayToEntities(tasks, (task) => task.id);
  });
}

export function useProjectsQuery() {
  return useSWR(`/projects`, async () => {
    const projects = await db.projects.toArray();
    return mapArrayToEntities(projects, (project) => project.id);
  });
}

export function useTasksQuery() {
  return useSWR(`/tasks`, async () => {
    const tasks = await db.tasks.toArray();
    return mapArrayToEntities(tasks, (task) => task.id);
  });
}
