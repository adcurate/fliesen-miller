CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`inquiry_id` text NOT NULL,
	`object_key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attachments_inquiry_idx` ON `attachments` (`inquiry_id`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`project_type` text NOT NULL,
	`area` text NOT NULL,
	`multi_areas` text DEFAULT '[]' NOT NULL,
	`multi_areas_description` text DEFAULT '' NOT NULL,
	`size` text NOT NULL,
	`timeframe` text NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`source_page` text DEFAULT '/' NOT NULL,
	`attribution` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'neu' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`requester_hash` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`unsubscribe_token` text NOT NULL,
	`unsubscribed` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_idempotency_idx` ON `inquiries` (`idempotency_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_unsubscribe_idx` ON `inquiries` (`unsubscribe_token`);--> statement-breakpoint
CREATE INDEX `inquiries_created_idx` ON `inquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `inquiries_rate_idx` ON `inquiries` (`requester_hash`,`created_at`);