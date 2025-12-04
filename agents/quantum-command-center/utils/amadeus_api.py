"""
Amadeus Test Tier API Integration
Part of QCC Phase 2: ATA Pilot

This module provides a rate-limited wrapper for the Amadeus API
with OAuth2 authentication and caching integration.
"""

import os
import time
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dotenv import load_dotenv
from utils.amadeus_cacher import AmadeusCacher, DEFAULT_TTL

# Load environment variables
load_dotenv()

# Amadeus API Configuration
AMADEUS_API_KEY = os.environ.get("AMADEUS_API_KEY", "")
AMADEUS_API_SECRET = os.environ.get("AMADEUS_API_SECRET", "")
AMADEUS_BASE_URL = "https://test.api.amadeus.com/v2"
AMADEUS_AUTH_URL = "https://test.api.amadeus.com/v1/security/oauth2/token"

# Rate limiting (10 TPS for Test Tier)
MAX_TPS = 10
REQUEST_INTERVAL = 1.0 / MAX_TPS  # 0.1 seconds between requests


class RateLimiter:
    """Simple rate limiter to enforce TPS constraints."""
    
    def __init__(self, max_tps: int = MAX_TPS):
        self.max_tps = max_tps
        self.min_interval = 1.0 / max_tps
        self.last_request_time = 0
    
    def wait_if_needed(self):
        """Wait if necessary to respect rate limit."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_interval:
            wait_time = self.min_interval - time_since_last
            print(f"⏳ Rate limit: waiting {wait_time:.3f}s")
            time.sleep(wait_time)
        
        self.last_request_time = time.time()


class AmadeusAPI:
    """Wrapper for Amadeus Test Tier API with caching and rate limiting."""
    
    def __init__(self):
        self.api_key = AMADEUS_API_KEY
        self.api_secret = AMADEUS_API_SECRET
        self.base_url = AMADEUS_BASE_URL
        self.access_token = None
        self.token_expiry = None
        self.rate_limiter = RateLimiter()
        self.cacher = AmadeusCacher()
        
        # Authenticate on initialization
        if self.api_key and self.api_secret:
            self._authenticate()
    
    def _authenticate(self):
        """Obtain OAuth2 access token from Amadeus."""
        print("🔐 Authenticating with Amadeus API...")
        
        response = requests.post(
            AMADEUS_AUTH_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": self.api_key,
                "client_secret": self.api_secret
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data.get("access_token")
            expires_in = data.get("expires_in", 1800)  # Default 30 minutes
            self.token_expiry = datetime.now() + timedelta(seconds=expires_in)
            print("✅ Authentication successful")
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            print(f"Response: {response.text}")
    
    def _ensure_authenticated(self):
        """Check if token is valid, refresh if needed."""
        if not self.access_token or datetime.now() >= self.token_expiry:
            self._authenticate()
    
    def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Make a rate-limited API request.
        
        Args:
            endpoint: API endpoint path
            params: Query parameters
            
        Returns:
            API response data or None on error
        """
        self._ensure_authenticated()
        self.rate_limiter.wait_if_needed()
        
        url = f"{self.base_url}/{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }
        
        print(f"🌐 API CALL: {endpoint} with params: {params}")
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                print(f"✅ API SUCCESS: {response.status_code}")
                return response.json()
            else:
                print(f"❌ API ERROR: {response.status_code}")
                print(f"Response: {response.text}")
                return None
        
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
            return None
    
    def search_flight_offers(
        self, 
        origin: str, 
        destination: str, 
        departure_date: str,
        adults: int = 1,
        max_results: int = 10,
        use_cache: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Search for flight offers with caching.
        
        Args:
            origin: Origin airport code (e.g., 'JFK')
            destination: Destination airport code (e.g., 'RUH')
            departure_date: Departure date in YYYY-MM-DD format
            adults: Number of adult passengers
            max_results: Maximum number of results to return
            use_cache: Whether to use cached data if available
            
        Returns:
            Flight offers data or None
        """
        query_params = {
            "type": "flight_offers",
            "origin": origin.upper(),
            "destination": destination.upper(),
            "departure_date": departure_date,
            "adults": adults
        }
        
        # Check cache first
        if use_cache:
            cached_data = self.cacher.get(query_params, ttl=DEFAULT_TTL)
            if cached_data:
                return cached_data
        
        # Make API call if cache miss or cache disabled
        api_params = {
            "originLocationCode": origin.upper(),
            "destinationLocationCode": destination.upper(),
            "departureDate": departure_date,
            "adults": adults,
            "max": max_results
        }
        
        result = self._make_request("shopping/flight-offers", api_params)
        
        # Cache the result
        if result and use_cache:
            self.cacher.set(query_params, result, ttl=DEFAULT_TTL)
        
        return result
    
    def get_hotel_offers(
        self,
        city_code: str,
        check_in: str,
        check_out: str,
        adults: int = 1,
        use_cache: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Search for hotel offers with caching.
        
        Args:
            city_code: City IATA code (e.g., 'RUH')
            check_in: Check-in date in YYYY-MM-DD format
            check_out: Check-out date in YYYY-MM-DD format
            adults: Number of adult guests
            use_cache: Whether to use cached data if available
            
        Returns:
            Hotel offers data or None
        """
        query_params = {
            "type": "hotel_offers",
            "city_code": city_code.upper(),
            "check_in": check_in,
            "check_out": check_out,
            "adults": adults
        }
        
        # Check cache first
        if use_cache:
            cached_data = self.cacher.get(query_params, ttl=DEFAULT_TTL)
            if cached_data:
                return cached_data
        
        # Make API call
        api_params = {
            "cityCode": city_code.upper(),
            "checkInDate": check_in,
            "checkOutDate": check_out,
            "adults": adults
        }
        
        result = self._make_request("shopping/hotel-offers", api_params)
        
        # Cache the result
        if result and use_cache:
            self.cacher.set(query_params, result, ttl=DEFAULT_TTL)
        
        return result


# Convenience function for use in agents
def search_flights(origin: str, destination: str, departure_date: str, adults: int = 1) -> Dict[str, Any]:
    """
    Search for flights with automatic caching and rate limiting.
    
    This is the primary function used by the Data Aggregator Agent.
    
    Args:
        origin: Origin airport code
        destination: Destination airport code
        departure_date: Departure date (YYYY-MM-DD)
        adults: Number of adults
        
    Returns:
        Flight offers data or error message
    """
    if not AMADEUS_API_KEY or not AMADEUS_API_SECRET:
        return {
            "error": "Amadeus API credentials not configured",
            "mock_data": {
                "data": [
                    {
                        "id": "MOCK_1",
                        "price": {"total": "850.00", "currency": "USD"},
                        "itineraries": [{
                            "segments": [{
                                "departure": {"iataCode": origin, "at": f"{departure_date}T10:00:00"},
                                "arrival": {"iataCode": destination, "at": f"{departure_date}T22:00:00"}
                            }]
                        }]
                    }
                ]
            }
        }
    
    api = AmadeusAPI()
    result = api.search_flight_offers(origin, destination, departure_date, adults)
    
    return result or {"error": "Failed to fetch flight data"}


if __name__ == "__main__":
    # Test Amadeus API integration
    print("Testing Amadeus API...")
    
    result = search_flights("JFK", "RUH", "2025-12-01", adults=1)
    print(f"\nResult: {result}")
