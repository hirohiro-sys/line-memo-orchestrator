import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  lineConnected: z.boolean(),
});

export const loginRequestSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type User = z.infer<typeof userSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
