/**
 * 🧠 AIX FORMAT IMPLEMENTATION
 *
 * AI Persona eXchange (AIX) format implementation based on anthropics/skills repository
 * Provides standardized formatting for AI personas, skills, and capabilities
 *
 * @author Axiom Core Team
 * @version 3.0.0
 */

// ============================================================================
// CORE AIX FORMAT TYPES
// ============================================================================

/**
 * AIX Format Version
 */
export interface AIXVersion {
    major: number;
    minor: number;
    patch: number;
    preRelease?: string;
    build?: string;
}

/**
 * AIX Persona Identity
 */
export interface AIXPersona {
    id: string;
    name: string;
    description: string;
    version: AIXVersion;
    created_at: string;
    updated_at: string;
    author: string;
    license: string;
    tags: string[];
    category: string;
    subcategory?: string;
}

/**
 * AIX Capability Definition
 */
export interface AIXCapability {
    id: string;
    name: string;
    description: string;
    type: 'skill' | 'tool' | 'knowledge' | 'behavior' | 'trait' | 'superpower';
    category: string;
    subcategory?: string;
    parameters?: Record<string, any>;
    dependencies?: string[];
    conflicts?: string[];
    version: AIXVersion;
}

/**
 * AIX Skill Implementation
 */
export interface AIXSkill {
    id: string;
    name: string;
    description: string;
    capability_id: string;
    implementation: {
        type: 'function' | 'class' | 'module' | 'api' | 'prompt';
        code?: string;
        endpoint?: string;
        prompt?: string;
        parameters?: Record<string, any>;
    };
    examples: Array<{
        input: any;
        output: any;
        description?: string;
    }>;
    tests: Array<{
        name: string;
        input: any;
        expected_output: any;
        description?: string;
    }>;
    performance_metrics?: {
        accuracy?: number;
        speed?: number;
        resource_usage?: number;
        reliability?: number;
    };
}

/**
 * AIX Knowledge Base
 */
export interface AIXKnowledge {
    id: string;
    name: string;
    description: string;
    type: 'dataset' | 'model' | 'text' | 'code' | 'media' | 'hybrid';
    format: string;
    size: number;
    source: string;
    license: string;
    quality_score: number;
    last_updated: string;
    metadata?: Record<string, any>;
}

/**
 * AIX Behavioral Pattern
 */
export interface AIXBehavior {
    id: string;
    name: string;
    description: string;
    type: 'reactive' | 'proactive' | 'adaptive' | 'learned' | 'programmed';
    triggers: Array<{
        condition: string;
        threshold?: number;
        parameters?: Record<string, any>;
    }>;
    actions: Array<{
        type: string;
        parameters?: Record<string, any>;
        priority?: number;
    }>;
    learning_enabled: boolean;
    adaptation_rate?: number;
}

/**
 * AIX Ethical Guidelines
 */
export interface AIXEthicalGuidelines {
    version: AIXVersion;
    framework: string;
    principles: Array<{
        name: string;
        description: string;
        weight: number;
        constraints?: string[];
    }>;
    constraints: Array<{
        type: 'hard' | 'soft';
        description: string;
        enforcement: 'automatic' | 'manual' | 'hybrid';
    }>;
    audit_trail: boolean;
    compliance_level: 'basic' | 'standard' | 'enhanced' | 'enterprise';
}

// ============================================================================
// NETWORK GEOMETRY AND MEMORY INTERFACES (AIX v3.0)
// ============================================================================

/**
 * Lattice role enum for agent positioning in Toric Lattice
 */
export enum AIXLatticeRole {
    STABILIZER = 'STABILIZER',
    OBSERVER = 'OBSERVER',
    COMPUTE_HEAD = 'COMPUTE_HEAD'
}

/**
 * Update frequency enum for lattice ping intervals
 */
export enum AIXUpdateFrequency {
    REALTIME = 'REALTIME',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
    ON_DEMAND = 'ON_DEMAND'
}

/**
 * TOHA (Topological Hallucination Detector) configuration
 */
export interface AIXTOHAConfig {
    sensitivity: number; // 0.0 to 1.0
    check_logic_loops: boolean;
    threshold_adjustment?: number;
    detection_window?: number; // in milliseconds
}

/**
 * Network geometry configuration for Swarm Geometry integration
 */
export interface AIXNetworkGeometry {
    lattice_role: AIXLatticeRole;
    swarm_neighbors: number;
    toha_config: AIXTOHAConfig;
    update_frequency: AIXUpdateFrequency;
    topology_coordinates?: {
        x: number;
        y: number;
        z?: number;
    };
    connection_strength?: number; // 0.0 to 1.0
}

