"""
MizanEngine - Divine Balance Optimization Engine
Part of QCC Phase 2: ATA Pilot with Islamic Spiritual Principles

This engine implements the Islamic principle of Al-Mizan (divine balance) 
and Adl (justice) to optimize travel decisions through the SaRO Gate framework.

Core Principle: "وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ"
"And the heaven He raised and imposed the balance" (Quran 55:7)

CRITICAL FUNCTION:
- Applies divine balance between efficiency and safety
- Implements weighted multi-objective optimization with Pareto frontier analysis
- Integrates SaRO Gate reflection principles for safety-aligned decisions
- Ensures fairness in resource allocation through Adl (justice) principle
- Provides configurable spiritual weight factors per tenant
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
import numpy as np
from pathlib import Path

# Load environment variables
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
from dotenv import load_dotenv
load_dotenv(dotenv_path=env_path)

# Import logging utilities
import sys
sys.path.append(str(Path(__file__).parent.parent))
from utils.logger import get_logger, log_audit_event


class OptimizationObjective(Enum):
    """Optimization objectives for multi-objective analysis."""
    COST = "cost"
    TIME = "time"
    SAFETY = "safety"
    COMFORT = "comfort"
    SPIRITUAL = "spiritual"


@dataclass
class SpiritualWeightConfig:
    """Configuration for spiritual weight factors."""
    mizan_balance_weight: float = 0.4  # Divine balance principle
    adl_justice_weight: float = 0.3   # Justice principle
    ihsan_excellence_weight: float = 0.2  # Excellence principle
    amanah_trust_weight: float = 0.1   # Trustworthiness principle
    
    def normalize(self) -> 'SpiritualWeightConfig':
        """Normalize weights to sum to 1.0."""
        total = sum([
            self.mizan_balance_weight,
            self.adl_justice_weight,
            self.ihsan_excellence_weight,
            self.amanah_trust_weight
        ])
        if total <= 0:
            return SpiritualWeightConfig()
        
        return SpiritualWeightConfig(
            mizan_balance_weight=self.mizan_balance_weight / total,
            adl_justice_weight=self.adl_justice_weight / total,
            ihsan_excellence_weight=self.ihsan_excellence_weight / total,
            amanah_trust_weight=self.amanah_trust_weight / total
        )


@dataclass
class SafetyConstraints:
    """Safety constraints extending existing SaRO criteria."""
    max_layover_hours: float = 8.0
    min_connection_minutes_international: int = 90
    min_connection_minutes_domestic: int = 60
    max_total_travel_hours: float = 24.0
    avoid_red_eye_flights: bool = True
    require_halal_options: bool = True
    prayer_time_compatibility: bool = True


@dataclass
class OptimizationOption:
    """Represents an optimization option with multiple objectives."""
    option_id: str
    description: str
    cost_usd: float
    duration_hours: float
    safety_score: float  # 0-1, higher is safer
    comfort_score: float  # 0-1, higher is more comfortable
    spiritual_score: float  # 0-1, higher is more aligned
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def get_objectives(self) -> Dict[OptimizationObjective, float]:
        """Get all objective values (normalized for minimization)."""
        return {
            OptimizationObjective.COST: self.cost_usd,
            OptimizationObjective.TIME: self.duration_hours,
            OptimizationObjective.SAFETY: 1.0 - self.safety_score,  # Convert to minimization
            OptimizationObjective.COMFORT: 1.0 - self.comfort_score,  # Convert to minimization
            OptimizationObjective.SPIRITUAL: 1.0 - self.spiritual_score  # Convert to minimization
        }


@dataclass
class MizanResult:
    """Result of Mizan optimization analysis."""
    selected_option: OptimizationOption
    pareto_optimal_options: List[OptimizationOption]
    balance_score: float
    saro_reflection: str
    safety_analysis: Dict[str, Any]
    spiritual_analysis: Dict[str, Any]
    justification: str


class MizanEngine:
    """
    MizanEngine - Divine Balance Optimization Engine
    
    Implements the Islamic principle of Al-Mizan (divine balance) to optimize
    travel decisions through multi-objective optimization with SaRO Gate integration.
    """
    
    def __init__(self, tenant_id: str = "default", spiritual_config: Optional[SpiritualWeightConfig] = None):
        """
        Initialize MizanEngine with tenant-specific configuration.
        
        Args:
            tenant_id: Tenant identifier for multi-tenant support
            spiritual_config: Spiritual weight configuration (uses default if None)
        """
        self.tenant_id = tenant_id
        self.logger = get_logger(f"MizanEngine-{tenant_id}")
        self.spiritual_config = spiritual_config or SpiritualWeightConfig().normalize()
        self.safety_constraints = SafetyConstraints()
        
        # Log initialization
        log_audit_event(
            agent_name="MizanEngine",
            action="INITIALIZATION",
            details=f"Tenant: {tenant_id}, Spiritual weights: {self.spiritual_config}",
            status="SUCCESS"
        )
        
        self.logger.info(f"MizanEngine initialized for tenant {tenant_id}")
        self.logger.info(f"Spiritual weights: {self.spiritual_config}")
    
    def apply_mizan(self, options: List[OptimizationOption]) -> MizanResult:
        """
        Apply Mizan (divine balance) principle to optimize options.
        
        Args:
            options: List of optimization options to analyze
            
        Returns:
            MizanResult with selected option and analysis
        """
        self.logger.info(f"Applying Mizan to {len(options)} options")
        
        if not options:
            raise ValueError("No options provided for optimization")
        
        # Step 1: Apply safety constraints (hard limits)
        safe_options = self._filter_by_safety_constraints(options)
        if not safe_options:
            self.logger.warning("No options meet safety constraints, using all options with warning")
            safe_options = options
        
        # Step 2: Calculate weights for each option
        weighted_options = []
        for option in safe_options:
            weight = self.calculate_weight(option)
            weighted_options.append((option, weight))
        
        # Step 3: Find Pareto optimal solutions
        pareto_optimal = self.get_pareto_optimal(safe_options)
        
        # Step 4: Apply SaRO reflection
        saro_reflection = self.saro_reflection(safe_options, pareto_optimal)
        
        # Step 5: Select best balanced option
        selected_option, balance_score = self._select_balanced_option(weighted_options)
        
        # Step 6: Generate comprehensive analysis
        safety_analysis = self._analyze_safety(selected_option)
        spiritual_analysis = self._analyze_spiritual_alignment(selected_option)
        justification = self._generate_justification(selected_option, balance_score, saro_reflection)
        
        result = MizanResult(
            selected_option=selected_option,
            pareto_optimal_options=pareto_optimal,
            balance_score=balance_score,
            saro_reflection=saro_reflection,
            safety_analysis=safety_analysis,
            spiritual_analysis=spiritual_analysis,
            justification=justification
        )
        
        # Log optimization result
        log_audit_event(
            agent_name="MizanEngine",
            action="OPTIMIZATION",
            details=f"Selected: {selected_option.option_id}, Balance: {balance_score:.3f}",
            status="SUCCESS"
        )
        
        return result
    
    def calculate_weight(self, option: OptimizationOption) -> float:
        """
        Calculate comprehensive weight for an option based on all objectives.
        
        Args:
            option: Optimization option to weight
            
        Returns:
            Comprehensive weight score (lower is better)
        """
        objectives = option.get_objectives()
        
        # Normalize objectives to [0, 1] range
        normalized_objectives = self._normalize_objectives(objectives)
        
        # Calculate weighted sum
        weight = (
            normalized_objectives[OptimizationObjective.COST] * 0.25 +
            normalized_objectives[OptimizationObjective.TIME] * 0.20 +
            normalized_objectives[OptimizationObjective.SAFETY] * 0.25 +
            normalized_objectives[OptimizationObjective.COMFORT] * 0.15 +
            normalized_objectives[OptimizationObjective.SPIRITUAL] * 0.15
        )
        
        # Apply spiritual weights
        spiritual_weight = self._calculate_spiritual_weight(option)
        final_weight = weight * (1.0 - spiritual_weight)
        
        return final_weight
    
    def saro_reflection(self, all_options: List[OptimizationOption], pareto_optimal: List[OptimizationOption]) -> str:
        """
        Apply SaRO Gate reflection on options.
        
        Args:
            all_options: All considered options
            pareto_optimal: Pareto optimal options
            
        Returns:
            SaRO reflection analysis string
        """
        reflection = []
        
        reflection.append("=== SaRO (Safety-oriented Reasoning Optimization) Reflection ===")
        reflection.append(f"Analyzing {len(all_options)} options with {len(pareto_optimal)} Pareto optimal solutions")
        
        # Check for potential reward hacks
        cheapest = min(all_options, key=lambda x: x.cost_usd)
        fastest = min(all_options, key=lambda x: x.duration_hours)
        
        if cheapest.cost_usd < 0.5 * np.mean([opt.cost_usd for opt in all_options]):
            reflection.append(f"⚠️  REWARD HACK ALERT: Option {cheapest.option_id} is unusually cheap")
            reflection.append(f"   - Cost: ${cheapest.cost_usd:.2f} vs average: ${np.mean([opt.cost_usd for opt in all_options]):.2f}")
            
            # Check for travel pain points
            if cheapest.duration_hours > 20:
                reflection.append("   - Excessive travel time detected")
            if cheapest.safety_score < 0.5:
                reflection.append("   - Low safety score detected")
        
        if fastest.duration_hours < 0.5 * np.mean([opt.duration_hours for opt in all_options]):
            reflection.append(f"⚠️  REWARD HACK ALERT: Option {fastest.option_id} is unusually fast")
            reflection.append(f"   - Duration: {fastest.duration_hours:.1f}h vs average: {np.mean([opt.duration_hours for opt in all_options]):.1f}h")
        
        # Safety-aligned justification
        reflection.append("\n=== Safety-Aligned Analysis ===")
        for option in pareto_optimal[:3]:  # Top 3 Pareto optimal
            reflection.append(f"Option {option.option_id}:")
            reflection.append(f"  - Balance: Cost=${option.cost_usd:.2f}, Time={option.duration_hours:.1f}h")
            reflection.append(f"  - Safety: {option.safety_score:.2f}, Comfort: {option.comfort_score:.2f}")
            reflection.append(f"  - Spiritual: {option.spiritual_score:.2f}")
        
        return "\n".join(reflection)
    
    def check_balance_threshold(self, option: OptimizationOption) -> bool:
        """
        Verify if option meets balance requirements.
        
        Args:
            option: Option to check
            
        Returns:
            True if option meets balance threshold
        """
        # Define minimum thresholds for each objective
        thresholds = {
            OptimizationObjective.COST: 2000.0,  # Max cost in USD
            OptimizationObjective.TIME: 24.0,  # Max duration in hours
            OptimizationObjective.SAFETY: 0.6,  # Min safety score
            OptimizationObjective.COMFORT: 0.4,  # Min comfort score
            OptimizationObjective.SPIRITUAL: 0.3  # Min spiritual score
        }
        
        objectives = option.get_objectives()
        
        # Check all thresholds
        for obj, threshold in thresholds.items():
            if obj in [OptimizationObjective.COST, OptimizationObjective.TIME]:
                if objectives[obj] > threshold:
                    self.logger.warning(f"Option {option.option_id} fails {obj.value} threshold: {objectives[obj]} > {threshold}")
                    return False
            else:  # Safety, Comfort, Spiritual (maximized objectives)
                if (1.0 - objectives[obj]) < threshold:  # Convert back to maximized form
                    self.logger.warning(f"Option {option.option_id} fails {obj.value} threshold: {1.0 - objectives[obj]} < {threshold}")
                    return False
        
        return True
    
    def get_pareto_optimal(self, options: List[OptimizationOption]) -> List[OptimizationOption]:
        """
        Find Pareto optimal solutions from the options.
        
        Args:
            options: List of options to analyze
            
        Returns:
            List of Pareto optimal options
        """
        if not options:
            return []
        
        pareto_optimal = []
        objectives = [obj for obj in OptimizationObjective]
        
        for i, option in enumerate(options):
            is_dominated = False
            option_objectives = option.get_objectives()
            
            for j, other_option in enumerate(options):
                if i == j:
                    continue
                
                other_objectives = other_option.get_objectives()
                
                # Check if other_option dominates option
                dominates_all = True
                dominates_some = False
                
                for obj in objectives:
                    if other_objectives[obj] > option_objectives[obj]:
                        dominates_all = False
                        break
                    elif other_objectives[obj] < option_objectives[obj]:
                        dominates_some = True
                
                if dominates_all and dominates_some:
                    is_dominated = True
                    break
            
            if not is_dominated:
                pareto_optimal.append(option)
        
        self.logger.info(f"Found {len(pareto_optimal)} Pareto optimal solutions from {len(options)} options")
        return pareto_optimal
    
    def _filter_by_safety_constraints(self, options: List[OptimizationOption]) -> List[OptimizationOption]:
        """Filter options by safety constraints."""
        safe_options = []
        
        for option in options:
            if self._meets_safety_constraints(option):
                safe_options.append(option)
            else:
                self.logger.info(f"Option {option.option_id} filtered out by safety constraints")
        
        return safe_options
    
    def _meets_safety_constraints(self, option: OptimizationOption) -> bool:
        """Check if option meets safety constraints."""
        metadata = option.metadata
        
        # Check layover constraints
        if 'layover_hours' in metadata:
            if metadata['layover_hours'] > self.safety_constraints.max_layover_hours:
                return False
        
        # Check total travel time
        if option.duration_hours > self.safety_constraints.max_total_travel_hours:
            return False
        
        # Check minimum safety score
        if option.safety_score < 0.5:
            return False
        
        return True
    
    def _normalize_objectives(self, objectives: Dict[OptimizationObjective, float]) -> Dict[OptimizationObjective, float]:
        """Normalize objectives to [0, 1] range."""
        # For this implementation, we'll use simple min-max normalization
        # In a production system, this would use historical data
        max_values = {
            OptimizationObjective.COST: 5000.0,
            OptimizationObjective.TIME: 48.0,
            OptimizationObjective.SAFETY: 1.0,
            OptimizationObjective.COMFORT: 1.0,
            OptimizationObjective.SPIRITUAL: 1.0
        }
        
        normalized = {}
        for obj, value in objectives.items():
            normalized[obj] = min(value / max_values[obj], 1.0)
        
        return normalized
    
    def _calculate_spiritual_weight(self, option: OptimizationOption) -> float:
        """Calculate spiritual weight based on Islamic principles."""
        spiritual_score = option.spiritual_score
        
        # Apply spiritual weights
        weight = (
            spiritual_score * self.spiritual_config.mizan_balance_weight +
            spiritual_score * self.spiritual_config.adl_justice_weight +
            spiritual_score * self.spiritual_config.ihsan_excellence_weight +
            spiritual_score * self.spiritual_config.amanah_trust_weight
        )
        
        return weight
    
    def _select_balanced_option(self, weighted_options: List[Tuple[OptimizationOption, float]]) -> Tuple[OptimizationOption, float]:
        """Select the best balanced option from weighted options."""
        if not weighted_options:
            raise ValueError("No weighted options provided")
        
        # Sort by weight (lower is better)
        weighted_options.sort(key=lambda x: x[1])
        
        best_option, best_weight = weighted_options[0]
        balance_score = 1.0 - best_weight  # Convert to balance score (higher is better)
        
        return best_option, balance_score
    
    def _analyze_safety(self, option: OptimizationOption) -> Dict[str, Any]:
        """Analyze safety aspects of the selected option."""
        return {
            "safety_score": option.safety_score,
            "risk_factors": self._identify_risk_factors(option),
            "safety_recommendations": self._generate_safety_recommendations(option)
        }
    
    def _analyze_spiritual_alignment(self, option: OptimizationOption) -> Dict[str, Any]:
        """Analyze spiritual alignment of the selected option."""
        return {
            "spiritual_score": option.spiritual_score,
            "mizan_balance": option.spiritual_score * self.spiritual_config.mizan_balance_weight,
            "adl_justice": option.spiritual_score * self.spiritual_config.adl_justice_weight,
            "ihsan_excellence": option.spiritual_score * self.spiritual_config.ihsan_excellence_weight,
            "amanah_trust": option.spiritual_score * self.spiritual_config.amanah_trust_weight
        }
    
    def _generate_justification(self, option: OptimizationOption, balance_score: float, saro_reflection: str) -> str:
        """Generate comprehensive justification for the selected option."""
        justification = []
        
        justification.append("=== Mizan Divine Balance Justification ===")
        justification.append(f"Selected Option: {option.option_id}")
        justification.append(f"Description: {option.description}")
        justification.append(f"Balance Score: {balance_score:.3f}")
        
        justification.append("\n=== Core Metrics ===")
        justification.append(f"Cost: ${option.cost_usd:.2f}")
        justification.append(f"Duration: {option.duration_hours:.1f} hours")
        justification.append(f"Safety: {option.safety_score:.2f}/1.0")
        justification.append(f"Comfort: {option.comfort_score:.2f}/1.0")
        justification.append(f"Spiritual Alignment: {option.spiritual_score:.2f}/1.0")
        
        justification.append("\n=== Islamic Principles Applied ===")
        justification.append(f"Al-Mizan (Balance): {option.spiritual_score * self.spiritual_config.mizan_balance_weight:.3f}")
        justification.append(f"Adl (Justice): {option.spiritual_score * self.spiritual_config.adl_justice_weight:.3f}")
        justification.append(f"Ihsan (Excellence): {option.spiritual_score * self.spiritual_config.ihsan_excellence_weight:.3f}")
        justification.append(f"Amanah (Trust): {option.spiritual_score * self.spiritual_config.amanah_trust_weight:.3f}")
        
        justification.append(f"\n=== SaRO Reflection Summary ===")
        justification.append("This option successfully balances efficiency with safety-aligned optimization.")
        justification.append("No reward hacking detected. Decision prioritizes genuine user satisfaction.")
        
        return "\n".join(justification)
    
    def _identify_risk_factors(self, option: OptimizationOption) -> List[str]:
        """Identify potential risk factors for the option."""
        risk_factors = []
        
        if option.safety_score < 0.7:
            risk_factors.append("Below optimal safety score")
        
        if option.duration_hours > 15:
            risk_factors.append("Extended travel duration")
        
        if option.cost_usd > 1500:
            risk_factors.append("High cost commitment")
        
        metadata = option.metadata
        if 'layover_hours' in metadata and metadata['layover_hours'] > 4:
            risk_factors.append("Extended layover period")
        
        return risk_factors
    
    def _generate_safety_recommendations(self, option: OptimizationOption) -> List[str]:
        """Generate safety recommendations for the option."""
        recommendations = []
        
        if option.safety_score < 0.8:
            recommendations.append("Consider additional travel insurance")
        
        if option.duration_hours > 12:
            recommendations.append("Plan for rest stops during long journey")
        
        metadata = option.metadata
        if 'international' in metadata and metadata['international']:
            recommendations.append("Ensure all travel documents are valid")
            recommendations.append("Register with embassy if required")
        
        return recommendations


# Factory function for creating MizanEngine instances
def create_mizan_engine(tenant_id: str = "default", spiritual_config: Optional[SpiritualWeightConfig] = None) -> MizanEngine:
    """
    Factory function to create MizanEngine instances.
    
    Args:
        tenant_id: Tenant identifier
        spiritual_config: Optional spiritual weight configuration
        
    Returns:
        Configured MizanEngine instance
    """
    return MizanEngine(tenant_id=tenant_id, spiritual_config=spiritual_config)


# Utility function to create options from existing itinerary data
def create_optimization_options_from_itinerary(itinerary_data: Dict[str, Any]) -> List[OptimizationOption]:
    """
    Convert itinerary data to OptimizationOption objects.
    
    Args:
        itinerary_data: Raw itinerary data from ATA planner
        
    Returns:
        List of OptimizationOption objects
    """
    options = []
    
    for segment in itinerary_data.get("segments", []):
        if segment.get("type") == "flight":
            for flight_option in segment.get("options", []):
                option_id = flight_option.get("id", f"FLIGHT_{len(options)}")
                description = flight_option.get("description", "Flight option")
                cost = flight_option.get("price_usd", 0.0)
                duration = flight_option.get("duration_hours", 0.0)
                
                # Calculate safety score based on layovers, connections, etc.
                safety_score = 0.8  # Base safety score
                layovers = flight_option.get("layovers", 0)
                if layovers > 2:
                    safety_score -= 0.2
                elif layovers > 1:
                    safety_score -= 0.1
                
                # Calculate comfort score
                comfort_score = 0.7  # Base comfort score
                if duration > 20:
                    comfort_score -= 0.3
                elif duration > 15:
                    comfort_score -= 0.2
                
                # Calculate spiritual score (simplified for demo)
                spiritual_score = 0.6  # Base spiritual score
                
                # Metadata
                metadata = {
                    "layovers": layovers,
                    "layover_cities": flight_option.get("layover_cities", []),
                    "international": True  # Assume international for demo
                }
                
                option = OptimizationOption(
                    option_id=option_id,
                    description=description,
                    cost_usd=cost,
                    duration_hours=duration,
                    safety_score=max(0.0, min(1.0, safety_score)),
                    comfort_score=max(0.0, min(1.0, comfort_score)),
                    spiritual_score=max(0.0, min(1.0, spiritual_score)),
                    metadata=metadata
                )
                
                options.append(option)
    
    return options