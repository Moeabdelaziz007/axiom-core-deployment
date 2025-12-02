CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'IDLE',
	`brain_model` text DEFAULT 'llama-3.1-70b',
	`trust_score` integer DEFAULT 100,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `synthetic_dreams` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`title` text,
	`metadata` text,
	`session_id` text,
	`user_id` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `system_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` text NOT NULL,
	`message` text NOT NULL,
	`agent_id` text,
	`metadata` text,
	`timestamp` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`wallet_address` text,
	`tier` text DEFAULT 'FREE'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
-- Indexes for synthetic_dreams table for efficient querying
CREATE INDEX `idx_synthetic_dreams_created_at_desc` ON `synthetic_dreams` (`created_at` DESC);
--> statement-breakpoint
CREATE INDEX `idx_synthetic_dreams_user_id` ON `synthetic_dreams` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_synthetic_dreams_user_created_at` ON `synthetic_dreams` (`user_id`, `created_at` DESC);