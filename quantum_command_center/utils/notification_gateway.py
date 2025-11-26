"""
Centralized Notification Gateway
Part of QCC Phase 2: ATA Pilot

This module acts as a single point of egress for all external notifications
(Telegram, WhatsApp, etc.), ensuring security and zero-cost compliance.
"""

import os
import logging
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("QCC_NotificationGateway")

class NotificationGateway:
    """
    Centralized gateway for sending alerts to external channels.
    Currently implements mock adapters for zero-cost testing.
    """
    
    def __init__(self):
        self.channels = {
            "TELEGRAM": self._send_telegram,
            "WHATSAPP": self._send_whatsapp_mock
        }
        # In future, load API keys here
        # self.telegram_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    
    def send_alert(self, channel: str, recipient: str, message: str, level: str = "INFO") -> Dict[str, Any]:
        """
        Send an alert via the specified channel.
        
        Args:
            channel: 'TELEGRAM' or 'WHATSAPP'
            recipient: Chat ID or Phone Number
            message: Content of the alert
            level: Alert severity (INFO, WARNING, CRITICAL)
            
        Returns:
            Status dictionary
        """
        sender = self.channels.get(channel.upper())
        
        if not sender:
            return {"status": "error", "message": f"Channel {channel} not supported"}
            
        # Log internal event
        logger.info(f"[{level}] Outbound Alert to {channel}: {message[:50]}...")
        
        return sender(recipient, message, level)

    def _send_telegram(self, chat_id: str, text: str, level: str) -> Dict[str, Any]:
        """Mock Telegram adapter."""
        # Simulate API call
        print(f"\n📱 [TELEGRAM MOCK] To {chat_id} ({level}): {text}\n")
        return {"status": "success", "channel": "telegram", "mock": True}

    def _send_whatsapp_mock(self, phone: str, text: str, level: str) -> Dict[str, Any]:
        """Mock WhatsApp adapter."""
        print(f"\n💬 [WHATSAPP MOCK] To {phone} ({level}): {text}\n")
        return {"status": "success", "channel": "whatsapp", "mock": True}

# Singleton instance
gateway = NotificationGateway()

# Tool function for Agents
def send_notification(channel: str, recipient: str, message: str, level: str = "INFO") -> str:
    """
    Send a notification via the Centralized Gateway.
    
    Args:
        channel: 'TELEGRAM' or 'WHATSAPP'
        recipient: Chat ID or Phone Number
        message: The alert message
        level: 'INFO', 'WARNING', or 'CRITICAL'
    """
    import json
    result = gateway.send_alert(channel, recipient, message, level)
    return json.dumps(result)

if __name__ == "__main__":
    # Test the gateway
    gateway.send_alert("TELEGRAM", "@user123", "⚠️ Storm detected on route to JFK.", "WARNING")
