ALTER TABLE `axiom_identities` ADD `language_preference` text DEFAULT 'ar';--> statement-breakpoint
ALTER TABLE `axiom_identities` ADD `region` text DEFAULT 'egypt';--> statement-breakpoint
ALTER TABLE `axiom_identities` ADD `cultural_context` text;--> statement-breakpoint
ALTER TABLE `axiom_identities` ADD `sovereignty_level` text DEFAULT 'basic';