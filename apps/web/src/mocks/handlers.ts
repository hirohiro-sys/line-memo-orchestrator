import { http, HttpResponse } from "msw";
import {
  healthResponseSchema,
  memoListResponseSchema,
} from "@repo/shared";

export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json(healthResponseSchema.parse({ status: "ok" }));
  }),
  http.get("/api/memos", () => {
    return HttpResponse.json(
      memoListResponseSchema.parse({
        items: [
          {
            id: "1",
            title: "最初のメモ",
            body: "MSW のスタブです",
          },
        ],
      }),
    );
  }),
];
