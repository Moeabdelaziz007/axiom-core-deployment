import pytest
import sqlite3
import json
import time
from unittest.mock import MagicMock, patch
from quantum_command_center.agents.data_aggregator import AmadeusCacher

@pytest.fixture
def cacher(tmp_path):
    """Fixture to create a fresh AmadeusCacher instance for each test."""
    # Use a temporary file for the database to ensure persistence across calls
    db_file = tmp_path / "test_cache.db"
    cacher = AmadeusCacher(db_path=str(db_file))
    return cacher

def test_cache_miss(cacher):
    """Test that a new key results in a cache miss."""
    query = {"origin": "NYC", "destination": "LON", "date": "2025-12-25"}
    result = cacher.get(query)
    assert result is None

def test_cache_hit(cacher):
    """Test that a stored key results in a cache hit."""
    query = {"origin": "NYC", "destination": "LON", "date": "2025-12-25"}
    mock_data = {"flights": ["flight1", "flight2"]}
    
    cacher.set(query, mock_data)
    
    result = cacher.get(query)
    assert result == mock_data

def test_cache_expiration(cacher):
    """Test that expired cache entries are treated as misses."""
    query = {"origin": "NYC", "destination": "LON", "date": "2025-12-25"}
    mock_data = {"flights": ["flight1"]}
    
    # Cache with 1 second TTL
    cacher.set(query, mock_data, ttl=1)
    
    # Verify hit immediately
    assert cacher.get(query) == mock_data
    
    # Wait for expiration
    time.sleep(1.1)
    
    # Verify miss after expiration
    assert cacher.get(query) is None

def test_concurrent_access_simulation(cacher):
    """Simulate basic concurrent access pattern (sequential in this unit test)."""
    query = {"origin": "A", "destination": "B", "date": "2025-01-01"}
    
    cacher.set(query, {"data": 1})
    cacher.set(query, {"data": 2}) # Overwrite
    
    result = cacher.get(query)
    assert result == {"data": 2}
