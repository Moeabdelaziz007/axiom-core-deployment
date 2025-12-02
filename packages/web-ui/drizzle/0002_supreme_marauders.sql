CREATE TABLE `agent_blueprints` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`description` text,
	`price_monthly_usd` integer NOT NULL,
	`capabilities` text,
	`image_url` text,
	`model_provider` text NOT NULL,
	`model_name` text NOT NULL,
	`temperature` real DEFAULT 0.5,
	`tools` text,
	`system_prompt` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_wallet` text NOT NULL,
	`blueprint_id` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`tx_hash` text,
	`amount_paid` integer NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`blueprint_id`) REFERENCES `agent_blueprints`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_tx_hash_unique` ON `subscriptions` (`tx_hash`);--> statement-breakpoint
ALTER TABLE `axiom_identities` ADD `dna_profile` text;--> statement-breakpoint
ALTER TABLE `axiom_identities` ADD `evolution_stage` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `axiom_identities` ADD `created_at` integer DEFAULT (CURRENT_TIMESTAMP);--> statement-breakpoint
ALTER TABLE `axiom_identities` ADD `updated_at` integer DEFAULT (CURRENT_TIMESTAMP);