import {
  type NotificationSettings,
  notificationSettingsSchema,
  updateNotificationSettingsRequestSchema,
} from "@repo/shared";
import { HttpResponse, http } from "msw";
import { DEFAULT_NOTIFICATIONS } from "./data";

let notifications: NotificationSettings = { ...DEFAULT_NOTIFICATIONS };

export const handlers = [
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
