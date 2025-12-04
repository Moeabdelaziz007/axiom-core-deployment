"""
Tests for MizanEngine Integration
Part of QCC Phase 2: ATA Pilot

Tests the MizanEngine divine balance optimization with Islamic spiritual principles
and its integration with the ATA optimizer.
"""

import pytest
import asyncio
import json
from unittest.mock import MagicMock, patch, AsyncMock
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
sys.path.append(str(Path(__file__).parent.parent.parent))

# Mock environment variables before importing modules
with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_key"}):
    with patch("autogen_ext.models.openai.OpenAIChatCompletionClient") as MockClient:
        from quantum_command_center.agents.ata_optimizer import create_ata_optimizer, optimize_with_mizan_engine
        from quantum_command_center.core.mizan_engine import (
            MizanEngine, 
            create_mizan_engine, 
            create_optimization_options_from_itinerary, 
            SpiritualWeightConfig,
            OptimizationOption,
            OptimizationObjective
        )


class TestMizanEngine:
    """Test suite for MizanEngine core functionality."""
    
    @pytest.fixture
    def default_mizan_engine(self):
        """Create a default MizanEngine instance for testing."""
        return create_mizan_engine(tenant_id="TEST-TENANT")
    
    @pytest.fixture
    def custom_spiritual_config(self):
        """Create custom spiritual configuration for testing."""
        return SpiritualWeightConfig(
            mizan_balance_weight=0.6,
            adl_justice_weight=0.2,
            ihsan_excellence_weight=0.15,
            amanah_trust_weight=0.05
        ).normalize()
    
    @pytest.fixture
    def custom_mizan_engine(self, custom_spiritual_config):
        """Create a MizanEngine instance with custom spiritual config."""
        return create_mizan_engine(
            tenant_id="CUSTOM-TENANT", 
            spiritual_config=custom_spiritual_config
        )
    
    @pytest.fixture
    def sample_options(self):
        """Create sample optimization options for testing."""
        return [
            OptimizationOption(
                option_id="CHEAP",
                description="Cheapest option with long layovers",
                cost_usd=450.00,
                duration_hours=28.0,
                safety_score=0.6,
                comfort_score=0.4,
                spiritual_score=0.5,
                metadata={"layovers": 2, "layover_hours": 8.0}
            ),
            OptimizationOption(
                option_id="FAST",
                description="Fastest option with premium carrier",
                cost_usd=1200.00,
                duration_hours=14.0,
                safety_score=0.9,
                comfort_score=0.8,
                spiritual_score=0.7,
                metadata={"layovers": 1, "layover_hours": 2.0}
            ),
            OptimizationOption(
                option_id="BALANCED",
                description="Good balance of cost and convenience",
                cost_usd=750.00,
                duration_hours=18.0,
                safety_score=0.8,
                comfort_score=0.7,
                spiritual_score=0.8,
                metadata={"layovers": 1, "layover_hours": 4.0}
            )
        ]
    
    def test_mizan_engine_initialization(self, default_mizan_engine):
        """Test MizanEngine initialization with default configuration."""
        assert default_mizan_engine.tenant_id == "TEST-TENANT"
        assert default_mizan_engine.spiritual_config.mizan_balance_weight == 0.4
        assert default_mizan_engine.spiritual_config.adl_justice_weight == 0.3
        assert default_mizan_engine.spiritual_config.ihsan_excellence_weight == 0.2
        assert default_mizan_engine.spiritual_config.amanah_trust_weight == 0.1
    
    def test_mizan_engine_custom_initialization(self, custom_mizan_engine, custom_spiritual_config):
        """Test MizanEngine initialization with custom spiritual config."""
        assert custom_mizan_engine.tenant_id == "CUSTOM-TENANT"
        assert custom_mizan_engine.spiritual_config.mizan_balance_weight == custom_spiritual_config.mizan_balance_weight
        assert custom_mizan_engine.spiritual_config.adl_justice_weight == custom_spiritual_config.adl_justice_weight
    
    def test_apply_mizan(self, default_mizan_engine, sample_options):
        """Test the main apply_mizan method."""
        result = default_mizan_engine.apply_mizan(sample_options)
        
        assert result is not None
        assert result.selected_option is not None
        assert result.balance_score >= 0.0 and result.balance_score <= 1.0
        assert len(result.pareto_optimal_options) >= 1
        assert result.saro_reflection is not None
        assert result.safety_analysis is not None
        assert result.spiritual_analysis is not None
        assert result.justification is not None
    
    def test_calculate_weight(self, default_mizan_engine, sample_options):
        """Test weight calculation for optimization options."""
        for option in sample_options:
            weight = default_mizan_engine.calculate_weight(option)
            assert weight >= 0.0
            assert isinstance(weight, (int, float))
    
    def test_saro_reflection(self, default_mizan_engine, sample_options):
        """Test SaRO reflection generation."""
        reflection = default_mizan_engine.saro_reflection(sample_options, sample_options[:2])
        
        assert "SaRO" in reflection
        assert "Safety-oriented Reasoning Optimization" in reflection
        assert "Pareto optimal" in reflection
    
    def test_check_balance_threshold(self, default_mizan_engine, sample_options):
        """Test balance threshold checking."""
        for option in sample_options:
            result = default_mizan_engine.check_balance_threshold(option)
            assert isinstance(result, bool)
    
    def test_get_pareto_optimal(self, default_mizan_engine, sample_options):
        """Test Pareto optimal solution identification."""
        pareto_optimal = default_mizan_engine.get_pareto_optimal(sample_options)
        
        assert len(pareto_optimal) >= 1
        assert len(pareto_optimal) <= len(sample_options)
        for option in pareto_optimal:
            assert option in sample_options
    
    def test_spiritual_weight_normalization(self):
        """Test spiritual weight configuration normalization."""
        # Test with unnormalized weights
        config = SpiritualWeightConfig(
            mizan_balance_weight=4.0,
            adl_justice_weight=2.0,
            ihsan_excellence_weight=3.0,
            amanah_trust_weight=1.0
        )
        
        normalized = config.normalize()
        
        # Check that weights sum to 1.0
        total = (
            normalized.mizan_balance_weight +
            normalized.adl_justice_weight +
            normalized.ihsan_excellence_weight +
            normalized.amanah_trust_weight
        )
        assert abs(total - 1.0) < 0.001
    
    def test_empty_options_handling(self, default_mizan_engine):
        """Test handling of empty options list."""
        with pytest.raises(ValueError, match="No options provided"):
            default_mizan_engine.apply_mizan([])


