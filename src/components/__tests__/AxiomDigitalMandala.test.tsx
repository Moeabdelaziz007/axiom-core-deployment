import React from 'react';
import { render, screen } from '@testing-library/react';
import { AxiomDigitalMandala } from '../AxiomDigitalMandala';
import { AgentIdentity } from '@/types/identity';

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