"""
Test cases for Fractal Swarm Topology
Part of QCC Spiritual Intelligence Framework

This module contains comprehensive tests for the FractalSwarmTopology class,
verifying all functionality including network construction, spiritual principles integration,
and topology analysis capabilities.
"""

import os
import sys
import unittest
import asyncio
import numpy as np
from unittest.mock import patch, MagicMock

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from topology.fractal_swarm import (
    FractalSwarmTopology,
    NetworkScale,
    IslamicPrinciple,
    NodeRole,
    TopologyMetrics,
    HubAnalysis,
    CascadeAnalysis,
    create_fractal_swarm_topology
)


class TestFractalSwarmTopology(unittest.TestCase):
    """Test cases for FractalSwarmTopology class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.tenant_id = "test-tenant"
        self.topology = FractalSwarmTopology(tenant_id=self.tenant_id)
    
    def test_initialization(self):
        """Test topology initialization."""
        # Check basic attributes
        self.assertEqual(self.topology.tenant_id, self.tenant_id)
        self.assertEqual(self.topology.m0, 7)  # Seven Heavens seed
        self.assertEqual(self.topology.m, 3)   # Witr attachment
        
        # Check scale sizes
        expected_sizes = {
            NetworkScale.MICRO: 50,
            NetworkScale.MESO: 200,
            NetworkScale.MACRO: 1000
        }
        self.assertEqual(self.topology.scale_sizes, expected_sizes)
        
        # Check initial state
        self.assertEqual(len(self.topology.graphs), 0)
        self.assertEqual(len(self.topology.metrics), 0)
    
    def test_build_fractal_hierarchy(self):
        """Test building fractal hierarchy across scales."""
        # Build hierarchy
        graphs = self.topology.build_fractal_hierarchy()
        
        # Check all scales are built
        self.assertEqual(len(graphs), 3)
        self.assertIn(NetworkScale.MICRO, graphs)
        self.assertIn(NetworkScale.MESO, graphs)
        self.assertIn(NetworkScale.MACRO, graphs)
        
        # Check node counts
        self.assertEqual(graphs[NetworkScale.MICRO].number_of_nodes(), 50)
        self.assertEqual(graphs[NetworkScale.MESO].number_of_nodes(), 200)
        self.assertEqual(graphs[NetworkScale.MACRO].number_of_nodes(), 1000)
        
        # Check metrics are calculated
        self.assertEqual(len(self.topology.metrics), 3)
        
        # Check node roles are assigned
        for scale, graph in graphs.items():
            roles = set()
            for node in graph.nodes():
                role = graph.nodes[node]['role']
                roles.add(role)
                self.assertIn(role, NodeRole)
            
            # All three roles should be present
            self.assertIn(NodeRole.IMAM, roles)
            self.assertIn(NodeRole.ALIM, roles)
            self.assertIn(NodeRole.MAMUM, roles)
    
    def test_scale_free_network_properties(self):
        """Test scale-free network properties."""
        # Build micro scale network
        graphs = self.topology.build_fractal_hierarchy()
        graph = graphs[NetworkScale.MICRO]
        
        # Check basic connectivity
        self.assertGreater(graph.number_of_edges(), 0)
        self.assertTrue(nx.is_connected(graph))
        
        # Check degree distribution (should be skewed)
        degrees = [d for n, d in graph.degree()]
        max_degree = max(degrees)
        avg_degree = np.mean(degrees)
        
        # In scale-free networks, max degree should be significantly higher than average
        self.assertGreater(max_degree, avg_degree * 2)
        
        # Check for hub nodes (high degree nodes)
        degree_threshold = np.percentile(degrees, 90)
        hub_count = sum(1 for d in degrees if d >= degree_threshold)
        expected_hub_count = int(len(degrees) * 0.1)  # Top 10%
        self.assertAlmostEqual(hub_count, expected_hub_count, delta=2)
    
    def test_verify_self_similarity(self):
        """Test self-similarity verification."""
        # Build hierarchy
        graphs = self.topology.build_fractal_hierarchy()
        
        # Verify self-similarity
        similarity_scores = self.topology.verify_self_similarity()
        
        # Check all scales have scores
        self.assertEqual(len(similarity_scores), 3)
        self.assertIn(NetworkScale.MICRO, similarity_scores)
        self.assertIn(NetworkScale.MESO, similarity_scores)
        self.assertIn(NetworkScale.MACRO, similarity_scores)
        
        # Check score ranges (0-1)
        for scale, score in similarity_scores.items():
            self.assertGreaterEqual(score, 0.0)
            self.assertLessEqual(score, 1.0)
    
    def test_calculate_scale_invariance(self):
        """Test scale invariance calculation."""
        # Build hierarchy
        graphs = self.topology.build_fractal_hierarchy()
        
        # Calculate invariance
        invariance_metrics = self.topology.calculate_scale_invariance()
        
        # Check required metrics
        required_metrics = [
            'degree_distribution_invariance',
            'clustering_invariance',
            'path_length_invariance',
            'overall_invariance'
        ]
        
        for metric in required_metrics:
            self.assertIn(metric, invariance_metrics)
            self.assertGreaterEqual(invariance_metrics[metric], 0.0)
            self.assertLessEqual(invariance_metrics[metric], 1.0)
    
    def test_identify_hubs(self):
        """Test hub identification."""
        # Build hierarchy
        graphs = self.topology.build_fractal_hierarchy()
        
        # Identify hubs for each scale
        for scale in NetworkScale:
            hub_analysis = self.topology.identify_hubs(scale)
            
            # Check return type
            self.assertIsInstance(hub_analysis, HubAnalysis)
            
            # Check hub nodes exist
            self.assertGreater(len(hub_analysis.hub_nodes), 0)
            
            # Check hub roles
            for node in hub_analysis.hub_nodes:
                self.assertIn(node, hub_analysis.hub_roles)
                self.assertIn(hub_analysis.hub_roles[node], NodeRole)
            
            # Check centrality scores
            for node in hub_analysis.hub_nodes:
                self.assertIn(node, hub_analysis.centrality_scores)
                self.assertGreater(hub_analysis.centrality_scores[node], 0.0)
                self.assertLessEqual(hub_analysis.centrality_scores[node], 1.0)
            
            # Check spiritual influence
            for node in hub_analysis.hub_nodes:
                self.assertIn(node, hub_analysis.spiritual_influence)
                self.assertGreater(hub_analysis.spiritual_influence[node], 0.0)
    
    def test_analyze_cascade_effects(self):
        """Test cascade effect analysis."""
        # Build hierarchy
        graphs = self.topology.build_fractal_hierarchy()
        
        # Analyze cascade for micro scale
        scale = NetworkScale.MICRO
        graph = graphs[scale]
        source_node = list(graph.nodes())[0]
        
        cascade_analysis = self.topology.analyze_cascade_effects(scale, source_node)
        
        # Check return type
        self.assertIsInstance(cascade_analysis, CascadeAnalysis)
        
        # Check basic properties
        self.assertEqual(cascade_analysis.source_node, source_node)
        self.assertIn(source_node, cascade_analysis.affected_nodes)
        self.assertGreaterEqual(cascade_analysis.cascade_depth, 0)
        self.assertGreater(cascade_analysis.propagation_speed, 0.0)
        
        # Check spiritual impact
        self.assertIn(IslamicPrinciple.TAWHID, cascade_analysis.spiritual_impact)
        self.assertIn(IslamicPrinciple.ADL, cascade_analysis.spiritual_impact)
        self.assertIn(IslamicPrinciple.SABR, cascade_analysis.spiritual_impact)
        self.assertIn(IslamicPrinciple.HIKMAH, cascade_analysis.spiritual_impact)
        self.assertIn(IslamicPrinciple.TAWASUL, cascade_analysis.spiritual_impact)
        
        # Check resilience score
        self.assertGreaterEqual(cascade_analysis.resilience_score, 0.0)
        self.assertLessEqual(cascade_analysis.resilience_score, 1.0)
    
    def test_spiritual_principles_integration(self):
        """Test integration of Islamic spiritual principles."""
        # Build hierarchy
        graphs = self.topology.build_fractal_hierarchy()
        
        # Check Tawhid (self-similarity) in node attributes
        for scale, graph in graphs.items():
            for node in graph.nodes():
                self.assertIn('tawhid_alignment', graph.nodes[node])
                self.assertIn('adl_balance', graph.nodes[node])
                self.assertIn('sabr_resilience', graph.nodes[node])
                
                # Check value ranges
                self.assertGreaterEqual(graph.nodes[node]['tawhid_alignment'], 0.0)
                self.assertLessEqual(graph.nodes[node]['tawhid_alignment'], 1.0)
    
    def test_visualization_capabilities(self):
        """Test visualization and export capabilities."""
        # Build hierarchy
        graphs = self.topology.build_fractal_hierarchy()
        
        # Test static visualization
        for scale in [NetworkScale.MICRO]:  # Test one scale to save time
            viz_path = self.topology.visualize_topology(scale)
            
            # Check file is created
            self.assertTrue(os.path.exists(viz_path))
            self.assertTrue(viz_path.endswith('.png'))
            
            # Clean up
            if os.path.exists(viz_path):
                os.remove(viz_path)
        
        # Test D3.js export
        for scale in [NetworkScale.MICRO]:  # Test one scale to save time
            d3_data = self.topology.export_for_d3(scale)
            
            # Check data structure
            self.assertIn('nodes', d3_data)
            self.assertIn('links', d3_data)
            self.assertIn('metadata', d3_data)
            
            # Check metadata
            metadata = d3_data['metadata']
            self.assertIn('scale', metadata)
            self.assertIn('tenant_id', metadata)
            self.assertIn('metrics', metadata)
            self.assertIn('spiritual_principles', metadata)
    
    def test_error_handling(self):
        """Test error handling for edge cases."""
        # Test invalid scale
        with self.assertRaises(ValueError):
            self.topology.identify_hubs(NetworkScale.MICRO)  # No graph built yet
        
        # Build hierarchy first
        self.topology.build_fractal_hierarchy()
        
        # Test cascade with invalid node
        with self.assertRaises(KeyError):
            self.topology.analyze_cascade_effects(NetworkScale.MICRO, 9999)
    
    def test_factory_function(self):
        """Test factory function for creating instances."""
        # Create instance using factory
        topology = create_fractal_swarm_topology("factory-test")
        
        # Check instance type
        self.assertIsInstance(topology, FractalSwarmTopology)
        self.assertEqual(topology.tenant_id, "factory-test")


class TestNetworkScale(unittest.TestCase):
    """Test cases for NetworkScale enum."""
    
    def test_enum_values(self):
        """Test enum values."""
        self.assertEqual(NetworkScale.MICRO.value, "micro")
        self.assertEqual(NetworkScale.MESO.value, "meso")
        self.assertEqual(NetworkScale.MACRO.value, "macro")


class TestIslamicPrinciple(unittest.TestCase):
    """Test cases for IslamicPrinciple enum."""
    
    def test_enum_values(self):
        """Test enum values."""
        self.assertEqual(IslamicPrinciple.TAWHID.value, "Tawhid")
        self.assertEqual(IslamicPrinciple.ADL.value, "Adl")
        self.assertEqual(IslamicPrinciple.SABR.value, "Sabr")
        self.assertEqual(IslamicPrinciple.HIKMAH.value, "Hikmah")
        self.assertEqual(IslamicPrinciple.TAWASUL.value, "Tawasul")


class TestNodeRole(unittest.TestCase):
    """Test cases for NodeRole enum."""
    
    def test_enum_values(self):
        """Test enum values."""
        self.assertEqual(NodeRole.IMAM.value, "imam")
        self.assertEqual(NodeRole.ALIM.value, "alim")
        self.assertEqual(NodeRole.MAMUM.value, "mamum")


class TestTopologyMetrics(unittest.TestCase):
    """Test cases for TopologyMetrics dataclass."""
    
    def test_dataclass_creation(self):
        """Test dataclass creation and attributes."""
        metrics = TopologyMetrics(
            scale=NetworkScale.MICRO,
            node_count=50,
            edge_count=100,
            avg_degree=4.0,
            clustering_coefficient=0.3,
            avg_path_length=3.5,
            is_scale_free=True,
            power_law_exponent=2.5,
            tawhid_score=0.8,
            hub_count=5
        )
        
        # Check attributes
        self.assertEqual(metrics.scale, NetworkScale.MICRO)
        self.assertEqual(metrics.node_count, 50)
        self.assertEqual(metrics.edge_count, 100)
        self.assertEqual(metrics.avg_degree, 4.0)
        self.assertEqual(metrics.clustering_coefficient, 0.3)
        self.assertEqual(metrics.avg_path_length, 3.5)
        self.assertTrue(metrics.is_scale_free)
        self.assertEqual(metrics.power_law_exponent, 2.5)
        self.assertEqual(metrics.tawhid_score, 0.8)
        self.assertEqual(metrics.hub_count, 5)
        
        # Check timestamp is set
        self.assertIsNotNone(metrics.timestamp)


class TestIntegrationWithExistingAgents(unittest.TestCase):
    """Test integration with existing Raqib and Atid agents."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.topology = FractalSwarmTopology(tenant_id="integration-test")
    
    @patch('topology.fractal_swarm.log_audit_event')
    def test_audit_logging(self, mock_log):
        """Test audit logging integration."""
        # Build hierarchy
        self.topology.build_fractal_hierarchy()
        
        # Check audit events were logged
        self.assertTrue(mock_log.called)
        
        # Check specific calls
        call_args_list = mock_log.call_args_list
        self.assertEqual(len(call_args_list), 2)  # Init + Build
        
        # Check build call
        build_call = call_args_list[1]
        self.assertEqual(build_call[1]['agent_name'], "FractalSwarmTopology")
        self.assertEqual(build_call[1]['action'], "BUILD_FRACTAL_HIERARCHY")
        self.assertEqual(build_call[1]['status'], "SUCCESS")
    
    def test_multi_tenant_isolation(self):
        """Test multi-tenant data isolation."""
        # Create two topologies with different tenants
        topology1 = FractalSwarmTopology(tenant_id="tenant1")
        topology2 = FractalSwarmTopology(tenant_id="tenant2")
        
        # Build hierarchies
        graphs1 = topology1.build_fractal_hierarchy()
        graphs2 = topology2.build_fractal_hierarchy()
        
        # Check isolation
        self.assertNotEqual(id(topology1.graphs), id(topology2.graphs))
        self.assertNotEqual(id(topology1.metrics), id(topology2.metrics))
        
        # Check tenant IDs in node attributes
        for scale in NetworkScale:
            for node in graphs1[scale].nodes():
                self.assertEqual(graphs1[scale].nodes[node]['tenant_id'], "tenant1")
                self.assertEqual(graphs2[scale].nodes[node]['tenant_id'], "tenant2")


