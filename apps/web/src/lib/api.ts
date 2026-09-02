import {
  type CreateMemoRequest,
  createMemoRequestSchema,
  loginRequestSchema,
  type Memo,
  type MemoListResponse,
  memoListResponseSchema,
  memoSchema,
  type NotificationSettings,
  notificationSettingsSchema,
  type UpdateNotificationSettingsRequest,
  type User,
  updateNotificationSettingsRequestSchema,
  userSchema,
} from "@repo/shared";

export async function fetchMe(): Promise<User | null> {
  const res = await fetch("/api/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("failed to load session");
  return userSchema.parse(await res.json());
}

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginRequestSchema.parse({ email, password })),
  });
  if (!res.ok) throw new Error("invalid credentials");
  return userSchema.parse(await res.json());
}

export async function logout(): Promise<void> {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok && res.status !== 204) throw new Error("logout failed");
}

export async function fetchMemos(): Promise<MemoListResponse> {
  const res = await fetch("/api/memos");
  if (!res.ok) throw new Error("failed to load memos");
  return memoListResponseSchema.parse(await res.json());
}

export async function fetchNotifications(): Promise<NotificationSettings> {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("failed to load notifications");
  return notificationSettingsSchema.parse(await res.json());
}

export async function createMemo(input: CreateMemoRequest): Promise<Memo> {
  const res = await fetch("/api/memos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createMemoRequestSchema.parse(input)),
  });
  if (!res.ok) throw new Error("failed to create memo");
  return memoSchema.parse(await res.json());
}

export async function deleteMemo(id: string): Promise<void> {
  const res = await fetch(`/api/memos/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("failed to delete memo");
}

export async function updateNotifications(
  input: UpdateNotificationSettingsRequest,
): Promise<NotificationSettings> {
  const res = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateNotificationSettingsRequestSchema.parse(input)),
  });
  if (!res.ok) throw new Error("failed to update notifications");
  return notificationSettingsSchema.parse(await res.json());
}
