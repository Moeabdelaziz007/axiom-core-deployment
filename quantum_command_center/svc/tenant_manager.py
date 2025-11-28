"""
Tenant Manager Service
Part of Multi-Tenant Architecture Foundation

Handles tenant lifecycle management, validation, and retrieval.
"""

import logging
import json
import uuid
from typing import Optional, Dict, Any, List
from enum import Enum
import psycopg2
from psycopg2.extras import RealDictCursor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TenantTier(Enum):
    FREE = "FREE"
    PRO = "PRO"
    ENTERPRISE = "ENTERPRISE"

class TenantStatus(Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    ARCHIVED = "ARCHIVED"

class TenantManager:
    def __init__(self, db_connection_string: str):
        self.conn_string = db_connection_string
        self._conn = None

    def _get_conn(self):
        if self._conn is None or self._conn.closed:
            try:
                self._conn = psycopg2.connect(self.conn_string, cursor_factory=RealDictCursor)
            except Exception as e:
                logger.error(f"Failed to connect to database: {e}")
                raise e
        return self._conn

    def create_tenant(self, name: str, tier: str = "FREE") -> Dict[str, Any]:
        """
        Create a new tenant.
        
        Args:
            name: Tenant name.
            tier: Tenant tier (FREE, PRO, ENTERPRISE).
            
        Returns:
            Created tenant record.
        """
        conn = self._get_conn()
        try:
            with conn.cursor() as cur:
                # Default rate limits based on tier
                rate_limits = self._get_default_rate_limits(tier)
                
                cur.execute("""
                    INSERT INTO tenants (name, tier, status, rate_limits)
                    VALUES (%s, %s, %s, %s)
                    RETURNING *;
                """, (name, tier, TenantStatus.ACTIVE.value, json.dumps(rate_limits)))
                
                tenant = cur.fetchone()
                conn.commit()
                logger.info(f"Created tenant: {tenant['name']} ({tenant['tenant_id']})")
                return dict(tenant)
        except Exception as e:
            conn.rollback()
            logger.error(f"Error creating tenant: {e}")
            raise e

    def get_tenant(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve tenant by ID."""
        conn = self._get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM tenants WHERE tenant_id = %s", (tenant_id,))
                return dict(cur.fetchone()) if cur.rowcount > 0 else None
        except Exception as e:
            logger.error(f"Error fetching tenant {tenant_id}: {e}")
            return None

    def get_tenant_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Retrieve tenant by name."""
        conn = self._get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM tenants WHERE name = %s", (name,))
                return dict(cur.fetchone()) if cur.rowcount > 0 else None
        except Exception as e:
            logger.error(f"Error fetching tenant {name}: {e}")
            return None

    def update_tenant_status(self, tenant_id: str, status: str) -> bool:
        """Update tenant status."""
        conn = self._get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE tenants 
                    SET status = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE tenant_id = %s
                """, (status, tenant_id))
                conn.commit()
                return cur.rowcount > 0
        except Exception as e:
            conn.rollback()
            logger.error(f"Error updating tenant {tenant_id}: {e}")
            return False

    def _get_default_rate_limits(self, tier: str) -> Dict[str, int]:
        if tier == TenantTier.ENTERPRISE.value:
            return {"requests_per_minute": 1000, "tokens_per_minute": 100000}
        elif tier == TenantTier.PRO.value:
            return {"requests_per_minute": 300, "tokens_per_minute": 50000}
        else:
            return {"requests_per_minute": 60, "tokens_per_minute": 10000}

    def close(self):
        if self._conn:
            self._conn.close()

if __name__ == "__main__":
    # Simple test stub
    print("TenantManager loaded. Requires DB connection string to run.")
