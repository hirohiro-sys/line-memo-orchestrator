import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createDb } from "../db";
import { memos, tags } from "../db/schema";
import type { Env } from "../env";
import type { ClassifySuccess } from "./classify";
import { fetchMessageContent } from "./client";

export type PersistResult =
  | { status: "inserted" }
  | { status: "duplicate" }
  | { status: "failed"; reason: "save_failed" };

type PersistEnv = Pick<Env, "DB" | "MEDIA" | "LINE_CHANNEL_ACCESS_TOKEN">;

export function memoImageKey(userId: string, memoId: string): string {
  return `${userId}/${memoId}`;
}

function isUniqueConstraintError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("UNIQUE constraint failed");
}

export async function persistLineMemo(
  env: PersistEnv,
  input: {
    userId: string;
    lineMessageId: string;
    classified: ClassifySuccess;
  },
): Promise<PersistResult> {
  try {
    const db = createDb(env.DB);
    const [existing] = await db
      .select({ id: memos.id })
      .from(memos)
      .where(eq(memos.lineMessageId, input.lineMessageId))
      .limit(1);
    if (existing) return { status: "duplicate" };

    const [tag] = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, input.classified.tag))
      .limit(1);
    if (!tag) return { status: "failed", reason: "save_failed" };

    const memoId = nanoid();
    let imageKey: string | null = null;

    if (input.classified.mediaType === "image") {
      const content = await fetchMessageContent({
        accessToken: env.LINE_CHANNEL_ACCESS_TOKEN,
        messageId: input.lineMessageId,
      });
      if (!content) return { status: "failed", reason: "save_failed" };

      imageKey = memoImageKey(input.userId, memoId);
      await env.MEDIA.put(imageKey, content.body, {
        httpMetadata: { contentType: content.contentType },
      });
    }

    await db.insert(memos).values({
      id: memoId,
      userId: input.userId,
      tagId: tag.id,
      content: input.classified.content,
      url: null,
      imageKey,
      source: "line",
      mediaType: input.classified.mediaType,
      lineMessageId: input.lineMessageId,
      createdAt: new Date().toISOString(),
    });
    return { status: "inserted" };
  } catch (error) {
    if (isUniqueConstraintError(error)) return { status: "duplicate" };
    return { status: "failed", reason: "save_failed" };
  }
}
