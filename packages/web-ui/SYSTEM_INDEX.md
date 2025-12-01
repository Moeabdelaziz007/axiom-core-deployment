# Axiom Core System Index

## Overview

This document provides a comprehensive map of the Axiom Core system architecture, organized into four distinct layers that work together to create a powerful AI-powered platform. The system follows a modular design pattern with centralized barrel exports for clean imports and maintainable code.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        LAYER 1: THE BRAIN                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   AI Engine │  │    Groq     │  │  LangGraph  │              │
│  │             │  │             │  │             │              │
│  │ Model Mgmt  │  │  Inference  │  │  Workflow   │              │
│  │   & Routing │  │  & Gateway  │  │  Orchest.   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       LAYER 2: THE MEMORY                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Turso    │  │   Drizzle   │  │   Pinecone  │              │
│  │             │  │             │  │             │              │
│  │   SQLite    │  │    ORM      │  │ Vector DB   │              │
│  │   Database  │  │  & Schema   │  │ & Memory    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       LAYER 3: THE BODY                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │NeuralWork-  │  │ GhostCursor │  │ Gigafactory │              │
│  │   space     │  │             │  │             │              │
│  │             │  │ Human-like  │  │ Agent DNA   │              │
│  │  Visual UI  │  │  Movement   │  │  Synthesis  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       LAYER 4: THE SHIELD                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Arcjet    │  │ Dead Hand   │  │    Auth     │              │
│  │             │  │   Protocol  │  │             │              │
│  │   Security  │  │   Safety    │  │  Identity   │              │
│  │  & Defense  │  │  Monitoring │  │  Mgmt       │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Layer 1: The Brain 🧠

### AI Engine (`src/lib/ai-engine.ts`)
**Purpose**: Unified AI model management and intelligent routing between different providers  
**Location**: `@lib`  
**Key Features**: 
- Groq SDK integration for high-speed inference
- Vercel AI Gateway for observability
- Model selection logic (FAST/SMART/JUDGE)
- Environment-aware configuration

### Groq Integration (`src/lib/ai-engine.ts`)
**Purpose**: Direct access to Groq's high-performance LLM models  
**Location**: `@lib`  
**Key Features**:
- Llama 3.1 models (8B and 70B)
- Low-latency inference
- BYOK (Bring Your Own Key) support

### LangGraph (`src/core/dream-factory/`)
**Purpose**: Workflow orchestration for complex AI agent chains  
**Location**: `@core`  
**Key Features**:
- State-based agent workflows
- Multi-agent collaboration patterns
- Dream generation and refinement pipeline

## Layer 2: The Memory 💾

### Turso (`src/db/`)
**Purpose**: SQLite-compatible database for structured data storage  
**Location**: `@db`  
**Key Features**:
- Edge-optimized database
- Real-time replication
- Serverless deployment ready

### Drizzle (`src/db/schema.ts`)
**Purpose**: Type-safe ORM for database operations  
**Location**: `@db`  
**Key Features**:
- TypeScript-first schema definition
- Query builder with type inference
- Migration management

### Pinecone (`src/lib/pinecone.ts`)
**Purpose**: Vector database for semantic memory and similarity search  
**Location**: `@lib`  
**Key Features**:
- High-dimensional vector storage
- Semantic search capabilities
- Memory context retrieval

## Layer 3: The Body 🏗️

### NeuralWorkspace (`src/components/NeuralWorkspace.tsx`)
**Purpose**: Main visualization interface for system topology and agent states  
**Location**: `@components`  
**Key Features**:
- Real-time agent grid visualization
- Topology mapping display
- Ghost cursor integration
- Swarm hologram rendering

### GhostCursor (`src/lib/ghost-cursor.ts`)
**Purpose**: Human-like mouse movement simulation for natural interactions  
**Location**: `@lib`  
**Key Features**:
- Bezier curve path generation
- Variable velocity profiles
- Overshoot simulation
- Click prediction

### Gigafactory (`src/services/axiomForge.ts`)
**Purpose**: Agent DNA synthesis and creation pipeline  
**Location**: `@services`  
**Key Features**:
- Agent archetype generation
- DNA encoding/decoding
- Capability assignment

## Layer 4: The Shield 🛡️

### Arcjet (`src/lib/arcjet.ts`)
**Purpose**: Production-ready security middleware for bot detection and rate limiting  
**Location**: `@lib`  
**Key Features**:
- Bot detection algorithms
- Rate limiting
- Request validation

### Dead Hand Protocol (`src/lib/deadHandStore.ts`)
**Purpose**: System safety monitoring and heartbeat management  
**Location**: `@lib`  
**Key Features**:
- Health monitoring
- Automatic failover
- Safety triggers

### Authentication (`src/lib/auth.ts`)
**Purpose**: Wallet-based identity management and session handling  
**Location**: `@lib`  
**Key Features**:
- Solana wallet verification
- JWT session management
- Multi-tenant support

