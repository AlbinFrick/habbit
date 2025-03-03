CREATE TABLE `habbit_push_subscription` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text(255) NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `habbit_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `push_sub_user_id_idx` ON `habbit_push_subscription` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `habbit_push_subscription_endpoint_unique` ON `habbit_push_subscription` (`endpoint`);