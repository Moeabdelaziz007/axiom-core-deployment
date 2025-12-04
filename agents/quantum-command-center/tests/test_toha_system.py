"""
Comprehensive Test Suite for Topological Observer (TOHA) System
Part of QCC Spiritual Intelligence Framework

This test suite validates the Topological Observer and Mapper Algorithm
functionality, ensuring proper integration with Islamic spiritual principles
and existing Raqib/Atid systems.
"""

import os
import sys
import asyncio
import unittest
from unittest.mock import Mock, patch, MagicMock
import numpy as np
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from topology.toha_detector import (
    TopologicalObserver,
    TopologicalState,
    PersistentHomology,
    TopologicalEvent,
    TopologicalChange,
    create_topological_observer
)
from topology.mapper_cleaner import (
    MapperAlgorithm,
    CleanedTopology,
    FeatureExtraction,
    CleaningParameters,
    FilterType,
    create_mapper_algorithm
)
from topology.fractal_swarm import (
    FractalSwarmTopology,
    NetworkScale,
    IslamicPrinciple,
    NodeRole
)


class TestTopologicalObserver(unittest.TestCase):
    """Test cases for TopologicalObserver class."""
    
    def setUp(self):
        """Set up test environment."""
        self.observer = create_topological_observer("test-tenant")
        self.observer.fractal_topology.build_fractal_hierarchy()
    
    def test_initialization(self):
        """Test TopologicalObserver initialization."""
        self.assertEqual(self.observer.tenant_id, "test-tenant")
        self.assertIsNotNone(self.observer.fractal_topology)
        self.assertEqual(len(self.observer.observation_history), 0)
        self.assertEqual(len(self.observer.change_history), 0)
        self.assertIsNone(self.observer.current_state)
    
    def test_compute_betti_numbers(self):
        """Test Betti number computation."""
        # Get a graph from fractal topology
        graph = self.observer.fractal_topology.graphs[NetworkScale.MESO]
        
        beta_0, beta_1, beta_2 = self.observer._compute_betti_numbers(graph)
        
        # Validate Betti numbers
        self.assertIsInstance(beta_0, int)
        self.assertIsInstance(beta_1, int)
        self.assertIsInstance(beta_2, int)
        self.assertGreaterEqual(beta_0, 1)  # At least one component
        self.assertGreaterEqual(beta_1, 0)  # Non-negative loops
        self.assertGreaterEqual(beta_2, 0)  # Non-negative voids
    
    def test_persistent_homology_computation(self):
        """Test persistent homology computation."""
        # Get a graph from fractal topology
        graph = self.observer.fractal_topology.graphs[NetworkScale.MESO]
        
        # Run the async method synchronously for testing
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        persistence_diagram = loop.run_until_complete(
            self.observer.compute_persistent_homology(graph)
        )
        
        # Validate persistence diagram
        self.assertIsInstance(persistence_diagram, list)
        
        for feature in persistence_diagram:
            self.assertIsInstance(feature, PersistentHomology)
            self.assertIn(feature.dimension, [0, 1, 2])
            self.assertGreaterEqual(feature.birth, 0.0)
            self.assertGreaterEqual(feature.persistence, 0.0)
            self.assertGreaterEqual(feature.spiritual_significance, 0.0)
            self.assertLessEqual(feature.spiritual_significance, 1.0)
        
        loop.close()
    
    def test_grounding_score_calculation(self):
        """Test grounding score calculation."""
        # Get a graph from fractal topology
        graph = self.observer.fractal_topology.graphs[NetworkScale.MESO]
        
        # Create mock persistence diagram
        persistence_diagram = [
            PersistentHomology(
                dimension=0, birth=0.1, death=0.8, persistence=0.7,
                representatives=[1, 2, 3], spiritual_significance=0.8
            ),
            PersistentHomology(
                dimension=1, birth=0.2, death=0.6, persistence=0.4,
                representatives=[4, 5, 6, 7], spiritual_significance=0.6
            )
        ]
        
        grounding_score = self.observer._calculate_grounding_score(graph, persistence_diagram)
        
        # Validate grounding score
        self.assertIsInstance(grounding_score, float)
        self.assertGreaterEqual(grounding_score, 0.0)
        self.assertLessEqual(grounding_score, 1.0)
    
    def test_hallucination_score_calculation(self):
        """Test hallucination score calculation."""
        # Get a graph from fractal topology
        graph = self.observer.fractal_topology.graphs[NetworkScale.MESO]
        
        # Create mock persistence diagram
        persistence_diagram = [
            PersistentHomology(
                dimension=0, birth=0.1, death=0.2, persistence=0.1,
                representatives=[1, 2], spiritual_significance=0.2
            ),
            PersistentHomology(
                dimension=1, birth=0.3, death=0.4, persistence=0.1,
                representatives=[3, 4], spiritual_significance=0.1
            )
        ]
        
        hallucination_score = self.observer._calculate_hallucination_score(graph, persistence_diagram)
        
        # Validate hallucination score
        self.assertIsInstance(hallucination_score, float)
        self.assertGreaterEqual(hallucination_score, 0.0)
        self.assertLessEqual(hallucination_score, 1.0)
    
    def test_spiritual_balance_calculation(self):
        """Test spiritual balance calculation."""
        # Get a graph from fractal topology
        graph = self.observer.fractal_topology.graphs[NetworkScale.MESO]
        
        # Create mock persistence diagram
        persistence_diagram = [
            PersistentHomology(
                dimension=0, birth=0.1, death=0.8, persistence=0.7,
                representatives=[1, 2, 3], spiritual_significance=0.8
            )
        ]
        
        spiritual_balance = self.observer._calculate_spiritual_balance(graph, persistence_diagram)
        
        # Validate spiritual balance
        self.assertIsInstance(spiritual_balance, dict)
        self.assertEqual(len(spiritual_balance), len(IslamicPrinciple))
        
        for principle, score in spiritual_balance.items():
            self.assertIsInstance(principle, IslamicPrinciple)
            self.assertIsInstance(score, float)
            self.assertGreaterEqual(score, 0.0)
            self.assertLessEqual(score, 1.0)
    
    def test_topological_change_detection(self):
        """Test topological change detection."""
        # Create mock states
        old_state = TopologicalState(
            timestamp=datetime.now(),
            beta_0=2, beta_1=1, beta_2=0,
            persistence_diagram=[],
            grounding_score=0.5, hallucination_score=0.3,
            spiritual_balance={p: 0.5 for p in IslamicPrinciple}
        )
        
        new_state = TopologicalState(
            timestamp=datetime.now(),
            beta_0=1, beta_1=2, beta_2=1,
            persistence_diagram=[],
            grounding_score=0.8, hallucination_score=0.2,
            spiritual_balance={p: 0.6 for p in IslamicPrinciple}
        )
        
        # Run the async method synchronously for testing
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        changes = loop.run_until_complete(
            self.observer._detect_topological_changes(old_state, new_state)
        )
        
        # Validate detected changes
        self.assertIsInstance(changes, list)
        self.assertGreater(len(changes), 0)
        
        for change in changes:
            self.assertIsInstance(change, TopologicalChange)
            self.assertIsInstance(change.event_type, TopologicalEvent)
            self.assertIsInstance(change.confidence, float)
            self.assertGreaterEqual(change.confidence, 0.0)
            self.assertLessEqual(change.confidence, 1.0)
        
        loop.close()
    
    def test_spiritual_interpretation(self):
        """Test spiritual interpretation methods."""
        # Test Betti number interpretations
        interpretation_0 = self.observer._interpret_betti_0_change(2, 1)
        self.assertIsInstance(interpretation_0, str)
        self.assertIn("unity", interpretation_0.lower())
        
        interpretation_1 = self.observer._interpret_betti_1_change(1, 2)
        self.assertIsInstance(interpretation_1, str)
        self.assertIn("cycles", interpretation_1.lower())
        
        # Test grounding interpretation
        state = TopologicalState(
            timestamp=datetime.now(),
            beta_0=1, beta_1=1, beta_2=0,
            persistence_diagram=[],
            grounding_score=0.8, hallucination_score=0.2,
            spiritual_balance={IslamicPrinciple.TAWHID: 0.8}
        )
        
        grounding_interpretation = self.observer._interpret_grounding_state(state)
        self.assertIsInstance(grounding_interpretation, str)
        self.assertIn("grounding", grounding_interpretation.lower())
        
        # Test hallucination interpretation
        hallucination_state = TopologicalState(
            timestamp=datetime.now(),
            beta_0=3, beta_1=5, beta_2=2,
            persistence_diagram=[],
            grounding_score=0.2, hallucination_score=0.9,
            spiritual_balance={p: 0.3 for p in IslamicPrinciple}
        )
        
        hallucination_interpretation = self.observer._interpret_hallucination_state(hallucination_state)
        self.assertIsInstance(hallucination_interpretation, str)
        self.assertIn("hallucination", hallucination_interpretation.lower())


