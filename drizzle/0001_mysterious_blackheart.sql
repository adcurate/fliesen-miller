ALTER TABLE `inquiries` ADD `notification_status` text DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `notification_sent_at` text DEFAULT '' NOT NULL;
