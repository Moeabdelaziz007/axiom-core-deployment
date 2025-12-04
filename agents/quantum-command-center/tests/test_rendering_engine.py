import pytest
import os
from unittest.mock import MagicMock, patch
from quantum_command_center.utils.rendering_engine import QuantumRenderingEngine

@pytest.fixture
def engine():
    return QuantumRenderingEngine()

def test_rendering_engine_initialization(engine):
    """Test that the engine initializes with correct template environment."""
    assert engine.template_env is not None

@patch("quantum_command_center.utils.rendering_engine.HTML")
def test_generate_optimization_report_success(mock_html, engine, tmp_path):
    """Test successful PDF generation."""
    # Mock data
    optimization_result = {
        "optimizer_output": {
            "trip_name": "Test Trip",
            "final_cost": 100.0,
            "safe_rationale": "Safe",
            "segments": []
        },
        "tenant_id": "TEST-TENANT"
    }
    travel_id = "TEST-TRIP-001"
    
    # Mock HTML.write_pdf
    mock_html_instance = MagicMock()
    mock_html.return_value = mock_html_instance
    
    # Execute
    output_path = engine.generate_optimization_report(optimization_result, travel_id)
    
    # Verify
    assert output_path is not None
    assert "report_TEST-TRIP-001.pdf" in output_path
    mock_html_instance.write_pdf.assert_called_once()

@patch("quantum_command_center.utils.rendering_engine.create_cost_breakdown_chart")
@patch("quantum_command_center.utils.rendering_engine.HTML")
def test_chart_embedding(mock_html, mock_create_chart, engine):
    """Test that chart generator is called when segments are present."""
    optimization_result = {
        "optimizer_output": {
            "segments": [{"type": "Flight", "cost": 100}]
        }
    }
    
    mock_create_chart.return_value = "/path/to/chart.png"
    
    engine.generate_optimization_report(optimization_result, "TEST-CHART")
    
    mock_create_chart.assert_called_once()
