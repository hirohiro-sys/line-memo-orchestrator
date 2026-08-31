import type { MemoMediaType, MemoTag } from "@repo/shared";

const URL_REGEX = /^https?:\/\/[^\s]+$/i;
export const VALID_TAGS: MemoTag[] = ["tweet", "tech", "other"];

export function detectMediaType(text: string): Exclude<MemoMediaType, "image"> {
  return URL_REGEX.test(text.trim()) ? "url" : "text";
}

export function extractHashtag(text: string): MemoTag | null {
  const match = text.match(/#(tweet|tech|other)\b/i);
  if (!match) return null;
  return match[1].toLowerCase() as MemoTag;
}

export function classifyMessage(
  text: string | undefined,
  hasImage: boolean,
): { tag: MemoTag; needsConfirmation: boolean } {
  const msg = text?.trim() ?? "";

  if (msg) {
    const explicitTag = extractHashtag(msg);
    if (explicitTag) {
      return { tag: explicitTag, needsConfirmation: false };
    }
    if (msg.match(/#(\S+)/)) {
      return { tag: "tweet", needsConfirmation: true };
    }
  }

  if (hasImage) {
    return { tag: "other", needsConfirmation: false };
  }

  if (msg) {
    if (detectMediaType(msg) === "url") {
      return { tag: "tech", needsConfirmation: false };
    }
    return { tag: "tweet", needsConfirmation: false };
  }

  return { tag: "other", needsConfirmation: false };
}
