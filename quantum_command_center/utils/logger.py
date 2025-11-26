import logging
import os
from datetime import datetime

# Ensure logs directory exists
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(LOG_DIR, "qcc_audit.log")),
        logging.StreamHandler()
    ]
)

def get_logger(name):
    return logging.getLogger(name)

def log_audit_event(agent_name, action, details, status="SUCCESS"):
    """
    Logs a structured audit event for compliance and tracking.
    """
    logger = get_logger("AUDIT")
    event = f"AGENT={agent_name} | ACTION={action} | STATUS={status} | DETAILS={details}"
    logger.info(event)
