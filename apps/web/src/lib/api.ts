import {
  type MemoListResponse,
  memoListResponseSchema,
  type NotificationSettings,
  notificationSettingsSchema,
  type UpdateNotificationSettingsRequest,
  type User,
  updateNotificationSettingsRequestSchema,
  userSchema,
} from "@repo/shared";

function apiFetch(input: string, init?: RequestInit) {
  return fetch(input, { ...init, credentials: "include" });
}

export async function fetchMe(): Promise<User | null> {
  const res = await apiFetch("/api/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("failed to load session");
  return userSchema.parse(await res.json());
}

export async function logout(): Promise<void> {
  const res = await apiFetch("/api/auth/logout", { method: "POST" });
  if (!res.ok && res.status !== 204) throw new Error("logout failed");
}

export async function fetchMemos(): Promise<MemoListResponse> {
  const res = await apiFetch("/api/memos");
  if (!res.ok) throw new Error("failed to load memos");
  return memoListResponseSchema.parse(await res.json());
}

export async function fetchNotifications(): Promise<NotificationSettings> {
  const res = await apiFetch("/api/notifications");
  if (!res.ok) throw new Error("failed to load notifications");
  return notificationSettingsSchema.parse(await res.json());
}

export async function updateNotifications(
  input: UpdateNotificationSettingsRequest,
): Promise<NotificationSettings> {
  const res = await apiFetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateNotificationSettingsRequestSchema.parse(input)),
  });
  if (!res.ok) throw new Error("failed to update notifications");
  return notificationSettingsSchema.parse(await res.json());
}
