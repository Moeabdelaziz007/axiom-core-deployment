import pytest
import json
from quantum_command_center.utils.chart_generator import create_cost_breakdown_chart
import os

def test_chart_generation(tmp_path):
    """Test that chart generator creates a file."""
    segments = [
        {"type": "Flight", "cost": 500},
        {"type": "Hotel", "cost": 300}
    ]
    output_path = str(tmp_path / "test_chart.png")
    
    result_path = create_cost_breakdown_chart(segments, output_path)
    
    assert os.path.exists(result_path)
    assert result_path == output_path

def test_chart_generation_error(tmp_path):
    """Test handling of invalid data."""
    # Use a valid path
    output_path = str(tmp_path / "dummy.png")
    # Pass data missing 'type' key to trigger KeyError
    invalid_data = [{"cost": 100}]
    result = create_cost_breakdown_chart(invalid_data, output_path)
    assert result == "" 