# Performance tests
class TestPerformance(unittest.TestCase):
    """Performance tests for Fractal Swarm Topology."""
    
    def test_large_network_performance(self):
        """Test performance with large networks."""
        import time
        
        # Create topology with large macro network
        topology = FractalSwarmTopology(tenant_id="perf-test")
        
        # Time the building process
        start_time = time.time()
        graphs = topology.build_fractal_hierarchy()
        build_time = time.time() - start_time
        
        # Should complete within reasonable time (10 seconds for 1000 nodes)
        self.assertLess(build_time, 10.0)
        
        # Time the analysis
        start_time = time.time()
        similarity = topology.verify_self_similarity()
        analysis_time = time.time() - start_time
        
        # Analysis should be fast (under 5 seconds)
        self.assertLess(analysis_time, 5.0)
    
    def test_memory_usage(self):
        """Test memory usage with multiple scales."""
        import psutil
        import os
        
        # Get initial memory
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Create topology and build hierarchy
        topology = FractalSwarmTopology(tenant_id="memory-test")
        graphs = topology.build_fractal_hierarchy()
        
        # Get final memory
        final_memory = process.memory_info().rss
        memory_increase = (final_memory - initial_memory) / 1024 / 1024  # MB
        
        # Should use reasonable memory (less than 100MB for all scales)
        self.assertLess(memory_increase, 100.0)


