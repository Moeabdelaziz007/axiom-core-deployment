"""
Amadeus Conditional Caching Tool
Part of QCC Phase 2: ATA Pilot

This module implements intelligent caching for Amadeus API responses
to minimize API calls and stay within the 10 TPS / 5K calls/month limit.
"""

import sqlite3
import hashlib
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
from pathlib import Path

# Cache configuration
CACHE_DB_PATH = Path(__file__).parent.parent / "cache.db"
DEFAULT_TTL = 3600  # 1 hour for flight data
PRICING_TTL = 1800   # 30 minutes for pricing data


class AmadeusCacher:
    """Manages caching logic for Amadeus API responses."""
    
    def __init__(self, db_path: str = str(CACHE_DB_PATH)):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize SQLite database with cache table."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS amadeus_cache (
                query_hash TEXT PRIMARY KEY,
                query_params TEXT NOT NULL,
                response_data TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                ttl INTEGER NOT NULL,
                hit_count INTEGER DEFAULT 0
            )
        """)
        
        conn.commit()
        conn.close()
    
    def _generate_query_hash(self, query_params: Dict[str, Any]) -> str:
        """Generate a unique hash for query parameters."""
        # Sort keys for consistent hashing
        sorted_params = json.dumps(query_params, sort_keys=True)
        return hashlib.sha256(sorted_params.encode()).hexdigest()
    
    def get(self, query_params: Dict[str, Any], ttl: int = DEFAULT_TTL) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached data if valid, otherwise return None.
        
        Args:
            query_params: Dictionary of query parameters
            ttl: Time-to-live in seconds
            
        Returns:
            Cached response data if valid, None otherwise
        """
        query_hash = self._generate_query_hash(query_params)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT response_data, created_at, ttl FROM amadeus_cache WHERE query_hash = ?",
            (query_hash,)
        )
        
        result = cursor.fetchone()
        
        if result:
            response_data, created_at, stored_ttl = result
            current_time = int(time.time())
            
            # Check if cache is still valid
            if current_time - created_at < stored_ttl:
                # Update hit count
                cursor.execute(
                    "UPDATE amadeus_cache SET hit_count = hit_count + 1 WHERE query_hash = ?",
                    (query_hash,)
                )
                conn.commit()
                conn.close()
                
                print(f"✅ CACHE HIT for query: {query_params}")
                return json.loads(response_data)
            else:
                # Cache expired, delete it
                cursor.execute("DELETE FROM amadeus_cache WHERE query_hash = ?", (query_hash,))
                conn.commit()
                print(f"⏰ CACHE EXPIRED for query: {query_params}")
        
        conn.close()
        print(f"❌ CACHE MISS for query: {query_params}")
        return None
    
    def set(self, query_params: Dict[str, Any], response_data: Dict[str, Any], ttl: int = DEFAULT_TTL):
        """
        Store API response in cache.
        
        Args:
            query_params: Dictionary of query parameters
            response_data: API response to cache
            ttl: Time-to-live in seconds
        """
        query_hash = self._generate_query_hash(query_params)
        current_time = int(time.time())
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO amadeus_cache 
            (query_hash, query_params, response_data, created_at, ttl, hit_count)
            VALUES (?, ?, ?, ?, ?, 0)
        """, (
            query_hash,
            json.dumps(query_params),
            json.dumps(response_data),
            current_time,
            ttl
        ))
        
        conn.commit()
        conn.close()
        
        print(f"💾 CACHE UPDATED for query: {query_params}")
    
    def clear_expired(self):
        """Remove all expired cache entries."""
        current_time = int(time.time())
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "DELETE FROM amadeus_cache WHERE (created_at + ttl) < ?",
            (current_time,)
        )
        
        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()
        
        print(f"🗑️ Cleared {deleted_count} expired cache entries")
        return deleted_count
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*), SUM(hit_count) FROM amadeus_cache")
        total_entries, total_hits = cursor.fetchone()
        
        conn.close()
        
        return {
            "total_entries": total_entries or 0,
            "total_hits": total_hits or 0,
            "cache_file": self.db_path
        }


# Convenience functions for common use cases
def get_flight_offers(origin: str, destination: str, departure_date: str, 
                      adults: int = 1, fresh: bool = False) -> Optional[Dict[str, Any]]:
    """
    Get flight offers with caching.
    
    Args:
        origin: Origin airport code (e.g., 'JFK')
        destination: Destination airport code (e.g., 'RUH')
        departure_date: Departure date in YYYY-MM-DD format
        adults: Number of adult passengers
        fresh: If True, bypass cache and fetch fresh data
        
    Returns:
        Cached or fresh flight offer data
    """
    cacher = AmadeusCacher()
    
    query_params = {
        "type": "flight_offers",
        "origin": origin.upper(),
        "destination": destination.upper(),
        "departure_date": departure_date,
        "adults": adults
    }
    
    if not fresh:
        cached_data = cacher.get(query_params, ttl=DEFAULT_TTL)
        if cached_data:
            return cached_data
    
    # If cache miss or fresh requested, return None
    # The caller (amadeus_api.py) will make the API call and cache the result
    return None


if __name__ == "__main__":
    # Test caching functionality
    print("Testing Amadeus Cacher...")
    
    cacher = AmadeusCacher()
    
    # Test data
    test_query = {
        "type": "flight_offers",
        "origin": "JFK",
        "destination": "RUH",
        "departure_date": "2025-12-01",
        "adults": 1
    }
    
    test_response = {
        "data": [
            {
                "id": "1",
                "price": {"total": "850.00", "currency": "USD"},
                "itineraries": []
            }
        ]
    }
    
    # Test cache set
    cacher.set(test_query, test_response)
    
    # Test cache get
    result = cacher.get(test_query)
    print(f"Retrieved: {result}")
    
    # Test stats
    stats = cacher.get_stats()
    print(f"Cache stats: {stats}")