class TestMizanEngineIntegration:
    """Test suite for MizanEngine integration with ATA optimizer."""
    
    @pytest.fixture
    def mock_ata_optimizer(self):
        """Create a mock ATA optimizer for testing."""
        with patch("autogen_ext.models.openai.OpenAIChatCompletionClient") as MockClient:
            mock_client_instance = MagicMock()
            MockClient.return_value = mock_client_instance
            
            with patch("quantum_command_center.agents.ata_optimizer.GEMINI_API_KEY", "fake_key"):
                agent = create_ata_optimizer(tenant_id="INTEGRATION-TEST")
                return agent
    
    @pytest.fixture
    def sample_itinerary(self):
        """Create sample itinerary data for testing."""
        return {
            "origin": "New York (NY_PENN)",
            "destination": "Riyadh, Saudi Arabia",
            "date": "2025-12-01",
            "segments": [
                {
                    "type": "flight",
                    "from": "JFK",
                    "to": "RUH",
                    "options": [
                        {
                            "id": "CHEAP_1",
                            "price_usd": 450.00,
                            "duration_hours": 28,
                            "layovers": 2,
                            "layover_cities": ["IST", "CAI"],
                            "description": "Cheapest option with long layovers"
                        },
                        {
                            "id": "FAST_1",
                            "price_usd": 1200.00,
                            "duration_hours": 14,
                            "layovers": 1,
                            "layover_cities": ["DXB"],
                            "description": "Direct route, premium carrier"
                        }
                    ]
                }
            ]
        }
    
    def test_create_optimization_options_from_itinerary(self, sample_itinerary):
        """Test conversion of itinerary data to optimization options."""
        options = create_optimization_options_from_itinerary(sample_itinerary)
        
        assert len(options) >= 1
        for option in options:
            assert isinstance(option, OptimizationOption)
            assert option.option_id is not None
            assert option.cost_usd >= 0
            assert option.duration_hours >= 0
            assert 0 <= option.safety_score <= 1
            assert 0 <= option.comfort_score <= 1
            assert 0 <= option.spiritual_score <= 1
    
    @pytest.mark.asyncio
    async def test_optimize_with_mizan_engine(self, sample_itinerary):
        """Test the optimize_with_mizan_engine function."""
        result = await optimize_with_mizan_engine(sample_itinerary, "INTEGRATION-TEST")
        
        assert result is not None
        assert "selected_option" in result or "error" in result
        
        if "selected_option" in result:
            selected = result["selected_option"]
            assert "id" in selected
            assert "cost_usd" in selected
            assert "duration_hours" in selected
            assert "safety_score" in selected
            assert "comfort_score" in selected
            assert "spiritual_score" in selected
        
        assert "tenant_id" in result
        assert result["tenant_id"] == "INTEGRATION-TEST"
    
    def test_ata_optimizer_with_mizan_integration(self, mock_ata_optimizer):
        """Test ATA optimizer creation with MizanEngine integration."""
        assert mock_ata_optimizer.name == "ATA_Optimizer"
        assert hasattr(mock_ata_optimizer, '_mizan_engine')
        assert mock_ata_optimizer._mizan_engine is not None
        assert mock_ata_optimizer._mizan_engine.tenant_id == "INTEGRATION-TEST"
    
    def test_error_handling_in_optimization(self):
        """Test error handling in optimization process."""
        # Test with invalid itinerary data
        invalid_itinerary = {"invalid": "data"}
        
        result = asyncio.run(optimize_with_mizan_engine(invalid_itinerary, "ERROR-TEST"))
        
        assert result is not None
        assert "error" in result
        assert "tenant_id" in result
        assert result["tenant_id"] == "ERROR-TEST"


