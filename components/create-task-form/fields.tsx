import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDaysIcon, FlagIcon, SquarePenIcon } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useForm, useFormContext } from "react-hook-form";
import {
  Form as UiForm,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FormSchema } from "./form-schema";
import { format } from "date-fns/format";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Project as ProjectType } from "@/lib/db";

export const projectDefaultValues = {
  description: "",
  dueDate: null,
  projectId: null,
};

function Form({
  children,
  onCreateTask,
  defaultValues = projectDefaultValues,
}: Readonly<{
  children: React.ReactNode;
  onCreateTask: (data: FormSchema) => Promise<void>;
  defaultValues?: FormSchema;
}>) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  return (
    <UiForm {...form}>
      <form
        className="relative flex flex-col lg:flex-row gap-2"
        onSubmit={form.handleSubmit((values) => {
          onCreateTask(values);
          form.reset();
        })}>
        {children}
      </form>
    </UiForm>
  );
}

function Description() {
  const { control } = useFormContext<FormSchema>();

  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => {
        return (
          <FormItem className="w-full space-y-0">
            <SquarePenIcon className="absolute stroke-muted-foreground size-4 top-3 left-4" />
            <FormControl>
              <Input
                placeholder="Add new task..."
                className="pl-10 w-full"
                {...field}
              />
            </FormControl>
            <FormMessage className="pt-2" />
          </FormItem>
        );
      }}
    />
  );
}

function DueDate() {
  const { control } = useFormContext<FormSchema>();

  return (
    <FormField
      control={control}
      name="dueDate"
      render={({ field }) => {
        return (
          <FormItem className="space-y-0">
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start font-normal w-full lg:w-44">
                    <CalendarDaysIcon className="stroke-muted-foreground size-4 mr-2" />
                    {field.value ? format(field.value, "EEE P") : "Due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined}
                    onSelect={(newDate) => field.onChange(newDate ?? null)}
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage className="pt-2" />
          </FormItem>
        );
      }}
    />
  );
}

function Project(
  props: Readonly<{
    projects: ProjectType[];
  }>
) {
  const { control } = useFormContext<FormSchema>();

  return (
    <FormField
      control={control}
      name="projectId"
      render={({ field }) => {
        return (
          <Select value={field.value ?? ""} onValueChange={field.onChange}>
            <SelectTrigger className="min-w-40 w-full lg:w-fit">
              <FormItem className="space-y-0">
                <FormControl>
                  <div className="flex gap-2 items-center">
                    <FlagIcon className="stroke-muted-foreground size-4" />
                    <SelectValue placeholder="Select project" />
                  </div>
                </FormControl>
                <FormMessage className="pt-2" />
              </FormItem>
            </SelectTrigger>
            <SelectContent>
              {props.projects.map((project) => {
                return (
                  <SelectItem key={project.id} value={`${project.id}`}>
                    {project.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
      }}
    />
  );
}

export const CreateTask = {
  Form,
  Description,
  DueDate,
  Project,
};
