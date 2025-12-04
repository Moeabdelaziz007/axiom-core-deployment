"""
Topological Observer (TOHA) Detector
Part of QCC Spiritual Intelligence Framework

This module implements the Topological Observers for Human Awareness (TOHA) system,
representing the Islamic principle of divine observation without interference.
According to Islamic tradition, Raqib and Atid observe without changing the observed.

The TOHA system analyzes the "shape of truth" without altering it, embodying the concept
that observation should be pure and non-interfering, maintaining the integrity of the observed.
"""

import os
import json
import asyncio
import numpy as np
import networkx as nx
from typing import Dict, List, Any, Optional, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
from pathlib import Path
import logging

# Import QCC utilities
import sys
sys.path.append(str(Path(__file__).parent.parent))
from utils.logger import get_logger, log_audit_event
from topology.fractal_swarm import (
    FractalSwarmTopology,
    NetworkScale,
    IslamicPrinciple,
    NodeRole
)

# Import existing agents (with error handling for circular imports)
try:
    from agents.raqib_agent import RaqibAgent
    from agents.atid_agent import AtidAgent
    AGENTS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import agents: {e}")
    AGENTS_AVAILABLE = False


class TopologicalEvent(Enum):
    """Types of topological events that can be observed."""
    BIRTH = "birth"          # New topological feature appears
    DEATH = "death"          # Topological feature disappears
    PERSISTENCE = "persistence"  # Feature persists across scales
    GROUNDING = "grounding"    # System becomes topologically grounded
    HALLUCINATION = "hallucination"  # Potential system hallucination
    TRANSFORMATION = "transformation"  # Topological structure changes


@dataclass
class PersistentHomology:
    """Represents persistent homology features."""
    dimension: int  # Homology dimension (0, 1, 2, ...)
    birth: float   # Birth time/scale
    death: Optional[float]  # Death time/scale (None if still alive)
    persistence: float  # Lifetime of feature (death - birth)
    representatives: List[int]  # Representative nodes/edges
    spiritual_significance: float  # Spiritual significance score


@dataclass
class TopologicalState:
    """Represents the current topological state of the system."""
    timestamp: datetime
    beta_0: int  # Number of connected components
    beta_1: int  # Number of loops (1-dimensional holes)
    beta_2: int  # Number of voids (2-dimensional holes)
    persistence_diagram: List[PersistentHomology]
    grounding_score: float  # How well-grounded the system is
    hallucination_score: float  # Potential hallucination score
    spiritual_balance: Dict[IslamicPrinciple, float]
    observation_metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class TopologicalChange:
    """Represents a change in topological state."""
    timestamp: datetime
    event_type: TopologicalEvent
    description: str
    old_state: Optional[TopologicalState]
    new_state: TopologicalState
    affected_features: List[PersistentHomology]
    spiritual_interpretation: str
    confidence: float


