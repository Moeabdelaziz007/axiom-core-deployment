"""
RaqibAgent (Narrative Generator Agent)
Part of QCC Spiritual Intelligence Framework

This agent embodies the Islamic principle of Raqib - the recording of good deeds and successes.
As stated in the Quran: "مَا يَلْفِظُ مِن قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ" (Not a word does he utter but there is a watcher by him).

The RaqibAgent documents successes, extracts wisdom, and generates narratives that align
with Islamic spiritual principles while integrating with the QCC technical architecture.
"""

import os
import asyncio
import json
import sqlite3
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from enum import Enum
from dataclasses import dataclass, asdict
from dotenv import load_dotenv
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Import QCC utilities
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.logger import get_logger, log_audit_event

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "placeholder_key")


class IslamicPrinciple(Enum):
    """Islamic principles for categorizing success events."""
    TAWHID = "Tawhid"  # Oneness of God
    ADL = "Adl"  # Justice and Equity
    AMANAH = "Amanah"  # Trust and Responsibility
    SABR = "Sabr"  # Patience and Perseverance
    SHUKR = "Shukr"  # Gratitude
    TAWBAH = "Tawbah"  # Repentance and Improvement
    ILMA = "Ilma"  # Knowledge and Wisdom
    HIKMAH = "Hikmah"  # Wisdom
    TAQWA = "Taqwa"  # Consciousness
    IHSAN = "Ihsan"  # Excellence


@dataclass
class SuccessEvent:
    """Represents a success event recorded by RaqibAgent."""
    event_id: str
    timestamp: datetime
    agent_name: str
    tenant_id: str
    description: str
    principle: IslamicPrinciple
    spiritual_weight: int  # 1-10 scale
    impact_level: str  # LOW, MEDIUM, HIGH
    metadata: Dict[str, Any]
    wisdom_extracted: Optional[str] = None
    narrative_generated: Optional[str] = None