class TestSafetyConstraints:
    """Test suite for safety constraints integration."""
    
    @pytest.fixture
    def mizan_engine(self):
        """Create MizanEngine for safety testing."""
        return create_mizan_engine(tenant_id="SAFETY-TEST")
    
    def test_safety_constraint_filtering(self, mizan_engine):
        """Test filtering of options by safety constraints."""
        safe_option = OptimizationOption(
            option_id="SAFE",
            description="Safe option",
            cost_usd=800.00,
            duration_hours=16.0,
            safety_score=0.9,
            comfort_score=0.7,
            spiritual_score=0.8,
            metadata={"layovers": 1, "layover_hours": 3.0}
        )
        
        unsafe_option = OptimizationOption(
            option_id="UNSAFE",
            description="Unsafe option",
            cost_usd=200.00,
            duration_hours=48.0,  # Exceeds max travel time
            safety_score=0.2,  # Low safety score
            comfort_score=0.3,
            spiritual_score=0.4,
            metadata={"layovers": 4, "layover_hours": 12.0}
        )
        
        filtered = mizan_engine._filter_by_safety_constraints([safe_option, unsafe_option])
        
        # Should only contain the safe option
        assert len(filtered) == 1
        assert filtered[0].option_id == "SAFE"
    
    def test_safety_analysis_generation(self, mizan_engine):
        """Test safety analysis generation for options."""
        option = OptimizationOption(
            option_id="TEST",
            description="Test option",
            cost_usd=600.00,
            duration_hours=18.0,
            safety_score=0.7,
            comfort_score=0.6,
            spiritual_score=0.7,
            metadata={"layovers": 1, "layover_hours": 4.0}
        )
        
        analysis = mizan_engine._analyze_safety(option)
        
        assert "safety_score" in analysis
        assert "risk_factors" in analysis
        assert "safety_recommendations" in analysis
        assert isinstance(analysis["risk_factors"], list)
        assert isinstance(analysis["safety_recommendations"], list)


