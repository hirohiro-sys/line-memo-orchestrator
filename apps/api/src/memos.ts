import {
  createMemoRequestSchema,
  type Memo,
  memoListResponseSchema,
  memoSchema,
} from "@repo/shared";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { createDb } from "./db";
import { memos, tags } from "./db/schema";
import type { Env } from "./env";
import { detectMediaType } from "./line/classify";
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

memoRoutes.post("/api/memos", async (c) => {
  const userId = await readSessionUserId(c);
  if (!userId) {
    return c.json({ message: "unauthorized" }, 401);
  }

  let body: ReturnType<typeof createMemoRequestSchema.parse>;
  try {
    body = createMemoRequestSchema.parse(await c.req.json());
  } catch {
    return c.json({ message: "invalid request" }, 400);
  }

  const db = createDb(c.env.DB);
  const [tag] = await db
    .select({ id: tags.id, slug: tags.slug })
    .from(tags)
    .where(eq(tags.slug, body.tag))
    .limit(1);
  if (!tag) {
    return c.json({ message: "invalid request" }, 400);
  }

  const memoId = nanoid();
  const createdAt = new Date().toISOString();
  const mediaType = detectMediaType(body.content);

  try {
    await db.insert(memos).values({
      id: memoId,
      userId,
      tagId: tag.id,
      content: body.content,
      url: null,
      imageKey: null,
      source: "web",
      mediaType,
      lineMessageId: null,
      createdAt,
    });
  } catch {
    return c.json({ message: "save failed" }, 500);
  }

  return c.json(
    toMemoResponse({
      id: memoId,
      tag: tag.slug,
      content: body.content,
      url: null,
      mediaType,
      source: "web",
      createdAt,
    }),
    201,
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

function logJson(fields: Record<string, unknown>) {
  console.log(JSON.stringify(fields));
}

memoRoutes.delete("/api/memos/:id", async (c) => {
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

  if (!row || row.userId !== userId) {
    return c.json({ message: "not found" }, 404);
  }

  await db.delete(memos).where(eq(memos.id, c.req.param("id")));

  if (row.imageKey) {
    try {
      await c.env.MEDIA.delete(row.imageKey);
    } catch {
      logJson({
        event: "memo.image.delete",
        status: "failed",
        imageKey: row.imageKey,
      });
    }
  }

  return c.body(null, 204);
});
