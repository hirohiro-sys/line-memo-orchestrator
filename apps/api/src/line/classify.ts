import type { MemoMediaType, MemoTag } from "@repo/shared";

export const IMAGE_CONTENT = "（画像）";

export type LineFailReason =
  | "unsupported"
  | "unknown_tag"
  | "empty_after_tag"
  | "empty"
  | "save_failed";

export type ClassifySuccess = {
  save: true;
  tag: MemoTag;
  mediaType: MemoMediaType;
  content: string;
};

export type ClassifyFailure = {
  save: false;
  reason: LineFailReason;
};

export type ClassifyResult = ClassifySuccess | ClassifyFailure;

const URL_PATTERN = /^https?:\/\/\S+$/i;
const LEADING_PERMITTED_TAG = /^(?:[#＃])(tweet|tech|other)(?![0-9A-Za-z])/i;
const LEADING_HASH = /^[#＃]/;

function detectMediaType(text: string): Exclude<MemoMediaType, "image"> {
  return URL_PATTERN.test(text) ? "url" : "text";
}

function leadingPermittedTag(
  text: string,
): { tag: MemoTag; rest: string } | null {
  const match = LEADING_PERMITTED_TAG.exec(text);
  if (!match?.[1]) return null;
  return {
    tag: match[1].toLowerCase() as MemoTag,
    rest: text.slice(match[0].length).trim(),
  };
}

export function classify(input: {
  text?: string | null;
  isImage?: boolean;
}): ClassifyResult {
  if (input.isImage) {
    return {
      save: true,
      tag: "other",
      mediaType: "image",
      content: IMAGE_CONTENT,
    };
  }

  const text = input.text?.trim() ?? "";
  if (text.length === 0) {
    return { save: false, reason: "empty" };
  }

  const leading = leadingPermittedTag(text);
  if (leading) {
    if (leadingPermittedTag(leading.rest)) {
      return { save: false, reason: "unknown_tag" };
    }
    if (leading.rest.length === 0) {
      return { save: false, reason: "empty_after_tag" };
    }
    return {
      save: true,
      tag: leading.tag,
      mediaType: detectMediaType(leading.rest),
      content: leading.rest,
    };
  }

  if (LEADING_HASH.test(text)) {
    return { save: false, reason: "unknown_tag" };
  }

  const mediaType = detectMediaType(text);
  return {
    save: true,
    tag: mediaType === "url" ? "tech" : "tweet",
    mediaType,
    content: text,
  };
}
