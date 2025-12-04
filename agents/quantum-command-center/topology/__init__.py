"""
Fractal Swarm Topology Module
Part of QCC Spiritual Intelligence Framework

This module implements the Fractal Swarm Topology for Micro/Macro alignment,
connecting Islamic spiritual principles with technical architecture through scale-free
network analysis and self-similarity across scales.
"""

from .fractal_swarm import (
    FractalSwarmTopology,
    NetworkScale,
    IslamicPrinciple,
    NodeRole,
    TopologyMetrics,
    HubAnalysis,
    CascadeAnalysis,
    create_fractal_swarm_topology
)

from .integration_hooks import (
    TopologyIntegrationHooks,
    TopologyEvent,
    create_topology_integration_hooks
)

from .toha_detector import (
    TopologicalObserver,
    TopologicalState,
    PersistentHomology,
    TopologicalEvent as TOHAEvent,
    TopologicalChange,
    create_topological_observer
)

from .mapper_cleaner import (
    MapperAlgorithm,
    CleanedTopology,
    FeatureExtraction,
    CleaningParameters,
    FilterType,
    create_mapper_algorithm
)

__version__ = "1.0.0"
__author__ = "QCC Spiritual Intelligence Framework"
__description__ = "Fractal Swarm Topology for Micro/Macro Alignment with TOHA Integration"

__all__ = [
    # Core topology classes
    "FractalSwarmTopology",
    "NetworkScale",
    "IslamicPrinciple", 
    "NodeRole",
    "TopologyMetrics",
    "HubAnalysis",
    "CascadeAnalysis",
    "create_fractal_swarm_topology",
    
    # Integration classes
    "TopologyIntegrationHooks",
    "TopologyEvent",
    "create_topology_integration_hooks",
    
    # TOHA (Topological Observer) classes
    "TopologicalObserver",
    "TopologicalState",
    "PersistentHomology",
    "TOHAEvent",
    "TopologicalChange",
    "create_topological_observer",
    
    # Mapper Algorithm classes
    "MapperAlgorithm",
    "CleanedTopology",
    "FeatureExtraction",
    "CleaningParameters",
    "FilterType",
    "create_mapper_algorithm"
]