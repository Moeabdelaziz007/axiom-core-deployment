import React from 'react';

/**
 * Mock for framer-motion components
 * This provides basic React component replacements for motion components
 * to avoid rendering issues in test environment
 */

// Mock motion components as regular React components with forwarded refs
export const motion = {
  div: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
    <div {...props} ref={ref} />
  )),
  span: React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>((props, ref) => (
    <span {...props} ref={ref} />
  )),
  svg: React.forwardRef<SVGSVGElement, React.SVGAttributes<SVGSVGElement>>((props, ref) => (
    <svg {...props} ref={ref} />
  )),
  circle: React.forwardRef<SVGCircleElement, React.SVGAttributes<SVGCircleElement>>((props, ref) => (
    <circle {...props} ref={ref} />
  )),
  g: React.forwardRef<SVGGElement, React.SVGAttributes<SVGGElement>>((props, ref) => (
    <g {...props} ref={ref} />
  )),
  path: React.forwardRef<SVGPathElement, React.SVGAttributes<SVGPathElement>>((props, ref) => (
    <path {...props} ref={ref} />
  )),
  rect: React.forwardRef<SVGRectElement, React.SVGAttributes<SVGRectElement>>((props, ref) => (
    <rect {...props} ref={ref} />
  )),
  // Add other motion components as needed
};

// Mock AnimatePresence
export const AnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

// Mock other framer-motion exports
export const useAnimation = () => ({
  start: jest.fn(),
  stop: jest.fn(),
  set: jest.fn(),
});

export const useMotionValue = (initial: any) => ({
  value: initial,
  set: jest.fn(),
  onChange: jest.fn(),
});

export const useInView = () => false;

export const useScroll = () => ({
  scrollY: { value: 0, onChange: jest.fn() },
  scrollX: { value: 0, onChange: jest.fn() },
});

export const useTransform = (value: any, transformer: any) => transformer(value);

export const useSpring = () => ({});

export const useDrag = () => [jest.fn(), {}];

export const PanInfo = {};

export const MotionConfig: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

export const LayoutGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);