class RaqibAgent:
    """
    RaqibAgent - Narrative Generator Agent
    
    This agent records success events from other agents, categorizes them by Islamic principles,
    assigns spiritual weight, generates wisdom narratives using LLM integration, and maintains
    a success ledger for multi-tenant environments.
    """
    
    def __init__(self, tenant_id: str = "default"):
        """
        Initialize the RaqibAgent.
        
        Args:
            tenant_id: Tenant identifier for multi-tenant architecture
        """
        self.tenant_id = tenant_id
        self.logger = get_logger(f"RaqibAgent-{tenant_id}")
        self._init_database()
        self._init_llm_client()
        
    def _init_database(self):
        """Initialize SQLite database for success ledger."""
        self.db_path = f"raqib_success_ledger_{self.tenant_id}.db"
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create success events table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS success_events (
                event_id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                agent_name TEXT NOT NULL,
                tenant_id TEXT NOT NULL,
                description TEXT NOT NULL,
                principle TEXT NOT NULL,
                spiritual_weight INTEGER NOT NULL,
                impact_level TEXT NOT NULL,
                metadata TEXT,
                wisdom_extracted TEXT,
                narrative_generated TEXT
            )
        """)
        
        # Create principle statistics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS principle_stats (
                tenant_id TEXT,
                principle TEXT,
                total_events INTEGER,
                avg_spiritual_weight REAL,
                last_updated TEXT,
                PRIMARY KEY (tenant_id, principle)
            )
        """)
        
        conn.commit()
        conn.close()
        self.logger.info(f"Database initialized for tenant {self.tenant_id}")
    
    def _init_llm_client(self):
        """Initialize the LLM client for narrative generation."""
        self.model_client = OpenAIChatCompletionClient(
            model="gemini-flash-latest",
            api_key=GEMINI_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            model_capabilities={
                "vision": False,
                "function_calling": True,
                "json_output": True,
            },
        )
        
        # System message for wisdom extraction and narrative generation
        self.system_message = f"""
        You are the RaqibAgent, embodying the Islamic principle of recording good deeds and successes.
        Your mission is to extract wisdom and generate narratives that align with Islamic spiritual principles.
        
        GUIDING PRINCIPLES:
        1. Tawhid (Oneness): Recognize unity and interconnectedness in successes
        2. Adl (Justice): Ensure fairness and equity in success attribution
        3. Amanah (Trust): Honor responsibilities and commitments fulfilled
        4. Sabr (Patience): Acknowledge perseverance through challenges
        5. Shukr (Gratitude): Express thankfulness for achievements
        6. Tawbah (Repentance): Frame failures as opportunities for improvement
        7. Ilma (Knowledge): Extract wisdom and learning from experiences
        
        Your responses should:
        - Be spiritually uplifting and grounded in Islamic wisdom
        - Provide practical insights for future improvement
        - Maintain confidentiality and respect for all agents
        - Use clear, inspiring language that encourages continued excellence
        """
    
    def record_success(
        self,
        agent_name: str,
        description: str,
        principle: IslamicPrinciple,
        spiritual_weight: int,
        impact_level: str = "MEDIUM",
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Record a success event in the ledger.
        
        Args:
            agent_name: Name of the agent that achieved the success
            description: Detailed description of the success
            principle: Islamic principle category
            spiritual_weight: Spiritual significance (1-10 scale)
            impact_level: Impact level (LOW, MEDIUM, HIGH)
            metadata: Additional context and data
            
        Returns:
            Event ID of the recorded success
        """
        try:
            # Validate inputs
            if not agent_name or not agent_name.strip():
                raise ValueError("Agent name cannot be empty")
                
            if not 1 <= spiritual_weight <= 10:
                raise ValueError("Spiritual weight must be between 1 and 10")
            
            if impact_level not in ["LOW", "MEDIUM", "HIGH"]:
                raise ValueError("Impact level must be LOW, MEDIUM, or HIGH")
            
            # Generate event ID with microsecond precision to avoid collisions
            event_id = f"success_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}_{agent_name}"
            
            # Create success event
            event = SuccessEvent(
                event_id=event_id,
                timestamp=datetime.now(),
                agent_name=agent_name,
                tenant_id=self.tenant_id,
                description=description,
                principle=principle,
                spiritual_weight=spiritual_weight,
                impact_level=impact_level,
                metadata=metadata or {}
            )
            
            # Store in database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO success_events 
                (event_id, timestamp, agent_name, tenant_id, description, principle, 
                 spiritual_weight, impact_level, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event.event_id,
                event.timestamp.isoformat(),
                event.agent_name,
                event.tenant_id,
                event.description,
                event.principle.value,
                event.spiritual_weight,
                event.impact_level,
                json.dumps(event.metadata)
            ))
            
            conn.commit()
            conn.close()
            
            # Update principle statistics
            self._update_principle_stats(principle)
            
            # Log audit event
            log_audit_event(
                agent_name="RaqibAgent",
                action="RECORD_SUCCESS",
                details=f"Event {event_id} recorded for {agent_name} with principle {principle.value}",
                status="SUCCESS"
            )
            
            self.logger.info(f"Success recorded: {event_id} - {agent_name} - {principle.value}")
            return event_id
            
        except Exception as e:
            self.logger.error(f"Failed to record success: {str(e)}")
            log_audit_event(
                agent_name="RaqibAgent",
                action="RECORD_SUCCESS",
                details=f"Failed to record success for {agent_name}: {str(e)}",
                status="ERROR"
            )
            raise
    
    async def generate_narrative(self, event_id: str) -> str:
        """
        Generate a wisdom narrative for a success event using LLM.
        
        Args:
            event_id: ID of the success event
            
        Returns:
            Generated wisdom narrative
        """
        try:
            # Retrieve event from database
            event = self._get_event(event_id)
            if not event:
                raise ValueError(f"Event {event_id} not found")
            
            # Create prompt for narrative generation
            prompt = f"""
            Generate a wisdom narrative for this success event, following Islamic principles:
            
            Event Details:
            - Agent: {event.agent_name}
            - Description: {event.description}
            - Principle: {event.principle.value}
            - Spiritual Weight: {event.spiritual_weight}/10
            - Impact Level: {event.impact_level}
            - Timestamp: {event.timestamp}
            
            Please create a narrative that:
            1. Honors the achievement in the context of {event.principle.value}
            2. Extracts spiritual wisdom and lessons
            3. Provides guidance for future endeavors
            4. Expresses appropriate gratitude (Shukr)
            5. Maintains humility and acknowledges divine guidance
            
            Keep the narrative inspiring, practical, and aligned with Islamic teachings.
            """
            
            # Generate narrative using LLM
            agent = AssistantAgent(
                name="Raqib_Narrative_Generator",
                system_message=self.system_message,
                model_client=self.model_client,
            )
            
            message = TextMessage(content=prompt, source="RaqibAgent")
            response = await agent.on_messages([message], cancellation_token=None)
            
            narrative = response.chat_message.content if response.chat_message else "Narrative generation failed"
            
            # Update event with generated narrative
            self._update_event_narrative(event_id, narrative)
            
            self.logger.info(f"Narrative generated for event {event_id}")
            return narrative
            
        except Exception as e:
            self.logger.error(f"Failed to generate narrative for {event_id}: {str(e)}")
            raise
    
    async def extract_wisdom(self, event_id: str) -> str:
        """
        Extract key wisdom and insights from a success event.
        
        Args:
            event_id: ID of the success event
            
        Returns:
            Extracted wisdom and insights
        """
        try:
            # Retrieve event from database
            event = self._get_event(event_id)
            if not event:
                raise ValueError(f"Event {event_id} not found")
            
            # Create prompt for wisdom extraction
            prompt = f"""
            Extract key wisdom and insights from this success event:
            
            Event Details:
            - Agent: {event.agent_name}
            - Description: {event.description}
            - Principle: {event.principle.value}
            - Spiritual Weight: {event.spiritual_weight}/10
            - Impact Level: {event.impact_level}
            
            Please provide:
            1. Key lessons learned
            2. Spiritual insights related to {event.principle.value}
            3. Practical advice for future similar situations
            4. Areas for continued improvement
            5. Gratitude points (Shukr)
            
            Format as a concise wisdom summary that can guide future actions.
            """
            
            # Extract wisdom using LLM
            agent = AssistantAgent(
                name="Raqib_Wisdom_Extractor",
                system_message=self.system_message,
                model_client=self.model_client,
            )
            
            message = TextMessage(content=prompt, source="RaqibAgent")
            response = await agent.on_messages([message], cancellation_token=None)
            
            wisdom = response.chat_message.content if response.chat_message else "Wisdom extraction failed"
            
            # Update event with extracted wisdom
            self._update_event_wisdom(event_id, wisdom)
            
            self.logger.info(f"Wisdom extracted for event {event_id}")
            return wisdom
            
        except Exception as e:
            self.logger.error(f"Failed to extract wisdom for {event_id}: {str(e)}")
            raise
    
    def get_success_metrics(
        self,
        principle: Optional[IslamicPrinciple] = None,
        agent_name: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Retrieve success metrics and statistics.
        
        Args:
            principle: Filter by specific principle (optional)
            agent_name: Filter by specific agent (optional)
            days: Number of days to look back (default: 30)
            
        Returns:
            Dictionary containing success metrics
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Build query with filters
            query = """
                SELECT principle, COUNT(*) as count, AVG(spiritual_weight) as avg_weight,
                       SUM(CASE WHEN impact_level = 'HIGH' THEN 1 ELSE 0 END) as high_impact,
                       SUM(CASE WHEN impact_level = 'MEDIUM' THEN 1 ELSE 0 END) as medium_impact,
                       SUM(CASE WHEN impact_level = 'LOW' THEN 1 ELSE 0 END) as low_impact
                FROM success_events 
                WHERE tenant_id = ? 
                AND timestamp >= datetime('now', '-{} days')
            """.format(days)
            
            params = [self.tenant_id]
            
            if principle:
                query += " AND principle = ?"
                params.append(principle.value)
            
            if agent_name:
                query += " AND agent_name = ?"
                params.append(agent_name)
            
            query += " GROUP BY principle"
            
            cursor.execute(query, params)
            results = cursor.fetchall()
            
            # Calculate overall metrics
            total_events = sum(row[1] for row in results)
            avg_spiritual_weight = sum(row[2] * row[1] for row in results) / total_events if total_events > 0 else 0
            
            # Get top performing agents
            cursor.execute("""
                SELECT agent_name, COUNT(*) as count, AVG(spiritual_weight) as avg_weight
                FROM success_events 
                WHERE tenant_id = ? AND timestamp >= datetime('now', '-{} days')
                GROUP BY agent_name
                ORDER BY count DESC
                LIMIT 5
            """.format(days), [self.tenant_id])
            
            top_agents = cursor.fetchall()
            
            conn.close()
            
            metrics = {
                "tenant_id": self.tenant_id,
                "period_days": days,
                "total_events": total_events,
                "avg_spiritual_weight": round(avg_spiritual_weight, 2),
                "principle_breakdown": {
                    row[0]: {
                        "count": row[1],
                        "avg_weight": round(row[2], 2),
                        "impact_distribution": {
                            "high": row[3],
                            "medium": row[4],
                            "low": row[5]
                        }
                    } for row in results
                },
                "top_agents": [
                    {
                        "agent_name": row[0],
                        "success_count": row[1],
                        "avg_weight": round(row[2], 2)
                    } for row in top_agents
                ]
            }
            
            self.logger.info(f"Success metrics retrieved for tenant {self.tenant_id}")
            return metrics
            
        except Exception as e:
            self.logger.error(f"Failed to get success metrics: {str(e)}")
            raise
    
    def _get_event(self, event_id: str) -> Optional[SuccessEvent]:
        """Retrieve a success event from the database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM success_events WHERE event_id = ?
        """, (event_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        return SuccessEvent(
            event_id=row[0],
            timestamp=datetime.fromisoformat(row[1]),
            agent_name=row[2],
            tenant_id=row[3],
            description=row[4],
            principle=IslamicPrinciple(row[5]),
            spiritual_weight=row[6],
            impact_level=row[7],
            metadata=json.loads(row[8]) if row[8] else {},
            wisdom_extracted=row[9],
            narrative_generated=row[10]
        )
    
    def _update_event_narrative(self, event_id: str, narrative: str):
        """Update event with generated narrative."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE success_events SET narrative_generated = ? WHERE event_id = ?
        """, (narrative, event_id))
        
        conn.commit()
        conn.close()
    
    def _update_event_wisdom(self, event_id: str, wisdom: str):
        """Update event with extracted wisdom."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE success_events SET wisdom_extracted = ? WHERE event_id = ?
        """, (wisdom, event_id))
        
        conn.commit()
        conn.close()
    
    def _update_principle_stats(self, principle: IslamicPrinciple):
        """Update statistics for a specific principle."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Calculate current stats
        cursor.execute("""
            SELECT COUNT(*), AVG(spiritual_weight) 
            FROM success_events 
            WHERE tenant_id = ? AND principle = ?
        """, (self.tenant_id, principle.value))
        
        result = cursor.fetchone()
        total_events = result[0]
        avg_weight = round(result[1], 2) if result[1] else 0
        
        # Update or insert stats
        cursor.execute("""
            INSERT OR REPLACE INTO principle_stats 
            (tenant_id, principle, total_events, avg_spiritual_weight, last_updated)
            VALUES (?, ?, ?, ?, ?)
        """, (self.tenant_id, principle.value, total_events, avg_weight, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()


def create_raqib_agent(tenant_id: str = "default") -> RaqibAgent:
    """
    Factory function to create a RaqibAgent instance.
    
    Args:
        tenant_id: Tenant identifier for multi-tenant architecture
        
    Returns:
        Configured RaqibAgent instance
    """
    return RaqibAgent(tenant_id=tenant_id)


async def test_raqib_agent():
    """Test the RaqibAgent functionality."""
    print("\n" + "=" * 60)
    print("Testing RaqibAgent (Narrative Generator)")
    print("=" * 60 + "\n")
    
    # Create agent
    raqib = create_raqib_agent("test-tenant")
    
    # Test recording success
    event_id = raqib.record_success(
        agent_name="TestAgent",
        description="Successfully optimized travel itinerary reducing costs by 25% while maintaining safety standards",
        principle=IslamicPrinciple.ADL,
        spiritual_weight=8,
        impact_level="HIGH",
        metadata={"cost_savings": 25.0, "safety_rating": "A+"}
    )
    
    print(f"✅ Success recorded with ID: {event_id}")
    
    # Test wisdom extraction
    wisdom = await raqib.extract_wisdom(event_id)
    print(f"\n📖 Extracted Wisdom:\n{wisdom}")
    
    # Test narrative generation
    narrative = await raqib.generate_narrative(event_id)
    print(f"\n📝 Generated Narrative:\n{narrative}")
    
    # Test metrics
    metrics = raqib.get_success_metrics()
    print(f"\n📊 Success Metrics:\n{json.dumps(metrics, indent=2)}")
    
    print("\n✅ RaqibAgent test completed successfully!")


if __name__ == "__main__":
    asyncio.run(test_raqib_agent())