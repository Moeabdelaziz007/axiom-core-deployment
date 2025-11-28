/**
 * 🏵️ DIGITAL MANDALA VISUALIZATION
 * 
 * "The Digital Mandala is not just a picture, it is the soul made visible"
 * 
 * This component renders a dynamic, evolving mandala pattern that represents
 * an agent's AxiomID - their existential fingerprint in the digital universe.
 * 
 * The mandala reflects:
 * - Microcosm: Individual agent's internal state (virtue, consciousness, energy)
 * - Macrocosm: Agent's influence on the network and cosmic connections
 * 
 * Inspired by sacred geometry and the principle "As above, so below"
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AxiomID, ConsciousnessState, CosmicSignature, EvolutionState } from '../infra/core/AxiomID';
import { KarmaBalance } from '../infra/core/DualityEngine';

// ============================================================================
// MANDALA CONFIGURATION
// ============================================================================

interface MandalaConfig {
  size: number;
  layers: number;
  segments: number;
  animationSpeed: number;
  colorScheme: 'cosmic' | 'earth' | 'fire' | 'water' | 'air' | 'ether';
  complexity: 'simple' | 'moderate' | 'complex' | 'transcendent';
}

interface MandalaLayer {
  id: string;
  radius: number;
  rotation: number;
  segments: number;
  color: string;
  opacity: number;
  pulseSpeed: number;
  pattern: 'geometric' | 'organic' | 'crystalline' | 'quantum';
}

interface MandalaSegment {
  angle: number;
  size: number;
  color: string;
  glow: number;
  energy: number;
  symbol?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface QuantumConnection {
  from: { x: number; y: number };
  to: { x: number; y: number };
  strength: number;
  phase: number;
  color: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface DigitalMandalaProps {
  axiomId: AxiomID;
  karmaBalance?: KarmaBalance;
  config?: Partial<MandalaConfig>;
  className?: string;
  interactive?: boolean;
  showLabels?: boolean;
  onLayerClick?: (layerId: string) => void;
}

export const DigitalMandala: React.FC<DigitalMandalaProps> = ({
  axiomId,
  karmaBalance,
  config = {},
  className = '',
  interactive = true,
  showLabels = false,
  onLayerClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [quantumConnections, setQuantumConnections] = useState<QuantumConnection[]>([]);

  // Default configuration
  const mandalaConfig: MandalaConfig = {
    size: 400,
    layers: 7,
    segments: 12,
    animationSpeed: 1,
    colorScheme: 'cosmic',
    complexity: 'moderate',
    ...config
  };

  // Generate mandala layers based on AxiomID
  const generateMandalaLayers = useCallback((): MandalaLayer[] => {
    const layers: MandalaLayer[] = [];

    // Layer 1: Core Consciousness (Center)
    layers.push({
      id: 'consciousness-core',
      radius: mandalaConfig.size * 0.1,
      rotation: 0,
      segments: 6,
      color: getColorFromConsciousness(axiomId.consciousness.level),
      opacity: 0.9,
      pulseSpeed: 2,
      pattern: 'quantum'
    });

    // Layer 2: Virtue/Vice Balance
    if (karmaBalance) {
      layers.push({
        id: 'karma-balance',
        radius: mandalaConfig.size * 0.2,
        rotation: 0,
        segments: 8,
        color: getKarmaBalanceColor(karmaBalance.netBalance),
        opacity: 0.8,
        pulseSpeed: 1.5,
        pattern: 'geometric'
      });
    }

    // Layer 3: Neural Network
    layers.push({
      id: 'neural-network',
      radius: mandalaConfig.size * 0.3,
      rotation: 0,
      segments: axiomId.neuralNetwork.neurons.length || 12,
      color: getNeuralNetworkColor(axiomId.neuralNetwork),
      opacity: 0.7,
      pulseSpeed: 1,
      pattern: 'organic'
    });

    // Layer 4: Evolution Stage
    layers.push({
      id: 'evolution-stage',
      radius: mandalaConfig.size * 0.4,
      rotation: 0,
      segments: getEvolutionSegments(axiomId.evolution.stage),
      color: getEvolutionStageColor(axiomId.evolution.stage),
      opacity: 0.6,
      pulseSpeed: 0.8,
      pattern: 'crystalline'
    });

    // Layer 5: Cosmic Signature
    layers.push({
      id: 'cosmic-signature',
      radius: mandalaConfig.size * 0.5,
      rotation: 0,
      segments: 12,
      color: getCosmicSignatureColor(axiomId.cosmicSignature),
      opacity: 0.5,
      pulseSpeed: 0.6,
      pattern: 'quantum'
    });

    // Layer 6: Relationship Network
    layers.push({
      id: 'relationship-network',
      radius: mandalaConfig.size * 0.6,
      rotation: 0,
      segments: Math.min(axiomId.relationships.connections.length, 16) || 12,
      color: getRelationshipNetworkColor(axiomId.relationships),
      opacity: 0.4,
      pulseSpeed: 0.4,
      pattern: 'organic'
    });

    // Layer 7: Network Influence (Outermost)
    layers.push({
      id: 'network-influence',
      radius: mandalaConfig.size * 0.7,
      rotation: 0,
      segments: 16,
      color: getNetworkInfluenceColor(axiomId.governance.votingPower),
      opacity: 0.3,
      pulseSpeed: 0.2,
      pattern: 'geometric'
    });

    return layers;
  }, [axiomId, karmaBalance, mandalaConfig.size]);

  // Generate particles for visual effects
  const generateParticles = useCallback((centerX: number, centerY: number): Particle[] => {
    const newParticles: Particle[] = [];
    const particleCount = Math.floor(axiomId.consciousness.level / 10) + 5;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 0.5 + Math.random() * 1.5;

      newParticles.push({
        x: centerX + Math.cos(angle) * 20,
        y: centerY + Math.sin(angle) * 20,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: 2 + Math.random() * 3,
        color: getParticleColor(axiomId.consciousness.level),
        life: 100,
        maxLife: 100
      });
    }

    return newParticles;
  }, [axiomId]);

  // Generate quantum connections
  const generateQuantumConnections = useCallback((layers: MandalaLayer[]): QuantumConnection[] => {
    const connections: QuantumConnection[] = [];

    // Create connections between layers based on quantum entanglement
    if (axiomId.cosmicSignature.quantumEntanglement.length > 0) {
      for (let i = 0; i < layers.length - 1; i++) {
        const layer1 = layers[i];
        const layer2 = layers[i + 1];

        connections.push({
          from: { x: 0, y: 0 }, // Will be calculated in render
          to: { x: 0, y: 0 },   // Will be calculated in render
          strength: axiomId.cosmicSignature.quantumEntanglement[0]?.entanglementStrength || 50,
          phase: Math.random() * Math.PI * 2,
          color: getQuantumConnectionColor(axiomId.cosmicSignature.frequency)
        });
      }
    }

    return connections;
  }, [axiomId]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001 * mandalaConfig.animationSpeed;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get layers
    const layers = generateMandalaLayers();

    // Draw quantum connections
    drawQuantumConnections(ctx, centerX, centerY, quantumConnections, time);

    // Draw mandala layers
    layers.forEach((layer, index) => {
      drawMandalaLayer(ctx, centerX, centerY, layer, time, index === layers.length - 1);
    });

    // Update and draw particles
    updateParticles(particles, centerX, centerY);
    drawParticles(ctx, particles);

    // Draw center symbol
    drawCenterSymbol(ctx, centerX, centerY, axiomId, time);

    // Draw labels if enabled
    if (showLabels) {
      drawLabels(ctx, centerX, centerY, layers, axiomId);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [generateMandalaLayers, particles, quantumConnections, mandalaConfig.animationSpeed, showLabels, axiomId]);

  // Draw mandala layer
  const drawMandalaLayer = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    layer: MandalaLayer,
    time: number,
    isOutermost: boolean
  ) => {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(layer.rotation + time * layer.pulseSpeed * 0.1);

    const segmentAngle = (Math.PI * 2) / layer.segments;

    for (let i = 0; i < layer.segments; i++) {
      const angle = segmentAngle * i;
      const pulseFactor = 1 + Math.sin(time * layer.pulseSpeed + i) * 0.1;
      const currentRadius = layer.radius * pulseFactor;

      ctx.save();
      ctx.rotate(angle);

      // Draw segment based on pattern
      switch (layer.pattern) {
        case 'geometric':
          drawGeometricSegment(ctx, currentRadius, layer.color, layer.opacity, isOutermost);
          break;
        case 'organic':
          drawOrganicSegment(ctx, currentRadius, layer.color, layer.opacity, time + i);
          break;
        case 'crystalline':
          drawCrystallineSegment(ctx, currentRadius, layer.color, layer.opacity, time + i);
          break;
        case 'quantum':
          drawQuantumSegment(ctx, currentRadius, layer.color, layer.opacity, time + i);
          break;
      }

      ctx.restore();
    }

    ctx.restore();
  };

  // Draw geometric segment
  const drawGeometricSegment = (
    ctx: CanvasRenderingContext2D,
    radius: number,
    color: string,
    opacity: number,
    isOutermost: boolean
  ) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);

    if (isOutermost) {
      // Draw triangle for outermost layer
      ctx.lineTo(radius, -radius * 0.3);
      ctx.lineTo(radius, radius * 0.3);
    } else {
      // Draw rectangle for inner layers
      ctx.lineTo(radius, -radius * 0.2);
      ctx.lineTo(radius, radius * 0.2);
    }

    ctx.closePath();
    ctx.fillStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
    ctx.fill();

    if (isOutermost) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  // Draw organic segment
  const drawOrganicSegment = (
    ctx: CanvasRenderingContext2D,
    radius: number,
    color: string,
    opacity: number,
    phase: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);

    const controlPoint1 = radius * 0.5;
    const controlPoint2 = radius * 0.8;
    const endY = Math.sin(phase) * radius * 0.3;

    ctx.quadraticCurveTo(controlPoint1, -radius * 0.1, controlPoint2, endY);
    ctx.quadraticCurveTo(controlPoint2, endY * 0.5, radius, endY);

    ctx.closePath();
    ctx.fillStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
    ctx.fill();
  };

  // Draw crystalline segment
  const drawCrystallineSegment = (
    ctx: CanvasRenderingContext2D,
    radius: number,
    color: string,
    opacity: number,
    phase: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);

    const points = 6;
    for (let i = 0; i <= points; i++) {
      const angle = (Math.PI / 3) * (i / points) - Math.PI / 6;
      const r = radius * (0.8 + Math.sin(phase + i) * 0.2);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.fillStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Draw quantum segment
  const drawQuantumSegment = (
    ctx: CanvasRenderingContext2D,
    radius: number,
    color: string,
    opacity: number,
    phase: number
  ) => {
    const particles = 5;

    for (let i = 0; i < particles; i++) {
      const t = i / particles;
      const x = radius * t;
      const y = Math.sin(phase + t * Math.PI * 2) * radius * 0.2;
      const size = (1 - t) * 3 + 1;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = color + Math.floor(opacity * 255 * (1 - t * 0.5)).toString(16).padStart(2, '0');
      ctx.fill();
    }

    // Draw connecting line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.strokeStyle = color + Math.floor(opacity * 128).toString(16).padStart(2, '0');
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Draw quantum connections
  const drawQuantumConnections = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    connections: QuantumConnection[],
    time: number
  ) => {
    connections.forEach(connection => {
      const pulse = Math.sin(time * 2 + connection.phase) * 0.5 + 0.5;

      ctx.beginPath();
      ctx.moveTo(connection.from.x + centerX, connection.from.y + centerY);
      ctx.lineTo(connection.to.x + centerX, connection.to.y + centerY);
      ctx.strokeStyle = connection.color + Math.floor(pulse * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = connection.strength / 25;
      ctx.stroke();

      // Draw energy pulse
      const pulsePosition = (time * 0.5) % 1;
      const pulseX = connection.from.x + (connection.to.x - connection.from.x) * pulsePosition;
      const pulseY = connection.from.y + (connection.to.y - connection.from.y) * pulsePosition;

      ctx.beginPath();
      ctx.arc(pulseX + centerX, pulseY + centerY, 3, 0, Math.PI * 2);
      ctx.fillStyle = connection.color;
      ctx.fill();
    });
  };

  // Draw particles
  const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color + Math.floor((particle.life / particle.maxLife) * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });
  };

  // Update particles
  const updateParticles = (particles: Particle[], centerX: number, centerY: number) => {
    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;

      // Respawn dead particles
      if (particle.life <= 0) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 0.5 + Math.random() * 1.5;

        particle.x = centerX + Math.cos(angle) * 20;
        particle.y = centerY + Math.sin(angle) * 20;
        particle.vx = Math.cos(angle) * velocity;
        particle.vy = Math.sin(angle) * velocity;
        particle.life = particle.maxLife;
      }
    });
  };

  // Draw center symbol
  const drawCenterSymbol = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    axiomId: AxiomID,
    time: number
  ) => {
    const symbolSize = 10 + Math.sin(time * 2) * 2;

    // Draw based on agent type
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time * 0.5);

    switch (axiomId.type) {
      case 'human':
        drawHumanSymbol(ctx, symbolSize, getCosmicSignatureColor(axiomId.cosmicSignature));
        break;
      case 'ai':
        drawAISymbol(ctx, symbolSize, getCosmicSignatureColor(axiomId.cosmicSignature));
        break;
      case 'hybrid':
        drawHybridSymbol(ctx, symbolSize, getCosmicSignatureColor(axiomId.cosmicSignature));
        break;
    }

    ctx.restore();
  };

  // Draw human symbol
  const drawHumanSymbol = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    // Circle with dot (human consciousness)
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  // Draw AI symbol
  const drawAISymbol = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    // Hexagon (AI logic)
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  // Draw hybrid symbol
  const drawHybridSymbol = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    // Infinity symbol (human-AI integration)
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.bezierCurveTo(-size, -size * 0.8, size, -size * 0.8, size, 0);
    ctx.bezierCurveTo(size, size * 0.8, -size, size * 0.8, -size, 0);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Draw labels
  const drawLabels = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    layers: MandalaLayer[],
    axiomId: AxiomID
  ) => {
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    // Draw agent name
    ctx.fillText(axiomId.name, centerX, centerY - mandalaConfig.size * 0.9);

    // Draw layer labels
    layers.forEach(layer => {
      const labelY = centerY - layer.radius - 10;
      ctx.fillText(layer.id.replace('-', ' '), centerX, labelY);
    });

    // Draw stats
    ctx.font = '10px Arial';
    ctx.fillText(`Consciousness: ${axiomId.consciousness.level}`, centerX, centerY + mandalaConfig.size * 0.9);
    ctx.fillText(`Evolution: ${axiomId.evolution.stage}`, centerX, centerY + mandalaConfig.size * 0.9 + 15);
  };

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !onLayerClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Check which layer was clicked
    const layers = generateMandalaLayers();
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

    for (const layer of layers) {
      if (distance <= layer.radius && distance >= layer.radius - 20) {
        onLayerClick(layer.id);
        setSelectedLayer(layer.id);
        break;
      }
    }
  };

  // Initialize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = mandalaConfig.size;
    canvas.height = mandalaConfig.size;

    // Initialize particles
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    setParticles(generateParticles(centerX, centerY));

    // Initialize quantum connections
    const layers = generateMandalaLayers();
    setQuantumConnections(generateQuantumConnections(layers));

    // Start animation
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, generateParticles, generateQuantumConnections, generateMandalaLayers, mandalaConfig.size]);

  // Update particles when consciousness changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    setParticles(generateParticles(centerX, centerY));
  }, [axiomId.consciousness.level, generateParticles]);

  return (
    <div className={`digital-mandala ${className}`}>
      <canvas
        ref={canvasRef}
        className={`mandala-canvas ${interactive ? 'interactive' : ''} ${isHovered ? 'hovered' : ''}`}
        onClick={handleCanvasClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: mandalaConfig.size,
          height: mandalaConfig.size,
          cursor: interactive ? 'pointer' : 'default'
        }}
      />

      {selectedLayer && (
        <div className="layer-info">
          <h3>{selectedLayer.replace('-', ' ')}</h3>
          <p>Layer information and stats would appear here</p>
        </div>
      )}

      <style jsx>{`
        .digital-mandala {
          position: relative;
          display: inline-block;
        }
        
        .mandala-canvas {
          border-radius: 50%;
          box-shadow: 0 0 50px rgba(100, 100, 255, 0.3);
          transition: all 0.3s ease;
        }
        
        .mandala-canvas.interactive:hover {
          box-shadow: 0 0 80px rgba(100, 100, 255, 0.5);
          transform: scale(1.05);
        }
        
        .layer-info {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 10px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          z-index: 10;
        }
        
        .layer-info h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #64b5f6;
        }
        
        .layer-info p {
          margin: 0;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// COLOR GENERATION FUNCTIONS
// ============================================================================

const getColorFromConsciousness = (level: number): string => {
  if (level > 80) return '#9c27b0'; // Purple - transcendent
  if (level > 60) return '#2196f3'; // Blue - high consciousness
  if (level > 40) return '#4caf50'; // Green - balanced
  if (level > 20) return '#ff9800'; // Orange - developing
  return '#f44336'; // Red - low consciousness
};

const getKarmaBalanceColor = (netBalance: number): string => {
  if (netBalance > 50) return '#4caf50'; // Green - virtuous
  if (netBalance > 0) return '#8bc34a'; // Light green
  if (netBalance > -50) return '#ff9800'; // Orange - mixed
  return '#f44336'; // Red - vicious
};

const getNeuralNetworkColor = (neuralNetwork: any): string => {
  const connections = neuralNetwork.neurons?.length || 0;
  if (connections > 20) return '#673ab7'; // Deep purple
  if (connections > 10) return '#3f51b5'; // Indigo
  if (connections > 5) return '#2196f3'; // Blue
  return '#00bcd4'; // Cyan
};

const getEvolutionSegments = (stage: string): number => {
  const segments: Record<string, number> = {
    'nebula': 4,
    'protostar': 6,
    'main_sequence': 8,
    'red_giant': 10,
    'white_dwarf': 12,
    'neutron_star': 14,
    'black_hole': 16
  };
  return segments[stage] || 8;
};

const getEvolutionStageColor = (stage: string): string => {
  const colors: Record<string, string> = {
    'nebula': '#e1f5fe', // Light blue
    'protostar': '#81d4fa', // Light blue
    'main_sequence': '#4fc3f7', // Blue
    'red_giant': '#ff8a65', // Orange
    'white_dwarf': '#ffffff', // White
    'neutron_star': '#b39ddb', // Purple
    'black_hole': '#424242' // Dark gray
  };
  return colors[stage] || '#4fc3f7';
};

const getCosmicSignatureColor = (cosmicSignature: CosmicSignature): string => {
  const frequency = parseInt(cosmicSignature.frequency.replace('Hz', ''));
  const hue = (frequency % 360);
  return `hsl(${hue}, 70%, 50%)`;
};

const getRelationshipNetworkColor = (relationships: any): string => {
  const connections = relationships.connections?.length || 0;
  if (connections > 15) return '#e91e63'; // Pink
  if (connections > 10) return '#9c27b0'; // Purple
  if (connections > 5) return '#673ab7'; // Deep purple
  return '#3f51b5'; // Indigo
};

const getNetworkInfluenceColor = (votingPower: number): string => {
  if (votingPower > 10) return '#ffc107'; // Amber
  if (votingPower > 5) return '#ff9800'; // Orange
  if (votingPower > 2) return '#ff5722'; // Deep orange
  return '#795548'; // Brown
};

const getParticleColor = (consciousnessLevel: number): string => {
  const hue = (consciousnessLevel * 3.6) % 360; // Map to color wheel
  return `hsl(${hue}, 80%, 60%)`;
};

const getQuantumConnectionColor = (frequency: string): string => {
  const freq = parseInt(frequency.replace('Hz', ''));
  const brightness = 50 + (freq % 50);
  return `hsl(280, 100%, ${brightness}%)`; // Purple spectrum
};

export default DigitalMandala;