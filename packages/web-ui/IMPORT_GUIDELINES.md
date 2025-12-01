# Import Guidelines & Barrel Usage Documentation

## Table of Contents

1. [Overview](#overview)
2. [Barrel Import Patterns](#barrel-import-patterns)
3. [Before/After Comparisons](#beforeafter-comparisons)
4. [Best Practices](#best-practices)
5. [Barrel File Maintenance](#barrel-file-maintenance)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Migration Guide](#migration-guide)
8. [Performance Considerations](#performance-considerations)
9. [TypeScript Configuration](#typescript-configuration)
10. [Common Examples](#common-examples)

## Overview

The packages/web-ui codebase implements a comprehensive **Index Strategy** using barrel files and TypeScript path aliases to provide clean, maintainable imports throughout the application. This approach centralizes exports, reduces import verbosity, and improves developer experience.

### Path Aliases Configuration

The following path aliases are configured in [`tsconfig.json`](tsconfig.json:22-28):

```json
"paths": {
  "@/*": ["./src/*"],
  "@components": ["./src/components"],
  "@lib": ["./src/lib"],
  "@core": ["./src/core"],
  "@services": ["./src/services"]
}
```

### Barrel Files Structure

- [`src/components/index.ts`](src/components/index.ts) - UI component exports
- [`src/lib/index.ts`](src/lib/index.ts) - Utility library exports
- [`src/core/index.ts`](src/core/index.ts) - Core system modules
- [`src/services/index.ts`](src/services/index.ts) - Service layer exports

## Barrel Import Patterns

### Component Imports

Import UI components using the `@components` alias:

```typescript
// Single component import
import { NeuralWorkspace } from '@components';

// Multiple component imports
import { 
  NeuralWorkspace, 
  DeadHandMonitor, 
  AgentChatInterface 
} from '@components';

// Subdirectory component imports
import { HoloAgentCard } from '@components';
```

### Library Imports

Import utility functions and classes from `@lib`:

```typescript
// AI Engine utilities
import { aiEngine, groq, getModel } from '@lib';

// Ghost Cursor utilities
import { GhostCursor, type Point } from '@lib';

// Logging utilities
import { log, logAuthEvent } from '@lib';
```

### Core Imports

Import core system modules from `@core`:

```typescript
// Communication modules
import { AgentMessageBus, messageBus } from '@core';

// Topology modules
import { 
  SwarmConsensusEngine, 
  TOHADetector,
  ToricLattice 
} from '@core';
```

### Service Imports

Import service layer components from `@services`:

```typescript
// Core services
import { 
  IdentityService, 
  DreamMemory, 
  transactionExecutor 
} from '@services';
```

### Mixed Imports

Combine imports from different barrels:

```typescript
import { NeuralWorkspace } from '@components';
import { aiEngine } from '@lib';
import { AgentMessageBus } from '@core';
import { IdentityService } from '@services';
```

## Before/After Comparisons

### Before: Traditional Relative Imports

```typescript
// Messy relative imports
import NeuralWorkspace from '../../../components/NeuralWorkspace';
import DeadHandMonitor from '../../../components/DeadHandMonitor';
import { aiEngine } from '../../lib/ai-engine';
import { GhostCursor } from '../../lib/ghost-cursor';
import { AgentMessageBus } from '../../core/communication/AgentMessageBus';
import { IdentityService } from '../../services/IdentityService';
```

### After: Barrel Imports with Path Aliases

```typescript
// Clean, organized barrel imports
import { 
  NeuralWorkspace, 
  DeadHandMonitor 
} from '@components';
import { 
  aiEngine, 
  GhostCursor 
} from '@lib';
import { AgentMessageBus } from '@core';
import { IdentityService } from '@services';
```

## Best Practices

### 1. Use Named Imports

Prefer named imports over default imports for better tree-shaking:

```typescript
// ✅ Good - Named imports
import { NeuralWorkspace, DeadHandMonitor } from '@components';

// ❌ Avoid - Default imports (unless necessary)
import NeuralWorkspace from '@components/NeuralWorkspace';
```

### 2. Group Imports Logically

Group imports by type and add empty lines between groups:

```typescript
// React and framework imports
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// External library imports
import { Shield, Cpu } from 'lucide-react';

// Internal barrel imports
import { NeuralWorkspace, DeadHandMonitor } from '@components';
import { aiEngine, log } from '@lib';
import { AgentMessageBus } from '@core';
import { IdentityService } from '@services';

// Type imports
import type { AgentMessage } from '@core';
import type { UserProfile } from '@services';
```

### 3. Use Type Imports for Types Only

Use `import type` for type-only imports to improve performance:

```typescript
// ✅ Good - Type-only imports
import type { AgentMessage, Proposal } from '@core';
import type { UserProfile, DreamData } from '@services';

// ❌ Avoid - Regular imports for types only
import { AgentMessage, Proposal } from '@core';
```

### 4. Server-Side vs Client-Side Imports

Be aware of server-side only modules:

```typescript
// ✅ Client-side safe - exported from barrels
import { aiEngine, GhostCursor, log } from '@lib';

// ❌ Client-side error - server-side only
import { pinecone } from '@lib/pinecone'; // Direct import required

// ✅ Server components - direct imports
import { pinecone, INDEX_NAME } from '@/lib/pinecone';
import { redis } from '@/lib/redis';
```

## Barrel File Maintenance

### Adding New Exports

1. **For Components**: Add to [`src/components/index.ts`](src/components/index.ts)

```typescript
// Add new component export in appropriate section
export { default as NewComponent } from './NewComponent';
```

2. **For Libraries**: Add to [`src/lib/index.ts`](src/lib/index.ts)

```typescript
// Add new utility exports
export {
  newUtility,
  helperFunction
} from './new-utility-file';
```

3. **For Core Modules**: Add to [`src/core/index.ts`](src/core/index.ts)

```typescript
// Add new core module exports
export { NewCoreModule } from './new-module/NewCoreModule';
```

4. **For Services**: Add to [`src/services/index.ts`](src/services/index.ts)

```typescript
// Add new service exports
export { NewService } from './NewService';
```

### Organizing Barrel Files

1. **Group related exports** with clear section headers
2. **Use consistent formatting** and alphabetical ordering when appropriate
3. **Add descriptive comments** for each section
4. **Include JSDoc comments** for complex exports

### Version Control Considerations

- Barrel files change frequently during development
- Use descriptive commit messages when updating exports
- Consider barrel file changes as breaking changes for public APIs

## Troubleshooting Guide

### Common Import Issues

#### 1. "Cannot find module '@components'" Error

**Cause**: TypeScript path aliases not configured correctly

**Solution**:
1. Verify [`tsconfig.json`](tsconfig.json) paths configuration
2. Restart your TypeScript server/editor
3. Ensure barrel files exist and are properly formatted

#### 2. "Module has no exported member" Error

**Cause**: Export missing from barrel file

**Solution**:
1. Check the appropriate barrel file for the export
2. Add the missing export to the barrel file
3. Verify the original file exports the item correctly

#### 3. Import Works in Development but Fails in Production

**Cause**: Server-side only modules imported in client code

**Solution**:
1. Check if the module is server-side only (auth, database, etc.)
2. Import server-side modules directly in server components
3. Use dynamic imports for conditional server-side loading

#### 4. Circular Dependency Issues

**Cause**: Modules importing each other in a cycle

**Solution**:
1. Use dependency injection patterns
2. Extract shared functionality to separate modules
3. Restructure imports to break the cycle

### Debugging Import Issues

1. **Use the test barrel imports file**:
   ```bash
   npx tsx src/test-barrel-imports.ts
   ```

2. **Check the test barrels page** at `/test-barrels` in the development server

3. **Verify TypeScript compilation**:
   ```bash
   npx tsc --noEmit
   ```

## Migration Guide

### Migrating Existing Projects

#### Step 1: Update Import Statements

Replace relative imports with barrel imports:

```typescript
// Before
import NeuralWorkspace from '../components/NeuralWorkspace';
import { aiEngine } from '../lib/ai-engine';

// After
import { NeuralWorkspace } from '@components';
import { aiEngine } from '@lib';
```

#### Step 2: Update TypeScript Configuration

Ensure your [`tsconfig.json`](tsconfig.json) includes the path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components": ["./src/components"],
      "@lib": ["./src/lib"],
      "@core": ["./src/core"],
      "@services": ["./src/services"]
    }
  }
}
```

#### Step 3: Create Barrel Files

If migrating from a project without barrel files:

1. Create `index.ts` files in each directory
2. Add exports for all modules in the directory
3. Organize exports into logical sections

#### Step 4: Update Build Configuration

Ensure your build tool recognizes the path aliases:

**For Next.js**: Already configured in [`tsconfig.json`](tsconfig.json)

**For other tools**: May require additional configuration

### Automated Migration

Use find and replace with regex to speed up migration:

```bash
# Find relative component imports
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ["\']\.\./\.\./components/|from "@components/|g'
```

## Performance Considerations

### Tree Shaking

Barrel imports support tree shaking when used correctly:

```typescript
// ✅ Good - Enables tree shaking
import { specificFunction } from '@lib';

// ❌ Less optimal - May import more than needed
import * as libUtils from '@lib';
```

### Bundle Size Optimization

1. **Import only what you need** - Avoid importing entire modules
2. **Use type imports** - `import type` doesn't add to bundle size
3. **Lazy load heavy components** - Use dynamic imports for large components

```typescript
// Lazy loading example
const HeavyComponent = React.lazy(() => import('@components/HeavyComponent'));
```

### Build Performance

Barrel files can slightly increase build time, but the benefits outweigh the costs:

- Cleaner import statements
- Better developer experience
- Easier refactoring
- Reduced import errors

## TypeScript Configuration

### Required Configuration

Ensure your [`tsconfig.json`](tsconfig.json) includes:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"],
      "@components": ["./src/components"],
      "@lib": ["./src/lib"],
      "@core": ["./src/core"],
      "@services": ["./src/services"]
    }
  }
}
```

### Editor Integration

For optimal editor support:

1. **VS Code**: Ensure TypeScript extension is installed
2. **Restart TypeScript server**: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
3. **Check for errors**: Use the Problems panel to identify import issues

## Common Examples

### Example 1: Component with Multiple Imports

```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity } from 'lucide-react';

// Barrel imports
import { 
  NeuralWorkspace, 
  DeadHandMonitor,
  AgentChatInterface 
} from '@components';
import { aiEngine, log } from '@lib';
import { AgentMessageBus } from '@core';
import { IdentityService } from '@services';

// Type imports
import type { AgentMessage } from '@core';
import type { UserProfile } from '@services';

export default function DashboardPage() {
  // Component implementation
}
```

### Example 2: Server Component with Direct Imports

```typescript
// Server component - can import server-side modules directly
import { pinecone, INDEX_NAME } from '@/lib/pinecone';
import { redis } from '@/lib/redis';
import { createSession, verifyWalletSignature } from '@/lib/auth';

// Client-safe imports from barrels
import { NeuralWorkspace } from '@components';

export default async function ServerPage() {
  // Server-side implementation
}
```

### Example 3: Utility Function with Library Imports

```typescript
// Utility function using barrel imports
import { aiEngine, log } from '@lib';
import { AgentMessageBus } from '@core';
import { IdentityService } from '@services';

export async function processAgentMessage(message: string) {
  log.info('Processing agent message');
  
  const response = await aiEngine.generateResponse(message);
  const bus = new AgentMessageBus();
  const identity = IdentityService.getInstance();
  
  // Process message...
  
  return response;
}
```

### Example 4: Type-Only Imports

```typescript
// Type definitions with barrel imports
import type { 
  AgentMessage, 
  Proposal, 
  ConsensusResult 
} from '@core';

import type { 
  UserProfile, 
  DreamData, 
  TransactionResult 
} from '@services';

export interface AgentState {
  message: AgentMessage;
  proposal: Proposal;
  consensus: ConsensusResult;
  profile: UserProfile;
  dream: DreamData;
  transaction: TransactionResult;
}
```

---

## Additional Resources

- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Next.js Import Aliases](https://nextjs.org/docs/advanced-features/module-path-aliases)
- [Barrel Files Best Practices](https://basarat.gitbook.io/typescript/main-1/barrel)

For questions or issues with imports, refer to the [test barrel imports file](src/test-barrel-imports.ts) or visit the test page at `/test-barrels` in the development server.