"use client";

import { produce } from "immer";
import { db, type Task } from "@/lib/db";
import TaskCard from "@/components/task-card";
import { CreateTask } from "@/components/create-task-form/fields";
import { Button } from "@/components/ui/button";
import {
  useProjectQuery,
  useProjectsQuery,
  useProjectTasksQuery,
} from "@/lib/queries";
import { PlusIcon } from "lucide-react";

function ProjectIdPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const projectIdNumber = Number(params.projectId);
  const projectQuery = useProjectQuery({ projectId: projectIdNumber });
  const projectsQuery = useProjectsQuery();
  const projectTasksQuery = useProjectTasksQuery({
    projectId,
  });

  function handleTaskUpdated(updatedTask: Task) {
    const updatedTasks = produce(projectTasksQuery.data!, (draft) => {
      if (updatedTask.projectId === projectId) {
        draft.record[updatedTask.id] = updatedTask;
      } else {
        delete draft.record[updatedTask.id];
        draft.ids.splice(draft.ids.indexOf(updatedTask.id), 1);
      }
    });
    projectTasksQuery.mutate(
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
    const updatedTasks = produce(projectTasksQuery.data!, (draft) => {
      delete draft.record[deletedTask.id];
      draft.ids.splice(draft.ids.indexOf(deletedTask.id), 1);
    });
    projectTasksQuery.mutate(
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
    const tempTasks = produce(projectTasksQuery.data!, (draft) => {
      if (newTask.projectId === projectId) {
        const taskWithTempId = { ...newTask, id: tempId };
        draft.record[tempId] = taskWithTempId;
        draft.ids.push(tempId);
      }
    });
    projectTasksQuery.mutate(
      async () => {
        const taskId = await db.tasks.add(newTask);
        return produce(projectTasksQuery.data!, (draft) => {
          if (newTask.projectId === projectId) {
            draft.ids.push(taskId);
            draft.record[taskId] = { ...newTask, id: taskId };
          }
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
            defaultValues={{
              description: "",
              dueDate: null,
              projectId,
            }}
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
            <Button type="submit">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </CreateTask.Form>
        </div>
        <div className="grid gap-4">
          <div>
            <h2 className="mb-2 text-lg font-semibold">
              {projectQuery.data?.name}
            </h2>
            <div className="space-y-2">
              {projectTasksQuery.data?.toArray().map((task) => {
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projects={projectsQuery.data?.toArray() ?? []}
                    onTaskUpdated={handleTaskUpdated}
                    onTaskDeleted={() => handleTaskDeleted(task)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProjectIdPage;