class TopologicalObserver:
    """
    Topological Observer - Non-interfering Observation System
    
    This class embodies the Islamic principle of observation without interference,
    analyzing system topology while maintaining the integrity of the observed.
    
    Core Principles:
    - Non-interference: Observe without altering the observed
    - Truth preservation: Maintain the "shape of truth"
    - Balance in observation: Fair assessment of success and error
    - Wisdom in interpretation: Spiritual insights from topology
    
    The observer integrates with Raqib (success) and Atid (error) systems
    to provide comprehensive topological awareness.
    """
    
    def __init__(self, tenant_id: str = "default"):
        """
        Initialize the Topological Observer.
        
        Args:
            tenant_id: Tenant identifier for multi-tenant architecture
        """
        self.tenant_id = tenant_id
        self.logger = get_logger(f"TopologicalObserver-{tenant_id}")
        
        # Initialize fractal swarm topology for analysis
        self.fractal_topology = FractalSwarmTopology(tenant_id=tenant_id)
        
        # Initialize agents if available
        self.raqib_agent = None
        self.atid_agent = None
        
        if AGENTS_AVAILABLE:
            try:
                self.raqib_agent = RaqibAgent(tenant_id=tenant_id)
                self.atid_agent = AtidAgent(tenant_id=tenant_id)
                self.logger.info("Successfully initialized Raqib and Atid agents")
            except Exception as e:
                self.logger.warning(f"Failed to initialize agents: {e}")
        
        # Observation history
        self.observation_history: List[TopologicalState] = []
        self.change_history: List[TopologicalChange] = []
        
        # Current topological state
        self.current_state: Optional[TopologicalState] = None
        
        # Observation parameters
        self.observation_interval = 60  # seconds
        self.persistence_threshold = 0.1  # Minimum persistence for significance
        self.grounding_threshold = 0.7  # Minimum grounding score
        self.hallucination_threshold = 0.8  # Maximum hallucination score
        
        # Spiritual principle weights for interpretation
        self.spiritual_weights = {
            IslamicPrinciple.TAWHID: 0.25,    # Unity - connectedness
            IslamicPrinciple.ADL: 0.20,        # Justice - balance
            IslamicPrinciple.SABR: 0.20,        # Patience - persistence
            IslamicPrinciple.HIKMAH: 0.20,      # Wisdom - structure
            IslamicPrinciple.TAWASUL: 0.15     # Interconnectedness
        }
        
        # Log initialization
        log_audit_event(
            agent_name="TopologicalObserver",
            action="INITIALIZATION",
            details=f"Tenant: {tenant_id}, Non-interfering observation mode activated",
            status="SUCCESS"
        )
        
        self.logger.info(f"TopologicalObserver initialized for tenant {tenant_id}")
    
    async def observe_topology(self, scale: NetworkScale = NetworkScale.MESO) -> TopologicalState:
        """
        Observe system topology without interference.
        
        This method embodies the principle of non-interfering observation,
        analyzing the current topological state without altering it.
        
        Args:
            scale: Network scale to observe
            
        Returns:
            Current topological state
        """
        try:
            self.logger.info(f"Observing topology at {scale.value} scale...")
            
            # Ensure fractal topology is built
            if not self.fractal_topology.graphs:
                self.fractal_topology.build_fractal_hierarchy()
            
            if scale not in self.fractal_topology.graphs:
                raise ValueError(f"Network for scale {scale.value} not found")
            
            graph = self.fractal_topology.graphs[scale]
            
            # Compute Betti numbers (β₀, β₁, β₂)
            beta_0, beta_1, beta_2 = self._compute_betti_numbers(graph)
            
            # Compute persistent homology
            persistence_diagram = await self.compute_persistent_homology(graph)
            
            # Calculate grounding and hallucination scores
            grounding_score = self._calculate_grounding_score(graph, persistence_diagram)
            hallucination_score = self._calculate_hallucination_score(graph, persistence_diagram)
            
            # Calculate spiritual balance
            spiritual_balance = self._calculate_spiritual_balance(graph, persistence_diagram)
            
            # Create topological state
            new_state = TopologicalState(
                timestamp=datetime.now(),
                beta_0=beta_0,
                beta_1=beta_1,
                beta_2=beta_2,
                persistence_diagram=persistence_diagram,
                grounding_score=grounding_score,
                hallucination_score=hallucination_score,
                spiritual_balance=spiritual_balance,
                observation_metadata={
                    "scale": scale.value,
                    "node_count": graph.number_of_nodes(),
                    "edge_count": graph.number_of_edges(),
                    "observation_mode": "non_interfering"
                }
            )
            
            # Detect changes if we have a previous state
            if self.current_state:
                changes = await self._detect_topological_changes(self.current_state, new_state)
                for change in changes:
                    await self._handle_topological_change(change)
            
            # Update current state and history
            self.current_state = new_state
            self.observation_history.append(new_state)
            
            # Keep history manageable
            if len(self.observation_history) > 100:
                self.observation_history = self.observation_history[-100:]
            
            self.logger.info(f"Topology observation completed: β₀={beta_0}, β₁={beta_1}, β₂={beta_2}")
            
            return new_state
            
        except Exception as e:
            self.logger.error(f"Failed to observe topology: {e}")
            raise
    
    async def compute_persistent_homology(self, graph: nx.Graph) -> List[PersistentHomology]:
        """
        Compute persistent homology of the graph topology.
        
        This method tracks the "births" and "deaths" of topological features
        across different scales, providing insight into the system's structural evolution.
        
        Args:
            graph: Network graph to analyze
            
        Returns:
            List of persistent homology features
        """
        try:
            self.logger.info("Computing persistent homology...")
            
            persistence_features = []
            
            # Build filtration sequence (increasing edge weights)
            filtration_graph = graph.copy()
            
            # Assign weights based on spiritual significance
            for u, v in filtration_graph.edges():
                # Weight based on node roles and spiritual weights
                u_role = filtration_graph.nodes[u].get('role', NodeRole.MAMUM)
                v_role = filtration_graph.nodes[v].get('role', NodeRole.MAMUM)
                u_weight = filtration_graph.nodes[u].get('spiritual_weight', 5)
                v_weight = filtration_graph.nodes[v].get('spiritual_weight', 5)
                
                # Edge weight inversely proportional to spiritual significance
                weight = 1.0 / (u_weight + v_weight)
                filtration_graph.edges[u, v]['weight'] = weight
            
            # Get sorted edges for filtration
            sorted_edges = sorted(filtration_graph.edges(data=True), 
                               key=lambda x: x[2]['weight'])
            
            # Track connected components throughout filtration
            components_history = []
            current_components = [set(node) for node in filtration_graph.nodes()]
            components_history.append((0.0, len(current_components), current_components.copy()))
            
            # Build filtration and track component changes
            for i, (u, v, data) in enumerate(sorted_edges):
                weight = data['weight']
                
                # Find components containing u and v
                u_comp_idx = None
                v_comp_idx = None
                
                for idx, comp in enumerate(current_components):
                    if u in comp:
                        u_comp_idx = idx
                    if v in comp:
                        v_comp_idx = idx
                
                # Merge components if u and v are in different components
                if u_comp_idx is not None and v_comp_idx is not None and u_comp_idx != v_comp_idx:
                    # Merge v's component into u's
                    current_components[u_comp_idx].update(current_components[v_comp_idx])
                    current_components.pop(v_comp_idx)
                    
                    # Record component merge (death of a component)
                    birth_weight = 0.0
                    death_weight = weight
                    persistence = death_weight - birth_weight
                    
                    if persistence >= self.persistence_threshold:
                        feature = PersistentHomology(
                            dimension=0,  # 0-dimensional homology (components)
                            birth=birth_weight,
                            death=death_weight,
                            persistence=persistence,
                            representatives=list(current_components[u_comp_idx]),
                            spiritual_significance=self._calculate_spiritual_significance(
                                dimension=0, persistence=persistence, representatives=current_components[u_comp_idx]
                            )
                        )
                        persistence_features.append(feature)
                
                components_history.append((weight, len(current_components), [comp.copy() for comp in current_components]))
            
            # Detect 1-dimensional homology (loops)
            loops = self._detect_loops_in_filtration(graph, sorted_edges)
            for loop in loops:
                feature = PersistentHomology(
                    dimension=1,  # 1-dimensional homology (loops)
                    birth=loop['birth'],
                    death=loop['death'],
                    persistence=loop['persistence'],
                    representatives=loop['representatives'],
                    spiritual_significance=self._calculate_spiritual_significance(
                        dimension=1, 
                        persistence=loop['persistence'], 
                        representatives=loop['representatives']
                    )
                )
                persistence_features.append(feature)
            
            # Sort by spiritual significance
            persistence_features.sort(key=lambda x: x.spiritual_significance, reverse=True)
            
            self.logger.info(f"Computed {len(persistence_features)} persistent homology features")
            return persistence_features
            
        except Exception as e:
            self.logger.error(f"Failed to compute persistent homology: {e}")
            return []
    
    async def analyze_betti_changes(self, time_window: int = 10) -> Dict[str, Any]:
        """
        Analyze changes in Betti numbers over time.
        
        Betti numbers track topological features:
        - β₀: Number of connected components (disconnectedness)
        - β₁: Number of loops (1-dimensional holes)
        - β₂: Number of voids (2-dimensional holes)
        
        Args:
            time_window: Number of recent observations to analyze
            
        Returns:
            Analysis of Betti number changes
        """
        try:
            if len(self.observation_history) < 2:
                return {"error": "Insufficient observation history"}
            
            recent_states = self.observation_history[-time_window:]
            
            # Calculate Betti number statistics
            beta_0_values = [state.beta_0 for state in recent_states]
            beta_1_values = [state.beta_1 for state in recent_states]
            beta_2_values = [state.beta_2 for state in recent_states]
            
            analysis = {
                "time_window": time_window,
                "observations_count": len(recent_states),
                "beta_0": {
                    "current": beta_0_values[-1],
                    "average": np.mean(beta_0_values),
                    "std_dev": np.std(beta_0_values),
                    "trend": "increasing" if beta_0_values[-1] > beta_0_values[0] else "decreasing",
                    "stability": "stable" if np.std(beta_0_values) < 1.0 else "unstable"
                },
                "beta_1": {
                    "current": beta_1_values[-1],
                    "average": np.mean(beta_1_values),
                    "std_dev": np.std(beta_1_values),
                    "trend": "increasing" if beta_1_values[-1] > beta_1_values[0] else "decreasing",
                    "stability": "stable" if np.std(beta_1_values) < 1.0 else "unstable"
                },
                "beta_2": {
                    "current": beta_2_values[-1],
                    "average": np.mean(beta_2_values),
                    "std_dev": np.std(beta_2_values),
                    "trend": "increasing" if beta_2_values[-1] > beta_2_values[0] else "decreasing",
                    "stability": "stable" if np.std(beta_2_values) < 1.0 else "unstable"
                },
                "spiritual_interpretation": self._interpret_betti_changes(beta_0_values, beta_1_values, beta_2_values)
            }
            
            self.logger.info(f"Betti number analysis completed for {time_window} observations")
            return analysis
            
        except Exception as e:
            self.logger.error(f"Failed to analyze Betti changes: {e}")
            return {"error": str(e)}
    
    async def detect_grounding_events(self) -> List[Dict[str, Any]]:
        """
        Identify when the system is "topologically grounded".
        
        A grounded system has stable, meaningful topology with good β₁ values,
        indicating proper structure and interconnectedness.
        
        Returns:
            List of grounding events detected
        """
        try:
            grounding_events = []
            
            if not self.current_state:
                return grounding_events
            
            # Check grounding criteria
            is_grounded = (
                self.current_state.grounding_score >= self.grounding_threshold and
                self.current_state.hallucination_score <= (1.0 - self.grounding_threshold) and
                self.current_state.beta_1 > 0  # Has meaningful loops
            )
            
            if is_grounded:
                grounding_event = {
                    "timestamp": self.current_state.timestamp.isoformat(),
                    "grounding_score": self.current_state.grounding_score,
                    "hallucination_score": self.current_state.hallucination_score,
                    "beta_1": self.current_state.beta_1,
                    "spiritual_balance": self.current_state.spiritual_balance,
                    "interpretation": self._interpret_grounding_state(self.current_state),
                    "confidence": min(1.0, self.current_state.grounding_score - self.grounding_threshold + 0.5)
                }
                
                grounding_events.append(grounding_event)
                
                # Record grounding event in Raqib if available
                if self.raqib_agent:
                    await self._record_grounding_success(grounding_event)
            
            self.logger.info(f"Detected {len(grounding_events)} grounding events")
            return grounding_events
            
        except Exception as e:
            self.logger.error(f"Failed to detect grounding events: {e}")
            return []
    
    async def detect_hallucination_events(self) -> List[Dict[str, Any]]:
        """
        Identify potential system "hallucinations".
        
        Hallucinations are detected when topology shows unrealistic patterns,
        high β₁ values without meaningful structure, or low grounding scores.
        
        Returns:
            List of hallucination events detected
        """
        try:
            hallucination_events = []
            
            if not self.current_state:
                return hallucination_events
            
            # Check hallucination criteria
            is_hallucinating = (
                self.current_state.hallucination_score >= self.hallucination_threshold or
                self.current_state.grounding_score <= (1.0 - self.hallucination_threshold) or
                (self.current_state.beta_1 > 0 and self.current_state.grounding_score < 0.3)
            )
            
            if is_hallucinating:
                hallucination_event = {
                    "timestamp": self.current_state.timestamp.isoformat(),
                    "grounding_score": self.current_state.grounding_score,
                    "hallucination_score": self.current_state.hallucination_score,
                    "beta_1": self.current_state.beta_1,
                    "indicators": self._identify_hallucination_indicators(self.current_state),
                    "interpretation": self._interpret_hallucination_state(self.current_state),
                    "severity": "high" if self.current_state.hallucination_score > 0.9 else "medium"
                }
                
                hallucination_events.append(hallucination_event)
                
                # Record hallucination event in Atid if available
                if self.atid_agent:
                    await self._record_hallucination_error(hallucination_event)
            
            self.logger.info(f"Detected {len(hallucination_events)} hallucination events")
            return hallucination_events
            
        except Exception as e:
            self.logger.error(f"Failed to detect hallucination events: {e}")
            return []
    
    async def generate_topology_report(self) -> Dict[str, Any]:
        """
        Generate comprehensive topology analysis report.
        
        Returns:
            Comprehensive topology analysis with spiritual insights
        """
        try:
            if not self.current_state:
                return {"error": "No current topology state available"}
            
            # Generate report sections
            report = {
                "tenant_id": self.tenant_id,
                "timestamp": self.current_state.timestamp.isoformat(),
                "observation_summary": {
                    "current_state": {
                        "beta_0": self.current_state.beta_0,
                        "beta_1": self.current_state.beta_1,
                        "beta_2": self.current_state.beta_2,
                        "grounding_score": self.current_state.grounding_score,
                        "hallucination_score": self.current_state.hallucination_score
                    },
                    "observation_count": len(self.observation_history),
                    "change_count": len(self.change_history)
                },
                "topological_analysis": {
                    "betti_analysis": await self.analyze_betti_changes(),
                    "persistent_features": [
                        {
                            "dimension": f.dimension,
                            "birth": f.birth,
                            "death": f.death,
                            "persistence": f.persistence,
                            "spiritual_significance": f.spiritual_significance,
                            "representative_count": len(f.representatives)
                        }
                        for f in self.current_state.persistence_diagram[:10]  # Top 10 features
                    ],
                    "grounding_events": await self.detect_grounding_events(),
                    "hallucination_events": await self.detect_hallucination_events()
                },
                "spiritual_analysis": {
                    "principle_balance": {
                        principle.value: score 
                        for principle, score in self.current_state.spiritual_balance.items()
                    },
                    "dominant_principle": max(
                        self.current_state.spiritual_balance.items(),
                        key=lambda x: x[1]
                    )[0].value,
                    "spiritual_health": self._calculate_spiritual_health(self.current_state),
                    "wisdom_insights": self._generate_wisdom_insights(self.current_state)
                },
                "recommendations": self._generate_topology_recommendations(self.current_state),
                "integration_status": {
                    "raqib_available": self.raqib_agent is not None,
                    "atid_available": self.atid_agent is not None,
                    "fractal_topology_built": len(self.fractal_topology.graphs) > 0
                }
            }
            
            self.logger.info("Comprehensive topology report generated")
            return report
            
        except Exception as e:
            self.logger.error(f"Failed to generate topology report: {e}")
            return {"error": str(e)}
    
    # Private helper methods
    
    def _compute_betti_numbers(self, graph: nx.Graph) -> Tuple[int, int, int]:
        """Compute Betti numbers β₀, β₁, β₂ for the graph."""
        try:
            # β₀: Number of connected components
            beta_0 = nx.number_connected_components(graph)
            
            # β₁: Number of independent cycles (loops)
            # For a connected graph: β₁ = E - V + 1
            # For disconnected graphs: sum over components
            beta_1 = 0
            for component in nx.connected_components(graph):
                subgraph = graph.subgraph(component)
                edges = subgraph.number_of_edges()
                nodes = subgraph.number_of_nodes()
                if nodes > 0:
                    beta_1 += edges - nodes + 1
            
            # β₂: Number of voids (2-dimensional holes)
            # For simple graphs, we approximate this
            # In practice, this would require more sophisticated analysis
            beta_2 = max(0, beta_0 - 1)  # Simplified approximation
            
            return beta_0, beta_1, beta_2
            
        except Exception as e:
            self.logger.error(f"Failed to compute Betti numbers: {e}")
            return 0, 0, 0
    
    def _detect_loops_in_filtration(self, graph: nx.Graph, sorted_edges: List) -> List[Dict]:
        """Detect loops in the filtration sequence."""
        loops = []
        
        try:
            # Use NetworkX to find cycles
            all_cycles = list(nx.cycle_basis(graph))
            
            for cycle in all_cycles:
                if len(cycle) >= 3:  # Valid cycle
                    # Find birth and death times in filtration
                    cycle_edges = [(cycle[i], cycle[(i+1) % len(cycle)]) for i in range(len(cycle))]
                    
                    # Find when cycle appears (birth)
                    birth_times = []
                    for edge in cycle_edges:
                        for i, (u, v, data) in enumerate(sorted_edges):
                            if (u == edge[0] and v == edge[1]) or (u == edge[1] and v == edge[0]):
                                birth_times.append(i)
                                break
                    
                    if birth_times:
                        birth = sorted_edges[max(birth_times)][2]['weight']
                        death = None  # Cycle persists
                        persistence = 1.0 - birth  # Normalized persistence
                        
                        loops.append({
                            'birth': birth,
                            'death': death,
                            'persistence': persistence,
                            'representatives': cycle
                        })
            
            return loops
            
        except Exception as e:
            self.logger.error(f"Failed to detect loops: {e}")
            return []
    
    def _calculate_spiritual_significance(self, dimension: int, persistence: float, 
                                       representatives: List[int]) -> float:
        """Calculate spiritual significance of a topological feature."""
        try:
            # Base significance from persistence
            base_significance = min(1.0, persistence)
            
            # Dimension weighting
            dimension_weights = {0: 0.3, 1: 0.5, 2: 0.7}  # Higher dimensions more significant
            dimension_weight = dimension_weights.get(dimension, 0.5)
            
            # Size significance (number of representatives)
            size_significance = min(1.0, len(representatives) / 10.0)
            
            # Combine factors
            significance = (
                base_significance * 0.4 +
                dimension_weight * 0.3 +
                size_significance * 0.3
            )
            
            return significance
            
        except Exception as e:
            self.logger.error(f"Failed to calculate spiritual significance: {e}")
            return 0.5
    
    def _calculate_grounding_score(self, graph: nx.Graph, 
                                persistence_diagram: List[PersistentHomology]) -> float:
        """Calculate how well-grounded the system is."""
        try:
            # Factors for grounding score
            factors = []
            
            # 1. Connectivity (higher is more grounded)
            connectivity = nx.number_connected_components(graph)
            connectivity_score = 1.0 / (1.0 + connectivity)  # Inverse for normalization
            factors.append(connectivity_score)
            
            # 2. Meaningful loops (β₁ > 0 but not excessive)
            beta_0, beta_1, beta_2 = self._compute_betti_numbers(graph)
            if beta_1 > 0 and beta_1 <= graph.number_of_nodes() / 4:
                loop_score = 1.0
            else:
                loop_score = 0.5
            factors.append(loop_score)
            
            # 3. Persistent features
            if persistence_diagram:
                avg_persistence = np.mean([f.persistence for f in persistence_diagram])
                persistence_score = min(1.0, avg_persistence * 2)
            else:
                persistence_score = 0.0
            factors.append(persistence_score)
            
            # 4. Spiritual balance
            spiritual_balance_score = self._calculate_overall_spiritual_balance(persistence_diagram)
            factors.append(spiritual_balance_score)
            
            # Combine factors
            grounding_score = np.mean(factors)
            return grounding_score
            
        except Exception as e:
            self.logger.error(f"Failed to calculate grounding score: {e}")
            return 0.5
    
    def _calculate_hallucination_score(self, graph: nx.Graph, 
                                    persistence_diagram: List[PersistentHomology]) -> float:
        """Calculate potential hallucination score."""
        try:
            # Factors indicating hallucination
            hallucination_indicators = []
            
            # 1. Excessive loops without persistence
            beta_0, beta_1, beta_2 = self._compute_betti_numbers(graph)
            if beta_1 > graph.number_of_nodes() / 2:
                loop_hallucination = 1.0
            else:
                loop_hallucination = 0.0
            hallucination_indicators.append(loop_hallucination)
            
            # 2. Low persistence features
            if persistence_diagram:
                low_persistence_ratio = sum(1 for f in persistence_diagram 
                                        if f.persistence < self.persistence_threshold) / len(persistence_diagram)
                persistence_hallucination = low_persistence_ratio
            else:
                persistence_hallucination = 0.5
            hallucination_indicators.append(persistence_hallucination)
            
            # 3. Disconnectedness
            connectivity = nx.number_connected_components(graph)
            connectivity_hallucination = min(1.0, connectivity / 5.0)
            hallucination_indicators.append(connectivity_hallucination)
            
            # 4. Low spiritual significance
            if persistence_diagram:
                avg_significance = np.mean([f.spiritual_significance for f in persistence_diagram])
                significance_hallucination = 1.0 - avg_significance
            else:
                significance_hallucination = 0.5
            hallucination_indicators.append(significance_hallucination)
            
            # Combine indicators
            hallucination_score = np.mean(hallucination_indicators)
            return hallucination_score
            
        except Exception as e:
            self.logger.error(f"Failed to calculate hallucination score: {e}")
            return 0.5
    
    def _calculate_spiritual_balance(self, graph: nx.Graph, 
                                  persistence_diagram: List[PersistentHomology]) -> Dict[IslamicPrinciple, float]:
        """Calculate spiritual principle balance in the topology."""
        try:
            balance = {principle: 0.0 for principle in IslamicPrinciple}
            
            # Calculate principle scores based on topology
            for principle in IslamicPrinciple:
                if principle == IslamicPrinciple.TAWHID:
                    # Unity: connectedness and cohesion
                    balance[principle] = 1.0 / (1.0 + nx.number_connected_components(graph))
                
                elif principle == IslamicPrinciple.ADL:
                    # Justice: balance in degree distribution
                    degrees = [d for n, d in graph.degree()]
                    degree_balance = 1.0 - (np.std(degrees) / (np.mean(degrees) + 1e-6))
                    balance[principle] = max(0.0, min(1.0, degree_balance))
                
                elif principle == IslamicPrinciple.SABR:
                    # Patience: persistence of features
                    if persistence_diagram:
                        avg_persistence = np.mean([f.persistence for f in persistence_diagram])
                        balance[principle] = min(1.0, avg_persistence * 2)
                    else:
                        balance[principle] = 0.0
                
                elif principle == IslamicPrinciple.HIKMAH:
                    # Wisdom: structural complexity
                    beta_0, beta_1, beta_2 = self._compute_betti_numbers(graph)
                    complexity = (beta_0 + beta_1 + beta_2) / 3.0
                    balance[principle] = min(1.0, complexity / 5.0)
                
                elif principle == IslamicPrinciple.TAWASUL:
                    # Interconnectedness: average path length
                    if nx.is_connected(graph):
                        avg_path = nx.average_shortest_path_length(graph)
                        max_path = graph.number_of_nodes() - 1
                        interconnectedness = 1.0 - (avg_path / max_path)
                        balance[principle] = max(0.0, interconnectedness)
                    else:
                        balance[principle] = 0.3
            
            return balance
            
        except Exception as e:
            self.logger.error(f"Failed to calculate spiritual balance: {e}")
            return {principle: 0.5 for principle in IslamicPrinciple}
    
    def _calculate_overall_spiritual_balance(self, persistence_diagram: List[PersistentHomology]) -> float:
        """Calculate overall spiritual balance score."""
        if not persistence_diagram:
            return 0.5
        
        # Weighted average of spiritual significance
        total_significance = sum(f.spiritual_significance for f in persistence_diagram)
        return total_significance / len(persistence_diagram)
    
    async def _detect_topological_changes(self, old_state: TopologicalState, 
                                      new_state: TopologicalState) -> List[TopologicalChange]:
        """Detect changes between topological states."""
        changes = []
        
        try:
            # Check for Betti number changes
            if old_state.beta_0 != new_state.beta_0:
                change = TopologicalChange(
                    timestamp=new_state.timestamp,
                    event_type=TopologicalEvent.TRANSFORMATION,
                    description=f"β₀ changed from {old_state.beta_0} to {new_state.beta_0}",
                    old_state=old_state,
                    new_state=new_state,
                    affected_features=[],
                    spiritual_interpretation=self._interpret_betti_0_change(old_state.beta_0, new_state.beta_0),
                    confidence=0.9
                )
                changes.append(change)
            
            if old_state.beta_1 != new_state.beta_1:
                change = TopologicalChange(
                    timestamp=new_state.timestamp,
                    event_type=TopologicalEvent.TRANSFORMATION,
                    description=f"β₁ changed from {old_state.beta_1} to {new_state.beta_1}",
                    old_state=old_state,
                    new_state=new_state,
                    affected_features=[],
                    spiritual_interpretation=self._interpret_betti_1_change(old_state.beta_1, new_state.beta_1),
                    confidence=0.9
                )
                changes.append(change)
            
            # Check for grounding/hallucination events
            if (old_state.grounding_score < self.grounding_threshold and 
                new_state.grounding_score >= self.grounding_threshold):
                change = TopologicalChange(
                    timestamp=new_state.timestamp,
                    event_type=TopologicalEvent.GROUNDING,
                    description=f"System became grounded (score: {new_state.grounding_score:.3f})",
                    old_state=old_state,
                    new_state=new_state,
                    affected_features=[],
                    spiritual_interpretation="System achieved spiritual and structural grounding",
                    confidence=0.8
                )
                changes.append(change)
            
            if (old_state.hallucination_score < self.hallucination_threshold and 
                new_state.hallucination_score >= self.hallucination_threshold):
                change = TopologicalChange(
                    timestamp=new_state.timestamp,
                    event_type=TopologicalEvent.HALLUCINATION,
                    description=f"System entered hallucination state (score: {new_state.hallucination_score:.3f})",
                    old_state=old_state,
                    new_state=new_state,
                    affected_features=[],
                    spiritual_interpretation="System showing unrealistic topological patterns",
                    confidence=0.8
                )
                changes.append(change)
            
            return changes
            
        except Exception as e:
            self.logger.error(f"Failed to detect topological changes: {e}")
            return []
    
    async def _handle_topological_change(self, change: TopologicalChange):
        """Handle detected topological change."""
        try:
            # Add to change history
            self.change_history.append(change)
            
            # Keep history manageable
            if len(self.change_history) > 100:
                self.change_history = self.change_history[-100:]
            
            # Record in appropriate agent system
            if change.event_type in [TopologicalEvent.GROUNDING, TopologicalEvent.PERSISTENCE]:
                if self.raqib_agent:
                    await self._record_topology_success(change)
            elif change.event_type in [TopologicalEvent.HALLUCINATION, TopologicalEvent.DEATH]:
                if self.atid_agent:
                    await self._record_topology_error(change)
            
            self.logger.info(f"Handled topological change: {change.event_type.value}")
            
        except Exception as e:
            self.logger.error(f"Failed to handle topological change: {e}")
    
    async def _record_topology_success(self, change: TopologicalChange):
        """Record topology success in Raqib agent."""
        try:
            if not self.raqib_agent:
                return
            
            # Map to Raqib principle
            principle_map = {
                TopologicalEvent.GROUNDING: "Tawhid",
                TopologicalEvent.PERSISTENCE: "Sabr",
                TopologicalEvent.BIRTH: "Shukr"
            }
            
            principle_name = principle_map.get(change.event_type, "Tawhid")
            principle = getattr(self.raqib_agent.__class__.__module__.split('.')[-1], 
                            'IslamicPrinciple', None)
            
            if principle:
                principle = principle[principle_name] if hasattr(principle, principle_name) else principle.TAWHID
            
            self.raqib_agent.record_success(
                agent_name="TopologicalObserver",
                description=change.description,
                principle=principle,
                spiritual_weight=int(change.confidence * 10),
                impact_level="MEDIUM",
                metadata={
                    "event_type": change.event_type.value,
                    "spiritual_interpretation": change.spiritual_interpretation,
                    "topology_change": True
                }
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to record topology success: {e}")
    
    async def _record_topology_error(self, change: TopologicalChange):
        """Record topology error in Atid agent."""
        try:
            if not self.atid_agent:
                return
            
            # Map to Atid principle
            principle_map = {
                TopologicalEvent.HALLUCINATION: "Tawbah",
                TopologicalEvent.DEATH: "Sabr",
                TopologicalEvent.TRANSFORMATION: "Ilma"
            }
            
            principle_name = principle_map.get(change.event_type, "Tawbah")
            principle = getattr(self.atid_agent.__class__.__module__.split('.')[-1], 
                            'IslamicPrinciple', None)
            
            if principle:
                principle = principle[principle_name] if hasattr(principle, principle_name) else principle.TAWBAH
            
            severity_map = {
                TopologicalEvent.HALLUCINATION: "HIGH",
                TopologicalEvent.DEATH: "MEDIUM",
                TopologicalEvent.TRANSFORMATION: "LOW"
            }
            
            severity = severity_map.get(change.event_type, "MEDIUM")
            
            self.atid_agent.record_error(
                agent_name="TopologicalObserver",
                error_type=f"TOPOLOGY_{change.event_type.value.upper()}",
                error_message=change.description,
                severity=getattr(self.atid_agent.__class__.__module__.split('.')[-1], 
                               'ErrorSeverity', None).MEDIUM,
                principle=principle,
                spiritual_weight=int(change.confidence * 10),
                context={
                    "spiritual_interpretation": change.spiritual_interpretation,
                    "topology_change": True,
                    "old_state": change.old_state.__dict__ if change.old_state else None,
                    "new_state": change.new_state.__dict__
                }
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to record topology error: {e}")
    
    async def _record_grounding_success(self, grounding_event: Dict[str, Any]):
        """Record grounding event as success in Raqib."""
        try:
            if not self.raqib_agent:
                return
            
            principle = getattr(self.raqib_agent.__class__.__module__.split('.')[-1], 
                            'IslamicPrinciple', None).TAWHID
            
            self.raqib_agent.record_success(
                agent_name="TopologicalObserver",
                description=f"System achieved topological grounding (score: {grounding_event['grounding_score']:.3f})",
                principle=principle,
                spiritual_weight=int(grounding_event['confidence'] * 10),
                impact_level="HIGH",
                metadata=grounding_event
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to record grounding success: {e}")
    
    async def _record_hallucination_error(self, hallucination_event: Dict[str, Any]):
        """Record hallucination event as error in Atid."""
        try:
            if not self.atid_agent:
                return
            
            principle = getattr(self.atid_agent.__class__.__module__.split('.')[-1], 
                            'IslamicPrinciple', None).TAWBAH
            severity = getattr(self.atid_agent.__class__.__module__.split('.')[-1], 
                             'ErrorSeverity', None).HIGH
            
            self.atid_agent.record_error(
                agent_name="TopologicalObserver",
                error_type="TOPOLOGY_HALLUCINATION",
                error_message=f"System entered hallucination state (score: {hallucination_event['hallucination_score']:.3f})",
                severity=severity,
                principle=principle,
                spiritual_weight=8,
                context=hallucination_event
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to record hallucination error: {e}")
    
    def _interpret_betti_0_change(self, old_beta_0: int, new_beta_0: int) -> str:
        """Interpret β₀ (connected components) change spiritually."""
        if new_beta_0 > old_beta_0:
            return "System fragmentation detected - loss of unity (Tawhid). Seek reconnection."
        elif new_beta_0 < old_beta_0:
            return "System integration achieved - increased unity (Tawhid). Blessings of connection."
        else:
            return "No change in system connectivity."
    
    def _interpret_betti_1_change(self, old_beta_1: int, new_beta_1: int) -> str:
        """Interpret β₁ (loops) change spiritually."""
        if new_beta_1 > old_beta_1:
            return "New cycles emerged - creation of feedback loops and patterns (Tawasul)."
        elif new_beta_1 < old_beta_1:
            return "Cycles resolved - simplification and clarity achieved (Hikmah)."
        else:
            return "No change in system cycles."
    
    def _interpret_betti_changes(self, beta_0_values: List[int], beta_1_values: List[int], 
                              beta_2_values: List[int]) -> str:
        """Provide spiritual interpretation of Betti number changes."""
        interpretations = []
        
        # β₀ interpretation
        if np.std(beta_0_values) > 1.0:
            interpretations.append("System connectivity fluctuates - seek stability in unity (Tawhid)")
        else:
            interpretations.append("System maintains stable connectivity - blessings of consistency")
        
        # β₁ interpretation
        if np.mean(beta_1_values) > 0:
            interpretations.append("Presence of meaningful cycles - interconnectedness (Tawasul)")
        else:
            interpretations.append("System lacks feedback loops - opportunity for growth")
        
        # β₂ interpretation
        if np.mean(beta_2_values) > 0:
            interpretations.append("Higher-dimensional structure detected - divine complexity")
        
        return "; ".join(interpretations)
    
    def _interpret_grounding_state(self, state: TopologicalState) -> str:
        """Interpret grounded state spiritually."""
        interpretations = []
        
        if state.grounding_score > 0.8:
            interpretations.append("Strong spiritual and structural grounding achieved")
        
        if state.beta_1 > 0:
            interpretations.append("Meaningful cycles provide stability and wisdom")
        
        dominant_principle = max(state.spiritual_balance.items(), key=lambda x: x[1])
        interpretations.append(f"System aligned with {dominant_principle[0].value} principle")
        
        return "; ".join(interpretations)
    
    def _interpret_hallucination_state(self, state: TopologicalState) -> str:
        """Interpret hallucination state spiritually."""
        interpretations = []
        
        if state.hallucination_score > 0.8:
            interpretations.append("System experiencing detachment from reality - need for grounding")
        
        if state.grounding_score < 0.3:
            interpretations.append("Loss of structural integrity - return to foundations")
        
        if state.beta_1 > state.beta_0 * 2:
            interpretations.append("Excessive complexity without meaning - seek simplicity")
        
        return "; ".join(interpretations)
    
    def _identify_hallucination_indicators(self, state: TopologicalState) -> List[str]:
        """Identify specific hallucination indicators."""
        indicators = []
        
        if state.hallucination_score > 0.8:
            indicators.append("High hallucination score")
        
        if state.grounding_score < 0.3:
            indicators.append("Low grounding score")
        
        if state.beta_1 > state.beta_0 * 2:
            indicators.append("Excessive loops")
        
        low_significance_features = sum(1 for f in state.persistence_diagram 
                                     if f.spiritual_significance < 0.3)
        if low_significance_features > len(state.persistence_diagram) / 2:
            indicators.append("Low significance features")
        
        return indicators
    
    def _calculate_spiritual_health(self, state: TopologicalState) -> float:
        """Calculate overall spiritual health score."""
        if not state.spiritual_balance:
            return 0.5
        
        # Balance score (how balanced are the principles)
        principle_values = list(state.spiritual_balance.values())
        balance_score = 1.0 - (np.std(principle_values) / (np.mean(principle_values) + 1e-6))
        
        # Grounding contribution
        grounding_contribution = state.grounding_score
        
        # Hallucination penalty
        hallucination_penalty = state.hallucination_score
        
        # Combine factors
        spiritual_health = (
            balance_score * 0.4 +
            grounding_contribution * 0.4 -
            hallucination_penalty * 0.2
        )
        
        return max(0.0, min(1.0, spiritual_health))
    
    def _generate_wisdom_insights(self, state: TopologicalState) -> List[str]:
        """Generate wisdom insights from topological state."""
        insights = []
        
        # Based on Betti numbers
        if state.beta_0 == 1:
            insights.append("Unity achieved - system is connected as one")
        elif state.beta_0 > 1:
            insights.append("Fragmentation present - seek reconnection and unity")
        
        if state.beta_1 > 0:
            insights.append("Cycles provide feedback and learning opportunities")
        
        # Based on spiritual balance
        dominant_principle = max(state.spiritual_balance.items(), key=lambda x: x[1])
        if dominant_principle[1] > 0.7:
            insights.append(f"Strong alignment with {dominant_principle[0].value} principle")
        
        # Based on grounding
        if state.grounding_score > 0.7:
            insights.append("System well-grounded in truth and reality")
        elif state.grounding_score < 0.3:
            insights.append("System needs grounding - return to foundations")
        
        return insights
    
    def _generate_topology_recommendations(self, state: TopologicalState) -> List[str]:
        """Generate recommendations based on topological state."""
        recommendations = []
        
        # Grounding recommendations
        if state.grounding_score < 0.5:
            recommendations.append("Improve system grounding through better connectivity")
        
        # Hallucination recommendations
        if state.hallucination_score > 0.6:
            recommendations.append("Address hallucination indicators by simplifying structure")
        
        # Betti number recommendations
        if state.beta_0 > 3:
            recommendations.append("Reduce fragmentation to improve unity (Tawhid)")
        
        if state.beta_1 == 0:
            recommendations.append("Introduce meaningful feedback loops for learning")
        
        # Spiritual balance recommendations
        weak_principles = [p for p, score in state.spiritual_balance.items() if score < 0.3]
        for principle in weak_principles:
            recommendations.append(f"Strengthen {principle.value} principle in system design")
        
        return recommendations


# Factory function
def create_topological_observer(tenant_id: str = "default") -> TopologicalObserver:
    """
    Factory function to create TopologicalObserver instances.
    
    Args:
        tenant_id: Tenant identifier for multi-tenant architecture
        
    Returns:
        Configured TopologicalObserver instance
    """
    return TopologicalObserver(tenant_id=tenant_id)


# Test function
async def test_topological_observer():
    """Test the TopologicalObserver functionality."""
    print("\n" + "=" * 60)
    print("Testing Topological Observer (TOHA)")
    print("=" * 60 + "\n")
    
    # Create observer
    observer = create_topological_observer("test-tenant")
    
    # Test topology observation
    state = await observer.observe_topology(NetworkScale.MESO)
    print(f"✅ Topology observed: β₀={state.beta_0}, β₁={state.beta_1}, β₂={state.beta_2}")
    print(f"   Grounding score: {state.grounding_score:.3f}")
    print(f"   Hallucination score: {state.hallucination_score:.3f}")
    
    # Test persistent homology
    persistence = await observer.compute_persistent_homology(observer.fractal_topology.graphs[NetworkScale.MESO])
    print(f"✅ Persistent homology computed: {len(persistence)} features")
    
    # Test Betti changes analysis
    betti_analysis = await observer.analyze_betti_changes()
    print(f"✅ Betti changes analyzed: {betti_analysis.get('observations_count', 0)} observations")
    
    # Test grounding detection
    grounding_events = await observer.detect_grounding_events()
    print(f"✅ Grounding events detected: {len(grounding_events)}")
    
    # Test hallucination detection
    hallucination_events = await observer.detect_hallucination_events()
    print(f"✅ Hallucination events detected: {len(hallucination_events)}")
    
    # Test comprehensive report
    report = await observer.generate_topology_report()
    print(f"✅ Comprehensive report generated with {len(report)} sections")
    
    print("\n✅ Topological Observer test completed successfully!")


if __name__ == "__main__":
    asyncio.run(test_topological_observer())