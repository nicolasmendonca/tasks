import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarDaysIcon,
  FlagIcon,
  PlusIcon,
  SquarePenIcon,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { format } from "date-fns/format";

const formSchema = z.object({
  description: z.string().min(1, {
    message: "Description is required",
  }),
  dueDate: z.date().nullable(),
  projectId: z.string().nullable(),
});

export default function CreateTaskForm(
  props: Readonly<{
    onCreateTask: (data: z.infer<typeof formSchema>) => Promise<void>;
  }>
) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      dueDate: null,
      projectId: null,
    },
  });

  return (
    <Form {...form}>
      <form
        className="relative flex flex-col lg:flex-row gap-2"
        onSubmit={form.handleSubmit((values) => {
          props.onCreateTask(values);
          form.reset();
        })}>
        <FormField
          control={form.control}
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
        <FormField
          control={form.control}
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
                        {field.value
                          ? format(field.value, "EEE P")
                          : "Due date"}
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
        <FormField
          control={form.control}
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
                  <SelectItem value="project-a">Project A</SelectItem>
                  <SelectItem value="project-b">Project B</SelectItem>
                </SelectContent>
              </Select>
            );
          }}
        />
        <Button type="submit">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </form>
    </Form>
  );
}
