import {
  createMemoRequestSchema,
  type Memo,
  memoListResponseSchema,
  memoSchema,
  type NotificationSettings,
  notificationSettingsSchema,
  updateNotificationSettingsRequestSchema,
} from "@repo/shared";
import { HttpResponse, http } from "msw";
import { DEFAULT_NOTIFICATIONS, INITIAL_MEMOS } from "./data";

let memos: Memo[] = [...INITIAL_MEMOS];
let notifications: NotificationSettings = { ...DEFAULT_NOTIFICATIONS };

export const handlers = [
  http.get("/api/memos", () => {
    return HttpResponse.json(memoListResponseSchema.parse({ items: memos }));
  }),

  http.post("/api/memos", async ({ request }) => {
    const body = createMemoRequestSchema.parse(await request.json());
    const memo = memoSchema.parse({
      ...body,
      id: `m${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    memos = [memo, ...memos];
    return HttpResponse.json(memo, { status: 201 });
  }),

  http.delete("/api/memos/:id", ({ params }) => {
    const id = String(params.id);
    const exists = memos.some((memo) => memo.id === id);
    if (!exists) {
      return HttpResponse.json({ message: "not found" }, { status: 404 });
    }
    memos = memos.filter((memo) => memo.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/notifications", () => {
    return HttpResponse.json(notificationSettingsSchema.parse(notifications));
  }),

  http.patch("/api/notifications", async ({ request }) => {
    const body = updateNotificationSettingsRequestSchema.parse(
      await request.json(),
    );
    notifications = notificationSettingsSchema.parse({
      ...notifications,
      ...body,
    });
    return HttpResponse.json(notifications);
  }),
];
