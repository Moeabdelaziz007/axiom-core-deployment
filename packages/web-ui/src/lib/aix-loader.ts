/**
 * 🧠 AIX LOADER (v3.0)
 *
 * AI Persona eXchange (AIX) format loader implementation
 * Provides parsing and loading of AIX agent definitions from YAML content
 *
 * @author Axiom Core Team
 * @version 3.0.0
 */

import {
  AIXDocument,
  AIXVersion,
  AIXPersona,
  AIXCapability,
  AIXSkill,
  AIXKnowledge,
  AIXBehavior,
  AIXEthicalGuidelines,
  AIXNetworkGeometry,
  AIXMemory,
  AIXLatticeRole,
  AIXUpdateFrequency,
  AIXTOHAConfig
} from '../infra/research/AIXFormat';

// ============================================================================
// EXTENDED AIX TYPES FOR LOADER
// ============================================================================

/**
 * Mizan Constraints section for AIX v3.0
 */
export interface AIXMizanConstraints {
  enabled: boolean;
  max_concurrent_operations: number;
  memory_limit_mb: number;
  operation_timeout_ms: number;
  ethical_threshold: number; // 0.0 to 1.0
  safety_protocols: string[];
  constraint_rules: Array<{
    name: string;
    type: 'hard' | 'soft';
    condition: string;
    action: string;
    priority: number;
  }>;
}

/**
 * Solana Wallet section for AIX v3.0
 */
export interface AIXSolanaWallet {
  enabled: boolean;
  public_key?: string;
  wallet_type: 'phantom' | 'solflare' | 'ledger' | 'custom';
  network: 'mainnet-beta' | 'testnet' | 'devnet';
  permissions: string[];
  transaction_limits: {
    max_lamports: number;
    daily_limit: number;
    require_signature: boolean;
  };
  integration_config: {
    auto_connect: boolean;
    connection_timeout: number;
    retry_attempts: number;
  };
}

/**
 * Extended AIX Document with additional sections
 */
export interface AIXExtendedDocument extends AIXDocument {
  mizan_constraints?: AIXMizanConstraints;
  solana_wallet?: AIXSolanaWallet;
}

/**
 * AIX Loader Result
 */
export interface AIXLoaderResult {
  success: boolean;
  document?: AIXExtendedDocument;
  errors: string[];
  warnings: string[];
  metadata: {
    parsed_sections: string[];
    missing_sections: string[];
    validation_score: number; // 0-100
  };
}

// ============================================================================
// AIX LOADER IMPLEMENTATION
// ============================================================================

/**
 * AIX Format Loader
 */
export class AixLoader {
  private static readonly REQUIRED_SECTIONS = [
    'persona',
    'capabilities',
    'skills',
    'knowledge_bases',
    'behaviors',
    'ethical_guidelines'
  ];

  private static readonly OPTIONAL_SECTIONS = [
    'mizan_constraints',
    'solana_wallet',
    'network_geometry',
    'memory'
  ];

