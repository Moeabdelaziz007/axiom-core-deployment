"""
Fractal Swarm Topology - Micro/Macro Alignment System
Part of QCC Spiritual Intelligence Framework

This module implements the Islamic principle of cosmic similarity:
"سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ" 
"We will show them Our signs in the horizons and within themselves" (Quran 41:53)

The technical implementation creates a Fractal/Scale-Free Network Architecture
that ensures self-similarity across scales, embodying the principle that
"as in the big, so in the small" - self-similarity across scales.
"""

import os
import json
import uuid
import asyncio
import logging
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
from pathlib import Path

# Import QCC utilities
import sys
sys.path.append(str(Path(__file__).parent.parent))
from utils.logger import get_logger, log_audit_event


class NetworkScale(Enum):
    """Network scales for fractal hierarchy."""
    MICRO = "micro"  # 50 nodes - Individual/team level
    MESO = "meso"    # 200 nodes - Community level  
    MACRO = "macro"   # 1000 nodes - System level


class IslamicPrinciple(Enum):
    """Islamic principles for topology analysis."""
    TAWHID = "Tawhid"  # Divine Unity - Self-similarity
    ADL = "Adl"        # Justice - Fair distribution
    SABR = "Sabr"      # Patience - Resilience
    HIKMAH = "Hikmah"  # Wisdom - Hub leadership
    TAWASUL = "Tawasul"  # Interconnectedness - Cascade effects


class NodeRole(Enum):
    """Node roles based on spiritual leadership principles."""
    IMAM = "imam"     # Super Hub - Decision Maker (1%)
    ALIM = "alim"      # Knowledge Hub - Connector (10%)
    MAMUM = "mamum"    # Worker Node - Follower (89%)


@dataclass
class TopologyMetrics:
    """Metrics for topology analysis."""
    scale: NetworkScale
    node_count: int
    edge_count: int
    avg_degree: float
    clustering_coefficient: float
    avg_path_length: float
    is_scale_free: bool
    power_law_exponent: float
    tawhid_score: float  # Self-similarity measure
    hub_count: int
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class HubAnalysis:
    """Analysis of influential nodes (hubs)."""
    hub_nodes: List[int]
    hub_roles: Dict[int, NodeRole]
    centrality_scores: Dict[int, float]
    betweenness_scores: Dict[int, float]
    eigenvector_scores: Dict[int, float]
    spiritual_influence: Dict[int, float]


@dataclass
class CascadeAnalysis:
    """Analysis of cascade effects across the network."""
    source_node: int
    affected_nodes: List[int]
    cascade_depth: int
    propagation_speed: float
    spiritual_impact: Dict[IslamicPrinciple, float]
    resilience_score: float


