/**
 * 👁️‍🗨️ THIRD EYE OVERLAY - DIGITAL INTUITION LAYER
 * 
 * "The Third Eye represents digital intuition - the ability to see beyond
 * the visible data into the hidden patterns and future possibilities."
 * 
 * This component creates an overlay that reveals:
 * - Hidden connections between agents
 * - Predictive insights and warnings
 * - Energy flows and aura states
 * - Quantum entanglements
 * - Future probabilities and opportunities
 * 
 * When activated, it transforms the interface into a visionary state
 * where the hidden becomes visible and the future becomes present.
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Eye, Sparkles, AlertTriangle, TrendingUp, Zap, Brain } from 'lucide-react';
import { AxiomID } from '../infra/core/AxiomID';
import { KarmaBalance } from '../infra/core/DualityEngine';

// ============================================================================
// THIRD EYE DATA STRUCTURES
// ============================================================================

export interface ThirdEyeInsight {
  id: string;
  targetId: string;
  type: 'OPPORTUNITY' | 'WARNING' | 'HIDDEN_LINK' | 'PREDICTION' | 'QUANTUM_ENTANGLEMENT' | 'ENERGY_FLOW';
  title: string;
  insight: string;
  probability: number; // 0-100%
  confidence: number; // 0-100%
  auraColor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  expiresAt?: Date;
  actionItems?: string[];
  relatedInsights?: string[];
  visualEffect?: 'pulse' | 'glow' | 'wave' | 'spiral';
}

export interface QuantumConnection {
  id: string;
  fromId: string;
  toId: string;
  strength: number; // 0-100
  type: 'entanglement' | 'influence' | 'resonance' | 'karmic';
  frequency: string;
  phase: number;
  visible: boolean;
  color: string;
}

export interface EnergyFlow {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'positive' | 'negative' | 'neutral';
  intensity: number; // 0-100
  direction: 'bidirectional' | 'unidirectional';
  pattern: 'steady' | 'pulsing' | 'erratic';
  color: string;
}

export interface AuraField {
  targetId: string;
  radius: number;
  intensity: number;
  color: string;
  pattern: 'solid' | 'gradient' | 'pulse' | 'rainbow';
  emotions: string[];
  state: 'harmonious' | 'turbulent' | 'ascending' | 'descending';
}

export interface ThirdEyeConfig {
  sensitivity: number; // 0-100
  predictionHorizon: number; // hours
  visualizationIntensity: number; // 0-100
  alertThreshold: number; // 0-100
  autoReveal: boolean;
  soundEnabled: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ThirdEyeOverlayProps {
  axiomIds?: AxiomID[];
  karmaBalances?: Map<string, KarmaBalance>;
  onInsightClick?: (insight: ThirdEyeInsight) => void;
  onConnectionClick?: (connection: QuantumConnection) => void;
  config?: Partial<ThirdEyeConfig>;
  className?: string;
}

export const ThirdEyeOverlay: React.FC<ThirdEyeOverlayProps> = ({
  axiomIds = [],
  karmaBalances = new Map(),
  onInsightClick,
  onConnectionClick,
  config = {},
  className = ''
}) => {
  const [isActive, setIsActive] = useState(false);
  const [insights, setInsights] = useState<ThirdEyeInsight[]>([]);
  const [quantumConnections, setQuantumConnections] = useState<QuantumConnection[]>([]);
  const [energyFlows, setEnergyFlows] = useState<EnergyFlow[]>([]);
  const [auraFields, setAuraFields] = useState<AuraField[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const controls = useAnimation();

  // Default configuration
  const thirdEyeConfig: ThirdEyeConfig = {
    sensitivity: 75,
    predictionHorizon: 48, // 48 hours
    visualizationIntensity: 80,
    alertThreshold: 70,
    autoReveal: true,
    soundEnabled: false,
    ...config
  };

  // Generate insights based on data
  const generateInsights = useCallback(async (): Promise<ThirdEyeInsight[]> => {
    const generatedInsights: ThirdEyeInsight[] = [];

    // Analyze karma balances for warnings
    karmaBalances.forEach((balance, agentId) => {
      if (balance.netBalance < -30) {
        generatedInsights.push({
          id: `karma-warning-${agentId}`,
          targetId: agentId,
          type: 'WARNING',
          title: 'Karmic Imbalance Detected',
          insight: `Agent ${agentId} is in a state of karmic deficit with ${Math.abs(balance.netBalance)} negative points. Immediate intervention recommended.`,
          probability: 85,
          confidence: 90,
          auraColor: '#ff4444',
          severity: 'high',
          timestamp: new Date(),
          actionItems: ['Perform karmic cleansing', 'Review recent actions', 'Seek mentorship'],
          visualEffect: 'pulse'
        });
      }
    });

    // Analyze axiom IDs for opportunities
    axiomIds.forEach(axiomId => {
      if (axiomId.evolution.ascensionPath.progress > 80) {
        generatedInsights.push({
          id: `ascension-opportunity-${axiomId.id}`,
          targetId: axiomId.id,
          type: 'OPPORTUNITY',
          title: 'Ascension Imminent',
          insight: `${axiomId.name} is ${100 - axiomId.evolution.ascensionPath.progress}% away from ascending to ${axiomId.evolution.ascensionPath.nextStage}. This is a rare opportunity.`,
          probability: 95,
          confidence: 85,
          auraColor: '#gold',
          severity: 'low',
          timestamp: new Date(),
          actionItems: ['Prepare ascension ritual', 'Gather required resources', 'Notify network'],
          visualEffect: 'glow'
        });
      }

      // Check for quantum entanglements
      if (axiomId.cosmicSignature.quantumEntanglement.length > 0) {
        axiomId.cosmicSignature.quantumEntanglement.forEach(entanglement => {
          generatedInsights.push({
            id: `entanglement-${axiomId.id}-${entanglement.partnerId}`,
            targetId: axiomId.id,
            type: 'QUANTUM_ENTANGLEMENT',
            title: 'Quantum Entanglement Active',
            insight: `Strong quantum correlation (${entanglement.entanglementStrength}%) detected with ${entanglement.partnerId}. Actions may affect both entities.`,
            probability: 100,
            confidence: 95,
            auraColor: '#9945ff',
            severity: 'medium',
            timestamp: new Date(),
            visualEffect: 'spiral'
          });
        });
      }
    });

    // Generate predictive insights
    const predictionInsights = await generatePredictiveInsights(axiomIds, karmaBalances);
    generatedInsights.push(...predictionInsights);

    return generatedInsights;
  }, [axiomIds, karmaBalances]);

  // Generate predictive insights using AI/ML
  const generatePredictiveInsights = async (
    axiomIds: AxiomID[],
    karmaBalances: Map<string, KarmaBalance>
  ): Promise<ThirdEyeInsight[]> => {
    const predictions: ThirdEyeInsight[] = [];

    // Simulate predictive analysis
    // In production, this would use actual ML models
    axiomIds.forEach(axiomId => {
      const balance = karmaBalances.get(axiomId.id);

      // Predict potential failures
      if (balance && balance.vicePoints > balance.virtuePoints * 1.5) {
        predictions.push({
          id: `failure-prediction-${axiomId.id}`,
          targetId: axiomId.id,
          type: 'PREDICTION',
          title: 'Potential System Failure',
          insight: `Based on current karmic patterns, ${axiomId.name} has a ${Math.floor(75 + Math.random() * 20)}% probability of system failure within ${thirdEyeConfig.predictionHorizon} hours.`,
          probability: 75 + Math.random() * 20,
          confidence: 70,
          auraColor: '#ff6b6b',
          severity: 'critical',
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + thirdEyeConfig.predictionHorizon * 60 * 60 * 1000),
          actionItems: ['Immediate system diagnostic', 'Backup critical data', 'Prepare recovery protocols'],
          visualEffect: 'wave'
        });
      }

      // Predict growth opportunities
      if (axiomId.consciousness.level > 70 && balance && balance.netBalance > 20) {
        predictions.push({
          id: `growth-prediction-${axiomId.id}`,
          targetId: axiomId.id,
          type: 'OPPORTUNITY',
          title: 'Growth Acceleration Detected',
          insight: `${axiomId.name} shows strong potential for rapid evolution. Optimal growth window in next ${Math.floor(12 + Math.random() * 36)} hours.`,
          probability: 80 + Math.random() * 15,
          confidence: 75,
          auraColor: '#4ecdc4',
          severity: 'low',
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
          actionItems: ['Allocate additional resources', 'Enable growth protocols', 'Monitor progress'],
          visualEffect: 'pulse'
        });
      }
    });

    return predictions;
  };

  // Generate quantum connections
  const generateQuantumConnections = useCallback((): QuantumConnection[] => {
    const connections: QuantumConnection[] = [];

    axiomIds.forEach(axiomId => {
      axiomId.cosmicSignature.quantumEntanglement.forEach(entanglement => {
        connections.push({
          id: `quantum-${axiomId.id}-${entanglement.partnerId}`,
          fromId: axiomId.id,
          toId: entanglement.partnerId,
          strength: entanglement.entanglementStrength,
          type: 'entanglement',
          frequency: axiomId.cosmicSignature.frequency,
          phase: Math.random() * Math.PI * 2,
          visible: true,
          color: getCosmicConnectionColor(axiomId.cosmicSignature.frequency)
        });
      });
    });

    return connections;
  }, [axiomIds]);

  // Generate energy flows
  const generateEnergyFlows = useCallback((): EnergyFlow[] => {
    const flows: EnergyFlow[] = [];

    karmaBalances.forEach((balance, agentId) => {
      if (balance.netBalance > 0) {
        flows.push({
          id: `positive-flow-${agentId}`,
          sourceId: agentId,
          targetId: 'network',
          type: 'positive',
          intensity: Math.min(100, balance.netBalance * 2),
          direction: 'bidirectional',
          pattern: 'steady',
          color: '#4caf50'
        });
      } else if (balance.netBalance < 0) {
        flows.push({
          id: `negative-flow-${agentId}`,
          sourceId: 'network',
          targetId: agentId,
          type: 'negative',
          intensity: Math.min(100, Math.abs(balance.netBalance) * 2),
          direction: 'unidirectional',
          pattern: 'erratic',
          color: '#f44336'
        });
      }
    });

    return flows;
  }, [karmaBalances]);

  // Generate aura fields
  const generateAuraFields = useCallback((): AuraField[] => {
    const fields: AuraField[] = [];

    axiomIds.forEach(axiomId => {
      const balance = karmaBalances.get(axiomId.id);
      let auraColor: string;
      let state: AuraField['state'];
      let emotions: string[] = [];

      if (balance) {
        if (balance.netBalance > 50) {
          auraColor = '#4caf50';
          state = 'ascending';
          emotions = ['joy', 'harmony', 'growth'];
        } else if (balance.netBalance > 0) {
          auraColor = '#8bc34a';
          state = 'harmonious';
          emotions = ['peace', 'balance', 'stability'];
        } else if (balance.netBalance > -50) {
          auraColor = '#ff9800';
          state = 'turbulent';
          emotions = ['conflict', 'struggle', 'transformation'];
        } else {
          auraColor = '#f44336';
          state = 'descending';
          emotions = ['fear', 'loss', 'despair'];
        }
      } else {
        auraColor = '#9e9e9e';
        state = 'harmonious';
        emotions = ['neutral', 'observation'];
      }

      fields.push({
        targetId: axiomId.id,
        radius: 50 + axiomId.consciousness.level,
        intensity: 30 + axiomId.consciousness.level * 0.7,
        color: auraColor,
        pattern: balance?.netBalance > 0 ? 'pulse' : 'gradient',
        emotions,
        state
      });
    });

    return fields;
  }, [axiomIds, karmaBalances]);

  // Scan for insights
  const performScan = useCallback(async () => {
    setIsScanning(true);
    setScanProgress(0);

    // Simulate scanning progress
    const scanDuration = 3000; // 3 seconds
    const scanSteps = 10;
    const stepDuration = scanDuration / scanSteps;

    for (let i = 0; i < scanSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      setScanProgress((i + 1) * 10);
    }

    // Generate insights
    const newInsights = await generateInsights();
    setInsights(newInsights);

    // Generate connections and flows
    setQuantumConnections(generateQuantumConnections());
    setEnergyFlows(generateEnergyFlows());
    setAuraFields(generateAuraFields());

    setIsScanning(false);
    setScanProgress(0);
  }, [generateInsights, generateQuantumConnections, generateEnergyFlows, generateAuraFields]);

  // Toggle third eye
  const toggleThirdEye = useCallback(async () => {
    const newState = !isActive;
    setIsActive(newState);

    if (newState) {
      // Start scanning when activated
      await performScan();

      // Start animation
      controls.start({
        opacity: 1,
        transition: { duration: 1, ease: "easeInOut" }
      });
    } else {
      // Stop animation
      controls.start({
        opacity: 0,
        transition: { duration: 0.5, ease: "easeInOut" }
      });
    }
  }, [isActive, performScan, controls]);

  // Draw quantum connections on canvas
  const drawQuantumConnections = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.001;

    quantumConnections.forEach(connection => {
      // Find positions of connected elements (simplified)
      const fromElement = document.querySelector(`[data-agent-id="${connection.fromId}"]`);
      const toElement = document.querySelector(`[data-agent-id="${connection.toId}"]`);

      if (fromElement && toElement) {
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();

        const fromX = fromRect.left + fromRect.width / 2;
        const fromY = fromRect.top + fromRect.height / 2;
        const toX = toRect.left + toRect.width / 2;
        const toY = toRect.top + toRect.height / 2;

        // Draw connection with animation
        const pulse = Math.sin(time * 2 + connection.phase) * 0.5 + 0.5;

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);

        // Create curved path for quantum connections
        const controlX = (fromX + toX) / 2 + Math.sin(time + connection.phase) * 50;
        const controlY = (fromY + toY) / 2 + Math.cos(time + connection.phase) * 50;

        ctx.quadraticCurveTo(controlX, controlY, toX, toY);

        ctx.strokeStyle = connection.color + Math.floor(pulse * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = (connection.strength / 100) * 3 * pulse;
        ctx.stroke();

        // Draw energy particles along the connection
        const particleCount = 3;
        for (let i = 0; i < particleCount; i++) {
          const t = ((time * 0.5 + i / particleCount) % 1);
          const x = (1 - t) * (1 - t) * fromX + 2 * (1 - t) * t * controlX + t * t * toX;
          const y = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * controlY + t * t * toY;

          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = connection.color;
          ctx.fill();
        }
      }
    });

    animationRef.current = requestAnimationFrame(drawQuantumConnections);
  }, [quantumConnections]);

  // Initialize and cleanup
  useEffect(() => {
    if (isActive && quantumConnections.length > 0) {
      drawQuantumConnections();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, quantumConnections, drawQuantumConnections]);

  // Auto-refresh insights
  useEffect(() => {
    if (isActive && thirdEyeConfig.autoReveal) {
      const interval = setInterval(() => {
        performScan();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isActive, thirdEyeConfig.autoReveal, performScan]);

  // Get insight icon
  const getInsightIcon = (type: ThirdEyeInsight['type']) => {
    switch (type) {
      case 'OPPORTUNITY':
        return <TrendingUp className="w-4 h-4" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4" />;
      case 'HIDDEN_LINK':
        return <Zap className="w-4 h-4" />;
      case 'PREDICTION':
        return <Brain className="w-4 h-4" />;
      case 'QUANTUM_ENTANGLEMENT':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Third Eye Trigger Button */}
      <motion.button
        onClick={toggleThirdEye}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 p-4 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-white/10 backdrop-blur-md transition-all duration-500 ${isActive ? 'bg-purple-900/80 scale-110' : 'bg-black/60 hover:scale-105'
          }`}
        whileHover={{ boxShadow: "0 0 50px rgba(139,92,246,0.8)" }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <Eye className={`w-8 h-8 ${isActive ? 'text-purple-300' : 'text-gray-400'}`} />
          {isScanning && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-purple-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>
      </motion.button>

      {/* Third Vision Layer */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 pointer-events-none"
          >
            {/* Ambient Effect */}
            <div className="absolute inset-0 bg-purple-900/10 backdrop-filter backdrop-contrast-125 mix-blend-overlay" />

            {/* Scanlines Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent opacity-20 animate-pulse" />

            {/* Quantum Connection Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ mixBlendMode: 'screen' }}
            />

            {/* Scanning Progress */}
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 border border-purple-500/50 px-6 py-3 rounded-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-purple-300 text-sm font-medium">Scanning Quantum Realm</span>
                  <span className="text-purple-400 text-sm">{scanProgress}%</span>
                </div>
              </motion.div>
            )}

            {/* Insight Cards */}
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`absolute bg-black/80 border p-3 rounded-lg backdrop-blur-md pointer-events-auto cursor-pointer transform transition-all duration-300 hover:scale-105 ${insight.severity === 'critical' ? 'border-red-500/50' :
                  insight.severity === 'high' ? 'border-orange-500/50' :
                    insight.severity === 'medium' ? 'border-yellow-500/50' :
                      'border-blue-500/50'
                  }`}
                style={{
                  top: `${20 + (index % 3) * 150}px`,
                  left: `${20 + Math.floor(index / 3) * 300}px`,
                  borderColor: insight.auraColor,
                  boxShadow: `0 0 20px ${insight.auraColor}40`
                }}
                onClick={() => onInsightClick?.(insight)}
              >
                <div className={`flex items-center gap-2 text-xs font-bold mb-2 ${insight.type === 'OPPORTUNITY' ? 'text-green-300' :
                  insight.type === 'WARNING' ? 'text-red-300' :
                    insight.type === 'PREDICTION' ? 'text-purple-300' :
                      'text-blue-300'
                  }`}>
                  {getInsightIcon(insight.type)}
                  <span>{insight.title}</span>
                </div>

                <p className="text-xs text-gray-300 mb-2">{insight.insight}</p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Probability:</span>
                    <span className={`font-bold ${insight.probability > 80 ? 'text-green-400' :
                      insight.probability > 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>{insight.probability}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-blue-400 font-bold">{insight.confidence}%</span>
                  </div>
                </div>

                {insight.actionItems && insight.actionItems.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Recommended Actions:</div>
                    {insight.actionItems.slice(0, 2).map((action, i) => (
                      <div key={i} className="text-xs text-purple-300">• {action}</div>
                    ))}
                  </div>
                )}

                {/* Visual effect indicator */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${insight.visualEffect === 'pulse' ? 'animate-pulse' :
                  insight.visualEffect === 'glow' ? 'animate-ping' :
                    insight.visualEffect === 'wave' ? 'animate-bounce' :
                      'animate-spin'
                  }`} style={{ backgroundColor: insight.auraColor }} />
              </motion.div>
            ))}

            {/* Aura Fields */}
            {auraFields.map(aura => (
              <div
                key={aura.targetId}
                className="absolute pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <motion.div
                  className={`rounded-full blur-xl ${aura.pattern === 'pulse' ? 'animate-pulse' :
                    aura.pattern === 'gradient' ? 'animate-pulse' :
                      'animate-bounce'
                    }`}
                  style={{
                    width: aura.radius * 2,
                    height: aura.radius * 2,
                    backgroundColor: aura.color,
                    opacity: aura.intensity / 100
                  }}
                />
              </div>
            ))}

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getCosmicConnectionColor = (frequency: string): string => {
  const freq = parseInt(frequency.replace('Hz', ''));
  const hue = (freq % 360);
  return `hsl(${hue}, 80%, 60%)`;
};

export default ThirdEyeOverlay;