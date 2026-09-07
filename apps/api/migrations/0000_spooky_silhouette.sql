CREATE TABLE `memos` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`content` text NOT NULL,
	`url` text,
	`image_key` text,
	`source` text NOT NULL,
	`media_type` text NOT NULL,
	`line_message_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `memos_line_message_id_unique` ON `memos` (`line_message_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);--> statement-breakpoint
CREATE TABLE `tech_weekly_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`enabled` integer NOT NULL,
	`weekday` integer NOT NULL,
	`time` text NOT NULL,
	`last_sent_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tech_weekly_settings_user_id_unique` ON `tech_weekly_settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`line_user_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_line_user_id_unique` ON `users` (`line_user_id`);--> statement-breakpoint
INSERT INTO `tags` (`id`, `slug`, `name`) VALUES
	('tag_tweet', 'tweet', 'Tweet'),
	('tag_tech', 'tech', 'Tech'),
	('tag_other', 'other', 'Other');