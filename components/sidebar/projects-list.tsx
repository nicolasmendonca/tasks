"use client";

import Link from "next/link";
import { FolderIcon } from "lucide-react";
import AddProjectButtonDialog from "./add-project-button-dialog";
import useSWR from "swr";
import { db, Project } from "@/lib/db";
import { mapArrayToEntities } from "@/lib/utils";
import { produce } from "immer";

function getProjectKey(project: Project) {
  return project.id;
}

export default function ProjectsList() {
  const projectsQuery = useSWR("/projects", async () => {
    const projects = await db.projects.toArray();
    return mapArrayToEntities(projects, getProjectKey);
  });

  if (projectsQuery.error) {
    return <p>Error: {projectsQuery.error.message}</p>;
  }

  if (!projectsQuery.data) {
    return null;
  }

  async function handleProjectCreated(projectData: Omit<Project, "id">) {
    const tempId = -1;
    const tempProject = { ...projectData, id: tempId };
    const tempProjects = produce(projectsQuery.data!, (draft) => {
      draft.ids.push(tempId);
      draft.record[tempId] = tempProject;
    });
    await projectsQuery.mutate(
      async () => {
        const projectId = await db.projects.add(projectData);
        return produce(projectsQuery.data!, (draft) => {
          draft.ids.push(projectId);
          draft.record[projectId] = { ...projectData, id: projectId };
        });
      },
      {
        optimisticData: tempProjects,
      }
    );
  }

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-lg font-semibold">Projects</h3>
      <nav className="flex flex-col gap-2">
        {projectsQuery.data.toArray().map((project) => {
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
              prefetch={false}>
              <FolderIcon className="h-5 w-5" />
              {project.name}
            </Link>
          );
        })}
        <AddProjectButtonDialog onProjectCreated={handleProjectCreated} />
      </nav>
    </div>
  );
}
