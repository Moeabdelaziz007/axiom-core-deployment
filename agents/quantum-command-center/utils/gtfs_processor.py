"""
GTFS Processor Tool (Mock)
Part of QCC Phase 2: ATA Pilot

This module simulates a General Transit Feed Specification (GTFS) processor
for planning ground transportation (trains, buses, ferries) between coordinates.
In the future, this will integrate with real GIS/GTFS libraries.
"""

from typing import Dict, List, Optional, Any
import math

class GTFSProcessor:
    """
    Mock processor for ground transportation planning.
    Simulates finding routes between two locations using various transit modes.
    """
    
    def __init__(self):
        # Mock database of transit hubs
        self.transit_hubs = {
            "JFK": {"lat": 40.6413, "lon": -73.7781, "type": "AIRPORT"},
            "LGA": {"lat": 40.7769, "lon": -73.8740, "type": "AIRPORT"},
            "EWR": {"lat": 40.6895, "lon": -74.1745, "type": "AIRPORT"},
            "NY_PENN": {"lat": 40.7505, "lon": -73.9934, "type": "TRAIN_STATION"},
            "RUH": {"lat": 24.9576, "lon": 46.6988, "type": "AIRPORT"},
            "RIYADH_TRAIN": {"lat": 24.6494, "lon": 46.7161, "type": "TRAIN_STATION"},
        }
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate Haversine distance between two points in km."""
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) * math.sin(dlon / 2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def find_ground_transport(self, origin_code: str, destination_code: str, date: str) -> Dict[str, Any]:
        """
        Find ground transportation options between two locations.
        
        Args:
            origin_code: Code of origin location (e.g., 'JFK', 'NY_PENN')
            destination_code: Code of destination location
            date: Travel date
            
        Returns:
            Dictionary containing transport options
        """
        origin = self.transit_hubs.get(origin_code.upper())
        dest = self.transit_hubs.get(destination_code.upper())
        
        if not origin or not dest:
            return {
                "error": "Location not found in GTFS database",
                "available_hubs": list(self.transit_hubs.keys())
            }
        
        distance = self.calculate_distance(origin["lat"], origin["lon"], dest["lat"], dest["lon"])
        
        options = []
        
        # Logic for generating mock options based on distance
        if distance < 50:
            # Short distance: Taxi/Shuttle/Metro
            options.append({
                "mode": "TAXI",
                "duration_min": int(distance * 2 + 10),
                "price_usd": round(distance * 2.5 + 5, 2),
                "description": "Direct taxi transfer"
            })
            options.append({
                "mode": "SHUTTLE",
                "duration_min": int(distance * 3 + 20),
                "price_usd": round(distance * 0.8 + 15, 2),
                "description": "Shared airport shuttle"
            })
        elif distance < 500:
            # Medium distance: Train/Bus
            options.append({
                "mode": "TRAIN",
                "duration_min": int(distance / 80 * 60 + 30), # ~80 km/h avg
                "price_usd": round(distance * 0.15 + 20, 2),
                "description": "Regional Rail"
            })
            options.append({
                "mode": "BUS",
                "duration_min": int(distance / 60 * 60 + 45), # ~60 km/h avg
                "price_usd": round(distance * 0.08 + 10, 2),
                "description": "Intercity Bus"
            })
        else:
            # Long distance (should fly, but maybe High Speed Rail?)
            options.append({
                "mode": "HIGH_SPEED_TRAIN",
                "duration_min": int(distance / 200 * 60 + 60), # ~200 km/h avg
                "price_usd": round(distance * 0.25 + 50, 2),
                "description": "High Speed Rail Network"
            })

        return {
            "origin": origin_code,
            "destination": destination_code,
            "distance_km": round(distance, 2),
            "date": date,
            "options": options
        }

# Convenience function for the agent
def plan_ground_transport(origin_code: str, destination_code: str, date: str) -> str:
    """
    Plan ground transportation between two hubs.
    
    Args:
        origin_code: Origin hub code (e.g., 'JFK', 'NY_PENN')
        destination_code: Destination hub code
        date: Travel date (YYYY-MM-DD)
        
    Returns:
        JSON string of transport options
    """
    import json
    processor = GTFSProcessor()
    result = processor.find_ground_transport(origin_code, destination_code, date)
    return json.dumps(result, indent=2)

if __name__ == "__main__":
    # Test the mock processor
    print(plan_ground_transport("JFK", "NY_PENN", "2025-12-01"))
