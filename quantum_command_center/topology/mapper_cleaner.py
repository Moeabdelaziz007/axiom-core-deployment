"""
Mapper Algorithm for Topological Data Cleaning
Part of QCC Spiritual Intelligence Framework

This module implements the MapperAlgorithm class for topological data cleaning and processing,
representing the Islamic principle of purification and clarity in observation.

The Mapper algorithm filters noise, extracts meaningful features, and applies spiritual
significance filtering to ensure only truthful and meaningful topological patterns are preserved.
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
from sklearn.cluster import DBSCAN
from sklearn.metrics.pairwise import pairwise_distances
from scipy.spatial.distance import pdist, squareform

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
from topology.toha_detector import (
    TopologicalState,
    PersistentHomology,
    TopologicalObserver
)

# Import existing agents (with error handling for circular imports)
try:
    from agents.raqib_agent import RaqibAgent
    from agents.atid_agent import AtidAgent
    AGENTS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import agents: {e}")
    AGENTS_AVAILABLE = False


class FilterType(Enum):
    """Types of filters for topological data cleaning."""
    NOISE_REDUCTION = "noise_reduction"
    SIGNIFICANCE_FILTERING = "significance_filtering"
    SPIRITUAL_PURIFICATION = "spiritual_purification"
    STRUCTURAL_SIMPLIFICATION = "structural_simplification"
    TEMPORAL_SMOOTHING = "temporal_smoothing"


@dataclass
class CleaningParameters:
    """Parameters for topological data cleaning."""
    noise_threshold: float = 0.1
    significance_threshold: float = 0.3
    spiritual_purity_threshold: float = 0.7
    simplification_factor: float = 0.2
    temporal_window: int = 5
    filter_types: List[FilterType] = field(default_factory=lambda: list(FilterType))


@dataclass
class CleanedTopology:
    """Represents cleaned topological data."""
    original_state: TopologicalState
    cleaned_state: TopologicalState
    cleaning_applied: List[FilterType]
    noise_removed: int
    features_filtered: int
    spiritual_purity_improved: float
    cleaning_metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class FeatureExtraction:
    """Represents extracted significant topological features."""
    feature_id: str
    feature_type: str  # "persistent", "stable", "significant"
    persistence: float
    stability: float
    significance: float
    spiritual_alignment: Dict[IslamicPrinciple, float]
    representatives: List[int]
    metadata: Dict[str, Any] = field(default_factory=dict)


class MapperAlgorithm:
    """
    Mapper Algorithm for Topological Data Cleaning and Processing
    
    This class implements topological data cleaning techniques that embody Islamic
    principles of purification, clarity, and truth preservation.
    
    Core Principles:
    - Purification: Remove noise and artifacts from topology data
    - Clarity: Extract meaningful features and patterns
    - Truth preservation: Maintain the "shape of truth" while cleaning
    - Spiritual filtering: Filter based on Islamic principles
    - Balance: Fair treatment of all topological features
    
    The MapperAlgorithm integrates with FractalSwarmTopology and TopologicalObserver
    to provide clean, meaningful topological analysis.
    """
    
    def __init__(self, tenant_id: str = "default"):
        """
        Initialize Mapper Algorithm.
        
        Args:
            tenant_id: Tenant identifier for multi-tenant architecture
        """
        self.tenant_id = tenant_id
        self.logger = get_logger(f"MapperAlgorithm-{tenant_id}")
        
        # Initialize topology components
        self.fractal_topology = FractalSwarmTopology(tenant_id=tenant_id)
        self.topological_observer = TopologicalObserver(tenant_id=tenant_id)
        
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
        
        # Cleaning history
        self.cleaning_history: List[CleanedTopology] = []
        self.extraction_history: List[FeatureExtraction] = []
        
        # Default cleaning parameters
        self.cleaning_params = CleaningParameters()
        
        # Spiritual principle weights for filtering
        self.spiritual_filters = {
            IslamicPrinciple.TAWHID: {
                "min_alignment": 0.6,
                "feature_preference": "connectedness",
                "purity_requirement": 0.7
            },
            IslamicPrinciple.ADL: {
                "min_alignment": 0.5,
                "feature_preference": "balance",
                "purity_requirement": 0.6
            },
            IslamicPrinciple.SABR: {
                "min_alignment": 0.5,
                "feature_preference": "persistence",
                "purity_requirement": 0.6
            },
            IslamicPrinciple.HIKMAH: {
                "min_alignment": 0.7,
                "feature_preference": "complexity",
                "purity_requirement": 0.8
            },
            IslamicPrinciple.TAWASUL: {
                "min_alignment": 0.5,
                "feature_preference": "interconnectedness",
                "purity_requirement": 0.6
            }
        }
        
        # Log initialization
        log_audit_event(
            agent_name="MapperAlgorithm",
            action="INITIALIZATION",
            details=f"Tenant: {tenant_id}, Topological data cleaning initialized",
            status="SUCCESS"
        )
        
        self.logger.info(f"MapperAlgorithm initialized for tenant {tenant_id}")
    
    async def clean_topological_data(self, 
                                   raw_state: TopologicalState,
                                   custom_params: Optional[CleaningParameters] = None) -> CleanedTopology:
        """
        Clean topological data by removing noise and artifacts.
        
        This method embodies the principle of purification, removing impurities
        while preserving the essential truth of the topological structure.
        
        Args:
            raw_state: Raw topological state to clean
            custom_params: Optional custom cleaning parameters
            
        Returns:
            Cleaned topological data
        """
        try:
            self.logger.info("Starting topological data cleaning...")
            
            # Use custom parameters if provided
            params = custom_params or self.cleaning_params
            
            # Initialize cleaning metrics
            noise_removed = 0
            features_filtered = 0
            spiritual_purity_improved = 0.0
            cleaning_applied = []
            
            # Start with raw state
            cleaned_state = TopologicalState(
                timestamp=raw_state.timestamp,
                beta_0=raw_state.beta_0,
                beta_1=raw_state.beta_1,
                beta_2=raw_state.beta_2,
                persistence_diagram=raw_state.persistence_diagram.copy(),
                grounding_score=raw_state.grounding_score,
                hallucination_score=raw_state.hallucination_score,
                spiritual_balance=raw_state.spiritual_balance.copy(),
                observation_metadata=raw_state.observation_metadata.copy()
            )
            
            # Apply cleaning filters
            if FilterType.NOISE_REDUCTION in params.filter_types:
                cleaned_state, noise_count = await self._apply_noise_reduction(
                    cleaned_state, params.noise_threshold
                )
                noise_removed += noise_count
                cleaning_applied.append(FilterType.NOISE_REDUCTION)
            
            if FilterType.SIGNIFICANCE_FILTERING in params.filter_types:
                cleaned_state, filtered_count = await self._apply_significance_filtering(
                    cleaned_state, params.significance_threshold
                )
                features_filtered += filtered_count
                cleaning_applied.append(FilterType.SIGNIFICANCE_FILTERING)
            
            if FilterType.SPIRITUAL_PURIFICATION in params.filter_types:
                cleaned_state, purity_improvement = await self._apply_spiritual_purification(
                    cleaned_state, params.spiritual_purity_threshold
                )
                spiritual_purity_improved += purity_improvement
                cleaning_applied.append(FilterType.SPIRITUAL_PURIFICATION)
            
            if FilterType.STRUCTURAL_SIMPLIFICATION in params.filter_types:
                cleaned_state, simplification_count = await self._apply_structural_simplification(
                    cleaned_state, params.simplification_factor
                )
                features_filtered += simplification_count
                cleaning_applied.append(FilterType.STRUCTURAL_SIMPLIFICATION)
            
            if FilterType.TEMPORAL_SMOOTHING in params.filter_types:
                cleaned_state = await self._apply_temporal_smoothing(
                    cleaned_state, params.temporal_window
                )
                cleaning_applied.append(FilterType.TEMPORAL_SMOOTHING)
            
            # Create cleaned topology result
            cleaned_topology = CleanedTopology(
                original_state=raw_state,
                cleaned_state=cleaned_state,
                cleaning_applied=cleaning_applied,
                noise_removed=noise_removed,
                features_filtered=features_filtered,
                spiritual_purity_improved=spiritual_purity_improved,
                cleaning_metadata={
                    "parameters": params.__dict__,
                    "cleaning_timestamp": datetime.now().isoformat(),
                    "purity_before": self._calculate_spiritual_purity(raw_state),
                    "purity_after": self._calculate_spiritual_purity(cleaned_state)
                }
            )
            
            # Add to history
            self.cleaning_history.append(cleaned_topology)
            
            # Keep history manageable
            if len(self.cleaning_history) > 50:
                self.cleaning_history = self.cleaning_history[-50:]
            
            # Record cleaning success in Raqib if available
            if self.raqib_agent and spiritual_purity_improved > 0.1:
                await self._record_cleaning_success(cleaned_topology)
            
            self.logger.info(f"Topological data cleaning completed: {len(cleaning_applied)} filters applied")
            return cleaned_topology
            
        except Exception as e:
            self.logger.error(f"Failed to clean topological data: {e}")
            raise
    
    async def extract_significant_features(self, 
                                        state: TopologicalState,
                                        significance_threshold: float = 0.5) -> List[FeatureExtraction]:
        """
        Extract meaningful topological features from cleaned data.
        
        This method identifies features that are spiritually significant and
        structurally important, embodying the principle of clarity.
        
        Args:
            state: Topological state to analyze
            significance_threshold: Minimum significance score for features
            
        Returns:
            List of significant feature extractions
        """
        try:
            self.logger.info("Extracting significant topological features...")
            
            significant_features = []
            
            # Analyze persistent homology features
            for i, feature in enumerate(state.persistence_diagram):
                # Calculate feature significance
                significance = self._calculate_feature_significance(feature, state)
                
                if significance >= significance_threshold:
                    # Calculate stability
                    stability = self._calculate_feature_stability(feature, state)
                    
                    # Calculate spiritual alignment
                    spiritual_alignment = self._calculate_spiritual_alignment(feature, state)
                    
                    # Create feature extraction
                    extraction = FeatureExtraction(
                        feature_id=f"feature_{i}_{feature.dimension}d",
                        feature_type="persistent",
                        persistence=feature.persistence,
                        stability=stability,
                        significance=significance,
                        spiritual_alignment=spiritual_alignment,
                        representatives=feature.representatives,
                        metadata={
                            "dimension": feature.dimension,
                            "birth": feature.birth,
                            "death": feature.death,
                            "spiritual_significance": feature.spiritual_significance
                        }
                    )
                    
                    significant_features.append(extraction)
            
            # Extract stable features from history
            stable_features = await self._extract_stable_features(state, significance_threshold)
            significant_features.extend(stable_features)
            
            # Sort by significance
            significant_features.sort(key=lambda x: x.significance, reverse=True)
            
            # Add to extraction history
            self.extraction_history.extend(significant_features)
            
            # Keep history manageable
            if len(self.extraction_history) > 200:
                self.extraction_history = self.extraction_history[-200:]
            
            self.logger.info(f"Extracted {len(significant_features)} significant features")
            return significant_features
            
        except Exception as e:
            self.logger.error(f"Failed to extract significant features: {e}")
            return []
    
    async def compute_bottleneck_distance(self, 
                                        state1: TopologicalState,
                                        state2: TopologicalState) -> float:
        """
        Calculate bottleneck distance between two topological states.
        
        The bottleneck distance measures the similarity between persistence diagrams,
        providing a metric for comparing topological structures.
        
        Args:
            state1: First topological state
            state2: Second topological state
            
        Returns:
            Bottleneck distance between states
        """
        try:
            self.logger.info("Computing bottleneck distance...")
            
            # Extract persistence diagrams
            diag1 = [(f.birth, f.death if f.death is not None else f.birth + f.persistence) 
                       for f in state1.persistence_diagram]
            diag2 = [(f.birth, f.death if f.death is not None else f.birth + f.persistence) 
                       for f in state2.persistence_diagram]
            
            # Add points at infinity for features that never die
            for f in state1.persistence_diagram:
                if f.death is None:
                    diag1.append((f.birth, float('inf')))
            
            for f in state2.persistence_diagram:
                if f.death is None:
                    diag2.append((f.birth, float('inf')))
            
            # Compute bottleneck distance
            if not diag1 or not diag2:
                return float('inf')
            
            # Simplified bottleneck distance calculation
            # In practice, this would use more sophisticated algorithms
            distance = self._approximate_bottleneck_distance(diag1, diag2)
            
            self.logger.info(f"Bottleneck distance computed: {distance:.6f}")
            return distance
            
        except Exception as e:
            self.logger.error(f"Failed to compute bottleneck distance: {e}")
            return float('inf')
    
    async def apply_spiritual_filters(self, 
                                     features: List[FeatureExtraction],
                                     active_principles: List[IslamicPrinciple]) -> List[FeatureExtraction]:
        """
        Filter features based on Islamic spiritual principles.
        
        This method applies spiritual filtering to ensure only features
        aligned with Islamic principles are preserved.
        
        Args:
            features: List of features to filter
            active_principles: Islamic principles to apply
            
        Returns:
            Filtered list of features
        """
        try:
            self.logger.info(f"Applying spiritual filters for {len(active_principles)} principles...")
            
            filtered_features = []
            
            for feature in features:
                # Check alignment with each active principle
                is_aligned = True
                
                for principle in active_principles:
                    alignment_score = feature.spiritual_alignment.get(principle, 0.0)
                    min_alignment = self.spiritual_filters[principle]["min_alignment"]
                    
                    if alignment_score < min_alignment:
                        is_aligned = False
                        break
                
                if is_aligned:
                    filtered_features.append(feature)
            
            # Sort by overall spiritual alignment
            filtered_features.sort(
                key=lambda x: sum(x.spiritual_alignment.values()) / len(x.spiritual_alignment),
                reverse=True
            )
            
            self.logger.info(f"Spiritual filtering: {len(features)} -> {len(filtered_features)} features")
            return filtered_features
            
        except Exception as e:
            self.logger.error(f"Failed to apply spiritual filters: {e}")
            return features
    
    async def generate_clean_topology(self, 
                                    scale: NetworkScale = NetworkScale.MESO,
                                    custom_params: Optional[CleaningParameters] = None) -> CleanedTopology:
        """
        Generate clean topology by observing and cleaning in one step.
        
        This method combines observation, cleaning, and feature extraction
        to provide a complete clean topological analysis.
        
        Args:
            scale: Network scale to analyze
            custom_params: Optional custom cleaning parameters
            
        Returns:
            Complete cleaned topology with features
        """
        try:
            self.logger.info(f"Generating clean topology for {scale.value} scale...")
            
            # Observe raw topology
            raw_state = await self.topological_observer.observe_topology(scale)
            
            # Clean the topology
            cleaned_topology = await self.clean_topological_data(raw_state, custom_params)
            
            # Extract significant features
            significant_features = await self.extract_significant_features(
                cleaned_topology.cleaned_state
            )
            
            # Apply spiritual filters
            active_principles = list(IslamicPrinciple)
            filtered_features = await self.apply_spiritual_filters(
                significant_features, active_principles
            )
            
            # Update cleaned topology with extracted features
            cleaned_topology.cleaning_metadata["extracted_features"] = [
                {
                    "feature_id": f.feature_id,
                    "feature_type": f.feature_type,
                    "significance": f.significance,
                    "stability": f.stability,
                    "spiritual_alignment": {p.value: s for p, s in f.spiritual_alignment.items()}
                }
                for f in filtered_features[:20]  # Top 20 features
            ]
            
            self.logger.info(f"Clean topology generated: {len(filtered_features)} significant features")
            return cleaned_topology
            
        except Exception as e:
            self.logger.error(f"Failed to generate clean topology: {e}")
            raise
    
    # Private helper methods
    
    async def _apply_noise_reduction(self, 
                                   state: TopologicalState,
                                   threshold: float) -> Tuple[TopologicalState, int]:
        """Apply noise reduction to topological data."""
        try:
            noise_removed = 0
            cleaned_features = []
            
            for feature in state.persistence_diagram:
                # Remove features with low persistence (likely noise)
                if feature.persistence >= threshold:
                    cleaned_features.append(feature)
                else:
                    noise_removed += 1
            
            # Create cleaned state
            cleaned_state = TopologicalState(
                timestamp=state.timestamp,
                beta_0=state.beta_0,
                beta_1=state.beta_1,
                beta_2=state.beta_2,
                persistence_diagram=cleaned_features,
                grounding_score=state.grounding_score,
                hallucination_score=state.hallucination_score,
                spiritual_balance=state.spiritual_balance.copy(),
                observation_metadata={
                    **state.observation_metadata,
                    "noise_reduction_applied": True,
                    "noise_threshold": threshold,
                    "features_removed": noise_removed
                }
            )
            
            return cleaned_state, noise_removed
            
        except Exception as e:
            self.logger.error(f"Failed to apply noise reduction: {e}")
            return state, 0
    
    async def _apply_significance_filtering(self, 
                                          state: TopologicalState,
                                          threshold: float) -> Tuple[TopologicalState, int]:
        """Apply significance filtering to topological features."""
        try:
            features_filtered = 0
            significant_features = []
            
            for feature in state.persistence_diagram:
                # Keep features with high spiritual significance
                if feature.spiritual_significance >= threshold:
                    significant_features.append(feature)
                else:
                    features_filtered += 1
            
            # Create cleaned state
            cleaned_state = TopologicalState(
                timestamp=state.timestamp,
                beta_0=state.beta_0,
                beta_1=state.beta_1,
                beta_2=state.beta_2,
                persistence_diagram=significant_features,
                grounding_score=state.grounding_score,
                hallucination_score=state.hallucination_score,
                spiritual_balance=state.spiritual_balance.copy(),
                observation_metadata={
                    **state.observation_metadata,
                    "significance_filtering_applied": True,
                    "significance_threshold": threshold,
                    "features_filtered": features_filtered
                }
            )
            
            return cleaned_state, features_filtered
            
        except Exception as e:
            self.logger.error(f"Failed to apply significance filtering: {e}")
            return state, 0
    
    async def _apply_spiritual_purification(self, 
                                          state: TopologicalState,
                                          threshold: float) -> Tuple[TopologicalState, float]:
        """Apply spiritual purification based on Islamic principles."""
        try:
            purified_features = []
            purity_improvement = 0.0
            
            for feature in state.persistence_diagram:
                # Check spiritual purity
                purity_score = self._calculate_feature_purity(feature)
                
                if purity_score >= threshold:
                    purified_features.append(feature)
                else:
                    # Feature doesn't meet spiritual purity standards
                    purity_improvement += (threshold - purity_score)
            
            # Update spiritual balance based on purification
            purified_balance = state.spiritual_balance.copy()
            for principle in IslamicPrinciple:
                purification_factor = self.spiritual_filters[principle]["purity_requirement"]
                purified_balance[principle] = min(1.0, purified_balance[principle] * purification_factor)
            
            # Create purified state
            purified_state = TopologicalState(
                timestamp=state.timestamp,
                beta_0=state.beta_0,
                beta_1=state.beta_1,
                beta_2=state.beta_2,
                persistence_diagram=purified_features,
                grounding_score=min(1.0, state.grounding_score + purity_improvement * 0.1),
                hallucination_score=max(0.0, state.hallucination_score - purity_improvement * 0.1),
                spiritual_balance=purified_balance,
                observation_metadata={
                    **state.observation_metadata,
                    "spiritual_purification_applied": True,
                    "purity_threshold": threshold,
                    "purity_improvement": purity_improvement
                }
            )
            
            return purified_state, purity_improvement
            
        except Exception as e:
            self.logger.error(f"Failed to apply spiritual purification: {e}")
            return state, 0.0
    
    async def _apply_structural_simplification(self, 
                                            state: TopologicalState,
                                            factor: float) -> Tuple[TopologicalState, int]:
        """Apply structural simplification to reduce complexity."""
        try:
            simplified_features = []
            features_simplified = 0
            
            # Sort features by significance
            sorted_features = sorted(
                state.persistence_diagram,
                key=lambda x: x.spiritual_significance,
                reverse=True
            )
            
            # Keep top features based on simplification factor
            keep_count = max(1, int(len(sorted_features) * (1.0 - factor)))
            
            for i, feature in enumerate(sorted_features):
                if i < keep_count:
                    simplified_features.append(feature)
                else:
                    features_simplified += 1
            
            # Create simplified state
            simplified_state = TopologicalState(
                timestamp=state.timestamp,
                beta_0=state.beta_0,
                beta_1=state.beta_1,
                beta_2=state.beta_2,
                persistence_diagram=simplified_features,
                grounding_score=state.grounding_score,
                hallucination_score=state.hallucination_score,
                spiritual_balance=state.spiritual_balance.copy(),
                observation_metadata={
                    **state.observation_metadata,
                    "structural_simplification_applied": True,
                    "simplification_factor": factor,
                    "features_simplified": features_simplified
                }
            )
            
            return simplified_state, features_simplified
            
        except Exception as e:
            self.logger.error(f"Failed to apply structural simplification: {e}")
            return state, 0
    
    async def _apply_temporal_smoothing(self, 
                                      state: TopologicalState,
                                      window: int) -> TopologicalState:
        """Apply temporal smoothing using historical data."""
        try:
            # Get recent states for smoothing
            recent_states = [s for s in self.topological_observer.observation_history 
                           if s != state][-window:]
            
            if not recent_states:
                return state
            
            # Calculate smoothed values
            smoothed_beta_0 = int(np.mean([s.beta_0 for s in recent_states] + [state.beta_0]))
            smoothed_beta_1 = int(np.mean([s.beta_1 for s in recent_states] + [state.beta_1]))
            smoothed_beta_2 = int(np.mean([s.beta_2 for s in recent_states] + [state.beta_2]))
            
            smoothed_grounding = np.mean([s.grounding_score for s in recent_states] + [state.grounding_score])
            smoothed_hallucination = np.mean([s.hallucination_score for s in recent_states] + [state.hallucination_score])
            
            # Smooth spiritual balance
            smoothed_balance = {}
            for principle in IslamicPrinciple:
                values = [s.spiritual_balance.get(principle, 0.5) for s in recent_states] + [state.spiritual_balance.get(principle, 0.5)]
                smoothed_balance[principle] = np.mean(values)
            
            # Create smoothed state
            smoothed_state = TopologicalState(
                timestamp=state.timestamp,
                beta_0=smoothed_beta_0,
                beta_1=smoothed_beta_1,
                beta_2=smoothed_beta_2,
                persistence_diagram=state.persistence_diagram.copy(),
                grounding_score=smoothed_grounding,
                hallucination_score=smoothed_hallucination,
                spiritual_balance=smoothed_balance,
                observation_metadata={
                    **state.observation_metadata,
                    "temporal_smoothing_applied": True,
                    "smoothing_window": window,
                    "states_averaged": len(recent_states) + 1
                }
            )
            
            return smoothed_state
            
        except Exception as e:
            self.logger.error(f"Failed to apply temporal smoothing: {e}")
            return state
    
    def _calculate_feature_significance(self, 
                                     feature: PersistentHomology,
                                     state: TopologicalState) -> float:
        """Calculate overall significance of a topological feature."""
        try:
            # Combine multiple significance factors
            persistence_score = min(1.0, feature.persistence * 2)
            spiritual_score = feature.spiritual_significance
            stability_score = self._calculate_feature_stability(feature, state)
            
            # Weighted combination
            significance = (
                persistence_score * 0.4 +
                spiritual_score * 0.4 +
                stability_score * 0.2
            )
            
            return significance
            
        except Exception as e:
            self.logger.error(f"Failed to calculate feature significance: {e}")
            return 0.5
    
    def _calculate_feature_stability(self, 
                                   feature: PersistentHomology,
                                   state: TopologicalState) -> float:
        """Calculate stability of a topological feature."""
        try:
            # Stability based on persistence and dimension
            base_stability = min(1.0, feature.persistence)
            
            # Higher dimensions are more stable
            dimension_stability = min(1.0, feature.dimension / 2.0)
            
            # Representative count stability
            size_stability = min(1.0, len(feature.representatives) / 10.0)
            
            # Combine factors
            stability = (
                base_stability * 0.5 +
                dimension_stability * 0.3 +
                size_stability * 0.2
            )
            
            return stability
            
        except Exception as e:
            self.logger.error(f"Failed to calculate feature stability: {e}")
            return 0.5
    
    def _calculate_spiritual_alignment(self, 
                                     feature: PersistentHomology,
                                     state: TopologicalState) -> Dict[IslamicPrinciple, float]:
        """Calculate spiritual alignment of a topological feature."""
        try:
            alignment = {}
            
            for principle in IslamicPrinciple:
                # Base alignment from state balance
                base_alignment = state.spiritual_balance.get(principle, 0.5)
                
                # Feature-specific alignment
                if principle == IslamicPrinciple.TAWHID:
                    # Unity: connected features
                    alignment[principle] = base_alignment * (1.0 + feature.persistence)
                
                elif principle == IslamicPrinciple.ADL:
                    # Justice: balanced features
                    alignment[principle] = base_alignment * (1.0 - abs(0.5 - feature.persistence))
                
                elif principle == IslamicPrinciple.SABR:
                    # Patience: persistent features
                    alignment[principle] = base_alignment * feature.persistence
                
                elif principle == IslamicPrinciple.HIKMAH:
                    # Wisdom: complex features
                    alignment[principle] = base_alignment * (1.0 + feature.dimension / 2.0)
                
                elif principle == IslamicPrinciple.TAWASUL:
                    # Interconnectedness: features with many representatives
                    alignment[principle] = base_alignment * min(1.0, len(feature.representatives) / 5.0)
            
            return alignment
            
        except Exception as e:
            self.logger.error(f"Failed to calculate spiritual alignment: {e}")
            return {principle: 0.5 for principle in IslamicPrinciple}
    
    async def _extract_stable_features(self, 
                                      state: TopologicalState,
                                      significance_threshold: float) -> List[FeatureExtraction]:
        """Extract stable features from historical data."""
        try:
            stable_features = []
            
            # Analyze feature persistence across observations
            if len(self.topological_observer.observation_history) < 3:
                return stable_features
            
            # Track feature stability across recent observations
            feature_stability = {}
            
            for hist_state in self.topological_observer.observation_history[-10:]:
                for hist_feature in hist_state.persistence_diagram:
                    # Create feature key based on representatives
                    key = tuple(sorted(hist_feature.representatives))
                    
                    if key not in feature_stability:
                        feature_stability[key] = {
                            "count": 0,
                            "total_persistence": 0.0,
                            "total_significance": 0.0
                        }
                    
                    feature_stability[key]["count"] += 1
                    feature_stability[key]["total_persistence"] += hist_feature.persistence
                    feature_stability[key]["total_significance"] += hist_feature.spiritual_significance
            
            # Create stable feature extractions
            for key, stats in feature_stability.items():
                if stats["count"] >= 3:  # Feature appears in multiple observations
                    avg_persistence = stats["total_persistence"] / stats["count"]
                    avg_significance = stats["total_significance"] / stats["count"]
                    
                    if avg_significance >= significance_threshold:
                        extraction = FeatureExtraction(
                            feature_id=f"stable_{hash(key) % 10000}",
                            feature_type="stable",
                            persistence=avg_persistence,
                            stability=stats["count"] / 10.0,  # Normalized stability
                            significance=avg_significance,
                            spiritual_alignment=self._calculate_spiritual_alignment(
                                PersistentHomology(
                                    dimension=1,  # Assume 1D for stable features
                                    birth=0.0,
                                    death=avg_persistence,
                                    persistence=avg_persistence,
                                    representatives=list(key),
                                    spiritual_significance=avg_significance
                                ),
                                state
                            ),
                            representatives=list(key),
                            metadata={
                                "occurrence_count": stats["count"],
                                "stability_score": stats["count"] / 10.0
                            }
                        )
                        
                        stable_features.append(extraction)
            
            return stable_features
            
        except Exception as e:
            self.logger.error(f"Failed to extract stable features: {e}")
            return []
    
    def _calculate_feature_purity(self, feature: PersistentHomology) -> float:
        """Calculate spiritual purity of a topological feature."""
        try:
            # Purity based on multiple factors
            persistence_purity = min(1.0, feature.persistence)
            dimension_purity = min(1.0, (feature.dimension + 1) / 3.0)  # Higher dimensions more pure
            size_purity = min(1.0, len(feature.representatives) / 10.0)
            
            # Spiritual significance purity
            spiritual_purity = feature.spiritual_significance
            
            # Combine factors
            purity = (
                persistence_purity * 0.3 +
                dimension_purity * 0.2 +
                size_purity * 0.2 +
                spiritual_purity * 0.3
            )
            
            return purity
            
        except Exception as e:
            self.logger.error(f"Failed to calculate feature purity: {e}")
            return 0.5
    
    def _calculate_spiritual_purity(self, state: TopologicalState) -> float:
        """Calculate overall spiritual purity of topological state."""
        try:
            if not state.persistence_diagram:
                return 0.5
            
            # Average purity of all features
            total_purity = sum(self._calculate_feature_purity(f) for f in state.persistence_diagram)
            avg_purity = total_purity / len(state.persistence_diagram)
            
            # Balance contribution
            balance_values = list(state.spiritual_balance.values())
            balance_purity = 1.0 - (np.std(balance_values) / (np.mean(balance_values) + 1e-6))
            
            # Grounding contribution
            grounding_purity = state.grounding_score
            
            # Hallucination penalty
            hallucination_penalty = state.hallucination_score
            
            # Combine factors
            overall_purity = (
                avg_purity * 0.4 +
                balance_purity * 0.3 +
                grounding_purity * 0.2 -
                hallucination_penalty * 0.1
            )
            
            return max(0.0, min(1.0, overall_purity))
            
        except Exception as e:
            self.logger.error(f"Failed to calculate spiritual purity: {e}")
            return 0.5
    
    def _approximate_bottleneck_distance(self, 
                                       diag1: List[Tuple[float, float]],
                                       diag2: List[Tuple[float, float]]) -> float:
        """Approximate bottleneck distance calculation."""
        try:
            if not diag1 or not diag2:
                return float('inf')
            
            # For each point in diag1, find closest point in diag2
            max_distance = 0.0
            
            for birth1, death1 in diag1:
                min_distance = float('inf')
                
                for birth2, death2 in diag2:
                    # Use L-infinity distance
                    distance = max(abs(birth1 - birth2), abs(death1 - death2))
                    min_distance = min(min_distance, distance)
                
                max_distance = max(max_distance, min_distance)
            
            # For each point in diag2, find closest point in diag1
            for birth2, death2 in diag2:
                min_distance = float('inf')
                
                for birth1, death1 in diag1:
                    distance = max(abs(birth2 - birth1), abs(death2 - death1))
                    min_distance = min(min_distance, distance)
                
                max_distance = max(max_distance, min_distance)
            
            return max_distance
            
        except Exception as e:
            self.logger.error(f"Failed to approximate bottleneck distance: {e}")
            return float('inf')
    
    async def _record_cleaning_success(self, cleaned_topology: CleanedTopology):
        """Record cleaning success in Raqib agent."""
        try:
            if not self.raqib_agent:
                return
            
            principle = getattr(self.raqib_agent.__class__.__module__.split('.')[-1], 
                            'IslamicPrinciple', None).TAWHID
            
            self.raqib_agent.record_success(
                agent_name="MapperAlgorithm",
                description=f"Topological data cleaning improved spiritual purity by {cleaned_topology.spiritual_purity_improved:.3f}",
                principle=principle,
                spiritual_weight=int(cleaned_topology.spiritual_purity_improved * 10),
                impact_level="MEDIUM",
                metadata={
                    "noise_removed": cleaned_topology.noise_removed,
                    "features_filtered": cleaned_topology.features_filtered,
                    "cleaning_applied": [f.value for f in cleaned_topology.cleaning_applied]
                }
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to record cleaning success: {e}")


# Factory function
def create_mapper_algorithm(tenant_id: str = "default") -> MapperAlgorithm:
    """
    Factory function to create MapperAlgorithm instances.
    
    Args:
        tenant_id: Tenant identifier for multi-tenant architecture
        
    Returns:
        Configured MapperAlgorithm instance
    """
    return MapperAlgorithm(tenant_id=tenant_id)


# Test function
async def test_mapper_algorithm():
    """Test MapperAlgorithm functionality."""
    print("\n" + "=" * 60)
    print("Testing Mapper Algorithm")
    print("=" * 60 + "\n")
    
    # Create mapper algorithm
    mapper = create_mapper_algorithm("test-tenant")
    
    # Test clean topology generation
    cleaned_topology = await mapper.generate_clean_topology(NetworkScale.MESO)
    print(f"✅ Clean topology generated")
    print(f"   Noise removed: {cleaned_topology.noise_removed}")
    print(f"   Features filtered: {cleaned_topology.features_filtered}")
    print(f"   Spiritual purity improved: {cleaned_topology.spiritual_purity_improved:.3f}")
    
    # Test feature extraction
    features = await mapper.extract_significant_features(cleaned_topology.cleaned_state)
    print(f"✅ Significant features extracted: {len(features)}")
    
    # Test spiritual filtering
    filtered_features = await mapper.apply_spiritual_filters(
        features, [IslamicPrinciple.TAWHID, IslamicPrinciple.ADL]
    )
    print(f"✅ Spiritual filtering applied: {len(features)} -> {len(filtered_features)} features")
    
    # Test bottleneck distance
    if len(mapper.topological_observer.observation_history) >= 2:
        state1 = mapper.topological_observer.observation_history[-2]
        state2 = mapper.topological_observer.observation_history[-1]
        distance = await mapper.compute_bottleneck_distance(state1, state2)
        print(f"✅ Bottleneck distance computed: {distance:.6f}")
    
    print("\n✅ Mapper Algorithm test completed successfully!")


if __name__ == "__main__":
    asyncio.run(test_mapper_algorithm())