/**
 * Main UI Components Barrel Export
 *
 * This file provides centralized exports for all UI components in the components directory.
 * Use named imports like: `import { NeuralWorkspace, TheForge } from '@components';`
 */

// ============================================================================
// CORE WORKSPACE & MAIN APPLICATION COMPONENTS
// ============================================================================

export { default as NeuralWorkspace } from './NeuralWorkspace';
export { default as TheForge } from './TheForge';
export { default as ControlHub } from './ControlHub';
export { default as CryptoCortex } from './CryptoCortex';
export { default as NeuralTerminal } from './NeuralTerminal';

// ============================================================================
// AGENT COMPONENTS
// ============================================================================

export { default as AgentChatInterface } from './AgentChatInterface';
export { default as MarketAnalystAgent } from './MarketAnalystAgent';
export { default as OperationsAutomationAgent } from './OperationsAutomationAgent';

// ============================================================================
// MONITORING & DIAGNOSTICS COMPONENTS
// ============================================================================

export { default as DeadHandMonitor } from './DeadHandMonitor';
export { default as LiveDiagnostics } from './LiveDiagnostics';
export { default as PolyphaseMonitor } from './PolyphaseMonitor';
export { default as RealTimeMandalaWrapper } from './RealTimeMandalaWrapper';

// ============================================================================
// SWARM & VISUALIZATION COMPONENTS
// ============================================================================

export { default as SwarmConsensusVisualizer } from './SwarmConsensusVisualizer';
export { default as SwarmHologram } from './SwarmHologram';
export { default as AxiomHolographicMandala } from './AxiomHolographicMandala';

// ============================================================================
// AUTHENTICATION & PROVIDER COMPONENTS
// ============================================================================

export { AuthProvider } from './AuthProvider';
export { WalletContextProvider } from './WalletContextProvider';

// ============================================================================
// MODAL & UI INTERACTION COMPONENTS
// ============================================================================

export { default as ApprovalModal } from './ApprovalModal';

// ============================================================================
// BLOCKCHAIN & VERIFICATION COMPONENTS
// ============================================================================

export { default as SolanaVerifier } from './SolanaVerifier';

// ============================================================================
// SIMULATION & TESTING COMPONENTS
// ============================================================================

export { default as XPSimulator } from './XPSimulator';

// ============================================================================
// STREAMING & HANDLER COMPONENTS
// ============================================================================

export { default as StreamingResponseHandler } from './StreamingResponseHandler';

// ============================================================================
// SUBDIRECTORY COMPONENTS
// ============================================================================

// Forge Components
export { default as HoloAgentCard } from './forge/HoloAgentCard';

// Marketplace Components
export { default as AgentCard } from './marketplace/AgentCard';