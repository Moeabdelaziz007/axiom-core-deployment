-- Indexes for MENA Localization Support
-- Performance optimization indexes for the new MENA localization fields

-- Index for language preference queries
CREATE INDEX `idx_axiom_identities_language_preference` ON `axiom_identities` (`language_preference`);

-- Index for region queries
CREATE INDEX `idx_axiom_identities_region` ON `axiom_identities` (`region`);

-- Index for sovereignty level queries
CREATE INDEX `idx_axiom_identities_sovereignty_level` ON `axiom_identities` (`sovereignty_level`);

-- Composite index for region and language preference (common query pattern)
CREATE INDEX `idx_axiom_identities_region_language` ON `axiom_identities` (`region`, `language_preference`);