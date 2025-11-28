"""
Integration Hooks for Fractal Swarm Topology
Part of QCC Spiritual Intelligence Framework

This module provides integration points between Fractal Swarm Topology
and existing Raqib (success recording) and Atid (error reflection) agents,
enabling spiritual topology analysis of agent interactions and events.
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass

# Import QCC utilities
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from utils.logger import get_logger, log_audit_event
from topology.fractal_swarm import (
    FractalSwarmTopology,
    NetworkScale,
    IslamicPrinciple,
    NodeRole
)

# Import existing agents (with error handling for circular imports)
try:
    from agents.raqib_agent import RaqibAgent, IslamicPrinciple as RaqibPrinciple
    from agents.atid_agent import AtidAgent, ErrorSeverity, IslamicPrinciple as AtidPrinciple
    AGENTS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import agents: {e}")
    AGENTS_AVAILABLE = False


@dataclass
class TopologyEvent:
    """Represents a topology-related event for agent integration."""
    event_id: str
    timestamp: datetime
    event_type: str  # 'success', 'error', 'cascade', 'hub_change'
    agent_name: str
    scale: NetworkScale
    node_id: Optional[int]
    description: str
    spiritual_principle: IslamicPrinciple
    topology_context: Dict[str, Any]


class TopologyIntegrationHooks:
    """
    Integration hooks for connecting Fractal Swarm Topology with existing agents.
    
    This class provides bidirectional integration:
    1. Topology -> Agents: Send topology insights to Raqib/Atid
    2. Agents -> Topology: Update topology based on agent events
    """
    
    def __init__(self, tenant_id: str = "default"):
        """
        Initialize topology integration hooks.
        
        Args:
            tenant_id: Tenant identifier for multi-tenant architecture
        """
        self.tenant_id = tenant_id
        self.logger = get_logger(f"TopologyHooks-{tenant_id}")
        
        # Initialize topology
        self.topology = FractalSwarmTopology(tenant_id=tenant_id)
        
        # Initialize agents if available
        self.raqib_agent = None
        self.atid_agent = None
        
        if AGENTS_AVAILABLE:
            try:
                self.raqib_agent = RaqibAgent(tenant_id=tenant_id)
                self.atid_agent = AtidAgent(tenant_id=tenant_id)
                self.logger.info("Successfully initialized Raqib and Atid agents")
            except Exception as e:
                self.logger.warning(f"Failed to initialize agents: {e}")
        
        # Event history for integration tracking
        self.event_history = []
        
        # Log initialization
        log_audit_event(
            agent_name="TopologyIntegrationHooks",
            action="INITIALIZATION",
            details=f"Tenant: {tenant_id}, Agents available: {AGENTS_AVAILABLE}",
            status="SUCCESS"
        )
    
    async def initialize_integration(self) -> bool:
        """
        Initialize the integration between topology and agents.
        
        Returns:
            True if integration successful, False otherwise
        """
        try:
            # Build initial topology
            self.logger.info("Building initial fractal hierarchy...")
            graphs = self.topology.build_fractal_hierarchy()
            
            # Analyze topology
            self.logger.info("Analyzing topology properties...")
            similarity = self.topology.verify_self_similarity()
            invariance = self.topology.calculate_scale_invariance()
            
            # Record topology initialization as success event
            if self.raqib_agent:
                await self._record_topology_success("INITIALIZATION", similarity, invariance)
            
            # Set up event listeners for agent events
            if AGENTS_AVAILABLE:
                await self._setup_agent_event_listeners()
            
            self.logger.info("Topology integration initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize integration: {e}")
            
            # Record as error event
            if self.atid_agent:
                await self._record_topology_error("INITIALIZATION", str(e))
            
            return False
    
    async def record_agent_success(
        self,
        agent_name: str,
        description: str,
        principle: IslamicPrinciple,
        impact_level: str = "MEDIUM",
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Record agent success event and update topology accordingly.
        
        Args:
            agent_name: Name of the agent achieving success
            description: Description of the success
            principle: Islamic principle associated with success
            impact_level: Impact level (LOW, MEDIUM, HIGH)
            metadata: Additional metadata
            
        Returns:
            Event ID of recorded success
        """
        try:
            # Create topology event
            event = TopologyEvent(
                event_id=f"topo_success_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{agent_name}",
                timestamp=datetime.now(),
                event_type="success",
                agent_name=agent_name,
                scale=NetworkScale.MESO,  # Default to meso scale
                node_id=None,
                description=description,
                spiritual_principle=principle,
                topology_context={
                    "impact_level": impact_level,
                    "metadata": metadata or {},
                    "topology_impact": await self._calculate_success_topology_impact(agent_name, principle)
                }
            )
            
            # Record in Raqib agent
            event_id = None
            if self.raqib_agent and AGENTS_AVAILABLE:
                # Map to Raqib principle if needed
                raqib_principle = self._map_to_raqib_principle(principle)
                if raqib_principle:
                    event_id = self.raqib_agent.record_success(
                        agent_name=agent_name,
                        description=description,
                        principle=raqib_principle,
                        spiritual_weight=self._get_spiritual_weight(principle),
                        impact_level=impact_level,
                        metadata={
                            **(metadata or {}),
                            "topology_event_id": event.event_id,
                            "integration_type": "topology_hook"
                        }
                    )
            
            # Update topology based on success
            await self._update_topology_for_success(event)
            
            # Store in history
            self.event_history.append(event)
            
            # Log audit event
            log_audit_event(
                agent_name="TopologyIntegrationHooks",
                action="RECORD_AGENT_SUCCESS",
                details=f"Agent: {agent_name}, Principle: {principle.value}, Event: {event.event_id}",
                status="SUCCESS"
            )
            
            return event_id or event.event_id
            
        except Exception as e:
            self.logger.error(f"Failed to record agent success: {e}")
            raise
    
    async def record_agent_error(
        self,
        agent_name: str,
        error_type: str,
        error_message: str,
        principle: IslamicPrinciple,
        severity: str = "MEDIUM",
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Record agent error event and update topology accordingly.
        
        Args:
            agent_name: Name of the agent experiencing error
            error_type: Type/category of error
            error_message: Detailed error message
            principle: Islamic principle for learning
            severity: Error severity level
            context: Additional context
            
        Returns:
            Event ID of recorded error
        """
        try:
            # Create topology event
            event = TopologyEvent(
                event_id=f"topo_error_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{agent_name}",
                timestamp=datetime.now(),
                event_type="error",
                agent_name=agent_name,
                scale=NetworkScale.MESO,  # Default to meso scale
                node_id=None,
                description=f"{error_type}: {error_message}",
                spiritual_principle=principle,
                topology_context={
                    "error_type": error_type,
                    "severity": severity,
                    "context": context or {},
                    "topology_impact": await self._calculate_error_topology_impact(agent_name, error_type)
                }
            )
            
            # Record in Atid agent
            event_id = None
            if self.atid_agent and AGENTS_AVAILABLE:
                # Map to Atid principle and severity if needed
                atid_principle = self._map_to_atid_principle(principle)
                atid_severity = self._map_to_atid_severity(severity)
                
                if atid_principle and atid_severity:
                    event_id = self.atid_agent.record_error(
                        agent_name=agent_name,
                        error_type=error_type,
                        error_message=error_message,
                        severity=atid_severity,
                        principle=atid_principle,
                        spiritual_weight=self._get_spiritual_weight(principle),
                        context={
                            **(context or {}),
                            "topology_event_id": event.event_id,
                            "integration_type": "topology_hook"
                        }
                    )
            
            # Update topology based on error
            await self._update_topology_for_error(event)
            
            # Store in history
            self.event_history.append(event)
            
            # Log audit event
            log_audit_event(
                agent_name="TopologyIntegrationHooks",
                action="RECORD_AGENT_ERROR",
                details=f"Agent: {agent_name}, Error: {error_type}, Event: {event.event_id}",
                status="SUCCESS"
            )
            
            return event_id or event.event_id
            
        except Exception as e:
            self.logger.error(f"Failed to record agent error: {e}")
            raise
    
    async def analyze_topology_for_agents(self) -> Dict[str, Any]:
        """
        Analyze current topology and provide insights for agents.
        
        Returns:
            Dictionary containing topology insights for agents
        """
        try:
            # Ensure topology is built
            if not self.topology.graphs:
                await self.initialize_integration()
            
            insights = {}
            
            # Analyze each scale
            for scale in NetworkScale:
                if scale in self.topology.graphs:
                    scale_insights = {}
                    
                    # Hub analysis
                    hubs = self.topology.identify_hubs(scale)
                    scale_insights['hub_analysis'] = {
                        'hub_count': len(hubs.hub_nodes),
                        'imam_nodes': [n for n, r in hubs.hub_roles.items() if r == NodeRole.IMAM],
                        'alim_nodes': [n for n, r in hubs.hub_roles.items() if r == NodeRole.ALIM],
                        'spiritual_influence': hubs.spiritual_influence
                    }
                    
                    # Cascade analysis (simulate from top hub)
                    if hubs.hub_nodes:
                        top_hub = max(hubs.spiritual_influence.items(), key=lambda x: x[1])[0]
                        cascade = self.topology.analyze_cascade_effects(scale, top_hub)
                        scale_insights['cascade_analysis'] = {
                            'source_hub': top_hub,
                            'affected_nodes': len(cascade.affected_nodes),
                            'propagation_speed': cascade.propagation_speed,
                            'resilience_score': cascade.resilience_score,
                            'spiritual_impact': cascade.spiritual_impact
                        }
                    
                    # Spiritual metrics
                    metrics = self.topology.metrics.get(scale)
                    if metrics:
                        scale_insights['spiritual_metrics'] = {
                            'tawhid_score': metrics.tawhid_score,
                            'is_scale_free': metrics.is_scale_free,
                            'power_law_exponent': metrics.power_law_exponent
                        }
                    
                    insights[scale.value] = scale_insights
            
            # Overall insights
            insights['overall'] = {
                'self_similarity': self.topology.verify_self_similarity(),
                'scale_invariance': self.topology.calculate_scale_invariance(),
                'integration_health': {
                    'raqib_available': self.raqib_agent is not None,
                    'atid_available': self.atid_agent is not None,
                    'total_events': len(self.event_history)
                }
            }
            
            self.logger.info(f"Generated topology insights for {len(insights)} scales")
            return insights
            
        except Exception as e:
            self.logger.error(f"Failed to analyze topology for agents: {e}")
            raise
    
    async def export_integration_data(self, output_path: Optional[str] = None) -> str:
        """
        Export integration data for analysis and visualization.
        
        Args:
            output_path: Optional path to save export file
            
        Returns:
            Path to exported file
        """
        try:
            # Gather all integration data
            export_data = {
                'tenant_id': self.tenant_id,
                'export_timestamp': datetime.now().isoformat(),
                'topology_insights': await self.analyze_topology_for_agents(),
                'event_history': [
                    {
                        'event_id': event.event_id,
                        'timestamp': event.timestamp.isoformat(),
                        'event_type': event.event_type,
                        'agent_name': event.agent_name,
                        'scale': event.scale.value,
                        'description': event.description,
                        'spiritual_principle': event.spiritual_principle.value,
                        'topology_context': event.topology_context
                    }
                    for event in self.event_history[-100:]  # Last 100 events
                ],
                'integration_status': {
                    'agents_available': AGENTS_AVAILABLE,
                    'raqib_active': self.raqib_agent is not None,
                    'atid_active': self.atid_agent is not None
                }
            }
            
            # Determine output path
            if output_path is None:
                output_path = f"quantum_command_center/outputs/topology_integration_{self.tenant_id}.json"
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Export to JSON
            with open(output_path, 'w') as f:
                json.dump(export_data, f, indent=2)
            
            self.logger.info(f"Integration data exported to {output_path}")
            return output_path
            
        except Exception as e:
            self.logger.error(f"Failed to export integration data: {e}")
            raise
    
    # Private helper methods
    
    async def _setup_agent_event_listeners(self):
        """Set up event listeners for agent events."""
        # This would be implemented with actual agent event systems
        # For now, we'll log that listeners would be set up
        self.logger.info("Agent event listeners would be set up here")
    
    async def _record_topology_success(self, event_type: str, similarity: Dict, invariance: Dict):
        """Record topology-related success in Raqib agent."""
        if not self.raqib_agent:
            return
        
        try:
            # Create description from metrics
            avg_similarity = sum(similarity.values()) / len(similarity)
            overall_invariance = invariance.get('overall_invariance', 0.0)
            
            description = (
                f"Topology {event_type}: Self-similarity={avg_similarity:.3f}, "
                f"Invariance={overall_invariance:.3f}"
            )
            
            # Record as success
            self.raqib_agent.record_success(
                agent_name="FractalTopology",
                description=description,
                principle=RaqibPrinciple.TAWHID if AGENTS_AVAILABLE else None,
                spiritual_weight=8,
                impact_level="HIGH",
                metadata={
                    "similarity_scores": similarity,
                    "invariance_metrics": invariance,
                    "event_type": event_type
                }
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to record topology success: {e}")
    
    async def _record_topology_error(self, event_type: str, error_message: str):
        """Record topology-related error in Atid agent."""
        if not self.atid_agent:
            return
        
        try:
            # Record as error
            self.atid_agent.record_error(
                agent_name="FractalTopology",
                error_type=f"TOPOLOGY_{event_type}",
                error_message=error_message,
                severity=ErrorSeverity.MEDIUM if AGENTS_AVAILABLE else "MEDIUM",
                principle=AtidPrinciple.SABR if AGENTS_AVAILABLE else None,
                spiritual_weight=6,
                context={
                    "event_type": event_type,
                    "component": "fractal_topology"
                }
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to record topology error: {e}")
    
    async def _calculate_success_topology_impact(self, agent_name: str, principle: IslamicPrinciple) -> Dict[str, Any]:
        """Calculate topology impact of agent success."""
        # This would analyze how success affects network topology
        return {
            "impact_type": "success",
            "agent_affected": agent_name,
            "principle_aligned": principle.value,
            "network_resilience_change": 0.1,  # Successes improve resilience
            "spiritual_coherence_increase": 0.05
        }
    
    async def _calculate_error_topology_impact(self, agent_name: str, error_type: str) -> Dict[str, Any]:
        """Calculate topology impact of agent error."""
        # This would analyze how error affects network topology
        return {
            "impact_type": "error",
            "agent_affected": agent_name,
            "error_category": error_type,
            "network_resilience_change": -0.15,  # Errors reduce resilience
            "spiritual_coherence_decrease": -0.08
        }
    
    async def _update_topology_for_success(self, event: TopologyEvent):
        """Update topology based on success event."""
        # This would implement topology updates based on successes
        # For now, we'll just log the update
        self.logger.info(f"Would update topology for success event: {event.event_id}")
    
    async def _update_topology_for_error(self, event: TopologyEvent):
        """Update topology based on error event."""
        # This would implement topology updates based on errors
        # For now, we'll just log the update
        self.logger.info(f"Would update topology for error event: {event.event_id}")
    
    def _map_to_raqib_principle(self, principle: IslamicPrinciple):
        """Map topology principle to Raqib agent principle."""
        if not AGENTS_AVAILABLE:
            return None
        
        mapping = {
            IslamicPrinciple.TAWHID: RaqibPrinciple.TAWHID,
            IslamicPrinciple.ADL: RaqibPrinciple.ADL,
            IslamicPrinciple.SABR: RaqibPrinciple.SABR,
            IslamicPrinciple.HIKMAH: RaqibPrinciple.ILMA,
            IslamicPrinciple.TAWASUL: RaqibPrinciple.AMANAH
        }
        return mapping.get(principle)
    
    def _map_to_atid_principle(self, principle: IslamicPrinciple):
        """Map topology principle to Atid agent principle."""
        if not AGENTS_AVAILABLE:
            return None
        
        mapping = {
            IslamicPrinciple.TAWHID: AtidPrinciple.TAWBAH,
            IslamicPrinciple.ADL: AtidPrinciple.HIKMAH,
            IslamicPrinciple.SABR: AtidPrinciple.SABR,
            IslamicPrinciple.HIKMAH: AtidPrinciple.ILMA,
            IslamicPrinciple.TAWASUL: AtidPrinciple.TAQWA
        }
        return mapping.get(principle)
    
    def _map_to_atid_severity(self, severity: str):
        """Map string severity to Atid agent severity."""
        if not AGENTS_AVAILABLE:
            return None
        
        mapping = {
            "LOW": ErrorSeverity.LOW,
            "MEDIUM": ErrorSeverity.MEDIUM,
            "HIGH": ErrorSeverity.HIGH,
            "CRITICAL": ErrorSeverity.CRITICAL
        }
        return mapping.get(severity)
    
    def _get_spiritual_weight(self, principle: IslamicPrinciple) -> int:
        """Get spiritual weight for principle."""
        weights = {
            IslamicPrinciple.TAWHID: 10,
            IslamicPrinciple.ADL: 8,
            IslamicPrinciple.SABR: 7,
            IslamicPrinciple.HIKMAH: 9,
            IslamicPrinciple.TAWASUL: 6
        }
        return weights.get(principle, 5)


# Factory function
def create_topology_integration_hooks(tenant_id: str = "default") -> TopologyIntegrationHooks:
    """
    Factory function to create TopologyIntegrationHooks instances.
    
    Args:
        tenant_id: Tenant identifier for multi-tenant architecture
        
    Returns:
        Configured TopologyIntegrationHooks instance
    """
    return TopologyIntegrationHooks(tenant_id=tenant_id)


# Test function
async def test_topology_integration():
    """Test topology integration hooks."""
    print("\n" + "=" * 60)
    print("Testing Topology Integration Hooks")
    print("=" * 60 + "\n")
    
    # Create integration hooks
    hooks = create_topology_integration_hooks("integration-test")
    
    # Initialize integration
    success = await hooks.initialize_integration()
    print(f"✅ Integration initialized: {success}")
    
    # Test recording success
    if AGENTS_AVAILABLE:
        success_id = await hooks.record_agent_success(
            agent_name="TestAgent",
            description="Successfully optimized network topology",
            principle=IslamicPrinciple.TAWHID,
            impact_level="HIGH",
            metadata={"optimization_type": "fractal"}
        )
        print(f"✅ Success recorded: {success_id}")
    
    # Test recording error
    if AGENTS_AVAILABLE:
        error_id = await hooks.record_agent_error(
            agent_name="TestAgent",
            error_type="TOPOLOGY_ERROR",
            error_message="Network connectivity issue",
            principle=IslamicPrinciple.SABR,
            severity="MEDIUM"
        )
        print(f"✅ Error recorded: {error_id}")
    
    # Test topology analysis
    insights = await hooks.analyze_topology_for_agents()
    print(f"✅ Generated insights for {len(insights)} scales")
    
    # Test export
    export_path = await hooks.export_integration_data()
    print(f"✅ Integration data exported: {export_path}")
    
    print("\n✅ Topology integration hooks test completed!")


if __name__ == "__main__":
    asyncio.run(test_topology_integration())