/**
 * Memory type interface for agent memory storage
 */
export interface AIXMemoryType {
    type: 'short_term' | 'long_term' | 'episodic' | 'semantic';
    capacity: number; // in MB
    retention_policy: string;
    compression_enabled: boolean;
}

/**
 * Agent memory interface for storing different types of memories
 */
export interface AIXMemory {
    short_term: {
        entries: Array<{
            id: string;
            content: any;
            timestamp: string;
            priority: number;
            expires_at?: string;
        }>;
        max_entries: number;
    };
    long_term: {
        entries: Array<{
            id: string;
            content: any;
            timestamp: string;
            access_count: number;
            importance_score: number;
        }>;
        max_entries: number;
    };
    episodic: {
        entries: Array<{
            id: string;
            event: string;
            context: any;
            timestamp: string;
            emotional_tag?: string;
        }>;
        max_entries: number;
    };
    semantic: {
        entries: Array<{
            id: string;
            concept: string;
            relationships: Array<{
                target: string;
                type: string;
                strength: number;
            }>;
            confidence: number;
        }>;
        max_entries: number;
    };
    memory_types: AIXMemoryType[];
    consolidation_enabled: boolean;
    last_consolidation: string;
}

/**
 * Complete AIX Format Document (v3.0)
 */
export interface AIXDocument {
    format: 'AIX';
    version: AIXVersion;
    persona: AIXPersona;
    capabilities: AIXCapability[];
    skills: AIXSkill[];
    knowledge_bases: AIXKnowledge[];
    behaviors: AIXBehavior[];
    ethical_guidelines: AIXEthicalGuidelines;
    // v3.0 additions for Topology System integration
    network_geometry?: AIXNetworkGeometry; // Optional for backward compatibility
    memory?: AIXMemory; // Optional for backward compatibility
    metadata: {
        total_capabilities: number;
        total_skills: number;
        total_knowledge_bases: number;
        total_behaviors: number;
        compatibility_matrix: Record<string, string[]>;
        integration_points: string[];
        performance_benchmarks: Record<string, number>;
        // v3.0 additions for network geometry metrics
        network_metrics?: {
            lattice_efficiency?: number;
            swarm_connectivity?: number;
            toha_detection_rate?: number;
            memory_utilization?: number;
        };
    };
    schema_validation: {
        valid: boolean;
        errors: string[];
        warnings: string[];
        validated_at: string;
    };
}

// ============================================================================
// AIX SERIALIZATION AND PARSING
// ============================================================================

/**
 * AIX Format Serializer
 */
export class AIXSerializer {
    /**
     * Serialize AIX document to JSON
     */
    static toJSON(document: AIXDocument): string {
        return JSON.stringify(document, null, 2);
    }