## Module Hierarchy

```
packages/web-ui/src/
├── components/          # UI Components Layer
│   ├── NeuralWorkspace.tsx
│   ├── TheForge.tsx
│   ├── DeadHandMonitor.tsx
│   ├── SwarmConsensusVisualizer.tsx
│   └── index.ts         # Barrel export
├── lib/                 # Utility Libraries Layer
│   ├── ai-engine.ts
│   ├── ghost-cursor.ts
│   ├── auth.ts
│   ├── arcjet.ts
│   ├── pinecone.ts
│   └── index.ts         # Barrel export
├── core/                # Core Business Logic Layer
│   ├── dream-factory/
│   ├── communication/
│   ├── topology/
│   └── index.ts         # Barrel export
├── services/            # Service Layer
│   ├── IdentityService.ts
│   ├── dream-memory.ts
│   ├── axiomForge.ts
│   └── index.ts         # Barrel export
└── db/                  # Database Layer
    ├── schema.ts
    └── index.ts         # Barrel export
```

## Import Examples

### Using the Barrel Structure

```typescript
// Import multiple components from the components barrel
import { 
  NeuralWorkspace, 
  TheForge, 
  DeadHandMonitor,
  SwarmConsensusVisualizer 
} from '@components';

// Import utilities from the lib barrel
import { 
  aiEngine, 
  GhostCursor, 
  authenticateWallet,
  arcjet 
} from '@lib';

// Import core functionality
import { 
  createDreamGraph, 
  AgentMessageBus,
  SwarmConsensusEngine 
} from '@core';

// Import services
import { 
  IdentityService, 
  DreamMemory, 
  axiomForge 
} from '@services';
```

### Path Aliases Reference

The following path aliases are configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

This means you can import from any directory using the `@` prefix:

```typescript
// Direct imports (alternative to barrel imports)
import NeuralWorkspace from '@/components/NeuralWorkspace';
import { aiEngine } from '@/lib/ai-engine';
import { createDreamGraph } from '@/core/dream-factory/graph';
import { IdentityService } from '@/services/IdentityService';
```

## Module Relationships

### Data Flow Diagram

```
User Input → Auth → AI Engine → Dream Factory → Memory → Visualization
    ↓           ↓         ↓            ↓           ↓           ↓
  Shield     Brain     Brain       Memory       Body        Body
```

### Key Interactions

1. **Authentication Flow**: Auth → IdentityService → JWT Session → API Headers
2. **Dream Generation**: AI Engine → LangGraph → Dream Factory → Memory → Pinecone
3. **Visualization**: Memory → NeuralWorkspace → GhostCursor → UI Components
4. **Safety Monitoring**: Dead Hand → Arcjet → System Health → Response

## Development Patterns

### Barrel Export Strategy

All modules use centralized barrel exports (`index.ts` files) to provide:

1. **Clean Imports**: Single import statement for multiple modules
2. **Abstraction**: Hide implementation details behind the barrel
3. **Reorganization**: Easy to move files without breaking imports
4. **Tree Shaking**: Better bundling optimization

### Layer Communication

- **Brain → Memory**: AI models store/retrieve context from vector databases
- **Memory → Body**: Retrieved data informs visualization and interactions
- **Body → Shield**: User actions trigger security validations
- **Shield → Brain**: Security policies constrain AI operations

## System Health Monitoring

The Dead Hand Protocol provides continuous monitoring:

```typescript
import { getDeadHandStatus, updateHeartbeat } from '@lib';

// Check system health
const status = getDeadHandStatus();

// Update component heartbeat
updateHeartbeat('NeuralWorkspace');
```

## Security Architecture

Multiple layers of security protection:

1. **Arcjet**: Request-level filtering and rate limiting
2. **Auth**: Wallet-based identity verification
3. **Dead Hand**: System-level safety monitoring
4. **Input Validation**: All API endpoints validate inputs

## Performance Considerations

- **AI Engine**: Intelligent model routing balances cost and performance
- **Ghost Cursor**: Optimized path generation algorithms
- **Memory**: Vector similarity search for fast retrieval
- **Visualization**: Efficient rendering with React and Framer Motion

## Extending the System

When adding new modules:

1. Follow the 4-layer architecture pattern
2. Add exports to the appropriate barrel file
3. Update this documentation
4. Consider security implications
5. Add appropriate tests

## Troubleshooting

### Common Issues

1. **Import Errors**: Check barrel exports in `index.ts` files
2. **AI Model Failures**: Verify environment variables for API keys
3. **Memory Issues**: Check database connections and vector index status
4. **Security Blocks**: Review Arcjet rules and Dead Hand status

### Debug Mode

Enable detailed logging:

```typescript
import { log } from '@lib';

// Set debug level
log.setLevel('debug');

// Monitor specific components
log.debug('NeuralWorkspace', 'Component initialized');
```

---

*This documentation is maintained as part of the Axiom Core system. Last updated: 2025-11-30*