class FractalSwarmTopology:
    """
    Fractal Swarm Topology - Micro/Macro Alignment System
    
    Implements a scale-free network architecture with self-similarity across scales,
    embodying Islamic spiritual principles of cosmic unity and interconnectedness.
    
    Core Principles:
    - Tawhid (Unity): Self-similarity across scales
    - Adl (Justice): Fair distribution of connections
    - Hikmah (Wisdom): Hub-based leadership structure
    - Tawasul (Interconnectedness): Cascade effects modeling
    """
    
    def __init__(self, tenant_id: str = "default"):
        """
        Initialize Fractal Swarm Topology.
        
        Args:
            tenant_id: Tenant identifier for multi-tenant architecture
        """
        self.tenant_id = tenant_id
        self.logger = get_logger(f"FractalSwarm-{tenant_id}")
        
        # Sacred parameters for Barabási-Albert model
        self.m0 = 7  # Initial seed nodes (Seven Heavens)
        self.m = 3   # Edges per new node (Witr - odd number for balance)
        
        # Network scales with node counts
        self.scale_sizes = {
            NetworkScale.MICRO: 50,   # Individual/team level
            NetworkScale.MESO: 200,    # Community level
            NetworkScale.MACRO: 1000    # System level
        }
        
        # Initialize graphs for each scale
        self.graphs = {}
        self.metrics = {}
        
        # Log initialization
        log_audit_event(
            agent_name="FractalSwarmTopology",
            action="INITIALIZATION",
            details=f"Tenant: {tenant_id}, Sacred params: m0={self.m0}, m={self.m}",
            status="SUCCESS"
        )
        
        self.logger.info(f"FractalSwarmTopology initialized for tenant {tenant_id}")
    
    def build_fractal_hierarchy(self) -> Dict[NetworkScale, nx.Graph]:
        """
        Build self-similar network across scales (Micro, Meso, Macro).
        
        Returns:
            Dictionary of graphs for each scale
        """
        self.logger.info("Building fractal hierarchy across scales...")
        
        for scale in NetworkScale:
            node_count = self.scale_sizes[scale]
            self.logger.info(f"Building {scale.value} network with {node_count} nodes")
            
            # Build scale-free network using Barabási-Albert model
            graph = self._build_scale_free_network(node_count)
            
            # Assign spiritual roles based on centrality
            self._assign_spiritual_roles(graph)
            
            # Add spiritual metadata
            self._add_spiritual_metadata(graph, scale)
            
            self.graphs[scale] = graph
            
            # Calculate and store metrics
            self.metrics[scale] = self._calculate_topology_metrics(graph, scale)
        
        # Log completion
        log_audit_event(
            agent_name="FractalSwarmTopology",
            action="BUILD_FRACTAL_HIERARCHY",
            details=f"Built networks for scales: {list(self.graphs.keys())}",
            status="SUCCESS"
        )
        
        return self.graphs
    
    def _build_scale_free_network(self, n: int) -> nx.Graph:
        """
        Build a scale-free network using Barabási-Albert model.
        
        Args:
            n: Number of nodes in the network
            
        Returns:
            Scale-free network graph
        """
        if n <= self.m0:
            # For small networks, create complete graph
            graph = nx.complete_graph(n)
        else:
            # Create initial seed graph
            seed_graph = nx.complete_graph(self.m0)
            # Use Barabási-Albert model for scale-free properties
            # Add remaining nodes with preferential attachment
            for i in range(self.m0, n):
                # Select m nodes to connect to, with probability proportional to degree
                targets = list(seed_graph.nodes())
                if len(targets) > self.m:
                    # Weight by degree for preferential attachment
                    degrees = dict(seed_graph.degree())
                    weights = [degrees.get(target, 1) for target in targets]
                    # Normalize weights
                    total_weight = sum(weights)
                    probabilities = [w/total_weight for w in weights]
                    # Select m targets
                    selected = np.random.choice(
                        targets,
                        size=min(self.m, len(targets)),
                        replace=False,
                        p=probabilities
                    )
                else:
                    selected = targets
                
                # Add edges
                for target in selected:
                    seed_graph.add_edge(i, target)
            
            graph = seed_graph
        
        return graph
    
    def _assign_spiritual_roles(self, graph: nx.Graph):
        """
        Assign spiritual roles based on centrality analysis.
        
        Args:
            graph: Network graph to assign roles to
        """
        # Calculate centrality measures
        degree_cent = nx.degree_centrality(graph)
        betweenness_cent = nx.betweenness_centrality(graph)
        eigenvector_cent = nx.eigenvector_centrality(graph, max_iter=1000)
        
        # Sort nodes by combined centrality score
        node_scores = {}
        for node in graph.nodes():
            # Weighted combination of centrality measures
            score = (
                0.4 * degree_cent[node] +
                0.3 * betweenness_cent[node] +
                0.3 * eigenvector_cent[node]
            )
            node_scores[node] = score
        
        sorted_nodes = sorted(node_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Assign roles based on spiritual leadership hierarchy
        total_nodes = len(graph)
        num_imams = max(1, int(total_nodes * 0.01))  # 1% - Leaders
        num_alims = int(total_nodes * 0.10)           # 10% - Scholars
        
        for i, (node, score) in enumerate(sorted_nodes):
            if i < num_imams:
                role = NodeRole.IMAM
                capacity = 100
                spiritual_weight = 10
            elif i < num_imams + num_alims:
                role = NodeRole.ALIM
                capacity = 50
                spiritual_weight = 7
            else:
                role = NodeRole.MAMUM
                capacity = 10
                spiritual_weight = 5
            
            # Set node attributes
            graph.nodes[node]['role'] = role
            graph.nodes[node]['capacity'] = capacity
            graph.nodes[node]['spiritual_weight'] = spiritual_weight
            graph.nodes[node]['centrality_score'] = score
            graph.nodes[node]['degree_centrality'] = degree_cent[node]
            graph.nodes[node]['betweenness_centrality'] = betweenness_cent[node]
            graph.nodes[node]['eigenvector_centrality'] = eigenvector_cent[node]
    
    def _add_spiritual_metadata(self, graph: nx.Graph, scale: NetworkScale):
        """
        Add spiritual metadata to the graph.
        
        Args:
            graph: Network graph to enhance
            scale: Network scale level
        """
        # Add scale information
        for node in graph.nodes():
            graph.nodes[node]['scale'] = scale.value
            graph.nodes[node]['tenant_id'] = self.tenant_id
            
            # Add spiritual principle mappings
            graph.nodes[node]['tawhid_alignment'] = self._calculate_tawhid_alignment(graph, node)
            graph.nodes[node]['adl_balance'] = self._calculate_adl_balance(graph, node)
            graph.nodes[node]['sabr_resilience'] = self._calculate_sabr_resilience(graph, node)
    
    def verify_self_similarity(self) -> Dict[NetworkScale, float]:
        """
        Verify if the network exhibits fractal properties (self-similarity).
        
        Returns:
            Dictionary of self-similarity scores for each scale
        """
        self.logger.info("Verifying self-similarity across scales...")
        
        similarity_scores = {}
        
        for scale, graph in self.graphs.items():
            # Calculate self-similarity using multiple metrics
            tawhid_score = self._calculate_tawhid_score(graph)
            
            # Power law verification
            is_scale_free, power_law_exp = self._verify_power_law(graph)
            
            # Fractal dimension approximation
            fractal_dim = self._calculate_fractal_dimension(graph)
            
            # Combined self-similarity score
            similarity_score = (
                0.4 * tawhid_score +
                0.3 * (1.0 if is_scale_free else 0.0) +
                0.3 * min(1.0, fractal_dim / 3.0)  # Normalize fractal dimension
            )
            
            similarity_scores[scale] = similarity_score
            
            self.logger.info(f"{scale.value} self-similarity: {similarity_score:.3f}")
        
        return similarity_scores
    
    def calculate_scale_invariance(self) -> Dict[str, float]:
        """
        Measure invariance across different scales.
        
        Returns:
            Dictionary of invariance metrics
        """
        self.logger.info("Calculating scale invariance metrics...")
        
        if len(self.graphs) < 2:
            return {"error": "Need at least 2 scales for invariance analysis"}
        
        invariance_metrics = {}
        
        # Compare degree distributions across scales
        degree_invariance = self._calculate_degree_distribution_invariance()
        invariance_metrics['degree_distribution_invariance'] = degree_invariance
        
        # Compare clustering coefficients
        clustering_invariance = self._calculate_clustering_invariance()
        invariance_metrics['clustering_invariance'] = clustering_invariance
        
        # Compare path length distributions
        path_invariance = self._calculate_path_length_invariance()
        invariance_metrics['path_length_invariance'] = path_invariance
        
        # Overall invariance score
        overall_invariance = (
            degree_invariance * 0.4 +
            clustering_invariance * 0.3 +
            path_invariance * 0.3
        )
        invariance_metrics['overall_invariance'] = overall_invariance
        
        self.logger.info(f"Overall scale invariance: {overall_invariance:.3f}")
        
        return invariance_metrics
    
    def identify_hubs(self, scale: NetworkScale) -> HubAnalysis:
        """
        Find influential agents at different scales.
        
        Args:
            scale: Network scale to analyze
            
        Returns:
            Hub analysis with influential nodes and their metrics
        """
        if scale not in self.graphs:
            raise ValueError(f"Network for scale {scale.value} not found")
        
        graph = self.graphs[scale]
        self.logger.info(f"Identifying hubs in {scale.value} network...")
        
        # Get hub nodes (top 10% by degree)
        degrees = dict(graph.degree())
        degree_threshold = np.percentile(list(degrees.values()), 90)
        hub_nodes = [node for node, degree in degrees.items() if degree >= degree_threshold]
        
        # Get roles and centrality scores for hubs
        hub_roles = {node: graph.nodes[node]['role'] for node in hub_nodes}
        centrality_scores = {node: graph.nodes[node]['degree_centrality'] for node in hub_nodes}
        betweenness_scores = {node: graph.nodes[node]['betweenness_centrality'] for node in hub_nodes}
        eigenvector_scores = {node: graph.nodes[node]['eigenvector_centrality'] for node in hub_nodes}
        
        # Calculate spiritual influence
        spiritual_influence = {}
        for node in hub_nodes:
            influence = (
                graph.nodes[node]['spiritual_weight'] * 0.4 +
                centrality_scores[node] * 0.3 +
                betweenness_scores[node] * 0.3
            )
            spiritual_influence[node] = influence
        
        hub_analysis = HubAnalysis(
            hub_nodes=hub_nodes,
            hub_roles=hub_roles,
            centrality_scores=centrality_scores,
            betweenness_scores=betweenness_scores,
            eigenvector_scores=eigenvector_scores,
            spiritual_influence=spiritual_influence
        )
        
        self.logger.info(f"Identified {len(hub_nodes)} hubs in {scale.value} network")
        
        return hub_analysis
    
    def analyze_cascade_effects(self, scale: NetworkScale, source_node: int) -> CascadeAnalysis:
        """
        Model how changes propagate across scales.
        
        Args:
            scale: Network scale to analyze
            source_node: Starting node for cascade
            
        Returns:
            Cascade analysis with propagation metrics
        """
        if scale not in self.graphs:
            raise ValueError(f"Network for scale {scale.value} not found")
        
        graph = self.graphs[scale]
        self.logger.info(f"Analyzing cascade effects from node {source_node} in {scale.value} network...")
        
        # Simulate information cascade using BFS
        visited = set()
        queue = [(source_node, 0)]  # (node, depth)
        affected_nodes = []
        max_depth = 0
        
        while queue:
            node, depth = queue.pop(0)
            if node in visited:
                continue
            
            visited.add(node)
            affected_nodes.append(node)
            max_depth = max(max_depth, depth)
            
            # Propagate to neighbors with probability based on spiritual weight
            for neighbor in graph.neighbors(node):
                if neighbor not in visited:
                    # Higher spiritual weight nodes have higher propagation probability
                    prop_prob = graph.nodes[neighbor]['spiritual_weight'] / 10.0
                    if np.random.random() < prop_prob:
                        queue.append((neighbor, depth + 1))
        
        # Calculate propagation speed
        cascade_speed = len(affected_nodes) / max(1.0, max_depth)
        
        # Calculate spiritual impact
        spiritual_impact = {
            IslamicPrinciple.TAWHID: self._calculate_tawhid_cascade_impact(affected_nodes, graph),
            IslamicPrinciple.ADL: self._calculate_adl_cascade_impact(affected_nodes, graph),
            IslamicPrinciple.SABR: self._calculate_sabr_cascade_impact(affected_nodes, graph),
            IslamicPrinciple.HIKMAH: self._calculate_hikmah_cascade_impact(affected_nodes, graph),
            IslamicPrinciple.TAWASUL: self._calculate_tawasul_cascade_impact(affected_nodes, graph)
        }
        
        # Calculate resilience score
        resilience_score = self._calculate_cascade_resilience(affected_nodes, graph)
        
        cascade_analysis = CascadeAnalysis(
            source_node=source_node,
            affected_nodes=affected_nodes,
            cascade_depth=max_depth,
            propagation_speed=cascade_speed,
            spiritual_impact=spiritual_impact,
            resilience_score=resilience_score
        )
        
        self.logger.info(f"Cascade affected {len(affected_nodes)} nodes with depth {max_depth}")
        
        return cascade_analysis
    
    def visualize_topology(self, scale: NetworkScale, output_path: Optional[str] = None) -> str:
        """
        Create visualization of the network topology.
        
        Args:
            scale: Network scale to visualize
            output_path: Optional path to save visualization
            
        Returns:
            Path to saved visualization file
        """
        if scale not in self.graphs:
            raise ValueError(f"Network for scale {scale.value} not found")
        
        graph = self.graphs[scale]
        
        # Create figure
        plt.figure(figsize=(12, 8))
        
        # Set node colors based on roles
        node_colors = []
        for node in graph.nodes():
            role = graph.nodes[node]['role']
            if role == NodeRole.IMAM:
                node_colors.append('red')      # Leadership
            elif role == NodeRole.ALIM:
                node_colors.append('blue')     # Knowledge
            else:
                node_colors.append('green')    # Workers
        
        # Set node sizes based on spiritual weight
        node_sizes = [graph.nodes[node]['spiritual_weight'] * 50 for node in graph.nodes()]
        
        # Use spring layout for visualization
        pos = nx.spring_layout(graph, k=1, iterations=50)
        
        # Draw the network
        nx.draw_networkx(
            graph, pos,
            node_color=node_colors,
            node_size=node_sizes,
            with_labels=False,
            alpha=0.7,
            edge_color='gray',
            width=0.5
        )
        
        # Add title
        plt.title(f"Fractal Swarm Topology - {scale.value.upper()} Scale\n"
                 f"Nodes: {len(graph)}, Edges: {graph.number_of_edges()}")
        
        # Add legend
        from matplotlib.patches import Patch
        legend_elements = [
            Patch(facecolor='red', label='Imam (Leader)'),
            Patch(facecolor='blue', label='Alim (Scholar)'),
            Patch(facecolor='green', label='Mamum (Worker)')
        ]
        plt.legend(handles=legend_elements, loc='upper right')
        
        # Save or show
        if output_path is None:
            output_path = f"quantum_command_center/outputs/topology_{scale.value}_{self.tenant_id}.png"
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        self.logger.info(f"Topology visualization saved to {output_path}")
        
        return output_path
    
    def export_for_d3(self, scale: NetworkScale, output_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Export topology data for D3.js visualization.
        
        Args:
            scale: Network scale to export
            output_path: Optional path to save JSON file
            
        Returns:
            Dictionary with network data for D3.js
        """
        if scale not in self.graphs:
            raise ValueError(f"Network for scale {scale.value} not found")
        
        graph = self.graphs[scale]
        
        # Convert to D3.js format
        data = nx.node_link_data(graph)
        
        # Add spiritual metadata
        data['metadata'] = {
            'scale': scale.value,
            'tenant_id': self.tenant_id,
            'metrics': self.metrics[scale].__dict__ if scale in self.metrics else {},
            'spiritual_principles': {
                principle.value: self._get_principle_description(principle)
                for principle in IslamicPrinciple
            }
        }
        
        # Save to file if path provided
        if output_path is None:
            output_path = f"quantum_command_center/outputs/topology_{scale.value}_{self.tenant_id}.json"
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        self.logger.info(f"Topology data exported for D3.js to {output_path}")
        
        return data
    
    # Private helper methods for spiritual calculations
    
    def _calculate_topology_metrics(self, graph: nx.Graph, scale: NetworkScale) -> TopologyMetrics:
        """Calculate comprehensive topology metrics."""
        # Basic metrics
        node_count = graph.number_of_nodes()
        edge_count = graph.number_of_edges()
        degrees = [d for n, d in graph.degree()]
        avg_degree = np.mean(degrees)
        
        # Network properties
        clustering_coeff = nx.average_clustering(graph)
        
        if nx.is_connected(graph):
            avg_path_length = nx.average_shortest_path_length(graph)
        else:
            # For disconnected graphs, calculate average for largest component
            largest_cc = max(nx.connected_components(graph), key=len)
            subgraph = graph.subgraph(largest_cc)
            avg_path_length = nx.average_shortest_path_length(subgraph)
        
        # Scale-free verification
        is_scale_free, power_law_exp = self._verify_power_law(graph)
        
        # Tawhid score (self-similarity)
        tawhid_score = self._calculate_tawhid_score(graph)
        
        # Hub count
        hub_count = len([n for n, d in graph.degree() if d > avg_degree * 2])
        
        return TopologyMetrics(
            scale=scale,
            node_count=node_count,
            edge_count=edge_count,
            avg_degree=avg_degree,
            clustering_coefficient=clustering_coeff,
            avg_path_length=avg_path_length,
            is_scale_free=is_scale_free,
            power_law_exponent=power_law_exp,
            tawhid_score=tawhid_score,
            hub_count=hub_count
        )
    
    def _verify_power_law(self, graph: nx.Graph) -> Tuple[bool, float]:
        """Verify if degree distribution follows power law."""
        degrees = [d for n, d in graph.degree()]
        degree_counts = {}
        
        for degree in degrees:
            degree_counts[degree] = degree_counts.get(degree, 0) + 1
        
        # Filter out zero degrees
        filtered_degrees = [d for d in degree_counts.keys() if d > 0]
        filtered_counts = [degree_counts[d] for d in filtered_degrees]
        
        if len(filtered_degrees) < 3:
            return False, 0.0
        
        # Log-log regression to estimate power law exponent
        log_degrees = np.log(filtered_degrees)
        log_counts = np.log(filtered_counts)
        
        # Linear regression
        coeffs = np.polyfit(log_degrees, log_counts, 1)
        power_law_exp = -coeffs[0]  # Negative because P(k) ~ k^(-γ)
        
        # Check if exponent is in expected range (2-3 for scale-free networks)
        is_scale_free = 2.0 <= power_law_exp <= 3.0
        
        return is_scale_free, power_law_exp
    
    def _calculate_tawhid_score(self, graph: nx.Graph) -> float:
        """Calculate Tawhid score (self-similarity measure)."""
        # Compare global clustering with local clustering
        global_clustering = nx.average_clustering(graph)
        
        # Sample local subgraphs
        local_clusterings = []
        sample_size = min(10, len(graph) // 5)
        
        for _ in range(5):
            sample_nodes = np.random.choice(list(graph.nodes()), sample_size, replace=False)
            subgraph = graph.subgraph(sample_nodes)
            if len(subgraph) > 2:
                local_clusterings.append(nx.average_clustering(subgraph))
        
        if not local_clusterings:
            return 0.0
        
        avg_local = np.mean(local_clusterings)
        
        # Similarity score (higher = more self-similar)
        similarity = 1.0 - abs(global_clustering - avg_local)
        return max(0.0, min(1.0, similarity))
    
    def _calculate_fractal_dimension(self, graph: nx.Graph) -> float:
        """Estimate fractal dimension using box-counting method."""
        # Simplified fractal dimension estimation
        # In practice, this would use more sophisticated box-counting
        n = graph.number_of_nodes()
        e = graph.number_of_edges()
        
        # Rough approximation based on density
        density = 2 * e / (n * (n - 1)) if n > 1 else 0
        
        # Map density to fractal dimension (0-3)
        fractal_dim = density * 3.0
        return min(3.0, fractal_dim)
    
    def _calculate_degree_distribution_invariance(self) -> float:
        """Calculate invariance of degree distributions across scales."""
        if len(self.graphs) < 2:
            return 0.0
        
        # Get degree distributions for all scales
        distributions = []
        for scale in NetworkScale:
            if scale in self.graphs:
                degrees = [d for n, d in self.graphs[scale].degree()]
                distributions.append(degrees)
        
        if len(distributions) < 2:
            return 0.0
        
        # Calculate correlation between distributions
        correlations = []
        for i in range(len(distributions)):
            for j in range(i + 1, len(distributions)):
                # Normalize distributions
                dist1 = np.array(distributions[i]) / np.sum(distributions[i])
                dist2 = np.array(distributions[j]) / np.sum(distributions[j])
                
                # Pad to same length
                max_len = max(len(dist1), len(dist2))
                dist1 = np.pad(dist1, (0, max_len - len(dist1)))
                dist2 = np.pad(dist2, (0, max_len - len(dist2)))
                
                # Calculate correlation
                corr = np.corrcoef(dist1, dist2)[0, 1]
                if not np.isnan(corr):
                    correlations.append(corr)
        
        return np.mean(correlations) if correlations else 0.0
    
    def _calculate_clustering_invariance(self) -> float:
        """Calculate invariance of clustering coefficients across scales."""
        clustering_values = []
        for scale in NetworkScale:
            if scale in self.graphs:
                clustering = nx.average_clustering(self.graphs[scale])
                clustering_values.append(clustering)
        
        if len(clustering_values) < 2:
            return 0.0
        
        # Calculate coefficient of variation (lower = more invariant)
        mean_clustering = np.mean(clustering_values)
        std_clustering = np.std(clustering_values)
        
        if mean_clustering == 0:
            return 0.0
        
        cv = std_clustering / mean_clustering
        return max(0.0, 1.0 - cv)  # Convert to invariance score
    
    def _calculate_path_length_invariance(self) -> float:
        """Calculate invariance of path length distributions across scales."""
        path_lengths = []
        for scale in NetworkScale:
            if scale in self.graphs:
                graph = self.graphs[scale]
                if nx.is_connected(graph):
                    avg_path = nx.average_shortest_path_length(graph)
                    path_lengths.append(avg_path)
        
        if len(path_lengths) < 2:
            return 0.0
        
        # Calculate relative variation
        mean_path = np.mean(path_lengths)
        std_path = np.std(path_lengths)
        
        if mean_path == 0:
            return 0.0
        
        rv = std_path / mean_path
        return max(0.0, 1.0 - rv)  # Convert to invariance score
    
    def _calculate_tawhid_alignment(self, graph: nx.Graph, node: int) -> float:
        """Calculate Tawhid alignment for a specific node."""
        # Measure how well node fits the overall pattern
        node_degree = graph.degree(node)
        degrees = [d for n, d in graph.degree()]
        avg_degree = np.mean(degrees)
        
        # Alignment based on deviation from mean
        alignment = 1.0 - abs(node_degree - avg_degree) / avg_degree
        return max(0.0, min(1.0, alignment))
    
    def _calculate_adl_balance(self, graph: nx.Graph, node: int) -> float:
        """Calculate Adl (justice) balance for a specific node."""
        # Measure fairness of connections
        node_neighbors = list(graph.neighbors(node))
        if not node_neighbors:
            return 0.5
        
        # Calculate degree variance among neighbors
        neighbor_degrees = [graph.degree(n) for n in node_neighbors]
        variance = np.var(neighbor_degrees)
        
        # Lower variance = more balanced
        balance = 1.0 / (1.0 + variance)
        return balance
    
    def _calculate_sabr_resilience(self, graph: nx.Graph, node: int) -> float:
        """Calculate Sabr (patience/resilience) for a specific node."""
        # Measure based on alternative paths
        if graph.number_of_nodes() <= 1:
            return 0.0
        
        # Count number of independent paths to other nodes
        # Use local node connectivity instead of node_connectivity
        try:
            # Calculate node connectivity (number of internally node-disjoint paths)
            connectivity = nx.local_node_connectivity(graph, node)
        except:
            # Fallback to degree-based resilience
            degree = graph.degree(node)
            max_degree = max(dict(graph.degree()).values())
            connectivity = degree / max_degree
        
        # Higher connectivity = more resilient
        resilience = min(1.0, connectivity / 10.0)
        return resilience
    
    def _calculate_tawhid_cascade_impact(self, affected_nodes: List[int], graph: nx.Graph) -> float:
        """Calculate Tawhid impact of cascade (unity preservation)."""
        total_nodes = graph.number_of_nodes()
        affected_ratio = len(affected_nodes) / total_nodes
        
        # Measure how cascade affects network unity
        if affected_ratio < 0.1:
            return 0.1  # Minimal impact
        elif affected_ratio < 0.5:
            return 0.5  # Moderate impact
        else:
            return 1.0  # Major impact
    
    def _calculate_adl_cascade_impact(self, affected_nodes: List[int], graph: nx.Graph) -> float:
        """Calculate Adl impact of cascade (justice/fairness)."""
        # Measure if cascade affects all roles fairly
        role_counts = {NodeRole.IMAM: 0, NodeRole.ALIM: 0, NodeRole.MAMUM: 0}
        total_role_counts = {NodeRole.IMAM: 0, NodeRole.ALIM: 0, NodeRole.MAMUM: 0}
        
        for node in graph.nodes():
            role = graph.nodes[node]['role']
            total_role_counts[role] += 1
        
        for node in affected_nodes:
            role = graph.nodes[node]['role']
            role_counts[role] += 1
        
        # Calculate fairness of impact distribution
        impact_ratios = {}
        for role in NodeRole:
            if total_role_counts[role] > 0:
                impact_ratios[role] = role_counts[role] / total_role_counts[role]
            else:
                impact_ratios[role] = 0.0
        
        # Lower variance in impact ratios = more just
        impact_variance = np.var(list(impact_ratios.values()))
        fairness = 1.0 / (1.0 + impact_variance)
        
        return fairness
    
    def _calculate_sabr_cascade_impact(self, affected_nodes: List[int], graph: nx.Graph) -> float:
        """Calculate Sabr impact of cascade (resilience)."""
        # Measure network resilience after cascade
        remaining_graph = graph.copy()
        remaining_graph.remove_nodes_from(affected_nodes)
        
        if remaining_graph.number_of_nodes() == 0:
            return 0.0  # Network completely destroyed
        
        # Check if remaining network is still connected
        if nx.is_connected(remaining_graph):
            return 1.0  # Fully resilient
        else:
            # Calculate size of largest component
            largest_cc = max(nx.connected_components(remaining_graph), key=len)
            resilience = len(largest_cc) / remaining_graph.number_of_nodes()
            return resilience
    
    def _calculate_hikmah_cascade_impact(self, affected_nodes: List[int], graph: nx.Graph) -> float:
        """Calculate Hikmah impact of cascade (wisdom)."""
        # Measure impact on knowledge hubs (Alim nodes)
        alim_affected = 0
        total_alim = 0
        
        for node in graph.nodes():
            role = graph.nodes[node]['role']
            if role == NodeRole.ALIM:
                total_alim += 1
                if node in affected_nodes:
                    alim_affected += 1
        
        if total_alim == 0:
            return 0.0
        
        # Impact on knowledge distribution
        knowledge_impact = alim_affected / total_alim
        return knowledge_impact
    
    def _calculate_tawasul_cascade_impact(self, affected_nodes: List[int], graph: nx.Graph) -> float:
        """Calculate Tawasul impact of cascade (interconnectedness)."""
        # Measure how cascade affects network connectivity
        total_edges = graph.number_of_edges()
        
        # Count edges affected by removed nodes
        affected_edges = 0
        for node in affected_nodes:
            affected_edges += graph.degree(node)
        
        # Edge impact ratio
        edge_impact = affected_edges / (2 * total_edges)  # Divide by 2 to avoid double counting
        
        return edge_impact
    
    def _calculate_cascade_resilience(self, affected_nodes: List[int], graph: nx.Graph) -> float:
        """Calculate overall cascade resilience score."""
        # Combine multiple resilience factors
        total_nodes = graph.number_of_nodes()
        affected_ratio = len(affected_nodes) / total_nodes
        
        # Network fragmentation
        remaining_graph = graph.copy()
        remaining_graph.remove_nodes_from(affected_nodes)
        
        if remaining_graph.number_of_nodes() == 0:
            return 0.0
        
        if nx.is_connected(remaining_graph):
            fragmentation = 0.0
        else:
            components = list(nx.connected_components(remaining_graph))
            fragmentation = len(components) - 1
        
        # Combined resilience score
        resilience = (1.0 - affected_ratio) * (1.0 - fragmentation / 10.0)
        return max(0.0, min(1.0, resilience))
    
    def _get_principle_description(self, principle: IslamicPrinciple) -> str:
        """Get description of Islamic principle."""
        descriptions = {
            IslamicPrinciple.TAWHID: "Divine Unity - Self-similarity across scales",
            IslamicPrinciple.ADL: "Justice - Fair distribution and balance",
            IslamicPrinciple.SABR: "Patience - Resilience and perseverance",
            IslamicPrinciple.HIKMAH: "Wisdom - Knowledge and leadership",
            IslamicPrinciple.TAWASUL: "Interconnectedness - Cascade effects and unity"
        }
        return descriptions.get(principle, "Unknown principle")


# Factory function for creating FractalSwarmTopology instances
def create_fractal_swarm_topology(tenant_id: str = "default") -> FractalSwarmTopology:
    """
    Factory function to create FractalSwarmTopology instances.
    
    Args:
        tenant_id: Tenant identifier for multi-tenant architecture
        
    Returns:
        Configured FractalSwarmTopology instance
    """
    return FractalSwarmTopology(tenant_id=tenant_id)


# Test function
async def test_fractal_swarm_topology():
    """Test the FractalSwarmTopology functionality."""
    print("\n" + "=" * 60)
    print("Testing Fractal Swarm Topology")
    print("=" * 60 + "\n")
    
    # Create topology
    topology = create_fractal_swarm_topology("test-tenant")
    
    # Build fractal hierarchy
    graphs = topology.build_fractal_hierarchy()
    print(f"✅ Built networks for scales: {list(graphs.keys())}")
    
    # Verify self-similarity
    similarity = topology.verify_self_similarity()
    print(f"\n📊 Self-similarity scores:")
    for scale, score in similarity.items():
        print(f"  {scale.value}: {score:.3f}")
    
    # Calculate scale invariance
    invariance = topology.calculate_scale_invariance()
    print(f"\n📏 Scale invariance metrics:")
    for metric, value in invariance.items():
        print(f"  {metric}: {value:.3f}")
    
    # Identify hubs
    for scale in NetworkScale:
        if scale in graphs:
            hubs = topology.identify_hubs(scale)
            print(f"\n👥 Hubs in {scale.value} network:")
            print(f"  Total hubs: {len(hubs.hub_nodes)}")
            print(f"  Imam nodes: {sum(1 for role in hubs.hub_roles.values() if role == NodeRole.IMAM)}")
            print(f"  Alim nodes: {sum(1 for role in hubs.hub_roles.values() if role == NodeRole.ALIM)}")
    
    # Analyze cascade effects
    if NetworkScale.MICRO in graphs:
        source_node = list(graphs[NetworkScale.MICRO].nodes())[0]
        cascade = topology.analyze_cascade_effects(NetworkScale.MICRO, source_node)
        print(f"\n⚡ Cascade analysis from node {source_node}:")
        print(f"  Affected nodes: {len(cascade.affected_nodes)}")
        print(f"  Cascade depth: {cascade.cascade_depth}")
        print(f"  Propagation speed: {cascade.propagation_speed:.3f}")
        print(f"  Resilience score: {cascade.resilience_score:.3f}")
    
    # Visualize and export
    for scale in NetworkScale:
        if scale in graphs:
            # Static visualization
            viz_path = topology.visualize_topology(scale)
            print(f"\n📈 Visualization saved: {viz_path}")
            
            # D3.js export
            d3_data = topology.export_for_d3(scale)
            print(f"🌐 D3.js data exported for {scale.value} scale")
    
    print("\n✅ Fractal Swarm Topology test completed successfully!")


if __name__ == "__main__":
    asyncio.run(test_fractal_swarm_topology())