import { z } from "zod";

export const memoSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
});

export const memoListResponseSchema = z.object({
  items: z.array(memoSchema),
});

export type Memo = z.infer<typeof memoSchema>;
export type MemoListResponse = z.infer<typeof memoListResponseSchema>;
