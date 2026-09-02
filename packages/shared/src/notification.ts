import { z } from "zod";

export const notificationSettingsSchema = z.object({
  techWeeklyEnabled: z.boolean(),
  techWeeklyDay: z.number().int().min(0).max(6),
  techWeeklyTime: z.string(),
});

export const updateNotificationSettingsRequestSchema =
  notificationSettingsSchema.partial();

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type UpdateNotificationSettingsRequest = z.infer<
  typeof updateNotificationSettingsRequestSchema
>;