class TestSpiritualAnalysis:
    """Test suite for spiritual analysis functionality."""
    
    @pytest.fixture
    def custom_config(self):
        """Create custom spiritual configuration."""
        return SpiritualWeightConfig(
            mizan_balance_weight=0.5,
            adl_justice_weight=0.3,
            ihsan_excellence_weight=0.15,
            amanah_trust_weight=0.05
        ).normalize()
    
    @pytest.fixture
    def mizan_engine(self, custom_config):
        """Create MizanEngine with custom spiritual config."""
        return create_mizan_engine(
            tenant_id="SPIRITUAL-TEST",
            spiritual_config=custom_config
        )
    
    def test_spiritual_analysis_generation(self, mizan_engine, custom_config):
        """Test spiritual analysis generation."""
        option = OptimizationOption(
            option_id="SPIRITUAL",
            description="Spiritually aligned option",
            cost_usd=700.00,
            duration_hours=17.0,
            safety_score=0.8,
            comfort_score=0.7,
            spiritual_score=0.9,
            metadata={}
        )
        
        analysis = mizan_engine._analyze_spiritual_alignment(option)
        
        assert "spiritual_score" in analysis
        assert "mizan_balance" in analysis
        assert "adl_justice" in analysis
        assert "ihsan_excellence" in analysis
        assert "amanah_trust" in analysis
        
        # Check that spiritual weights are applied correctly
        assert analysis["mizan_balance"] == option.spiritual_score * custom_config.mizan_balance_weight
        assert analysis["adl_justice"] == option.spiritual_score * custom_config.adl_justice_weight
        assert analysis["ihsan_excellence"] == option.spiritual_score * custom_config.ihsan_excellence_weight
        assert analysis["amanah_trust"] == option.spiritual_score * custom_config.amanah_trust_weight
    
    def test_justification_generation(self, mizan_engine):
        """Test comprehensive justification generation."""
        option = OptimizationOption(
            option_id="JUSTIFIED",
            description="Well justified option",
            cost_usd=750.00,
            duration_hours=18.0,
            safety_score=0.8,
            comfort_score=0.7,
            spiritual_score=0.8,
            metadata={}
        )
        
        justification = mizan_engine._generate_justification(option, 0.85, "Test reflection")
        
        assert "Mizan Divine Balance Justification" in justification
        assert "JUSTIFIED" in justification
        assert "0.850" in justification  # Balance score
        assert "Core Metrics" in justification
        assert "Islamic Principles Applied" in justification
        assert "SaRO Reflection Summary" in justification


# Performance and stress tests
class TestMizanEnginePerformance:
    """Test suite for MizanEngine performance."""
    
    def test_large_options_handling(self):
        """Test handling of large number of options."""
        mizan_engine = create_mizan_engine(tenant_id="PERFORMANCE-TEST")
        
        # Create 100 options
        options = []
        for i in range(100):
            options.append(OptimizationOption(
                option_id=f"OPTION_{i}",
                description=f"Option {i}",
                cost_usd=500.0 + i * 10,
                duration_hours=15.0 + i * 0.1,
                safety_score=0.5 + (i % 10) * 0.05,
                comfort_score=0.5 + (i % 8) * 0.06,
                spiritual_score=0.5 + (i % 6) * 0.08,
                metadata={}
            ))
        
        # Should handle large option sets without issues
        result = mizan_engine.apply_mizan(options)
        
        assert result is not None
        assert result.selected_option is not None
        assert len(result.pareto_optimal_options) >= 1


if __name__ == "__main__":
    # Run a quick test when executed directly
    print("Running MizanEngine tests...")
    
    # Test basic functionality
    engine = create_mizan_engine(tenant_id="QUICK-TEST")
    
    options = [
        OptimizationOption(
            option_id="TEST1",
            description="Test option 1",
            cost_usd=500.00,
            duration_hours=16.0,
            safety_score=0.7,
            comfort_score=0.6,
            spiritual_score=0.7,
            metadata={}
        ),
        OptimizationOption(
            option_id="TEST2",
            description="Test option 2",
            cost_usd=800.00,
            duration_hours=14.0,
            safety_score=0.9,
            comfort_score=0.8,
            spiritual_score=0.8,
            metadata={}
        )
    ]
    
    result = engine.apply_mizan(options)
    print(f"✅ Quick test passed. Selected: {result.selected_option.option_id}")
    print(f"   Balance score: {result.balance_score:.3f}")
    print(f"   Pareto optimal options: {len(result.pareto_optimal_options)}")