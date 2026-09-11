import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMessageContent, replyFailure, replyTextFor } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("replyTextFor", () => {
  it("maps each fail reason to the fixed LINE reply", () => {
    expect(replyTextFor("unsupported")).toBe(
      "この形式は保存できません。テキスト（URL含む）か画像を送信してください。",
    );
    expect(replyTextFor("unknown_tag")).toBe(
      "使えるタグは #tweet #tech #other です。",
    );
    expect(replyTextFor("empty_after_tag")).toBe(
      "本文が空です。タグのあとにテキスト（URL含む）か画像を送ってください。",
    );
    expect(replyTextFor("empty")).toBe(
      "本文が空です。テキスト（URL含む）か画像を送ってください。",
    );
    expect(replyTextFor("save_failed")).toBe(
      "保存できませんでした。もう一度送ってください。",
    );
  });
});

describe("replyFailure", () => {
  it("posts a text message to the Reply API", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      replyFailure({
        accessToken: "token",
        replyToken: "reply-1",
        reason: "unknown_tag",
      }),
    ).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.line.me/v2/bot/message/reply",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          replyToken: "reply-1",
          messages: [
            {
              type: "text",
              text: "使えるタグは #tweet #tech #other です。",
            },
          ],
        }),
      },
    );
  });

  it("returns false when Reply API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 400 })),
    );

    await expect(
      replyFailure({
        accessToken: "token",
        replyToken: "reply-1",
        reason: "save_failed",
      }),
    ).resolves.toBe(false);
  });
});

describe("fetchMessageContent", () => {
  it("gets the binary from the Content API", async () => {
    const body = new Uint8Array([1, 2, 3]).buffer;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(body, {
        status: 200,
        headers: { "content-type": "image/jpeg" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const content = await fetchMessageContent({
      accessToken: "token",
      messageId: "mid-1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api-data.line.me/v2/bot/message/mid-1/content",
      { headers: { Authorization: "Bearer token" } },
    );
    expect(content?.contentType).toBe("image/jpeg");
    expect(content && [...new Uint8Array(content.body)]).toEqual([1, 2, 3]);
  });

  it("returns null when Content API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );

    await expect(
      fetchMessageContent({ accessToken: "token", messageId: "mid-1" }),
    ).resolves.toBeNull();
  });
});
