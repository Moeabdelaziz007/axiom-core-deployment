/**
 * Minimal test to isolate React rendering issue
 */

import React from 'react';
import { render } from '@testing-library/react';

// Test basic component import
describe('AxiomGigafactory Minimal Test', () => {
  test('should import component', () => {
    const AxiomGigafactory = require('../AxiomGigafactory').default;
    expect(AxiomGigafactory).toBeDefined();
  });

  test('should render basic div without component', () => {
    const { container } = render(<div data-testid="test">Test</div>);
    expect(container).toBeInTheDocument();
  });

  test('should identify problematic dependency', async () => {
    try {
      // Try importing each dependency individually
      const framerMotion = require('framer-motion');
      console.log('Framer Motion imported:', typeof framerMotion);
      
      const factoryService = require('@/services/factoryService');
      console.log('Factory Service imported:', typeof factoryService);
      
      const lucideReact = require('lucide-react');
      console.log('Lucide React imported:', typeof lucideReact);
      
      const tanstackQuery = require('@tanstack/react-query');
      console.log('TanStack Query imported:', typeof tanstackQuery);
      
    } catch (error) {
      console.log('Import error:', error);
    }
  });
});