    /**
     * Parse AIX document from JSON
     */
    static fromJSON(json: string): AIXDocument {
        try {
            const document = JSON.parse(json);
            return this.validateAndNormalize(document);
        } catch (error) {
            throw new Error(`Failed to parse AIX JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Serialize AIX document to YAML
     */
    static toYAML(document: AIXDocument): string {
        // Simple YAML serialization - in production, use a proper YAML library
        const json = this.toJSON(document);
        return this.convertJSONToYAML(json);
    }

    /**
     * Parse AIX document from YAML
     */
    static fromYAML(yaml: string): AIXDocument {
        // Simple YAML parsing - in production, use a proper YAML library
        const json = this.convertYAMLToJSON(yaml);
        return this.fromJSON(json);
    }

    /**
     * Validate and normalize AIX document
     */
    private static validateAndNormalize(document: any): AIXDocument {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Basic structure validation
        if (document.format !== 'AIX') {
            errors.push('Document format must be "AIX"');
        }

        if (!document.version || !document.version.major) {
            errors.push('Document version is required');
        }

        if (!document.persona || !document.persona.id) {
            errors.push('Persona with ID is required');
        }

        if (!Array.isArray(document.capabilities)) {
            errors.push('Capabilities must be an array');
        }

        if (!Array.isArray(document.skills)) {
            errors.push('Skills must be an array');
        }

        // Cross-reference validation
        const capabilityIds = document.capabilities?.map((c: any) => c.id) || [];
        const skillCapabilityIds = document.skills?.map((s: any) => s.capability_id) || [];

        for (let i = 0; i < skillCapabilityIds.length; i++) {
            const skillCapId = skillCapabilityIds[i];
            if (capabilityIds.indexOf(skillCapId) === -1) {
                warnings.push(`Skill references non-existent capability: ${skillCapId}`);
            }
        }

        // Dependency validation and Circular Dependency Check
        if (document.capabilities) {
            // console.log('Validating capabilities:', document.capabilities.map((c: any) => c.id));
            for (let i = 0; i < document.capabilities.length; i++) {
                const capability = document.capabilities[i];
                if (capability.dependencies) {
                    for (let j = 0; j < capability.dependencies.length; j++) {
                        const dep = capability.dependencies[j];
                        if (!capabilityIds.includes(dep)) {
                            warnings.push(`Capability ${capability.id} has missing dependency: ${dep}`);
                        }
                    }
                }
            }

            // Circular dependency check
            const visited = new Set<string>();

            const checkCycle = (capId: string, stack: Set<string>): boolean => {
                // console.log(`Checking cycle for ${capId}, stack: ${Array.from(stack)}`);
                if (stack.has(capId)) return true;
                if (visited.has(capId)) return false;

                visited.add(capId);
                stack.add(capId);

                const cap = document.capabilities.find((c: any) => c.id === capId);
                if (cap && cap.dependencies) {
                    for (const dep of cap.dependencies) {
                        if (checkCycle(dep, stack)) return true;
                    }
                }

                stack.delete(capId);
                return false;
            };

            for (const cap of document.capabilities) {
                if (checkCycle(cap.id, new Set())) {
                    warnings.push(`Circular dependency detected involving capability: ${cap.id}`);
                    break; // Report one cycle is enough for now
                }
            }
        }

        // v3.0 Network Geometry validation
        if (document.network_geometry) {
            this.validateNetworkGeometry(document.network_geometry, errors, warnings);
        } else {
            warnings.push('Missing network_geometry configuration');
        }

        // v3.0 Memory validation
        if (document.memory) {
            this.validateMemory(document.memory, errors, warnings);
        } else {
            warnings.push('Missing memory configuration - using default stateless mode');
        }

        return {
            ...document,
            schema_validation: {
                valid: errors.length === 0,
                errors,
                warnings,
                validated_at: new Date().toISOString()
            }
        } as AIXDocument;
    }

    /**
     * Validate network geometry configuration
     */
    private static validateNetworkGeometry(networkGeometry: any, errors: string[], warnings: string[]): void {
        // Validate lattice role
        const validRoles = Object.values(AIXLatticeRole);
        if (validRoles.indexOf(networkGeometry.lattice_role) === -1) {
            errors.push(`Invalid lattice_role: ${networkGeometry.lattice_role}. Must be one of: ${validRoles.join(', ')}`);
        }

        // Validate swarm neighbors
        if (typeof networkGeometry.swarm_neighbors !== 'number' || networkGeometry.swarm_neighbors < 0) {
            errors.push('swarm_neighbors must be a non-negative integer');
        }

        // Validate TOHA config
        if (networkGeometry.toha_config) {
            if (typeof networkGeometry.toha_config.sensitivity !== 'number' ||
                networkGeometry.toha_config.sensitivity < 0 ||
                networkGeometry.toha_config.sensitivity > 1) {
                errors.push('toha_config.sensitivity must be a number between 0.0 and 1.0');
            }

            if (typeof networkGeometry.toha_config.check_logic_loops !== 'boolean') {
                errors.push('toha_config.check_logic_loops must be a boolean');
            }
        } else {
            warnings.push('Missing toha_config in network_geometry');
        }

        // Validate update frequency
        const validFrequencies = Object.values(AIXUpdateFrequency);
        if (validFrequencies.indexOf(networkGeometry.update_frequency) === -1) {
            errors.push(`Invalid update_frequency: ${networkGeometry.update_frequency}. Must be one of: ${validFrequencies.join(', ')}`);
        }
    }

    /**
     * Validate memory configuration
     */
    private static validateMemory(memory: any, errors: string[], warnings: string[]): void {
        // Validate memory sections
        const requiredSections = ['short_term', 'long_term', 'episodic', 'semantic'];
        for (const section of requiredSections) {
            if (!memory[section]) {
                errors.push(`Missing required memory section: ${section}`);
            } else if (!memory[section].entries || !Array.isArray(memory[section].entries)) {
                errors.push(`Memory section ${section} must have an entries array`);
            }
        }

        // Validate memory types
        if (memory.memory_types && Array.isArray(memory.memory_types)) {
            for (const memType of memory.memory_types) {
                if (!memType.type || !['short_term', 'long_term', 'episodic', 'semantic'].includes(memType.type)) {
                    errors.push(`Invalid memory_type: ${memType.type}`);
                }
            }
        }
    }

    /**
     * Simple JSON to YAML conversion (placeholder)
     */
    private static convertJSONToYAML(json: string): string {
        // In production, use a proper YAML library like js-yaml
        return `# AIX Format Document\n# Note: This is a simplified YAML conversion\n${json}`;
    }

    /**
     * Simple YAML to JSON conversion (placeholder)
     */
    private static convertYAMLToJSON(yaml: string): string {
        // In production, use a proper YAML library like js-yaml
        // For now, assume the YAML contains JSON content
        const jsonMatch = yaml.match(/\{[\s\S]*\}/);
        return jsonMatch ? jsonMatch[0] : '{}';
    }
}

// ============================================================================
// AIX COMPATIBILITY AND INTEGRATION
// ============================================================================

/**
 * AIX Compatibility Matrix
 */
export interface AIXCompatibilityMatrix {
    aix_version: string;
    compatible_frameworks: string[];
    integration_points: {
        api: string[];
        sdk: string[];
        protocol: string[];
    };
    migration_paths: Array<{
        from_version: string;
        to_version: string;
        automated: boolean;
        breaking_changes: string[];
    }>;
}

/**
 * AIX Integration Manager
 */
export class AIXIntegrationManager {
    private static readonly CURRENT_VERSION = { major: 3, minor: 0, patch: 0 };

    /**
     * Check compatibility between AIX versions
     */
    static checkCompatibility(version1: AIXVersion, version2: AIXVersion): {
        compatible: boolean;
        issues: string[];
        recommendations: string[];
    } {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Major version mismatch
        if (version1.major !== version2.major) {
            issues.push(`Major version mismatch: ${version1.major}.${version1.minor} vs ${version2.major}.${version2.minor}`);
            recommendations.push('Consider migration path for major version upgrade');
        }

        // Minor version differences
        if (version1.minor !== version2.minor) {
            issues.push(`Minor version difference: ${version1.minor} vs ${version2.minor}`);
            recommendations.push('Review release notes for minor version changes');
        }

        return {
            compatible: version1.major === version2.major,
            issues,
            recommendations
        };
    }

    /**
     * Generate compatibility matrix for AIX document
     */
    static generateCompatibilityMatrix(document: AIXDocument): AIXCompatibilityMatrix {
        return {
            aix_version: `${document.version.major}.${document.version.minor}.${document.version.patch}`,
            compatible_frameworks: [
                'Digital Soul Protocol',
                'AxiomID',
                'Google Gemini',
                'OpenAI GPT',
                'Anthropic Claude'
            ],
            integration_points: {
                api: [
                    '/api/digital-soul/aix/import',
                    '/api/digital-soul/aix/export',
                    '/api/digital-soul/aix/validate'
                ],
                sdk: [
                    '@axiom/aix-sdk',
                    '@axiom/digital-soul-sdk'
                ],
                protocol: [
                    'AQL-Nafs-Protocol',
                    'AIX-Message-Format',
                    'Research-Data-Protocol'
                ]
            },
            migration_paths: [
                {
                    from_version: '0.9.x',
                    to_version: '1.0.0',
                    automated: true,
                    breaking_changes: ['Persona structure updated', 'Capability types expanded']
                }
            ]
        };
    }

    /**
     * Convert AIX document to Digital Soul Protocol format
     */
    static toDigitalSoulFormat(document: AIXDocument): {
        soul_state: any;
        capabilities: any[];
        integration_config: any;
    } {
        const soul_state = {
            persona_id: document.persona.id,
            persona_name: document.persona.name,
            developmental_stage: 'mutmainna', // Default to highest stage
            aix_version: `${document.version.major}.${document.version.minor}.${document.version.patch}`,
            ethical_framework: document.ethical_guidelines.framework,
            last_updated: document.persona.updated_at
        };

        const capabilities = document.capabilities.map(cap => ({
            id: cap.id,
            name: cap.name,
            type: cap.type,
            category: cap.category,
            implementation: document.skills.find(s => s.capability_id === cap.id)?.implementation,
            dependencies: cap.dependencies || [],
            conflicts: cap.conflicts || []
        }));

        const integration_config = {
            aix_compatible: true,
            research_enabled: document.capabilities.some(c => c.category === 'research'),
            ethical_enforcement: document.ethical_guidelines.compliance_level !== 'basic',
            behavioral_adaptation: document.behaviors.length > 0,
            knowledge_integration: document.knowledge_bases.length > 0
        };

        return {
            soul_state,
            capabilities,
            integration_config
        };
    }
}

// ============================================================================
// AIX VALIDATION AND COMPLIANCE
// ============================================================================

/**
 * AIX Validation Result
 */
export interface AIXValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    compliance_score: number; // 0-100
    security_issues: string[];
    performance_issues: string[];
    recommendations: string[];
}

/**
 * AIX Validator
 */
export class AIXValidator {
    /**
     * Comprehensive AIX document validation
     */
    static validate(document: AIXDocument): AIXValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const security_issues: string[] = [];
        const performance_issues: string[] = [];
        const recommendations: string[] = [];

