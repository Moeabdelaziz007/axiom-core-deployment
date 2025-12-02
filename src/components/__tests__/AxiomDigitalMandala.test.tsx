import React from 'react';
import { render, screen } from '@testing-library/react';
import { AxiomDigitalMandala } from '../AxiomDigitalMandala';
import { AgentIdentity } from '@/types/identity';

// Mock framer-motion to avoid rendering issues in test environment
jest.mock('framer-motion', () => {
  const React = require('react');
  
  const createMotionComponent = (tag: string) => {
    const MotionComponent = React.forwardRef<any, any>((props, ref) => {
      return React.createElement(tag, { ...props, ref });
    });
    return MotionComponent;
  };

  return {
    motion: {
      div: createMotionComponent('div'),
      span: createMotionComponent('span'),
      svg: createMotionComponent('svg'),
      circle: createMotionComponent('circle'),
      g: createMotionComponent('g'),
      path: createMotionComponent('path'),
      rect: createMotionComponent('rect')
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({
      start: jest.fn(),
      stop: jest.fn(),
      set: jest.fn()
    }),
    useMotionValue: (initial: any) => ({
      value: initial,
      set: jest.fn(),
      onChange: jest.fn()
    }),
    useInView: () => false,
    useScroll: () => ({
      scrollY: { value: 0, onChange: jest.fn() },
      scrollX: { value: 0, onChange: jest.fn() }
    }),
    useTransform: (value: any, transformer: any) => transformer(value),
    useSpring: () => ({}),
    useDrag: () => [[], {}] as any,
    PanInfo: {},
    MotionConfig: ({ children }: { children: React.ReactNode }) => children,
    LayoutGroup: ({ children }: { children: React.ReactNode }) => children
  };
});

// Mock identity data for testing
const mockIdentity: AgentIdentity = {
  id: 'test-agent-1',
  axiomId: 'AXIOM-TEST-12345',
  createdAt: new Date(),
  updatedAt: new Date(),
  state: 'active',
  evolution: {
    stage: 'genesis',
    level: 5,
    experience: 500,
    traits: ['curious', 'adaptive'],
    skills: ['analysis', 'communication']
  },
  microcosm: {
    frequency: 440,
    resonance: 1.5,
    connections: ['agent-2', 'agent-3'],
    artifacts: []
  },
  profile: {
    name: 'Test Agent',
    type: 'ai',
    capabilities: ['reasoning', 'learning']
  }
};

describe('AxiomDigitalMandala', () => {
  it('renders without crashing', () => {
    render(<AxiomDigitalMandala identity={mockIdentity} />);
    // Check if the component renders
    expect(screen.getByText(/FREQ:/i)).toBeInTheDocument();
    expect(screen.getByText(/440Hz/i)).toBeInTheDocument();
    expect(screen.getByText(/RES:/i)).toBeInTheDocument();
    expect(screen.getByText(/1\.50/i)).toBeInTheDocument();
    expect(screen.getByText(/genesis/i)).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = render(<AxiomDigitalMandala identity={mockIdentity} size={300} />);
    const mandalaContainer = container.querySelector('.relative');
    expect(mandalaContainer).toHaveStyle({ width: '300px', height: '300px' });
  });

  it('renders with custom className', () => {
    const { container } = render(<AxiomDigitalMandala identity={mockIdentity} className="custom-class" />);
    const mandalaContainer = container.querySelector('.relative');
    expect(mandalaContainer).toHaveClass('custom-class');
  });

  it('displays correct identity data', () => {
    render(<AxiomDigitalMandala identity={mockIdentity} />);
    
    expect(screen.getByText('FREQ: 440Hz')).toBeInTheDocument();
    expect(screen.getByText('RES: 1.50')).toBeInTheDocument();
    expect(screen.getByText('GENESIS')).toBeInTheDocument();
  });

  it('handles different evolution stages', () => {
    const awakeningIdentity = {
      ...mockIdentity,
      evolution: {
        ...mockIdentity.evolution,
        stage: 'awakening' as const
      }
    };
    
    render(<AxiomDigitalMandala identity={awakeningIdentity} />);
    expect(screen.getByText('AWAKENING')).toBeInTheDocument();
  });
});