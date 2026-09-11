import { type Memo, memoListResponseSchema, memoSchema } from "@repo/shared";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "./db";
import { memos, tags } from "./db/schema";
import type { Env } from "./env";
import { readSessionUserId } from "./session";

export const memoRoutes = new Hono<{ Bindings: Env }>();

type MemoRow = {
  id: string;
  tag: string;
  content: string;
  url: string | null;
  mediaType: string;
  source: string;
  createdAt: string;
};

export function toMemoResponse(row: MemoRow): Memo {
  return memoSchema.parse({
    id: row.id,
    tag: row.tag,
    content: row.content,
    mediaType: row.mediaType,
    source: row.source,
    createdAt: row.createdAt,
    ...(row.url ? { url: row.url } : {}),
    ...(row.mediaType === "image"
      ? { thumbnailUrl: `/api/memos/${row.id}/image` }
      : {}),
  });
}

memoRoutes.get("/api/memos", async (c) => {
  const userId = await readSessionUserId(c);
  if (!userId) {
    return c.json({ message: "unauthorized" }, 401);
  }

  const db = createDb(c.env.DB);
  const rows = await db
    .select({
      id: memos.id,
      tag: tags.slug,
      content: memos.content,
      url: memos.url,
      mediaType: memos.mediaType,
      source: memos.source,
      createdAt: memos.createdAt,
    })
    .from(memos)
    .innerJoin(tags, eq(memos.tagId, tags.id))
    .where(eq(memos.userId, userId))
    .orderBy(desc(memos.createdAt));

  return c.json(
    memoListResponseSchema.parse({ items: rows.map(toMemoResponse) }),
  );
});

memoRoutes.get("/api/memos/:id/image", async (c) => {
  const userId = await readSessionUserId(c);
  if (!userId) {
    return c.json({ message: "unauthorized" }, 401);
  }

  const db = createDb(c.env.DB);
  const [row] = await db
    .select({
      userId: memos.userId,
      imageKey: memos.imageKey,
    })
    .from(memos)
    .where(eq(memos.id, c.req.param("id")))
    .limit(1);

  if (!row || row.userId !== userId || !row.imageKey) {
    return c.json({ message: "not found" }, 404);
  }

  const object = await c.env.MEDIA.get(row.imageKey);
  if (!object) {
    return c.json({ message: "not found" }, 404);
  }

  return new Response(object.body, {
    headers: {
      "Content-Type":
        object.httpMetadata?.contentType ?? "application/octet-stream",
    },
  });
});