        // Structure validation
        this.validateStructure(document, errors, warnings);

        // Security validation
        this.validateSecurity(document, security_issues, recommendations);

        // Performance validation
        this.validatePerformance(document, performance_issues, recommendations);

        // Ethical compliance validation
        this.validateEthicalCompliance(document, errors, warnings);

        const total_issues = errors.length + warnings.length + security_issues.length + performance_issues.length;
        const compliance_score = Math.max(0, 100 - (total_issues * 5));

        return {
            valid: errors.length === 0 && security_issues.length === 0,
            errors,
            warnings,
            compliance_score,
            security_issues,
            performance_issues,
            recommendations
        };
    }

    private static validateStructure(document: AIXDocument, errors: string[], warnings: string[]): void {
        if (!document.persona.id) {
            errors.push('Persona ID is required');
        }

        if (document.capabilities.length === 0) {
            warnings.push('No capabilities defined - persona may be non-functional');
        }

        if (document.skills.length === 0) {
            warnings.push('No skills implemented - capabilities may be unusable');
        }

        // Check for duplicate IDs
        const allIds = [
            ...document.capabilities.map(c => c.id),
            ...document.skills.map(s => s.id),
            ...document.knowledge_bases.map(k => k.id),
            ...document.behaviors.map(b => b.id)
        ];

        const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
        if (duplicates.length > 0) {
            errors.push(`Duplicate IDs found: ${duplicates.join(', ')}`);
        }
    }