class TestMapperAlgorithm(unittest.TestCase):
    """Test cases for MapperAlgorithm class."""
    
    def setUp(self):
        """Set up test environment."""
        self.mapper = create_mapper_algorithm("test-tenant")
        self.mapper.fractal_topology.build_fractal_hierarchy()
    
    def test_initialization(self):
        """Test MapperAlgorithm initialization."""
        self.assertEqual(self.mapper.tenant_id, "test-tenant")
        self.assertIsNotNone(self.mapper.fractal_topology)
        self.assertIsNotNone(self.mapper.topological_observer)
        self.assertEqual(len(self.mapper.cleaning_history), 0)
        self.assertEqual(len(self.mapper.extraction_history), 0)
        self.assertIsInstance(self.mapper.cleaning_params, CleaningParameters)
    
    def test_noise_reduction(self):
        """Test noise reduction filtering."""
        # Create mock state with noisy features
        noisy_features = [
            PersistentHomology(
                dimension=0, birth=0.1, death=0.15, persistence=0.05,
                representatives=[1], spiritual_significance=0.1  # Low persistence
            ),
            PersistentHomology(
                dimension=1, birth=0.2, death=0.8, persistence=0.6,
                representatives=[2, 3, 4], spiritual_significance=0.7  # High persistence
            )
        ]
        
        state = TopologicalState(
            timestamp=datetime.now(),
            beta_0=1, beta_1=1, beta_2=0,
            persistence_diagram=noisy_features,
            grounding_score=0.5, hallucination_score=0.3,
            spiritual_balance={p: 0.5 for p in IslamicPrinciple}
        )
        
        # Run the async method synchronously for testing
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        cleaned_state, noise_removed = loop.run_until_complete(
            self.mapper._apply_noise_reduction(state, 0.1)
        )
        
        # Validate noise reduction
        self.assertIsInstance(cleaned_state, TopologicalState)
        self.assertEqual(noise_removed, 1)  # One noisy feature removed
        self.assertEqual(len(cleaned_state.persistence_diagram), 1)  # One feature kept
        
        # Kept feature should have high persistence
        kept_feature = cleaned_state.persistence_diagram[0]
        self.assertGreaterEqual(kept_feature.persistence, 0.1)
        
        loop.close()
    
    def test_significance_filtering(self):
        """Test significance filtering."""
        # Create mock state with mixed significance features
        mixed_features = [
            PersistentHomology(
                dimension=0, birth=0.1, death=0.5, persistence=0.4,
                representatives=[1, 2], spiritual_significance=0.2  # Low significance
            ),
            PersistentHomology(
                dimension=1, birth=0.2, death=0.7, persistence=0.5,
                representatives=[3, 4, 5], spiritual_significance=0.8  # High significance
            )
        ]
        
        state = TopologicalState(
            timestamp=datetime.now(),
            beta_0=1, beta_1=1, beta_2=0,
            persistence_diagram=mixed_features,
            grounding_score=0.5, hallucination_score=0.3,
            spiritual_balance={p: 0.5 for p in IslamicPrinciple}
        )
        
        # Run the async method synchronously for testing
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        filtered_state, features_filtered = loop.run_until_complete(
            self.mapper._apply_significance_filtering(state, 0.5)
        )
        
        # Validate significance filtering
        self.assertIsInstance(filtered_state, TopologicalState)
        self.assertEqual(features_filtered, 1)  # One feature filtered
        self.assertEqual(len(filtered_state.persistence_diagram), 1)  # One feature kept
        
        # Kept feature should have high significance
        kept_feature = filtered_state.persistence_diagram[0]
        self.assertGreaterEqual(kept_feature.spiritual_significance, 0.5)
        
        loop.close()
    
    def test_spiritual_purification(self):
        """Test spiritual purification filtering."""
        # Create mock state with impure features
        impure_features = [
            PersistentHomology(
                dimension=0, birth=0.1, death=0.5, persistence=0.4,
                representatives=[1], spiritual_significance=0.3  # Low purity
            ),
            PersistentHomology(
                dimension=1, birth=0.2, death=0.8, persistence=0.6,
                representatives=[2, 3, 4], spiritual_significance=0.9  # High purity
            )
        ]
        
        state = TopologicalState(
            timestamp=datetime.now(),
            beta_0=1, beta_1=1, beta_2=0,
            persistence_diagram=impure_features,
            grounding_score=0.5, hallucination_score=0.3,
            spiritual_balance={p: 0.5 for p in IslamicPrinciple}
        )
        
        # Run the async method synchronously for testing
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        purified_state, purity_improvement = loop.run_until_complete(
            self.mapper._apply_spiritual_purification(state, 0.7)
        )
        
        # Validate spiritual purification
        self.assertIsInstance(purified_state, TopologicalState)
        self.assertGreater(purity_improvement, 0.0)  # Some improvement
        
        # Check spiritual balance improvement
        for principle in IslamicPrinciple:
            original_score = state.spiritual_balance[principle]
            purified_score = purified_state.spiritual_balance[principle]
            self.assertGreaterEqual(purified_score, original_score * 0.6)  # Minimum purification factor
        
        loop.close()
    
    def test_feature_extraction(self):
        """Test significant feature extraction."""
        # Create mock state
        features = [
            PersistentHomology(
                dimension=0, birth=0.1, death=0.8, persistence=0.7,
                representatives=[1, 2, 3], spiritual_significance=0.8
            ),
            PersistentHomology(
                dimension=1, birth=0.2, death=0.6, persistence=0.4,
                representatives=[4, 5, 6, 7], spiritual_significance=0.6
            )
        ]
        
        state = TopologicalState(
            timestamp=datetime.now(),
            beta_0=1, beta_1=1, beta_2=0,
            persistence_diagram=features,
            grounding_score=0.7, hallucination_score=0.2,
            spiritual_balance={p: 0.6 for p in IslamicPrinciple}
        )
        
        # Run the async method synchronously for testing
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        extracted_features = loop.run_until_complete(
            self.mapper.extract_significant_features(state, 0.5)
        )
        
        # Validate feature extraction
        self.assertIsInstance(extracted_features, list)
        
        for feature in extracted_features:
            self.assertIsInstance(feature, FeatureExtraction)
            self.assertIsInstance(feature.feature_id, str)
            self.assertGreaterEqual(feature.significance, 0.5)  # Above threshold
            self.assertGreaterEqual(feature.stability, 0.0)
            self.assertLessEqual(feature.stability, 1.0)
            self.assertIsInstance(feature.spiritual_alignment, dict)
            self.assertEqual(len(feature.spiritual_alignment), len(IslamicPrinciple))
        
        loop.close()
    
    def test_spiritual_filtering(self):
        """Test spiritual principle filtering."""
        # Create mock features
        features = [
            FeatureExtraction(
                feature_id="feature_1",
                feature_type="persistent",
                persistence=0.7, stability=0.8, significance=0.8,
                spiritual_alignment={IslamicPrinciple.TAWHID: 0.9, IslamicPrinciple.ADL: 0.4},
                representatives=[1, 2, 3]
            ),
            FeatureExtraction(
                feature_id="feature_2",
                feature_type="stable",
                persistence=0.5, stability=0.6, significance=0.6,
                spiritual_alignment={IslamicPrinciple.TAWHID: 0.3, IslamicPrinciple.ADL: 0.8},
                representatives=[4, 5, 6]
            )
        ]
        
        # Run the async method synchronously for testing
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        filtered_features = loop.run_until_complete(
            self.mapper.apply_spiritual_filters(features, [IslamicPrinciple.TAWHID])
        )
        
        # Validate spiritual filtering
        self.assertIsInstance(filtered_features, list)
        
        # Only features with high Tawhid alignment should pass
        for feature in filtered_features:
            tawhid_alignment = feature.spiritual_alignment.get(IslamicPrinciple.TAWHID, 0.0)
            self.assertGreaterEqual(tawhid_alignment, 0.6)  # Minimum alignment
        
        loop.close()
    
    def test_bottleneck_distance(self):
        """Test bottleneck distance calculation."""
        # Create mock states
        features1 = [
            PersistentHomology(
                dimension=0, birth=0.1, death=0.8, persistence=0.7,
                representatives=[1, 2], spiritual_significance=0.8
            )
        ]
        
        features2 = [
            PersistentHomology(
                dimension=0, birth=0.2, death=0.7, persistence=0.5,
                representatives=[3, 4], spiritual_significance=0.6
            )
        ]
        
        state1 = TopologicalState(
            timestamp=datetime.now(),
            beta_0=1, beta_1=1, beta_2=0,
            persistence_diagram=features1,
            grounding_score=0.7, hallucination_score=0.2,
            spiritual_balance={p: 0.6 for p in IslamicPrinciple}
        )
        
        state2 = TopologicalState(
            timestamp=datetime.now(),
            beta_0=1, beta_1=1, beta_2=0,
            persistence_diagram=features2,
            grounding_score=0.6, hallucination_score=0.3,
            spiritual_balance={p: 0.5 for p in IslamicPrinciple}
        )
        
        # Run the async method synchronously for testing
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        distance = loop.run_until_complete(
            self.mapper.compute_bottleneck_distance(state1, state2)
        )
        
        # Validate bottleneck distance
        self.assertIsInstance(distance, float)
        self.assertGreaterEqual(distance, 0.0)
        
        loop.close()
    
    def test_clean_topology_generation(self):
        """Test complete clean topology generation."""
        # Run the async method synchronously for testing
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        cleaned_topology = loop.run_until_complete(
            self.mapper.generate_clean_topology(NetworkScale.MESO)
        )
        
        # Validate clean topology
        self.assertIsInstance(cleaned_topology, CleanedTopology)
        self.assertIsInstance(cleaned_topology.original_state, TopologicalState)
        self.assertIsInstance(cleaned_topology.cleaned_state, TopologicalState)
        self.assertIsInstance(cleaned_topology.cleaning_applied, list)
        self.assertGreaterEqual(cleaned_topology.noise_removed, 0)
        self.assertGreaterEqual(cleaned_topology.features_filtered, 0)
        self.assertIsInstance(cleaned_topology.spiritual_purity_improved, float)
        
        # Check that extracted features are included
        self.assertIn("extracted_features", cleaned_topology.cleaning_metadata)
        
        loop.close()


