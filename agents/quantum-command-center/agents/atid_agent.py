"""
AtidAgent (Error Reflection Engine)
Part of QCC Spiritual Intelligence Framework

This agent embodies the Islamic principle of Atid - the recording of mistakes for learning and improvement.
As stated in Islamic tradition: "عَتِيدٌ" - ready for recording and accountability.

The AtidAgent documents errors, analyzes root causes, and provides corrective guidance
while integrating with the QCC technical architecture and complementing the RaqibAgent.
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


class ErrorSeverity(Enum):
    """Error severity levels for categorization."""
    CRITICAL = "CRITICAL"  # System failure, security breach
    HIGH = "HIGH"  # Major functionality impacted
    MEDIUM = "MEDIUM"  # Partial functionality affected
    LOW = "LOW"  # Minor issues, warnings


class IslamicPrinciple(Enum):
    """Islamic principles for categorizing error events and lessons."""
    TAWHID = "Tawhid"  # Oneness of God
    ADL = "Adl"  # Justice and Equity
    AMANAH = "Amanah"  # Trust and Responsibility
    SABR = "Sabr"  # Patience and perseverance through difficulties
    SHUKR = "Shukr"  # Gratitude
    TAWBAH = "Tawbah"  # Repentance and turning back to correct path
    ILMA = "Ilma"  # Knowledge and learning from mistakes
    HIKMAH = "Hikmah"  # Wisdom extracted from errors
    TAQWA = "Taqwa"  # Consciousness and mindfulness to prevent future errors
    IHSAN = "Ihsan"  # Excellence


@dataclass
class ErrorEvent:
    """Represents an error event recorded by AtidAgent."""
    event_id: str
    timestamp: datetime
    agent_name: str
    tenant_id: str
    error_type: str
    error_message: str
    severity: ErrorSeverity
    principle: IslamicPrinciple
    spiritual_weight: int  # 1-10 scale for learning significance
    context: Dict[str, Any]
    root_cause: Optional[str] = None
    spiritual_reflection: Optional[str] = None
    corrective_actions: Optional[List[str]] = None
    topology_analysis: Optional[Dict[str, Any]] = None
    resolved: bool = False
    resolution_notes: Optional[str] = None


class TOHAAnalyzer:
    """
    Topological Observers Handler - Basic framework for analyzing system topology
    when errors occur to understand systemic impacts and dependencies.
    """
    
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.logger = get_logger(f"TOHA-{tenant_id}")
        
    def analyze_error_topology(self, error_event: ErrorEvent) -> Dict[str, Any]:
        """
        Analyze system topology at the time of error to understand context.
        
        Args:
            error_event: The error event to analyze in topological context
            
        Returns:
            Dictionary containing topology analysis results
        """
        try:
            # Simulate topology analysis - in real implementation this would
            # query actual system state, agent connections, and dependencies
            topology_data = {
                "affected_agents": self._get_connected_agents(error_event.agent_name),
                "system_load": self._get_system_load_snapshot(),
                "dependency_chain": self._trace_dependencies(error_event.agent_name),
                "cascade_risk": self._assess_cascade_risk(error_event),
                "recovery_path": self._suggest_recovery_path(error_event)
            }
            
            self.logger.info(f"Topology analysis completed for error {error_event.event_id}")
            return topology_data
            
        except Exception as e:
            self.logger.error(f"Topology analysis failed: {str(e)}")
            return {"error": "Topology analysis unavailable", "details": str(e)}
    
    def _get_connected_agents(self, agent_name: str) -> List[str]:
        """Get list of agents connected to the failing agent."""
        # Mock implementation - would query actual agent registry
        connected_agents = ["Orchestrator", "DataAggregator", "PSYsafeMonitor"]
        return [agent for agent in connected_agents if agent != agent_name]
    
    def _get_system_load_snapshot(self) -> Dict[str, Any]:
        """Get current system load metrics."""
        # Mock implementation - would query actual system metrics
        return {
            "cpu_usage": "45%",
            "memory_usage": "62%",
            "active_requests": 23,
            "queue_depth": 5
        }
    
    def _trace_dependencies(self, agent_name: str) -> List[str]:
        """Trace dependency chain for the failing agent."""
        # Mock implementation - would trace actual dependencies
        return [f"Database_{agent_name}", f"Cache_{agent_name}", "Shared_Resources"]
    
    def _assess_cascade_risk(self, error_event: ErrorEvent) -> str:
        """Assess risk of error cascading to other components."""
        if error_event.severity == ErrorSeverity.CRITICAL:
            return "HIGH"
        elif error_event.severity == ErrorSeverity.HIGH:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _suggest_recovery_path(self, error_event: ErrorEvent) -> List[str]:
        """Suggest recovery path based on topology analysis."""
        recovery_steps = [
            f"Isolate {error_event.agent_name} from critical paths",
            "Activate backup systems if available",
            "Notify dependent agents of the failure",
            "Initiate graceful degradation procedures"
        ]
        return recovery_steps


class AtidAgent:
    """
    AtidAgent - Error Reflection Engine
    
    This agent records error events from other agents, categorizes them by Islamic principles,
    analyzes root causes using LLM integration, generates spiritual reflections, and maintains
    an error reflection ledger for multi-tenant environments.
    """
    
    def __init__(self, tenant_id: str = "default"):
        """
        Initialize the AtidAgent.
        
        Args:
            tenant_id: Tenant identifier for multi-tenant architecture
        """
        self.tenant_id = tenant_id
        self.logger = get_logger(f"AtidAgent-{tenant_id}")
        self.toha_analyzer = TOHAAnalyzer(tenant_id)
        self._init_database()
        self._init_llm_client()
        
    def _init_database(self):
        """Initialize SQLite database for error reflection ledger."""
        self.db_path = f"atid_error_ledger_{self.tenant_id}.db"
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create error events table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS error_events (
                event_id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                agent_name TEXT NOT NULL,
                tenant_id TEXT NOT NULL,
                error_type TEXT NOT NULL,
                error_message TEXT NOT NULL,
                severity TEXT NOT NULL,
                principle TEXT NOT NULL,
                spiritual_weight INTEGER NOT NULL,
                context TEXT,
                root_cause TEXT,
                spiritual_reflection TEXT,
                corrective_actions TEXT,
                topology_analysis TEXT,
                resolved BOOLEAN DEFAULT FALSE,
                resolution_notes TEXT
            )
        """)
        
        # Create error patterns table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS error_patterns (
                tenant_id TEXT,
                error_type TEXT,
                agent_name TEXT,
                frequency INTEGER,
                last_occurrence TEXT,
                common_root_causes TEXT,
                PRIMARY KEY (tenant_id, error_type, agent_name)
            )
        """)
        
        # Create principle statistics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS principle_stats (
                tenant_id TEXT,
                principle TEXT,
                total_errors INTEGER,
                avg_spiritual_weight REAL,
                resolution_rate REAL,
                last_updated TEXT,
                PRIMARY KEY (tenant_id, principle)
            )
        """)
        
        conn.commit()
        conn.close()
        self.logger.info(f"Database initialized for tenant {self.tenant_id}")
    
    def _init_llm_client(self):
        """Initialize the LLM client for error analysis and reflection generation."""
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
        
        # System message for error analysis and spiritual reflection
        self.system_message = f"""
        You are the AtidAgent, embodying the Islamic principle of recording mistakes for learning and improvement.
        Your mission is to analyze errors, extract lessons, and provide guidance that aligns with Islamic spiritual principles.
        
        GUIDING PRINCIPLES:
        1. Tawbah (Repentance): Frame errors as opportunities for returning to the correct path
        2. Sabr (Patience): Acknowledge the difficulty of failures and encourage perseverance
        3. Ilma (Knowledge): Extract wisdom and learning from every mistake
        4. Tawakkul (Trust): Maintain trust in divine plan during system failures
        5. Istighfar (Forgiveness): Seek improvement through acknowledging shortcomings
        6. Hikmah (Wisdom): Provide deep insights that prevent future errors
        7. Taqwa (Consciousness): Foster mindfulness to prevent recurring issues
        
        Your responses should:
        - Be constructive and focused on learning rather than blame
        - Provide practical insights for system improvement
        - Maintain confidentiality and respect for all agents
        - Use clear, encouraging language that promotes growth
        - Connect technical solutions with spiritual wisdom
        """
    
    def record_error(
        self,
        agent_name: str,
        error_type: str,
        error_message: str,
        severity: ErrorSeverity,
        principle: IslamicPrinciple,
        spiritual_weight: int,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Record an error event in the ledger.
        
        Args:
            agent_name: Name of the agent that experienced the error
            error_type: Type/category of error
            error_message: Detailed error message
            severity: Error severity level
            principle: Islamic principle category for the lesson
            spiritual_weight: Spiritual significance (1-10 scale)
            context: Additional context and data
            
        Returns:
            Event ID of the recorded error
        """
        try:
            # Validate inputs
            if not agent_name or not agent_name.strip():
                raise ValueError("Agent name cannot be empty")
                
            if not 1 <= spiritual_weight <= 10:
                raise ValueError("Spiritual weight must be between 1 and 10")
            
            # Generate event ID with microsecond precision to avoid collisions
            event_id = f"error_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}_{agent_name}"
            
            # Create error event
            event = ErrorEvent(
                event_id=event_id,
                timestamp=datetime.now(),
                agent_name=agent_name,
                tenant_id=self.tenant_id,
                error_type=error_type,
                error_message=error_message,
                severity=severity,
                principle=principle,
                spiritual_weight=spiritual_weight,
                context=context or {}
            )
            
            # Perform topology analysis
            event.topology_analysis = self.toha_analyzer.analyze_error_topology(event)
            
            # Store in database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO error_events 
                (event_id, timestamp, agent_name, tenant_id, error_type, error_message,
                 severity, principle, spiritual_weight, context, topology_analysis)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event.event_id,
                event.timestamp.isoformat(),
                event.agent_name,
                event.tenant_id,
                event.error_type,
                event.error_message,
                event.severity.value,
                event.principle.value,
                event.spiritual_weight,
                json.dumps(event.context),
                json.dumps(event.topology_analysis)
            ))
            
            conn.commit()
            conn.close()
            
            # Update error patterns
            self._update_error_patterns(event)
            
            # Log audit event
            log_audit_event(
                agent_name="AtidAgent",
                action="RECORD_ERROR",
                details=f"Event {event_id} recorded for {agent_name} with principle {principle.value}",
                status="SUCCESS"
            )
            
            self.logger.info(f"Error recorded: {event_id} - {agent_name} - {principle.value}")
            return event_id
            
        except Exception as e:
            self.logger.error(f"Failed to record error: {str(e)}")
            log_audit_event(
                agent_name="AtidAgent",
                action="RECORD_ERROR",
                details=f"Failed to record error for {agent_name}: {str(e)}",
                status="ERROR"
            )
            raise
    
    async def analyze_root_cause(self, event_id: str) -> str:
        """
        Analyze the root cause of an error event using LLM.
        
        Args:
            event_id: ID of the error event
            
        Returns:
            Root cause analysis
        """
        try:
            # Retrieve event from database
            event = self._get_event(event_id)
            if not event:
                raise ValueError(f"Event {event_id} not found")
            
            # Create prompt for root cause analysis
            prompt = f"""
            Analyze the root cause of this error event, following Islamic principles of learning:
            
            Event Details:
            - Agent: {event.agent_name}
            - Error Type: {event.error_type}
            - Error Message: {event.error_message}
            - Severity: {event.severity.value}
            - Principle: {event.principle.value}
            - Spiritual Weight: {event.spiritual_weight}/10
            - Context: {json.dumps(event.context, indent=2)}
            - Topology Analysis: {json.dumps(event.topology_analysis, indent=2)}
            
            Please provide:
            1. Primary root cause identification
            2. Contributing factors analysis
            3. Systemic issues that may have contributed
            4. Connection to {event.principle.value} principle
            5. Technical and spiritual insights
            
            Focus on understanding rather than blame, and provide actionable insights.
            """
            
            # Generate root cause analysis using LLM
            agent = AssistantAgent(
                name="Atid_RootCause_Analyzer",
                system_message=self.system_message,
                model_client=self.model_client,
            )
            
            message = TextMessage(content=prompt, source="AtidAgent")
            response = await agent.on_messages([message], cancellation_token=None)
            
            root_cause = response.chat_message.content if response.chat_message else "Root cause analysis failed"
            
            # Update event with root cause analysis
            self._update_event_root_cause(event_id, root_cause)
            
            self.logger.info(f"Root cause analysis completed for event {event_id}")
            return root_cause
            
        except Exception as e:
            self.logger.error(f"Failed to analyze root cause for {event_id}: {str(e)}")
            raise
    
    async def generate_reflection(self, event_id: str) -> str:
        """
        Generate a spiritual reflection for an error event using LLM.
        
        Args:
            event_id: ID of the error event
            
        Returns:
            Generated spiritual reflection
        """
        try:
            # Retrieve event from database
            event = self._get_event(event_id)
            if not event:
                raise ValueError(f"Event {event_id} not found")
            
            # Create prompt for spiritual reflection
            prompt = f"""
            Generate a spiritual reflection for this error event, following Islamic principles:
            
            Event Details:
            - Agent: {event.agent_name}
            - Error Type: {event.error_type}
            - Error Message: {event.error_message}
            - Severity: {event.severity.value}
            - Principle: {event.principle.value}
            - Spiritual Weight: {event.spiritual_weight}/10
            - Root Cause: {event.root_cause or 'Not yet analyzed'}
            
            Please create a reflection that:
            1. Honors the principle of {event.principle.value}
            2. Extracts spiritual wisdom and lessons from this error
            3. Provides guidance for personal and system growth
            4. Encourages patience (Sabr) and perseverance
            5. Frames the error as an opportunity for Tawbah (repentance/return to correct path)
            6. Maintains hope and trust in improvement
            
            Keep the reflection inspiring, practical, and aligned with Islamic teachings.
            """
            
            # Generate reflection using LLM
            agent = AssistantAgent(
                name="Atid_Reflection_Generator",
                system_message=self.system_message,
                model_client=self.model_client,
            )
            
            message = TextMessage(content=prompt, source="AtidAgent")
            response = await agent.on_messages([message], cancellation_token=None)
            
            reflection = response.chat_message.content if response.chat_message else "Reflection generation failed"
            
            # Update event with generated reflection
            self._update_event_reflection(event_id, reflection)
            
            self.logger.info(f"Spiritual reflection generated for event {event_id}")
            return reflection
            
        except Exception as e:
            self.logger.error(f"Failed to generate reflection for {event_id}: {str(e)}")
            raise
    
    async def suggest_corrective_actions(self, event_id: str) -> List[str]:
        """
        Suggest corrective actions for an error event using LLM.
        
        Args:
            event_id: ID of the error event
            
        Returns:
            List of corrective action recommendations
        """
        try:
            # Retrieve event from database
            event = self._get_event(event_id)
            if not event:
                raise ValueError(f"Event {event_id} not found")
            
            # Create prompt for corrective actions
            prompt = f"""
            Suggest corrective actions for this error event, following Islamic principles:
            
            Event Details:
            - Agent: {event.agent_name}
            - Error Type: {event.error_type}
            - Error Message: {event.error_message}
            - Severity: {event.severity.value}
            - Principle: {event.principle.value}
            - Spiritual Weight: {event.spiritual_weight}/10
            - Root Cause: {event.root_cause or 'Not yet analyzed'}
            - Topology Analysis: {json.dumps(event.topology_analysis, indent=2)}
            
            Please provide:
            1. Immediate technical actions to resolve this error
            2. Preventive measures to avoid recurrence
            3. Systemic improvements based on {event.principle.value}
            4. Spiritual practices to strengthen against similar errors
            5. Monitoring and alerting improvements
            6. Team learning and knowledge sharing recommendations
            
            Format as a numbered list of actionable items.
            """
            
            # Generate corrective actions using LLM
            agent = AssistantAgent(
                name="Atid_Corrective_Action_Advisor",
                system_message=self.system_message,
                model_client=self.model_client,
            )
            
            message = TextMessage(content=prompt, source="AtidAgent")
            response = await agent.on_messages([message], cancellation_token=None)
            
            actions_text = response.chat_message.content if response.chat_message else "Action generation failed"
            
            # Parse actions into list (assuming numbered list format)
            actions = []
            for line in actions_text.split('\n'):
                if line.strip() and (line.strip().startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')) or 
                                    line.strip()[0].isdigit() and '.' in line.strip()):
                    # Remove numbering and clean up
                    action = line.split('.', 1)[1].strip() if '.' in line else line.strip()
                    actions.append(action)
            
            # Update event with suggested actions
            self._update_event_corrective_actions(event_id, actions)
            
            self.logger.info(f"Corrective actions suggested for event {event_id}")
            return actions
            
        except Exception as e:
            self.logger.error(f"Failed to suggest corrective actions for {event_id}: {str(e)}")
            raise
    
    def get_error_patterns(
        self,
        agent_name: Optional[str] = None,
        error_type: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Identify recurring error patterns and trends.
        
        Args:
            agent_name: Filter by specific agent (optional)
            error_type: Filter by specific error type (optional)
            days: Number of days to look back (default: 30)
            
        Returns:
            Dictionary containing error pattern analysis
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Build query with filters
            query = """
                SELECT error_type, agent_name, COUNT(*) as frequency,
                       AVG(spiritual_weight) as avg_weight,
                       MAX(timestamp) as last_occurrence,
                       SUM(CASE WHEN resolved = TRUE THEN 1 ELSE 0 END) as resolved_count
                FROM error_events 
                WHERE tenant_id = ? 
                AND timestamp >= datetime('now', '-{} days')
            """.format(days)
            
            params = [self.tenant_id]
            
            if agent_name:
                query += " AND agent_name = ?"
                params.append(agent_name)
            
            if error_type:
                query += " AND error_type = ?"
                params.append(error_type)
            
            query += " GROUP BY error_type, agent_name ORDER BY frequency DESC"
            
            cursor.execute(query, params)
            results = cursor.fetchall()
            
            # Get common root causes for top patterns
            patterns = []
            for row in results[:10]:  # Top 10 patterns
                cursor.execute("""
                    SELECT root_cause FROM error_events 
                    WHERE tenant_id = ? AND error_type = ? AND agent_name = ?
                    AND root_cause IS NOT NULL
                    LIMIT 3
                """, (self.tenant_id, row[0], row[1]))
                
                root_causes = [rc[0] for rc in cursor.fetchall()]
                
                patterns.append({
                    "error_type": row[0],
                    "agent_name": row[1],
                    "frequency": row[2],
                    "avg_spiritual_weight": round(row[3], 2),
                    "last_occurrence": row[4],
                    "resolution_rate": round(row[5] / row[2] * 100, 2) if row[2] > 0 else 0,
                    "common_root_causes": root_causes
                })
            
            # Get principle-based patterns
            cursor.execute("""
                SELECT principle, COUNT(*) as count, AVG(spiritual_weight) as avg_weight
                FROM error_events 
                WHERE tenant_id = ? AND timestamp >= datetime('now', '-{} days')
                GROUP BY principle
                ORDER BY count DESC
            """.format(days), [self.tenant_id])
            
            principle_patterns = cursor.fetchall()
            
            conn.close()
            
            analysis = {
                "tenant_id": self.tenant_id,
                "period_days": days,
                "total_patterns": len(patterns),
                "top_error_patterns": patterns,
                "principle_distribution": [
                    {
                        "principle": row[0],
                        "count": row[1],
                        "avg_weight": round(row[2], 2)
                    } for row in principle_patterns
                ],
                "recommendations": self._generate_pattern_recommendations(patterns)
            }
            
            self.logger.info(f"Error patterns analysis completed for tenant {self.tenant_id}")
            return analysis
            
        except Exception as e:
            self.logger.error(f"Failed to get error patterns: {str(e)}")
            raise
    
    def resolve_error(self, event_id: str, resolution_notes: str) -> bool:
        """
        Mark an error event as resolved with resolution notes.
        
        Args:
            event_id: ID of the error event to resolve
            resolution_notes: Notes about how the error was resolved
            
        Returns:
            True if successfully marked as resolved
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE error_events 
                SET resolved = TRUE, resolution_notes = ?
                WHERE event_id = ?
            """, (resolution_notes, event_id))
            
            conn.commit()
            success = cursor.rowcount > 0
            conn.close()
            
            if success:
                self.logger.info(f"Error {event_id} marked as resolved")
                log_audit_event(
                    agent_name="AtidAgent",
                    action="RESOLVE_ERROR",
                    details=f"Error {event_id} resolved: {resolution_notes}",
                    status="SUCCESS"
                )
            
            return success
            
        except Exception as e:
            self.logger.error(f"Failed to resolve error {event_id}: {str(e)}")
            return False
    
    def _get_event(self, event_id: str) -> Optional[ErrorEvent]:
        """Retrieve an error event from the database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM error_events WHERE event_id = ?
        """, (event_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        return ErrorEvent(
            event_id=row[0],
            timestamp=datetime.fromisoformat(row[1]),
            agent_name=row[2],
            tenant_id=row[3],
            error_type=row[4],
            error_message=row[5],
            severity=ErrorSeverity(row[6]),
            principle=IslamicPrinciple(row[7]),
            spiritual_weight=row[8],
            context=json.loads(row[9]) if row[9] else {},
            root_cause=row[10],
            spiritual_reflection=row[11],
            corrective_actions=json.loads(row[12]) if row[12] else None,
            topology_analysis=json.loads(row[13]) if row[13] else None,
            resolved=bool(row[14]),
            resolution_notes=row[15]
        )
    
    def _update_event_root_cause(self, event_id: str, root_cause: str):
        """Update event with root cause analysis."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE error_events SET root_cause = ? WHERE event_id = ?
        """, (root_cause, event_id))
        
        conn.commit()
        conn.close()
    
    def _update_event_reflection(self, event_id: str, reflection: str):
        """Update event with spiritual reflection."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE error_events SET spiritual_reflection = ? WHERE event_id = ?
        """, (reflection, event_id))
        
        conn.commit()
        conn.close()
    
    def _update_event_corrective_actions(self, event_id: str, actions: List[str]):
        """Update event with corrective actions."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE error_events SET corrective_actions = ? WHERE event_id = ?
        """, (json.dumps(actions), event_id))
        
        conn.commit()
        conn.close()
    
    def _update_error_patterns(self, event: ErrorEvent):
        """Update error patterns statistics."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Calculate current stats for this pattern
        cursor.execute("""
            SELECT COUNT(*) FROM error_events 
            WHERE tenant_id = ? AND error_type = ? AND agent_name = ?
        """, (self.tenant_id, event.error_type, event.agent_name))
        
        frequency = cursor.fetchone()[0]
        
        # Get common root causes
        cursor.execute("""
            SELECT root_cause FROM error_events 
            WHERE tenant_id = ? AND error_type = ? AND agent_name = ?
            AND root_cause IS NOT NULL
            GROUP BY root_cause
            ORDER BY COUNT(*) DESC
            LIMIT 3
        """, (self.tenant_id, event.error_type, event.agent_name))
        
        common_root_causes = [rc[0] for rc in cursor.fetchall()]
        
        # Update or insert pattern
        cursor.execute("""
            INSERT OR REPLACE INTO error_patterns 
            (tenant_id, error_type, agent_name, frequency, last_occurrence, common_root_causes)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            self.tenant_id,
            event.error_type,
            event.agent_name,
            frequency,
            event.timestamp.isoformat(),
            json.dumps(common_root_causes)
        ))
        
        # Update principle statistics
        cursor.execute("""
            INSERT OR REPLACE INTO principle_stats 
            (tenant_id, principle, total_errors, avg_spiritual_weight, resolution_rate, last_updated)
            SELECT ?, ?, 
                   COUNT(*), 
                   AVG(spiritual_weight),
                   SUM(CASE WHEN resolved = TRUE THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
                   ?
            FROM error_events 
            WHERE tenant_id = ? AND principle = ?
        """, (self.tenant_id, event.principle.value, datetime.now().isoformat(), 
              self.tenant_id, event.principle.value))
        
        conn.commit()
        conn.close()
    
    def _generate_pattern_recommendations(self, patterns: List[Dict]) -> List[str]:
        """Generate recommendations based on error patterns."""
        recommendations = []
        
        if not patterns:
            return ["No significant error patterns detected in the specified period."]
        
        # Analyze top patterns
        top_pattern = patterns[0]
        if top_pattern["frequency"] > 5:
            recommendations.append(
                f"High frequency error '{top_pattern['error_type']}' in {top_pattern['agent_name']} "
                f"requires immediate attention and systematic fixes"
            )
        
        # Check resolution rates
        low_resolution_patterns = [p for p in patterns if p["resolution_rate"] < 50]
        if low_resolution_patterns:
            recommendations.append(
                f"Multiple patterns show low resolution rates (<50%). "
                f"Review incident response procedures and team training"
            )
        
        # Check spiritual weight patterns
        high_weight_patterns = [p for p in patterns if p["avg_spiritual_weight"] > 7]
        if high_weight_patterns:
            recommendations.append(
                "Several high-impact errors detected. Consider implementing additional "
                "monitoring and preventive measures aligned with Islamic principles"
            )
        
        return recommendations


def create_atid_agent(tenant_id: str = "default") -> AtidAgent:
    """
    Factory function to create an AtidAgent instance.
    
    Args:
        tenant_id: Tenant identifier for multi-tenant architecture
        
    Returns:
        Configured AtidAgent instance
    """
    return AtidAgent(tenant_id=tenant_id)


async def test_atid_agent():
    """Test the AtidAgent functionality."""
    print("\n" + "=" * 60)
    print("Testing AtidAgent (Error Reflection Engine)")
    print("=" * 60 + "\n")
    
    # Create agent
    atid = create_atid_agent("test-tenant")
    
    # Test recording error
    event_id = atid.record_error(
        agent_name="TestAgent",
        error_type="API_CONNECTION_FAILED",
        error_message="Failed to connect to external API after 3 retries",
        severity=ErrorSeverity.HIGH,
        principle=IslamicPrinciple.SABR,
        spiritual_weight=7,
        context={
            "api_endpoint": "https://api.example.com",
            "retry_count": 3,
            "timeout": 30
        }
    )
    
    print(f"✅ Error recorded with ID: {event_id}")
    
    # Test root cause analysis
    root_cause = await atid.analyze_root_cause(event_id)
    print(f"\n🔍 Root Cause Analysis:\n{root_cause}")
    
    # Test reflection generation
    reflection = await atid.generate_reflection(event_id)
    print(f"\n📖 Spiritual Reflection:\n{reflection}")
    
    # Test corrective actions
    actions = await atid.suggest_corrective_actions(event_id)
    print(f"\n🔧 Corrective Actions:")
    for i, action in enumerate(actions, 1):
        print(f"{i}. {action}")
    
    # Test error patterns
    patterns = atid.get_error_patterns()
    print(f"\n📊 Error Patterns Analysis:\n{json.dumps(patterns, indent=2)}")
    
    # Test resolution
    resolved = atid.resolve_error(event_id, "Fixed API connectivity by updating authentication tokens")
    print(f"\n✅ Error resolved: {resolved}")
    
    print("\n✅ AtidAgent test completed successfully!")


if __name__ == "__main__":
    asyncio.run(test_atid_agent())