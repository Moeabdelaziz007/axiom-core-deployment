from typing import Dict, Any
from .logger import get_logger

logger = get_logger("ZeroCostTools")

class ZeroCostTools:
    """
    A collection of zero-cost tool wrappers.
    In a real implementation, these would call actual APIs (Amadeus Test, NWS, etc.).
    For Phase 1, they are mocked or simplified.
    """

    @staticmethod
    def search_flights(origin: str, destination: str, date: str) -> Dict[str, Any]:
        """
        Mock flight search using Amadeus Test API logic.
        """
        logger.info(f"Searching flights: {origin} -> {destination} on {date}")
        # Mock response
        return {
            "status": "success",
            "data": [
                {"id": "1", "airline": "MockAir", "price": "150 USD", "duration": "3h"},
                {"id": "2", "airline": "ZeroCostAir", "price": "120 USD", "duration": "5h (1 stop)"}
            ]
        }

    @staticmethod
    def get_weather_alert(location: str) -> Dict[str, Any]:
        """
        Mock NWS Weather Alert.
        """
        logger.info(f"Checking weather for: {location}")
        # Mock response
        return {
            "status": "success",
            "alerts": [] # No alerts
        }

    @staticmethod
    def get_market_sentiment(topic: str) -> Dict[str, Any]:
        """
        Mock Sentiment Analysis using VADER logic.
        """
        logger.info(f"Analyzing sentiment for: {topic}")
        return {
            "status": "success",
            "sentiment": "positive",
            "score": 0.85
        }
