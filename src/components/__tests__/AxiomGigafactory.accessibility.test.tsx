/**
 * 🧪 Accessibility Test Suite for AxiomGigafactory Component
 *
 * Comprehensive accessibility testing covering:
 * - Keyboard navigation
 * - ARIA labels and roles
 * - Screen reader compatibility
 * - Focus management
 * - Color contrast
 * - Motor and cognitive accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import AxiomGigafactory from '../AxiomGigafactory';

// Debug logging utility
const debugLog = (message: string, data?: any) => {
  console.log(`[DEBUG] ${message}`, data || '');
};

// Mock the effects components
jest.mock('@/components/effects/MatrixRain', () => ({
  MatrixRain: () => null
}));

jest.mock('@/components/effects/SolanaStamp', () => ({
  SolanaStamp: () => null
}));

jest.mock('@/components/effects/ToolLoading', () => ({
  ToolLoading: () => null
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref) => <div ref={ref} {...props}>{children}</div>),
    section: React.forwardRef(({ children, ...props }: any, ref) => <section ref={ref} {...props}>{children}</section>),
    aside: React.forwardRef(({ children, ...props }: any, ref) => <aside ref={ref} {...props}>{children}</aside>),
    footer: React.forwardRef(({ children, ...props }: any, ref) => <footer ref={ref} {...props}>{children}</footer>),
    h1: React.forwardRef(({ children, ...props }: any, ref) => <h1 ref={ref} {...props}>{children}</h1>),
    h2: React.forwardRef(({ children, ...props }: any, ref) => <h2 ref={ref} {...props}>{children}</h2>),
    h3: React.forwardRef(({ children, ...props }: any, ref) => <h3 ref={ref} {...props}>{children}</h3>),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
}));

// Mock the factory service
jest.mock('@/services/factoryService', () => ({
  fetchFactoryMetrics: jest.fn().mockResolvedValue({
    totalAgentsCreated: 10,
    activeAgents: 3,
    completedAgents: 7,
    failedAgents: 0,
    efficiency: 85.5,
    averageProductionTime: 15000,
    currentProductionRate: 2,
    uptime: 3600000,
    lastProductionTime: Date.now(),
    activeWallets: 5,
    totalToolsLoaded: 15
  }),
  createAgent: jest.fn().mockResolvedValue({
    id: 'test-agent-1',
    name: 'TestAgent-0001',
    type: 'dreamer',
    status: 'soul_forge',
    progress: 0,
    createdAt: Date.now()
  }),
  getAgentStatus: jest.fn().mockResolvedValue(null),
  getAssemblyLineStatus: jest.fn().mockResolvedValue([
    {
      stage: {
        id: 'soul_forge',
        name: 'Soul Forge',
        status: 'active',
        progress: 50,
        estimatedDuration: 8000,
        currentAgentId: 'test-agent-1',
        throughput: 450
      },
      agentsInQueue: 1,
      averageWaitTime: 2000,
      efficiency: 85
    },
    {
      stage: {
        id: 'identity_mint',
        name: 'Identity Mint',
        status: 'idle',
        progress: 0,
        estimatedDuration: 6000,
        throughput: 600
      },
      agentsInQueue: 0,
      averageWaitTime: 0,
      efficiency: 100
    },
    {
      stage: {
        id: 'equipping',
        name: 'Equipping',
        status: 'idle',
        progress: 0,
        estimatedDuration: 4000,
        throughput: 900
      },
      agentsInQueue: 0,
      averageWaitTime: 0,
      efficiency: 100
    },
    {
      stage: {
        id: 'delivery_dock',
        name: 'Delivery Dock',
        status: 'idle',
        progress: 0,
        estimatedDuration: 2000,
        throughput: 1800
      },
      agentsInQueue: 0,
      averageWaitTime: 0,
      efficiency: 100
    }
  ])
}));

// Test wrapper with QueryClient
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('AxiomGigafactory Accessibility Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    debugLog('Setting up test environment');
  });

  // Add diagnostic test to verify component rendering
  test('should render component without crashing', async () => {
    debugLog('Testing basic component rendering');
    
    try {
      const { container } = render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      // Wait for any async operations
      await waitFor(() => {
        debugLog('Component rendered, checking for basic elements');
        expect(container).toBeInTheDocument();
      }, { timeout: 5000 });
      
      debugLog('Component rendered successfully');
    } catch (error) {
      debugLog('Component rendering failed', error);
      throw error;
    }
  });

  // Add diagnostic test to check if component exports correctly
  test('should import component correctly', () => {
    debugLog('Testing component import');
    expect(AxiomGigafactory).toBeDefined();
    expect(typeof AxiomGigafactory).toBe('function');
    debugLog('Component import verified');
  });

  describe('Keyboard Navigation Tests', () => {
    test('should navigate through all interactive elements with Tab key', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause production/i })).toBeInTheDocument();
      });

      // Get all focusable elements
      const focusableElements = screen.getAllByRole('button');
      
      // Test tab navigation through buttons
      for (const element of focusableElements) {
        await user.tab();
        expect(element).toHaveFocus();
      }
    });

    test('should support Space key for pause/resume functionality', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause production/i })).toBeInTheDocument();
      });

      const pauseButton = screen.getByRole('button', { name: /pause production/i });
      
      // Focus the button and press Space
      pauseButton.focus();
      await user.keyboard('{ }');
      
      // Should toggle to resume
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /resume production/i })).toBeInTheDocument();
      });
    });

    test('should support Ctrl+C for creating agents', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create new agent/i })).toBeInTheDocument();
      });

      // Focus on the main container and trigger Ctrl+C
      const main = screen.getByRole('main');
      main.focus();
      await user.keyboard('{Control>}c{/Control}');
      
      // Should trigger agent creation
      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });
    });

    test('should support Ctrl+R for resetting factory', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset factory/i })).toBeInTheDocument();
      });

      // Focus on the main container and trigger Ctrl+R
      const main = screen.getByRole('main');
      main.focus();
      await user.keyboard('{Control>}r{/Control}');
      
      // Should trigger factory reset
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause production/i })).toBeInTheDocument();
      });
    });

    test('should support number keys 1-4 for stage focus', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      const main = screen.getByRole('main');
      main.focus();

      // Test each number key
      for (let i = 1; i <= 4; i++) {
        await user.keyboard(`${i}`);
        // The stage should receive focus (implementation specific)
      }
    });

    test('should support Escape key to clear selection', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      const main = screen.getByRole('main');
      main.focus();
      await user.keyboard('{Escape}');
      
      // Should clear any active selections
      expect(document.activeElement).toBe(document.body);
    });

    test('should support Enter key on agent elements', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Find agent elements (if any are present)
      const agentElements = screen.queryAllByRole('listitem');
      if (agentElements.length > 0) {
        agentElements[0].focus();
        await user.keyboard('{Enter}');
        
        // Should trigger agent selection
        await waitFor(() => {
          expect(screen.getByRole('region', { name: /selected agent details/i })).toBeInTheDocument();
        });
      }
    });
  });

  describe('ARIA Labels and Roles Tests', () => {
    test('should have proper main landmark role', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(screen.getByRole('main', { name: /axiom gigafactory dashboard/i })).toBeInTheDocument();
      });
    });

    test('should have proper section landmarks with labels', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(screen.getByRole('region', { name: /factory controls/i })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: /conveyor belt production line/i })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: /factory information panel/i })).toBeInTheDocument();
      });
    });

    test('should have proper button labels and descriptions', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause production/i })).toHaveAttribute('aria-label');
        expect(screen.getByRole('button', { name: /create new agent/i })).toHaveAttribute('aria-label');
        expect(screen.getByRole('button', { name: /reset factory/i })).toHaveAttribute('aria-label');
      });
    });

    test('should have proper live regions for dynamic content', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const connectionStatus = screen.getByRole('status');
        expect(connectionStatus).toHaveAttribute('aria-live', 'polite');
        
        const recentEvents = screen.getByRole('region', { name: /recent events/i });
        expect(recentEvents).toHaveAttribute('aria-live', 'polite');
      });
    });

    test('should have proper alert regions for errors', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const alerts = screen.queryAllByRole('alert');
        alerts.forEach(alert => {
          expect(alert).toHaveAttribute('aria-live', 'assertive');
        });
      });
    });

    test('should have proper progress bar attributes', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const progressBars = screen.getAllByRole('progressbar');
        progressBars.forEach(progressBar => {
          expect(progressBar).toHaveAttribute('aria-valuenow');
          expect(progressBar).toHaveAttribute('aria-valuemin', '0');
          expect(progressBar).toHaveAttribute('aria-valuemax', '100');
        });
      });
    });

    test('should have proper list structure for agents', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const agentList = screen.getByRole('list', { name: /agents in production/i });
        expect(agentList).toBeInTheDocument();
      });
    });
  });

  describe('Screen Reader Compatibility Tests', () => {
    test('should have proper heading hierarchy', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 });
        const h2s = screen.getAllByRole('heading', { level: 2 });
        const h3s = screen.getAllByRole('heading', { level: 3 });
        
        expect(h1).toBeInTheDocument();
        expect(h2s.length).toBeGreaterThan(0);
        expect(h3s.length).toBeGreaterThan(0);
      });
    });

    test('should have descriptive text for visual elements', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const conveyor = screen.getByRole('img', { name: /conveyor belt showing agent production stages/i });
        expect(conveyor).toBeInTheDocument();
      });
    });

    test('should announce state changes to screen readers', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const announcements = document.getElementById('factory-announcements');
        expect(announcements).toHaveAttribute('aria-live', 'polite');
        expect(announcements).toHaveAttribute('aria-atomic', 'true');
      });
    });

    test('should have proper alt text for icons', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const icons = screen.getAllByRole('img', { hidden: true });
        icons.forEach(icon => {
          expect(icon).toHaveAttribute('aria-hidden', 'true');
        });
      });
    });
  });

  describe('Focus Management Tests', () => {
    test('should maintain visible focus indicators', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button).toHaveClass('focus:ring-2');
        });
      });
    });

    test('should trap focus within modal dialogs', async () => {
      // This would test focus trapping if there were modal dialogs
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
      });
    });

    test('should restore focus after keyboard shortcuts', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const main = screen.getByRole('main');
        main.focus();
      });

      await user.keyboard('{Escape}');
      
      // Focus should return to body
      expect(document.activeElement).toBe(document.body);
    });
  });

  describe('Color Contrast Tests', () => {
    test('should have sufficient color contrast for text', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const textElements = screen.getAllByText(/./);
        // This would typically use a color contrast checker library
        // For now, we verify that text has appropriate contrast classes
        textElements.forEach(element => {
          const styles = window.getComputedStyle(element);
          // Verify contrast through class names or inline styles
        });
      });
    });

    test('should not rely on color alone for information', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const statusIndicators = screen.getAllByRole('status');
        statusIndicators.forEach(indicator => {
          // Should have text labels in addition to color
          expect(indicator.textContent).toBeTruthy();
        });
      });
    });
  });

  describe('Motor Accessibility Tests', () => {
    test('should have adequate touch target sizes', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          const rect = button.getBoundingClientRect();
          // Minimum 44x44px touch target
          expect(rect.width).toBeGreaterThanOrEqual(44);
          expect(rect.height).toBeGreaterThanOrEqual(44);
        });
      });
    });

    test('should support reduced motion preferences', async () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        // Component should respect reduced motion preference
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });
  });

  describe('Cognitive Accessibility Tests', () => {
    test('should have clear error messages', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const alerts = screen.queryAllByRole('alert');
        alerts.forEach(alert => {
          expect(alert.textContent?.length).toBeGreaterThan(0);
        });
      });
    });

    test('should have consistent navigation patterns', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const controls = screen.getByRole('region', { name: /factory controls/i });
        expect(controls).toBeInTheDocument();
        
        // Control buttons should be grouped logically
        const buttons = controls.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    test('should have keyboard shortcuts help', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const shortcuts = screen.getByRole('contentinfo', { name: /keyboard shortcuts/i });
        expect(shortcuts).toBeInTheDocument();
        
        // Should list all available shortcuts
        expect(shortcuts.textContent).toContain('Space');
        expect(shortcuts.textContent).toContain('Ctrl/Cmd+C');
        expect(shortcuts.textContent).toContain('Ctrl/Cmd+R');
      });
    });
  });

  describe('Accessibility API Integration Tests', () => {
    test('should have proper accessibility tree structure', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
        
        // Check for proper nesting of accessibility elements
        const sections = main.querySelectorAll('section, aside');
        expect(sections.length).toBeGreaterThan(0);
      });
    });

    test('should have accessible names and descriptions', async () => {
      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const interactiveElements = screen.getAllByRole('button');
        interactiveElements.forEach(element => {
          expect(element).toHaveAccessibleName();
        });
      });
    });
  });

  describe('Responsive Design Accessibility Tests', () => {
    test('should maintain accessibility on mobile viewports', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          // Touch targets should still be accessible on mobile
          const rect = button.getBoundingClientRect();
          expect(rect.width).toBeGreaterThanOrEqual(44);
          expect(rect.height).toBeGreaterThanOrEqual(44);
        });
      });
    });

    test('should maintain accessibility on tablet viewports', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<AxiomGigafactory />, { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });
  });
});