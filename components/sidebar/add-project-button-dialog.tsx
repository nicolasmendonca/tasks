import React from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const formSchema = z.object({
  name: z.string().min(1),
});

function AddProjectButtonDialog({
  onProjectCreated,
}: {
  onProjectCreated: (values: z.infer<typeof formSchema>) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-neutral-950 justify-start gap-2">
          <PlusIcon />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <DialogHeader>
            <DialogTitle>Add new project</DialogTitle>
          </DialogHeader>
          <form
            className="relative flex flex-col lg:flex-row gap-2"
            onSubmit={form.handleSubmit((values) => {
              form.reset();
              onProjectCreated(values);
              setOpen(false);
            })}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Add new project..." />
                    </FormControl>
                    <FormMessage className="pt-2" />
                  </FormItem>
                );
              }}
            />
          </form>
          <DialogFooter>
            <Button type="submit">Add project</Button>
            <DialogClose asChild>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  form.reset();
                }}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddProjectButtonDialog;
