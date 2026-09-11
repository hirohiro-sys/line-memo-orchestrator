import type { LineFailReason } from "./classify";

const REPLY_URL = "https://api.line.me/v2/bot/message/reply";

export const REPLY_TEXT = {
  unsupported:
    "この形式は保存できません。テキスト（URL含む）か画像を送信してください。",
  unknown_tag: "使えるタグは #tweet #tech #other です。",
  empty_after_tag:
    "本文が空です。タグのあとにテキスト（URL含む）か画像を送ってください。",
  empty: "本文が空です。テキスト（URL含む）か画像を送ってください。",
  save_failed: "保存できませんでした。もう一度送ってください。",
} as const satisfies Record<LineFailReason, string>;

export function replyTextFor(reason: LineFailReason): string {
  return REPLY_TEXT[reason];
}

function contentUrl(messageId: string): string {
  return `https://api-data.line.me/v2/bot/message/${messageId}/content`;
}

function bearerHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function replyFailure(input: {
  accessToken: string;
  replyToken: string;
  reason: LineFailReason;
}): Promise<boolean> {
  try {
    const response = await fetch(REPLY_URL, {
      method: "POST",
      headers: {
        ...bearerHeaders(input.accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        replyToken: input.replyToken,
        messages: [{ type: "text", text: replyTextFor(input.reason) }],
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchMessageContent(input: {
  accessToken: string;
  messageId: string;
}): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  try {
    const response = await fetch(contentUrl(input.messageId), {
      headers: bearerHeaders(input.accessToken),
    });
    if (!response.ok) return null;
    return {
      body: await response.arrayBuffer(),
      contentType:
        response.headers.get("content-type") ?? "application/octet-stream",
    };
  } catch {
    return null;
  }
}
