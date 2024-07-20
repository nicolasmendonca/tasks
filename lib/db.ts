import { z } from "zod";
import Dexie, { EntityTable } from "dexie";

export const Task = z.object({
  id: z.number(),
  description: z.string(),
  completed: z.boolean().default(false),
  dueDate: z
    .string()
    .nullable()
    .transform((str) => (str !== null ? new Date(str) : null))
    .default(null),
  projectId: z.string().nullable().default(null),
});

export type Task = z.infer<typeof Task>;

export const Project = z.object({
  id: z.number(),
  name: z.string().min(1),
});

export type Project = z.infer<typeof Project>;

export const db = new Dexie("myDatabase") as Dexie & {
  tasks: EntityTable<Task, "id">;
  projects: EntityTable<Project, "id">;
};

db.version(1).stores({
  tasks: "++id, description, completed, dueDate, projectId",
  projects: "++id, name",
});
