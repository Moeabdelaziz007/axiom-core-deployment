"""
Test suite for Amadeus Cacher
Verifies caching logic, TTL expiration, and stats tracking
"""

import unittest
import sqlite3
import time
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from utils.amadeus_cacher import AmadeusCacher, DEFAULT_TTL


class TestAmadeusCacher(unittest.TestCase):
    """Test cases for AmadeusCacher."""
    
    def setUp(self):
        """Create a test cacher with a temporary database."""
        self.test_db = "test_cache.db"
        self.cacher = AmadeusCacher(db_path=self.test_db)
        
        # Test data
        self.sample_query = {
            "type": "flight_offers",
            "origin": "JFK",
            "destination": "RUH",
            "departure_date": "2025-12-01",
            "adults": 1
        }
        
        self.sample_response = {
            "data": [
                {
                    "id": "TEST_1",
                    "price": {"total": "850.00", "currency": "USD"}
                }
            ]
        }
    
    def tearDown(self):
        """Clean up test database."""
        import os
        if os.path.exists(self.test_db):
            os.remove(self.test_db)
    
    def test_cache_set_and_get(self):
        """Test that data can be cached and retrieved."""
        # Set cache
        self.cacher.set(self.sample_query, self.sample_response)
        
        # Get from cache
        result = self.cacher.get(self.sample_query)
        
        self.assertIsNotNone(result)
        self.assertEqual(result, self.sample_response)
    
    def test_cache_miss(self):
        """Test that missing cache returns None."""
        non_existent_query = {
            "type": "flight_offers",
            "origin": "LAX",
            "destination": "SFO",
            "departure_date": "2025-12-15",
            "adults": 2
        }
        
        result = self.cacher.get(non_existent_query)
        self.assertIsNone(result)
    
    def test_cache_expiration(self):
        """Test that expired cache entries are not returned."""
        # Set cache with very short TTL
        short_ttl = 1  # 1 second
        self.cacher.set(self.sample_query, self.sample_response, ttl=short_ttl)
        
        # Immediate retrieval should work
        result = self.cacher.get(self.sample_query, ttl=short_ttl)
        self.assertIsNotNone(result)
        
        # Wait for expiration
        time.sleep(2)
        
        # Should return None after expiration
        result = self.cacher.get(self.sample_query, ttl=short_ttl)
        self.assertIsNone(result)
    
    def test_hit_count_tracking(self):
        """Test that cache hit count is incremented."""
        # Set cache
        self.cacher.set(self.sample_query, self.sample_response)
        
        # Get from cache multiple times
        for _ in range(3):
            self.cacher.get(self.sample_query)
        
        # Check stats
        stats = self.cacher.get_stats()
        self.assertEqual(stats["total_hits"], 3)
    
    def test_clear_expired(self):
        """Test clearing expired entries."""
        # Add some entries with short TTL
        for i in range(5):
            query = self.sample_query.copy()
            query["adults"] = i + 1
            self.cacher.set(query, self.sample_response, ttl=1)
        
        # Wait for expiration
        time.sleep(2)
        
        # Clear expired
        deleted_count = self.cacher.clear_expired()
        
        self.assertEqual(deleted_count, 5)


if __name__ == "__main__":
    unittest.main()