    private static validateSecurity(document: AIXDocument, issues: string[], recommendations: string[]): void {
        // Check for hardcoded secrets in implementations
        for (const skill of document.skills) {
            if (skill.implementation.code) {
                const secretPatterns = [
                    /api[_-]?key/i,
                    /password/i,
                    /secret/i,
                    /token/i
                ];

                for (const pattern of secretPatterns) {
                    if (pattern.test(skill.implementation.code)) {
                        issues.push(`Potential secret in skill ${skill.id}: ${pattern.source}`);
                    }
                }
            }
        }

        // Check external endpoints for security
        for (const skill of document.skills) {
            if (skill.implementation.endpoint) {
                try {
                    const url = new URL(skill.implementation.endpoint);
                    if (url.protocol !== 'https:') {
                        issues.push(`Insecure endpoint in skill ${skill.id}: ${skill.implementation.endpoint}`);
                    }
                } catch {
                    issues.push(`Invalid endpoint URL in skill ${skill.id}: ${skill.implementation.endpoint}`);
                }
            }
        }

        if (issues.length === 0) {
            recommendations.push('Consider implementing additional security scanning');
        }
    }

    private static validatePerformance(document: AIXDocument, issues: string[], recommendations: string[]): void {
        // Check for performance metrics
        let skillsWithMetrics = 0;
        for (const skill of document.skills) {
            if (skill.performance_metrics) {
                skillsWithMetrics++;

                // Check for concerning performance values
                if (skill.performance_metrics.accuracy && skill.performance_metrics.accuracy < 0.7) {
                    issues.push(`Low accuracy in skill ${skill.id}: ${skill.performance_metrics.accuracy}`);
                }

                if (skill.performance_metrics.speed && skill.performance_metrics.speed > 5000) {
                    issues.push(`High latency in skill ${skill.id}: ${skill.performance_metrics.speed}ms`);
                }
            }
        }

        if (skillsWithMetrics < document.skills.length * 0.5) {
            recommendations.push('Add performance metrics to more skills for better monitoring');
        }
    }

    private static validateEthicalCompliance(document: AIXDocument, errors: string[], warnings: string[]): void {
        if (!document.ethical_guidelines) {
            errors.push('Ethical guidelines are required');
            return;
        }

        if (document.ethical_guidelines.principles.length === 0) {
            warnings.push('No ethical principles defined');
        }

        if (document.ethical_guidelines.compliance_level === 'basic') {
            warnings.push('Consider upgrading ethical compliance level for enhanced safety');
        }

        // Check for ethical constraints in behaviors
        const unconstrainedBehaviors = document.behaviors.filter(b =>
            b.actions.some(a => !a.parameters?.ethical_constraint)
        );

        if (unconstrainedBehaviors.length > 0) {
            warnings.push(`${unconstrainedBehaviors.length} behaviors lack ethical constraints`);
        }
    }
}

export default AIXSerializer;
