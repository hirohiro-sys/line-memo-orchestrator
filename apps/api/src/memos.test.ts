import { describe, expect, it } from "vitest";
import { toMemoResponse } from "./memos";

const base = {
  id: "memo_1",
  tag: "tweet",
  content: "眠い",
  url: null,
  mediaType: "text",
  source: "line",
  createdAt: "2026-09-11T00:00:00.000Z",
};

describe("toMemoResponse", () => {
  it("omits a null url so the web schema can parse the list", () => {
    expect(toMemoResponse(base)).toEqual({
      id: "memo_1",
      tag: "tweet",
      content: "眠い",
      mediaType: "text",
      source: "line",
      createdAt: "2026-09-11T00:00:00.000Z",
    });
  });

  it("adds a relative image path and does not read thumbnailUrl from the DB", () => {
    expect(
      toMemoResponse({
        ...base,
        tag: "other",
        content: "（画像）",
        mediaType: "image",
      }),
    ).toEqual({
      id: "memo_1",
      tag: "other",
      content: "（画像）",
      mediaType: "image",
      source: "line",
      createdAt: "2026-09-11T00:00:00.000Z",
      thumbnailUrl: "/api/memos/memo_1/image",
    });
  });

  it("keeps a present url and does not add thumbnailUrl for url memos", () => {
    expect(
      toMemoResponse({
        ...base,
        tag: "tech",
        content: "https://example.com",
        url: "https://example.com",
        mediaType: "url",
      }),
    ).toEqual({
      id: "memo_1",
      tag: "tech",
      content: "https://example.com",
      url: "https://example.com",
      mediaType: "url",
      source: "line",
      createdAt: "2026-09-11T00:00:00.000Z",
    });
  });
});