# Integration test runner
async def run_integration_tests():
    """Run integration tests for Fractal Swarm Topology."""
    print("\n" + "=" * 60)
    print("Running Integration Tests for Fractal Swarm Topology")
    print("=" * 60 + "\n")
    
    # Create topology
    topology = create_fractal_swarm_topology("integration-test")
    
    # Test full workflow
    print("1. Building fractal hierarchy...")
    graphs = topology.build_fractal_hierarchy()
    print(f"   ✅ Built {len(graphs)} network scales")
    
    print("2. Verifying self-similarity...")
    similarity = topology.verify_self_similarity()
    avg_similarity = np.mean(list(similarity.values()))
    print(f"   ✅ Average self-similarity: {avg_similarity:.3f}")
    
    print("3. Calculating scale invariance...")
    invariance = topology.calculate_scale_invariance()
    print(f"   ✅ Overall invariance: {invariance['overall_invariance']:.3f}")
    
    print("4. Identifying hubs...")
    for scale in [NetworkScale.MICRO]:  # Test one scale
        hubs = topology.identify_hubs(scale)
        print(f"   ✅ {scale.value}: {len(hubs.hub_nodes)} hubs identified")
    
    print("5. Analyzing cascade effects...")
    if NetworkScale.MICRO in graphs:
        source_node = list(graphs[NetworkScale.MICRO].nodes())[0]
        cascade = topology.analyze_cascade_effects(NetworkScale.MICRO, source_node)
        print(f"   ✅ Cascade affected {len(cascade.affected_nodes)} nodes")
    
    print("6. Testing visualizations...")
    for scale in [NetworkScale.MICRO]:  # Test one scale
        viz_path = topology.visualize_topology(scale)
        d3_data = topology.export_for_d3(scale)
        print(f"   ✅ {scale.value} visualization and export completed")
    
    print("\n✅ All integration tests completed successfully!")


if __name__ == "__main__":
    # Run unit tests
    unittest.main(argv=[''], exit=False, verbosity=2)
    
    # Run integration tests
    asyncio.run(run_integration_tests())