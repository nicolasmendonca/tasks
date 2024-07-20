import { z } from "zod";

export const FormSchema = z.object({
  description: z.string().min(1, {
    message: "Description is required",
  }),
  dueDate: z.date().nullable(),
  projectId: z.string().nullable(),
});
export type FormSchema = z.infer<typeof FormSchema>;
