import {
  loginRequestSchema,
  memoListResponseSchema,
  notificationSettingsSchema,
  userSchema,
  type MemoListResponse,
  type NotificationSettings,
  type User,
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
