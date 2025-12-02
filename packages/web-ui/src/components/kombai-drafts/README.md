# Axiom ID Landing Components

## Overview
Futuristic AI-themed landing page and dashboard components for the Axiom ID platform.

## Components

### 1. SovereignLanding
Main landing page with hero section and feature cards.

**Features:**
- Transparent header with navigation
- Gradient hero text with holographic effects
- Glass-morphism feature cards
- Circuit board background patterns
- Integrated Solana wallet connection

### 2. IndustrialDashboard
AI Agent Gigafactory dashboard with real-time updates.

**Features:**
- Vertical sidebar navigation
- Multi-tab dashboard header
- 4-stage assembly line visualization
- Real-time metrics display
- WebSocket integration for live updates

### 3. WalletButton
Solana wallet connection component with dropdown menu.

**States:**
- Disconnected: Shows "Connect Wallet" button
- Connecting: Shows loading spinner
- Connected: Shows shortened address with dropdown

## Architecture

### Data Flow
```
┌─────────────────┐
│   Components    │
│  (UI Layer)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  React Query    │
│  (Cache Layer)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   API Services  │
│  (Data Layer)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Backend APIs   │
│   + WebSocket   │
└─────────────────┘
```

### State Management

#### Global UI State (Zustand)
- Dashboard tab selection
- Sidebar state
- Modal states
- Theme preferences

#### Server State (React Query)
- Factory metrics
- Assembly line stages
- Agent queue data
- Auto-refetching every 2-5 seconds

#### Real-time Updates (WebSocket)
- Assembly progress updates
- Metrics changes
- Agent deployment notifications

## Services

### factoryService.ts
API calls for factory data:
- `getFactoryStatus()` - Get overall factory status
- `getAssemblyStages()` - Get assembly line stages
- `getMetrics()` - Get dashboard metrics
- `deployAgent()` - Deploy a new agent

### walletService.ts
API calls for wallet operations:
- `authenticateWallet()` - Authenticate user wallet
- `getWalletAccount()` - Get wallet details
- `getWalletBalance()` - Get wallet balance

## Hooks

### useFactoryData.ts
React Query hooks for data fetching:
- `useFactoryStatus()` - Fetch factory status
- `useAssemblyStages()` - Fetch assembly stages
- `useFactoryMetrics()` - Fetch metrics
- `useDeployAgent()` - Mutation for deploying agents

### useFactoryRealtime.ts
WebSocket hook for real-time updates:
```typescript
const { isConnected, lastUpdate } = useFactoryRealtime({
  enabled: true,
  onUpdate: (update) => {
    console.log('Update:', update);
  },
});
```

## Providers

### RootProviders
Wraps the app with necessary context providers:
- QueryProvider (React Query)
- WalletProvider (Solana Wallet Adapter)

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3000/ws/factory
```

## Usage

### Basic Setup
```tsx
import { RootProviders } from '@/providers/RootProviders';
import SovereignLanding from '@/components/kombai-drafts/SovereignLanding';

export default function Page() {
  return (
    <RootProviders>
      <SovereignLanding />
    </RootProviders>
  );
}
```

### With Dashboard
```tsx
import IndustrialDashboardConnected from '@/components/kombai-drafts/IndustrialDashboardConnected';

export default function DashboardPage() {
  return (
    <RootProviders>
      <IndustrialDashboardConnected />
    </RootProviders>
  );
}
```

## Styling

### Theme Colors
- Cyan: `#00F0FF`
- Purple: `#7000FF`
- Background: `#030712`
- Surface: `#0f172a`

### Custom Utilities (globals.css)
- `heading-hero` - Large hero text
- `heading-section` - Section headings
- `text-gradient-cyan-purple` - Gradient text
- `.glass-panel` - Glass-morphism effect
- `.circuit-pattern` - Circuit board background

## Testing

### Mock Data
Components work with mock data when backend is unavailable:
```typescript
const mockMetrics: DashboardMetrics = {
  systemStatus: 'Online',
  throughputPercentage: 96,
  activeWallets: 1402,
  currentQueue: 3,
};
```

## Performance

### Optimizations
- React Query caching (1 minute stale time)
- Auto-refetch intervals (2-5 seconds)
- WebSocket reconnection logic
- Lazy loading for heavy components

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Dependencies
- `@tanstack/react-query` - Data fetching and caching
- `zustand` - Global state management
- `@solana/wallet-adapter-react` - Wallet integration
- `framer-motion` - Animations
- `lucide-react` - Icons
- `axios` - HTTP client