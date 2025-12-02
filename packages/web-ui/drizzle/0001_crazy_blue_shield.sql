CREATE TABLE `axiom_identities` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_name` text NOT NULL,
	`wallet_public_key` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`reputation` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `axiom_identities_wallet_public_key_unique` ON `axiom_identities` (`wallet_public_key`);
--> statement-breakpoint
CREATE INDEX `axiom_identities_agent_name_idx` ON `axiom_identities` (`agent_name`);
--> statement-breakpoint
CREATE INDEX `axiom_identities_status_idx` ON `axiom_identities` (`status`);
--> statement-breakpoint
CREATE INDEX `axiom_identities_reputation_idx` ON `axiom_identities` (`reputation`);