class TestIntegration(unittest.TestCase):
    """Test cases for system integration."""
    
    def setUp(self):
        """Set up test environment."""
        self.observer = create_topological_observer("integration-test")
        self.mapper = create_mapper_algorithm("integration-test")
    
    def test_observer_mapper_integration(self):
        """Test integration between observer and mapper."""
        # Build fractal topology for both
        self.observer.fractal_topology.build_fractal_hierarchy()
        self.mapper.fractal_topology.build_fractal_hierarchy()
        
        # Run the async method synchronously for testing
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Observe topology
        state = loop.run_until_complete(
            self.observer.observe_topology(NetworkScale.MESO)
        )
        
        # Clean topology using mapper
        cleaned_topology = loop.run_until_complete(
            self.mapper.clean_topological_data(state)
        )
        
        # Validate integration
        self.assertIsInstance(state, TopologicalState)
        self.assertIsInstance(cleaned_topology, CleanedTopology)
        self.assertEqual(cleaned_topology.original_state, state)
        
        loop.close()
    
    def test_spiritual_principle_consistency(self):
        """Test consistency of spiritual principles across components."""
        # Test that both observer and mapper use same principles
        observer_principles = set(self.observer.spiritual_weights.keys())
        mapper_principles = set(self.mapper.spiritual_filters.keys())
        
        self.assertEqual(observer_principles, mapper_principles)
        self.assertEqual(observer_principles, set(IslamicPrinciple))
    
    def test_multi_tenant_isolation(self):
        """Test multi-tenant data isolation."""
        # Create observers for different tenants
        observer1 = create_topological_observer("tenant-1")
        observer2 = create_topological_observer("tenant-2")
        
        # Initialize both
        observer1.fractal_topology.build_fractal_hierarchy()
        observer2.fractal_topology.build_fractal_hierarchy()
        
        # Validate isolation
        self.assertNotEqual(observer1.tenant_id, observer2.tenant_id)
        self.assertNotEqual(
            observer1.fractal_topology.tenant_id,
            observer2.fractal_topology.tenant_id
        )
        
        # History should be separate
        self.assertEqual(len(observer1.observation_history), 0)
        self.assertEqual(len(observer2.observation_history), 0)


def run_comprehensive_tests():
    """Run comprehensive test suite for TOHA system."""
    print("\n" + "=" * 60)
    print("Running Comprehensive TOHA System Tests")
    print("=" * 60 + "\n")
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test cases
    test_suite.addTest(unittest.makeSuite(TestTopologicalObserver))
    test_suite.addTest(unittest.makeSuite(TestMapperAlgorithm))
    test_suite.addTest(unittest.makeSuite(TestIntegration))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print(f"\n{'='*60}")
    print("Test Summary")
    print('='*60)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    if result.failures:
        print(f"\nFailures:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if result.errors:
        print(f"\nErrors:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_comprehensive_tests()
    sys.exit(0 if success else 1)