  /**
   * Load agent from YAML content
   */
  static async loadAgent(yamlContent: string): Promise<AIXLoaderResult> {
    const result: AIXLoaderResult = {
      success: false,
      errors: [],
      warnings: [],
      metadata: {
        parsed_sections: [],
        missing_sections: [],
        validation_score: 0
      }
    };

    try {
      // Parse YAML content
      const parsedContent = this.parseYAML(yamlContent);

      // Extract and validate sections
      const document = await this.extractAndValidateSections(parsedContent, result);

      if (document) {
        result.document = document;
        result.success = result.errors.length === 0;
        result.metadata.validation_score = this.calculateValidationScore(result);
      }
    } catch (error) {
      result.errors.push(`Failed to load agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Simple YAML parser (since no YAML library is available)
   */
  private static parseYAML(yamlContent: string): Record<string, any> {
    const lines = yamlContent.split('\n');
    const result: Record<string, any> = {};
    let currentSection: string = '';
    let currentIndent = 0;
    let sectionStack: Array<{ name: string; indent: number; data: any }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Calculate indentation
      const indent = line.length - line.trimStart().length;

      // Handle section headers
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const sectionName = trimmed.slice(1, -1);

        // Pop sections with higher indentation
        while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].indent >= indent) {
          const popped = sectionStack.pop()!;
          if (sectionStack.length === 0) {
            result[popped.name] = popped.data;
          } else {
            sectionStack[sectionStack.length - 1].data[popped.name] = popped.data;
          }
        }

        // Start new section
        sectionStack.push({
          name: sectionName,
          indent,
          data: {}
        });

        currentSection = sectionName;
        currentIndent = indent;
        continue;
      }

      // Handle key-value pairs
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();

        // Parse value
        let parsedValue: any = value;

        // Handle boolean values
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        // Handle numbers
        else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value);
        // Handle quoted strings
        else if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
          parsedValue = value.slice(1, -1);
        }
        // Handle arrays (simple case)
        else if (value.startsWith('[') && value.endsWith(']')) {
          try {
            parsedValue = JSON.parse(value);
          } catch {
            parsedValue = value;
          }
        }

        // Add to current section
        if (sectionStack.length > 0) {
          const current = sectionStack[sectionStack.length - 1];
          current.data[key] = parsedValue;
        } else {
          result[key] = parsedValue;
        }
      }
    }

    // Flush remaining sections
    while (sectionStack.length > 0) {
      const popped = sectionStack.pop()!;
      if (sectionStack.length === 0) {
        result[popped.name] = popped.data;
      } else {
        sectionStack[sectionStack.length - 1].data[popped.name] = popped.data;
      }
    }

    return result;
  }

  /**
   * Extract and validate sections from parsed content
   */
  private static async extractAndValidateSections(
    parsedContent: Record<string, any>,
    result: AIXLoaderResult
  ): Promise<AIXExtendedDocument | null> {
    const document: Partial<AIXExtendedDocument> = {};
    const parsedSections: string[] = [];
    const missingSections: string[] = [];

    // Extract required sections
    for (const section of this.REQUIRED_SECTIONS) {
      if (parsedContent[section]) {
        try {
          document[section as keyof AIXExtendedDocument] = this.parseSection(section, parsedContent[section]);
          parsedSections.push(section);
        } catch (error) {
          result.errors.push(`Failed to parse ${section}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        missingSections.push(section);
        result.errors.push(`Missing required section: ${section}`);
      }
    }

    // Extract optional sections
    for (const section of this.OPTIONAL_SECTIONS) {
      if (parsedContent[section]) {
        try {
          document[section as keyof AIXExtendedDocument] = this.parseSection(section, parsedContent[section]);
          parsedSections.push(section);
        } catch (error) {
          result.warnings.push(`Failed to parse optional section ${section}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Special handling for MIZAN_CONSTRAINTS and SOLANA_WALLET
    if (parsedContent['MIZAN_CONSTRAINTS']) {
      try {
        document.mizan_constraints = this.parseMizanConstraints(parsedContent['MIZAN_CONSTRAINTS']);
        parsedSections.push('MIZAN_CONSTRAINTS');
      } catch (error) {
        result.errors.push(`Failed to parse MIZAN_CONSTRAINTS: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (parsedContent['SOLANA_WALLET']) {
      try {
        document.solana_wallet = this.parseSolanaWallet(parsedContent['SOLANA_WALLET']);
        parsedSections.push('SOLANA_WALLET');
      } catch (error) {
        result.errors.push(`Failed to parse SOLANA_WALLET: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update metadata
    result.metadata.parsed_sections = parsedSections;
    result.metadata.missing_sections = missingSections;

    // Validate document structure
    if (this.validateDocument(document, result)) {
      return document as AIXExtendedDocument;
    }

    return null;
  }

  /**
   * Parse individual sections
   */
  private static parseSection(sectionName: string, sectionData: any): any {
    switch (sectionName) {
      case 'persona':
        return this.parsePersona(sectionData);
      case 'capabilities':
        return this.parseCapabilities(sectionData);
      case 'skills':
        return this.parseSkills(sectionData);
      case 'knowledge_bases':
        return this.parseKnowledgeBases(sectionData);
      case 'behaviors':
        return this.parseBehaviors(sectionData);
      case 'ethical_guidelines':
        return this.parseEthicalGuidelines(sectionData);
      case 'network_geometry':
        return this.parseNetworkGeometry(sectionData);
      case 'memory':
        return this.parseMemory(sectionData);
      default:
        return sectionData;
    }
  }

  /**
   * Parse persona section
   */
  private static parsePersona(data: any): AIXPersona {
    if (!data.id || !data.name || !data.description) {
      throw new Error('Persona requires id, name, and description');
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      version: data.version || { major: 3, minor: 0, patch: 0 },
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      author: data.author || 'Unknown',
      license: data.license || 'MIT',
      tags: Array.isArray(data.tags) ? data.tags : [],
      category: data.category || 'general',
      subcategory: data.subcategory
    };
  }

  /**
   * Parse capabilities section
   */
  private static parseCapabilities(data: any): AIXCapability[] {
    if (!Array.isArray(data)) {
      throw new Error('Capabilities must be an array');
    }

    return data.map((cap, index) => {
      if (!cap.id || !cap.name || !cap.description || !cap.type || !cap.category) {
        throw new Error(`Capability at index ${index} missing required fields`);
      }

      return {
        id: cap.id,
        name: cap.name,
        description: cap.description,
        type: cap.type,
        category: cap.category,
        subcategory: cap.subcategory,
        parameters: cap.parameters || {},
        dependencies: Array.isArray(cap.dependencies) ? cap.dependencies : [],
        conflicts: Array.isArray(cap.conflicts) ? cap.conflicts : [],
        version: cap.version || { major: 1, minor: 0, patch: 0 }
      };
    });
  }

  /**
   * Parse skills section
   */
  private static parseSkills(data: any): AIXSkill[] {
    if (!Array.isArray(data)) {
      throw new Error('Skills must be an array');
    }

    return data.map((skill, index) => {
      if (!skill.id || !skill.name || !skill.description || !skill.capability_id) {
        throw new Error(`Skill at index ${index} missing required fields`);
      }

      return {
        id: skill.id,
        name: skill.name,
        description: skill.description,
        capability_id: skill.capability_id,
        implementation: skill.implementation || { type: 'function' },
        examples: Array.isArray(skill.examples) ? skill.examples : [],
        tests: Array.isArray(skill.tests) ? skill.tests : [],
        performance_metrics: skill.performance_metrics
      };
    });
  }

  /**
   * Parse knowledge bases section
   */
  private static parseKnowledgeBases(data: any): AIXKnowledge[] {
    if (!Array.isArray(data)) {
      throw new Error('Knowledge bases must be an array');
    }

    return data.map((kb, index) => {
      if (!kb.id || !kb.name || !kb.description || !kb.type || !kb.format) {
        throw new Error(`Knowledge base at index ${index} missing required fields`);
      }

      return {
        id: kb.id,
        name: kb.name,
        description: kb.description,
        type: kb.type,
        format: kb.format,
        size: kb.size || 0,
        source: kb.source || 'unknown',
        license: kb.license || 'unknown',
        quality_score: kb.quality_score || 0.5,
        last_updated: kb.last_updated || new Date().toISOString(),
        metadata: kb.metadata || {}
      };
    });
  }

  /**
   * Parse behaviors section
   */
  private static parseBehaviors(data: any): AIXBehavior[] {
    if (!Array.isArray(data)) {
      throw new Error('Behaviors must be an array');
    }

    return data.map((behavior, index) => {
      if (!behavior.id || !behavior.name || !behavior.description || !behavior.type) {
        throw new Error(`Behavior at index ${index} missing required fields`);
      }

      return {
        id: behavior.id,
        name: behavior.name,
        description: behavior.description,
        type: behavior.type,
        triggers: Array.isArray(behavior.triggers) ? behavior.triggers : [],
        actions: Array.isArray(behavior.actions) ? behavior.actions : [],
        learning_enabled: behavior.learning_enabled !== false,
        adaptation_rate: behavior.adaptation_rate
      };
    });
  }

  /**
   * Parse ethical guidelines section
   */
  private static parseEthicalGuidelines(data: any): AIXEthicalGuidelines {
    if (!data.framework) {
      throw new Error('Ethical guidelines require framework');
    }

    return {
      version: data.version || { major: 1, minor: 0, patch: 0 },
      framework: data.framework,
      principles: Array.isArray(data.principles) ? data.principles : [],
      constraints: Array.isArray(data.constraints) ? data.constraints : [],
      audit_trail: data.audit_trail !== false,
      compliance_level: data.compliance_level || 'standard'
    };
  }

  /**
   * Parse network geometry section
   */
  private static parseNetworkGeometry(data: any): AIXNetworkGeometry {
    if (!data.lattice_role || !data.update_frequency) {
      throw new Error('Network geometry requires lattice_role and update_frequency');
    }

    return {
      lattice_role: data.lattice_role as AIXLatticeRole,
      swarm_neighbors: data.swarm_neighbors || 3,
      toha_config: data.toha_config || {
        sensitivity: 0.7,
        check_logic_loops: true
      },
      update_frequency: data.update_frequency as AIXUpdateFrequency,
      topology_coordinates: data.topology_coordinates,
      connection_strength: data.connection_strength
    };
  }

  /**
   * Parse memory section
   */
  private static parseMemory(data: any): AIXMemory {
    return {
      short_term: {
        entries: Array.isArray(data.short_term?.entries) ? data.short_term.entries : [],
        max_entries: data.short_term?.max_entries || 100
      },
      long_term: {
        entries: Array.isArray(data.long_term?.entries) ? data.long_term.entries : [],
        max_entries: data.long_term?.max_entries || 1000
      },
      episodic: {
        entries: Array.isArray(data.episodic?.entries) ? data.episodic.entries : [],
        max_entries: data.episodic?.max_entries || 500
      },
      semantic: {
        entries: Array.isArray(data.semantic?.entries) ? data.semantic.entries : [],
        max_entries: data.semantic?.max_entries || 200
      },
      memory_types: Array.isArray(data.memory_types) ? data.memory_types : [],
      consolidation_enabled: data.consolidation_enabled !== false,
      last_consolidation: data.last_consolidation || new Date().toISOString()
    };
  }

  /**
   * Parse MIZAN_CONSTRAINTS section
   */
  private static parseMizanConstraints(data: any): AIXMizanConstraints {
    return {
      enabled: data.enabled !== false,
      max_concurrent_operations: data.max_concurrent_operations || 10,
      memory_limit_mb: data.memory_limit_mb || 512,
      operation_timeout_ms: data.operation_timeout_ms || 30000,
      ethical_threshold: data.ethical_threshold || 0.8,
      safety_protocols: Array.isArray(data.safety_protocols) ? data.safety_protocols : [],
      constraint_rules: Array.isArray(data.constraint_rules) ? data.constraint_rules : []
    };
  }

  /**
   * Parse SOLANA_WALLET section
   */
  private static parseSolanaWallet(data: any): AIXSolanaWallet {
    return {
      enabled: data.enabled !== false,
      public_key: data.public_key,
      wallet_type: data.wallet_type || 'phantom',
      network: data.network || 'devnet',
      permissions: Array.isArray(data.permissions) ? data.permissions : [],
      transaction_limits: {
        max_lamports: data.transaction_limits?.max_lamports || 1000000,
        daily_limit: data.transaction_limits?.daily_limit || 10000000,
        require_signature: data.transaction_limits?.require_signature !== false
      },
      integration_config: {
        auto_connect: data.integration_config?.auto_connect !== false,
        connection_timeout: data.integration_config?.connection_timeout || 5000,
        retry_attempts: data.integration_config?.retry_attempts || 3
      }
    };
  }

  /**
   * Validate document structure
   */
  private static validateDocument(document: Partial<AIXExtendedDocument>, result: AIXLoaderResult): boolean {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!document.persona?.id) {
      errors.push('Persona ID is required');
    }

    if (!document.capabilities || document.capabilities.length === 0) {
      warnings.push('No capabilities defined');
    }

    if (!document.skills || document.skills.length === 0) {
      warnings.push('No skills defined');
    }

    // Validate cross-references
    if (document.capabilities && document.skills) {
      const capabilityIds = document.capabilities.map(c => c.id);
      const skillCapabilityIds = document.skills.map(s => s.capability_id);

      for (const skillCapId of skillCapabilityIds) {
        if (!capabilityIds.includes(skillCapId)) {
          warnings.push(`Skill references non-existent capability: ${skillCapId}`);
        }
      }
    }

    // Add to result
    result.errors.push(...errors);
    result.warnings.push(...warnings);

    return errors.length === 0;
  }

  /**
   * Calculate validation score
   */
  private static calculateValidationScore(result: AIXLoaderResult): number {
    let score = 100;

    // Deduct points for errors
    score -= result.errors.length * 20;

    // Deduct points for warnings
    score -= result.warnings.length * 5;

    // Deduct points for missing sections
    score -= result.metadata.missing_sections.length * 15;

    return Math.max(0, score);
  }
}

export default AixLoader;