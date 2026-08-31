import { http, HttpResponse } from "msw";
import {
  createMemoRequestSchema,
  healthResponseSchema,
  loginRequestSchema,
  memoListResponseSchema,
  memoSchema,
  notificationSettingsSchema,
  updateNotificationSettingsRequestSchema,
  userSchema,
  type Memo,
  type NotificationSettings,
  type User,
} from "@repo/shared";
import {
  DEFAULT_NOTIFICATIONS,
  DEMO_LOGIN,
  INITIAL_MEMOS,
  MOCK_USER,
} from "./data";

let session: User | null = null;
let memos: Memo[] = [...INITIAL_MEMOS];
let notifications: NotificationSettings = { ...DEFAULT_NOTIFICATIONS };

function unauthorized() {
  return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
}

export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json(healthResponseSchema.parse({ status: "ok" }));
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const body = loginRequestSchema.parse(await request.json());
    if (body.email === DEMO_LOGIN.email && body.password === DEMO_LOGIN.password) {
      session = MOCK_USER;
      return HttpResponse.json(userSchema.parse(session));
    }
    return HttpResponse.json(
      { message: "invalid credentials" },
      { status: 401 },
    );
  }),

  http.post("/api/auth/logout", () => {
    session = null;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/me", () => {
    if (!session) return unauthorized();
    return HttpResponse.json(userSchema.parse(session));
  }),

  http.get("/api/memos", () => {
    if (!session) return unauthorized();
    return HttpResponse.json(memoListResponseSchema.parse({ items: memos }));
  }),

  http.post("/api/memos", async ({ request }) => {
    if (!session) return unauthorized();
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
    if (!session) return unauthorized();
    const id = String(params.id);
    const exists = memos.some((memo) => memo.id === id);
    if (!exists) {
      return HttpResponse.json({ message: "not found" }, { status: 404 });
    }
    memos = memos.filter((memo) => memo.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/notifications", () => {
    if (!session) return unauthorized();
    return HttpResponse.json(notificationSettingsSchema.parse(notifications));
  }),

  http.patch("/api/notifications", async ({ request }) => {
    if (!session) return unauthorized();
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
