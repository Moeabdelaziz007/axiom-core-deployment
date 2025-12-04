"""
Aql Meta-Controller - Research-Driven Decision Making Engine
Part of Digital Soul Protocol Architecture

This enhanced meta-controller integrates Google Deep Research capabilities with existing
AI Engine, Mizan Engine, and agent systems to provide superior decision-making
through research-driven insights while maintaining ethical frameworks.

Core Capabilities:
1. Research-Driven Decision Making
2. Enhanced Knowledge Integration
3. Advanced Meta-Learning for Research
4. Research Quality Assurance
5. Integration with Existing Systems
6. Performance Optimization for Research
"""

import os
import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import uuid
import numpy as np
from pathlib import Path

# Import existing systems
import sys
sys.path.append(str(Path(__file__).parent.parent))
from core.mizan_engine import MizanEngine, create_mizan_engine, SpiritualWeightConfig
from memory.embedding import EmbeddingGenerator
from memory.vector_db import VectorDB
from utils.logger import get_logger, log_audit_event

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Research and Decision Types
class ResearchQueryType(Enum):
    GENERAL = "GENERAL"
    MARKET_ANALYSIS = "MARKET_ANALYSIS"
    COMPETITIVE_INTELLIGENCE = "COMPETITIVE_INTELLIGENCE"
    TREND_ANALYSIS = "TREND_ANALYSIS"
    FACT_CHECKING = "FACT_CHECKING"
    ETHICAL_EVALUATION = "ETHICAL_EVALUATION"
    PERFORMANCE_OPTIMIZATION = "PERFORMANCE_OPTIMIZATION"

class DecisionImpact(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ResearchConfidence(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"

class MetaLearningStrategy(Enum):
    TRANSFER_LEARNING = "TRANSFER_LEARNING"
    FINE_TUNING = "FINE_TUNING"
    FEW_SHOT_LEARNING = "FEW_SHOT_LEARNING"
    REINFORCEMENT_LEARNING = "REINFORCEMENT_LEARNING"
    ENSEMBLE_LEARNING = "ENSEMBLE_LEARNING"

@dataclass
class ResearchQuery:
    """Represents a research query with metadata."""
    query_id: str
    tenant_id: str
    agent_id: str
    query_text: str
    query_type: ResearchQueryType
    parameters: Dict[str, Any] = field(default_factory=dict)
    priority: int = 5  # 1-10 scale
    max_results: int = 50
    estimated_duration_minutes: Optional[int] = None
    created_by: str = "aql_meta_controller"
    created_at: datetime = field(default_factory=datetime.now)
    context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ResearchResult:
    """Represents a research result with quality assessment."""
    result_id: str
    query_id: str
    source: str
    source_url: Optional[str]
    title: str
    content: str
    summary: Optional[str]
    confidence: ResearchConfidence
    relevance_score: float  # 0.0-1.0
    quality_score: float  # 0.0-1.0
    credibility_score: float  # 0.0-1.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    raw_data: Optional[Dict[str, Any]] = None
    processing_time_ms: Optional[int] = None
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class ResearchSynthesis:
    """Represents synthesized research outcomes."""
    synthesis_id: str
    query_id: str
    synthesis_type: str
    title: str
    content: str
    key_insights: List[str]
    recommendations: List[str]
    confidence: ResearchConfidence
    supporting_result_ids: List[str]
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class ResearchDrivenDecision:
    """Represents a decision backed by research evidence."""
    decision_id: str
    tenant_id: str
    agent_id: str
    query_id: str
    decision_title: str
    decision_description: str
    research_evidence: Dict[str, Any]
    impact_level: DecisionImpact
    confidence_score: float  # 0.0-1.0
    mizan_analysis: Optional[Dict[str, Any]] = None
    outcome_status: str = "PENDING"
    implementation_details: Dict[str, Any] = field(default_factory=dict)
    created_by: str = "aql_meta_controller"
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class MetaLearningConfig:
    """Configuration for meta-learning strategies."""
    strategy: MetaLearningStrategy
    hyperparameters: Dict[str, Any] = field(default_factory=dict)
    adaptation_rate: float = 0.1
    performance_threshold: float = 0.8
    update_frequency_minutes: int = 60
    transfer_domains: List[str] = field(default_factory=list)

@dataclass
class ResearchQualityConfig:
    """Configuration for research quality assessment."""
    min_confidence_threshold: float = 0.6
    min_relevance_threshold: float = 0.5
    min_credibility_threshold: float = 0.7
    source_reputation_weights: Dict[str, float] = field(default_factory=dict)
    bias_detection_threshold: float = 0.3
    ethics_compliance_required: bool = True

class AqlMetaController:
    """
    Enhanced Aql Meta-Controller with Research-Driven Capabilities
    
    This controller integrates Google Deep Research with existing systems to provide
    superior decision-making through research-driven insights while maintaining
    the Digital Soul Protocol's ethical framework.
    """
    
    def __init__(
        self,
        tenant_id: str = "default",
        google_api_key: Optional[str] = None,
        pinecone_api_key: Optional[str] = None,
        mizan_config: Optional[SpiritualWeightConfig] = None,
        research_quality_config: Optional[ResearchQualityConfig] = None,
        meta_learning_config: Optional[MetaLearningConfig] = None
    ):
        """
        Initialize Aql Meta-Controller.
        
        Args:
            tenant_id: Tenant identifier for multi-tenant architecture
            google_api_key: Google API key for research integration
            pinecone_api_key: Pinecone API key for vector storage
            mizan_config: Spiritual weight configuration
            research_quality_config: Research quality assessment configuration
            meta_learning_config: Meta-learning strategy configuration
        """
        self.tenant_id = tenant_id
        self.logger = get_logger(f"AqlMetaController-{tenant_id}")
        
        # Initialize configuration
        self.google_api_key = google_api_key or os.environ.get("GOOGLE_API_KEY")
        self.pinecone_api_key = pinecone_api_key or os.environ.get("PINECONE_API_KEY")
        self.mizan_config = mizan_config or SpiritualWeightConfig().normalize()
        self.research_quality_config = research_quality_config or ResearchQualityConfig()
        self.meta_learning_config = meta_learning_config or MetaLearningConfig(
            strategy=MetaLearningStrategy.TRANSFER_LEARNING
        )
        
        # Initialize core components
        self._init_components()
        
        # Initialize research cache and performance tracking
        self.research_cache = {}
        self.performance_metrics = {
            "queries_processed": 0,
            "avg_processing_time_ms": 0,
            "cache_hit_rate": 0.0,
            "quality_score_avg": 0.0,
            "decision_accuracy": 0.0
        }
        
        # Log initialization
        log_audit_event(
            agent_name="AqlMetaController",
            action="INITIALIZATION",
            details=f"Tenant: {tenant_id}, Strategy: {self.meta_learning_config.strategy.value}",
            status="SUCCESS"
        )
        
        self.logger.info(f"AqlMetaController initialized for tenant {tenant_id}")
        self.logger.info(f"Meta-learning strategy: {self.meta_learning_config.strategy.value}")
    
    def _init_components(self):
        """Initialize core components and integrations."""
        try:
            # Initialize Mizan Engine for ethical optimization
            self.mizan_engine = create_mizan_engine(
                tenant_id=self.tenant_id,
                spiritual_config=self.mizan_config
            )
            
            # Initialize embedding generator for knowledge integration
            self.embedding_generator = EmbeddingGenerator(api_key=self.google_api_key)
            
            # Initialize vector database for research storage
            self.vector_db = VectorDB(api_key=self.pinecone_api_key)
            
            # Initialize Google Deep Research client
            self._init_google_research_client()
            
            # Initialize meta-learning components
            self._init_meta_learning()
            
            self.logger.info("All core components initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize components: {str(e)}")
            raise
    
    def _init_google_research_client(self):
        """Initialize Google Deep Research client."""
        # This would integrate with Google's Deep Research API
        # For now, we'll use the existing AI Engine as a foundation
        try:
            from src.lib.ai_engine import AIEngine
            self.ai_engine = AIEngine()
            self.logger.info("Google Deep Research client initialized")
        except ImportError:
            # Fallback for when running in Python environment
            self.logger.warning("AI Engine not available, using fallback research client")
            self.ai_engine = None
    
    def _init_meta_learning(self):
        """Initialize meta-learning components."""
        self.meta_learning_state = {
            "learning_history": [],
            "performance_history": [],
            "adaptation_count": 0,
            "last_adaptation": datetime.now(),
            "knowledge_transfer_success": 0.0
        }
        
        # Initialize hyperparameter optimization
        self.hyperparameters = {
            "research_weight": 0.7,
            "ethical_weight": 0.2,
            "performance_weight": 0.1,
            "learning_rate": self.meta_learning_config.adaptation_rate,
            "confidence_threshold": self.research_quality_config.min_confidence_threshold
        }
    
    async def process_research_query(
        self,
        query_text: str,
        query_type: ResearchQueryType = ResearchQueryType.GENERAL,
        agent_id: str = "default_agent",
        parameters: Optional[Dict[str, Any]] = None,
        priority: int = 5
    ) -> Dict[str, Any]:
        """
        Process a research query with full pipeline.
        
        Args:
            query_text: The research query text
            query_type: Type of research query
            agent_id: ID of the requesting agent
            parameters: Additional query parameters
            priority: Query priority (1-10 scale)
            
        Returns:
            Dictionary containing research results and analysis
        """
        start_time = datetime.now()
        
        try:
            # Create research query
            query = ResearchQuery(
                query_id=str(uuid.uuid4()),
                tenant_id=self.tenant_id,
                agent_id=agent_id,
                query_text=query_text,
                query_type=query_type,
                parameters=parameters or {},
                priority=priority
            )
            
            self.logger.info(f"Processing research query: {query.query_id}")
            
            # Step 1: Check cache first
            cache_key = self._generate_cache_key(query)
            if cache_key in self.research_cache:
                cached_result = self.research_cache[cache_key]
                if cached_result["expires_at"] > datetime.now():
                    self.performance_metrics["cache_hit_rate"] += 0.01
                    return cached_result["result"]
            
            # Step 2: Execute research
            research_results = await self._execute_research(query)
            
            # Step 3: Quality assessment and validation
            validated_results = await self._assess_research_quality(research_results)
            
            # Step 4: Knowledge synthesis
            synthesis = await self._synthesize_research(query, validated_results)
            
            # Step 5: Generate research-driven decision
            decision = await self._generate_research_driven_decision(query, synthesis)
            
            # Step 6: Apply Mizan ethical optimization
            if decision:
                decision = await self._apply_mizan_optimization(decision)
            
            # Step 7: Update meta-learning
            await self._update_meta_learning(query, synthesis, decision)
            
            # Step 8: Cache results
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            self._cache_results(cache_key, {
                "query": query,
                "results": validated_results,
                "synthesis": synthesis,
                "decision": decision
            }, processing_time)
            
            # Update performance metrics
            self._update_performance_metrics(processing_time, validated_results)
            
            # Log completion
            log_audit_event(
                agent_name="AqlMetaController",
                action="RESEARCH_QUERY_PROCESSED",
                details=f"Query: {query.query_id}, Results: {len(validated_results)}",
                status="SUCCESS"
            )
            
            return {
                "query_id": query.query_id,
                "results": validated_results,
                "synthesis": synthesis,
                "decision": decision,
                "processing_time_ms": processing_time,
                "cache_hit": False
            }
            
        except Exception as e:
            self.logger.error(f"Failed to process research query: {str(e)}")
            log_audit_event(
                agent_name="AqlMetaController",
                action="RESEARCH_QUERY_FAILED",
                details=f"Error: {str(e)}",
                status="ERROR"
            )
            raise
    
    async def _execute_research(self, query: ResearchQuery) -> List[ResearchResult]:
        """Execute research using Google Deep Research and other sources."""
        results = []
        
        try:
            # Use Google Deep Research if available
            if self.ai_engine:
                google_result = await self._research_with_google(query)
                if google_result:
                    results.append(google_result)
            
            # Add other research sources based on query type
            additional_results = await self._research_additional_sources(query)
            results.extend(additional_results)
            
            # Store results in vector database for future retrieval
            await self._store_research_results(query, results)
            
        except Exception as e:
            self.logger.error(f"Research execution failed: {str(e)}")
            # Return fallback results
            results = self._generate_fallback_results(query)
        
        return results
    
    async def _research_with_google(self, query: ResearchQuery) -> Optional[ResearchResult]:
        """Research using Google Deep Research integration."""
        try:
            # Use the existing AI Engine for Google research
            if hasattr(self.ai_engine, 'researchWithGoogle'):
                google_result = await self.ai_engine.researchWithGoogle(
                    query.query_text,
                    language="en"
                )
                
                if google_result.get("success"):
                    return ResearchResult(
                        result_id=str(uuid.uuid4()),
                        query_id=query.query_id,
                        source="google_deep_research",
                        source_url=None,
                        title=f"Google Research: {query.query_text[:50]}...",
                        content=google_result["data"],
                        summary=None,
                        confidence=ResearchConfidence.HIGH,
                        relevance_score=0.9,
                        quality_score=0.85,
                        credibility_score=0.9,
                        metadata={"source": "google_gemini", "model": "gemini-2.0-flash-exp"},
                        raw_data=google_result
                    )
            
        except Exception as e:
            self.logger.error(f"Google research failed: {str(e)}")
        
        return None
    
    async def _research_additional_sources(self, query: ResearchQuery) -> List[ResearchResult]:
        """Research using additional sources based on query type."""
        results = []
        
        # Implement additional research sources based on query type
        if query.query_type == ResearchQueryType.MARKET_ANALYSIS:
            results.extend(await self._research_market_data(query))
        elif query.query_type == ResearchQueryType.COMPETITIVE_INTELLIGENCE:
            results.extend(await self._research_competitive_data(query))
        elif query.query_type == ResearchQueryType.TREND_ANALYSIS:
            results.extend(await self._research_trend_data(query))
        elif query.query_type == ResearchQueryType.FACT_CHECKING:
            results.extend(await self._research_fact_checking(query))
        
        return results
    
    async def _research_market_data(self, query: ResearchQuery) -> List[ResearchResult]:
        """Research market data and trends."""
        # Placeholder implementation for market research
        # This would integrate with market data APIs
        return []
    
    async def _research_competitive_data(self, query: ResearchQuery) -> List[ResearchResult]:
        """Research competitive intelligence data."""
        # Placeholder implementation for competitive research
        # This would integrate with competitive intelligence tools
        return []
    
    async def _research_trend_data(self, query: ResearchQuery) -> List[ResearchResult]:
        """Research trend analysis data."""
        # Placeholder implementation for trend research
        # This would integrate with trend analysis APIs
        return []
    
    async def _research_fact_checking(self, query: ResearchQuery) -> List[ResearchResult]:
        """Research fact-checking data."""
        # Placeholder implementation for fact-checking
        # This would integrate with fact-checking APIs
        return []
    
    async def _assess_research_quality(self, results: List[ResearchResult]) -> List[ResearchResult]:
        """Assess and filter research results based on quality criteria."""
        validated_results = []
        
        for result in results:
            # Apply quality assessment
            quality_score = await self._calculate_quality_score(result)
            result.quality_score = quality_score
            
            # Apply credibility assessment
            credibility_score = await self._calculate_credibility_score(result)
            result.credibility_score = credibility_score
            
            # Filter based on thresholds
            if (quality_score >= self.research_quality_config.min_relevance_threshold and
                credibility_score >= self.research_quality_config.min_credibility_threshold):
                validated_results.append(result)
        
        # Sort by quality score
        validated_results.sort(key=lambda x: x.quality_score, reverse=True)
        
        return validated_results
    
    async def _calculate_quality_score(self, result: ResearchResult) -> float:
        """Calculate quality score for a research result."""
        # Factors: relevance, confidence, source credibility, recency
        base_score = (result.relevance_score * 0.4 + 
                     float(result.confidence.value) / 4 * 0.3 +  # Convert enum to 0-1 scale
                     result.credibility_score * 0.3)
        
        # Apply bias detection
        bias_penalty = await self._detect_bias(result)
        final_score = base_score * (1.0 - bias_penalty)
        
        return min(1.0, max(0.0, final_score))
    
    async def _calculate_credibility_score(self, result: ResearchResult) -> float:
        """Calculate credibility score based on source reputation."""
        # Base credibility from source
        source_weights = self.research_quality_config.source_reputation_weights
        base_credibility = source_weights.get(result.source, 0.5)
        
        # Adjust based on content quality indicators
        content_indicators = await self._analyze_content_indicators(result)
        credibility_adjustment = content_indicators * 0.2
        
        return min(1.0, base_credibility + credibility_adjustment)
    
    async def _detect_bias(self, result: ResearchResult) -> float:
        """Detect and quantify bias in research results."""
        # Placeholder implementation for bias detection
        # This would use NLP techniques to detect various types of bias
        return 0.1  # Default low bias penalty
    
    async def _analyze_content_indicators(self, result: ResearchResult) -> float:
        """Analyze content quality indicators."""
        # Placeholder implementation for content analysis
        # This would analyze factors like completeness, structure, citations
        return 0.2  # Default positive adjustment
    
    async def _synthesize_research(
        self,
        query: ResearchQuery,
        results: List[ResearchResult]
    ) -> Optional[ResearchSynthesis]:
        """Synthesize research results into coherent insights."""
        if not results:
            return None
        
        try:
            # Extract key insights from results
            insights = await self._extract_key_insights(results)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(query, results)
            
            # Create synthesis
            synthesis = ResearchSynthesis(
                synthesis_id=str(uuid.uuid4()),
                query_id=query.query_id,
                synthesis_type="comprehensive_analysis",
                title=f"Research Synthesis: {query.query_text[:50]}...",
                content=await self._generate_synthesis_content(query, results),
                key_insights=insights,
                recommendations=recommendations,
                confidence=self._calculate_synthesis_confidence(results),
                supporting_result_ids=[r.result_id for r in results]
            )
            
            return synthesis
            
        except Exception as e:
            self.logger.error(f"Research synthesis failed: {str(e)}")
            return None
    
    async def _extract_key_insights(self, results: List[ResearchResult]) -> List[str]:
        """Extract key insights from research results."""
        # Placeholder implementation for insight extraction
        # This would use NLP to identify key themes and insights
        return ["Key insight 1", "Key insight 2", "Key insight 3"]
    
    async def _generate_recommendations(
        self,
        query: ResearchQuery,
        results: List[ResearchResult]
    ) -> List[str]:
        """Generate recommendations based on research results."""
        # Placeholder implementation for recommendation generation
        # This would analyze results to generate actionable recommendations
        return ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
    
    async def _generate_synthesis_content(
        self,
        query: ResearchQuery,
        results: List[ResearchResult]
    ) -> str:
        """Generate synthesis content combining all research results."""
        # Placeholder implementation for content generation
        # This would use LLM to generate comprehensive synthesis
        return f"Synthesized research results for query: {query.query_text}"
    
    def _calculate_synthesis_confidence(self, results: List[ResearchResult]) -> ResearchConfidence:
        """Calculate overall confidence for synthesis."""
        if not results:
            return ResearchConfidence.LOW
        
        avg_confidence = np.mean([float(r.confidence.value) for r in results])
        
        if avg_confidence >= 3.5:
            return ResearchConfidence.VERY_HIGH
        elif avg_confidence >= 2.5:
            return ResearchConfidence.HIGH
        elif avg_confidence >= 1.5:
            return ResearchConfidence.MEDIUM
        else:
            return ResearchConfidence.LOW
    
    async def _generate_research_driven_decision(
        self,
        query: ResearchQuery,
        synthesis: Optional[ResearchSynthesis]
    ) -> Optional[ResearchDrivenDecision]:
        """Generate a decision backed by research evidence."""
        if not synthesis:
            return None
        
        try:
            # Analyze impact level based on query type and synthesis
            impact_level = self._determine_impact_level(query, synthesis)
            
            # Calculate confidence score
            confidence_score = self._calculate_decision_confidence(synthesis)
            
            # Generate decision
            decision = ResearchDrivenDecision(
                decision_id=str(uuid.uuid4()),
                tenant_id=self.tenant_id,
                agent_id=query.agent_id,
                query_id=query.query_id,
                decision_title=f"Research-Driven Decision: {query.query_text[:50]}...",
                decision_description=await self._generate_decision_description(query, synthesis),
                research_evidence={
                    "synthesis_id": synthesis.synthesis_id,
                    "key_insights": synthesis.key_insights,
                    "recommendations": synthesis.recommendations,
                    "confidence": synthesis.confidence.value
                },
                impact_level=impact_level,
                confidence_score=confidence_score
            )
            
            return decision
            
        except Exception as e:
            self.logger.error(f"Decision generation failed: {str(e)}")
            return None
    
    def _determine_impact_level(
        self,
        query: ResearchQuery,
        synthesis: ResearchSynthesis
    ) -> DecisionImpact:
        """Determine the impact level of the decision."""
        # Analyze query parameters and synthesis to determine impact
        if query.query_type in [ResearchQueryType.ETHICAL_EVALUATION, ResearchQueryType.SAFETY_CRITICAL]:
            return DecisionImpact.CRITICAL
        elif query.priority >= 8:
            return DecisionImpact.HIGH
        elif query.priority >= 5:
            return DecisionImpact.MEDIUM
        else:
            return DecisionImpact.LOW
    
    def _calculate_decision_confidence(self, synthesis: ResearchSynthesis) -> float:
        """Calculate confidence score for the decision."""
        # Base confidence from synthesis
        base_confidence = float(synthesis.confidence.value) / 4.0
        
        # Adjust based on number of supporting insights
        insight_factor = min(1.0, len(synthesis.key_insights) / 5.0)
        
        # Adjust based on quality of recommendations
        recommendation_factor = min(1.0, len(synthesis.recommendations) / 3.0)
        
        return min(1.0, base_confidence * 0.6 + insight_factor * 0.2 + recommendation_factor * 0.2)
    
    async def _generate_decision_description(
        self,
        query: ResearchQuery,
        synthesis: ResearchSynthesis
    ) -> str:
        """Generate detailed decision description."""
        # Placeholder implementation for decision description generation
        # This would use LLM to generate comprehensive decision rationale
        return f"Decision based on research synthesis for query: {query.query_text}"
    
    async def _apply_mizan_optimization(
        self,
        decision: ResearchDrivenDecision
    ) -> ResearchDrivenDecision:
        """Apply Mizan ethical optimization to the decision."""
        try:
            # Create optimization options for Mizan analysis
            options = self._create_mizan_options(decision)
            
            # Apply Mizan optimization
            mizan_result = self.mizan_engine.apply_mizan(options)
            
            # Update decision with Mizan analysis
            decision.mizan_analysis = {
                "balance_score": mizan_result.balance_score,
                "saro_reflection": mizan_result.saro_reflection,
                "safety_analysis": mizan_result.safety_analysis,
                "spiritual_analysis": mizan_result.spiritual_analysis,
                "justification": mizan_result.justification
            }
            
            # Adjust confidence based on Mizan analysis
            mizan_adjustment = mizan_result.balance_score * 0.1
            decision.confidence_score = min(1.0, decision.confidence_score + mizan_adjustment)
            
            return decision
            
        except Exception as e:
            self.logger.error(f"Mizan optimization failed: {str(e)}")
            return decision
    
    def _create_mizan_options(self, decision: ResearchDrivenDecision) -> List:
        """Create options for Mizan analysis."""
        # This would create different decision options for Mizan to analyze
        # For now, return a single option representing the research-driven decision
        from core.mizan_engine import OptimizationOption
        
        return [OptimizationOption(
            option_id=decision.decision_id,
            description=decision.decision_description,
            cost_usd=0.0,  # Research decisions typically don't have direct costs
            duration_hours=0.0,
            safety_score=0.8,  # Research-backed decisions are generally safe
            comfort_score=0.7,
            spiritual_score=0.8,
            metadata={"research_confidence": decision.confidence_score}
        )]
    
    async def _update_meta_learning(
        self,
        query: ResearchQuery,
        synthesis: Optional[ResearchSynthesis],
        decision: Optional[ResearchDrivenDecision]
    ):
        """Update meta-learning state based on research outcomes."""
        try:
            # Record learning event
            learning_event = {
                "timestamp": datetime.now(),
                "query_type": query.query_type.value,
                "synthesis_quality": synthesis.confidence.value if synthesis else "LOW",
                "decision_confidence": decision.confidence_score if decision else 0.0,
                "processing_success": synthesis is not None and decision is not None
            }
            
            self.meta_learning_state["learning_history"].append(learning_event)
            
            # Update hyperparameters based on performance
            if len(self.meta_learning_state["learning_history"]) >= 10:
                await self._adapt_hyperparameters()
            
            # Check for transfer learning opportunities
            await self._identify_transfer_opportunities(query, synthesis)
            
        except Exception as e:
            self.logger.error(f"Meta-learning update failed: {str(e)}")
    
    async def _adapt_hyperparameters(self):
        """Adapt hyperparameters based on learning history."""
        try:
            recent_events = self.meta_learning_state["learning_history"][-10:]
            
            # Calculate success rate
            success_rate = sum(1 for e in recent_events if e["processing_success"]) / len(recent_events)
            
            # Adapt learning rate based on success
            if success_rate > 0.8:
                self.hyperparameters["learning_rate"] *= 1.1  # Increase if doing well
            elif success_rate < 0.6:
                self.hyperparameters["learning_rate"] *= 0.9  # Decrease if struggling
            
            # Update adaptation count
            self.meta_learning_state["adaptation_count"] += 1
            self.meta_learning_state["last_adaptation"] = datetime.now()
            
            self.logger.info(f"Hyperparameters adapted. Success rate: {success_rate:.2f}")
            
        except Exception as e:
            self.logger.error(f"Hyperparameter adaptation failed: {str(e)}")
    
    async def _identify_transfer_opportunities(
        self,
        query: ResearchQuery,
        synthesis: Optional[ResearchSynthesis]
    ):
        """Identify opportunities for knowledge transfer."""
        # Placeholder implementation for transfer learning
        # This would identify patterns that can be transferred to other domains
        pass
    
    async def _store_research_results(
        self,
        query: ResearchQuery,
        results: List[ResearchResult]
    ):
        """Store research results in vector database for future retrieval."""
        try:
            for result in results:
                # Generate embedding for the result
                embedding = self.embedding_generator.generate_embedding(result.content)
                
                # Store in vector database
                self.vector_db.upsert_memory(
                    memory_id=result.result_id,
                    vector=embedding,
                    metadata={
                        "query_id": query.query_id,
                        "tenant_id": self.tenant_id,
                        "title": result.title,
                        "content": result.content,
                        "source": result.source,
                        "confidence": result.confidence.value,
                        "quality_score": result.quality_score
                    }
                )
        
        except Exception as e:
            self.logger.error(f"Failed to store research results: {str(e)}")
    
    def _generate_cache_key(self, query: ResearchQuery) -> str:
        """Generate cache key for research query."""
        import hashlib
        key_data = f"{query.query_text}:{query.query_type.value}:{json.dumps(query.parameters, sort_keys=True)}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _cache_results(
        self,
        cache_key: str,
        results: Dict[str, Any],
        processing_time_ms: float
    ):
        """Cache research results for future use."""
        # Set expiration time (1 hour for research results)
        expires_at = datetime.now() + timedelta(hours=1)
        
        self.research_cache[cache_key] = {
            "result": results,
            "expires_at": expires_at,
            "cached_at": datetime.now(),
            "processing_time_ms": processing_time_ms
        }
    
    def _generate_fallback_results(self, query: ResearchQuery) -> List[ResearchResult]:
        """Generate fallback results when research fails."""
        return [ResearchResult(
            result_id=str(uuid.uuid4()),
            query_id=query.query_id,
            source="fallback",
            source_url=None,
            title="Fallback Research Result",
            content=f"Unable to complete research for query: {query.query_text}",
            summary="Research service temporarily unavailable",
            confidence=ResearchConfidence.LOW,
            relevance_score=0.3,
            quality_score=0.2,
            credibility_score=0.3,
            metadata={"fallback": True, "error": "research_failed"}
        )]
    
    def _update_performance_metrics(self, processing_time_ms: float, results: List[ResearchResult]):
        """Update performance tracking metrics."""
        self.performance_metrics["queries_processed"] += 1
        
        # Update average processing time
        total_queries = self.performance_metrics["queries_processed"]
        current_avg = self.performance_metrics["avg_processing_time_ms"]
        new_avg = (current_avg * (total_queries - 1) + processing_time_ms) / total_queries
        self.performance_metrics["avg_processing_time_ms"] = new_avg
        
        # Update quality score average
        if results:
            avg_quality = np.mean([r.quality_score for r in results])
            current_quality_avg = self.performance_metrics["quality_score_avg"]
            new_quality_avg = (current_quality_avg * (total_queries - 1) + avg_quality) / total_queries
            self.performance_metrics["quality_score_avg"] = new_quality_avg
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics."""
        return {
            "tenant_id": self.tenant_id,
            "metrics": self.performance_metrics,
            "meta_learning_state": self.meta_learning_state,
            "hyperparameters": self.hyperparameters,
            "cache_size": len(self.research_cache),
            "timestamp": datetime.now().isoformat()
        }
    
    async def cleanup_expired_cache(self):
        """Clean up expired cache entries."""
        current_time = datetime.now()
        expired_keys = [
            key for key, value in self.research_cache.items()
            if value["expires_at"] < current_time
        ]
        
        for key in expired_keys:
            del self.research_cache[key]
        
        if expired_keys:
            self.logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")


# Factory function for creating AqlMetaController instances
def create_aql_meta_controller(
    tenant_id: str = "default",
    google_api_key: Optional[str] = None,
    pinecone_api_key: Optional[str] = None,
    mizan_config: Optional[SpiritualWeightConfig] = None,
    research_quality_config: Optional[ResearchQualityConfig] = None,
    meta_learning_config: Optional[MetaLearningConfig] = None
) -> AqlMetaController:
    """
    Factory function to create AqlMetaController instances.
    
    Args:
        tenant_id: Tenant identifier
        google_api_key: Google API key for research
        pinecone_api_key: Pinecone API key for vector storage
        mizan_config: Spiritual weight configuration
        research_quality_config: Research quality assessment configuration
        meta_learning_config: Meta-learning strategy configuration
        
    Returns:
        Configured AqlMetaController instance
    """
    return AqlMetaController(
        tenant_id=tenant_id,
        google_api_key=google_api_key,
        pinecone_api_key=pinecone_api_key,
        mizan_config=mizan_config,
        research_quality_config=research_quality_config,
        meta_learning_config=meta_learning_config
    )


# Utility function for creating research queries
def create_research_query(
    query_text: str,
    query_type: ResearchQueryType = ResearchQueryType.GENERAL,
    agent_id: str = "default_agent",
    parameters: Optional[Dict[str, Any]] = None,
    priority: int = 5
) -> ResearchQuery:
    """
    Utility function to create research queries.
    
    Args:
        query_text: The research query text
        query_type: Type of research query
        agent_id: ID of the requesting agent
        parameters: Additional query parameters
        priority: Query priority (1-10 scale)
        
    Returns:
        ResearchQuery object
    """
    return ResearchQuery(
        query_id=str(uuid.uuid4()),
        tenant_id="default",  # Will be overridden by controller
        agent_id=agent_id,
        query_text=query_text,
        query_type=query_type,
        parameters=parameters or {},
        priority=priority
    )


if __name__ == "__main__":
    # Test the Aql Meta-Controller
    async def test_aql_meta_controller():
        print("\n" + "=" * 60)
        print("Testing Aql Meta-Controller")
        print("=" * 60 + "\n")
        
        # Create controller
        controller = create_aql_meta_controller(tenant_id="test-tenant")
        
        # Test research query
        result = await controller.process_research_query(
            query_text="What are the latest trends in AI ethics and governance?",
            query_type=ResearchQueryType.TREND_ANALYSIS,
            agent_id="test_agent",
            priority=7
        )
        
        print(f"✅ Research query processed: {result['query_id']}")
        print(f"📊 Results found: {len(result['results'])}")
        print(f"🧠 Synthesis generated: {result['synthesis'] is not None}")
        print(f"⚖️  Decision created: {result['decision'] is not None}")
        print(f"⏱️  Processing time: {result['processing_time_ms']:.2f}ms")
        
        # Get performance metrics
        metrics = controller.get_performance_metrics()
        print(f"\n📈 Performance Metrics:\n{json.dumps(metrics, indent=2, default=str)}")
        
        print("\n✅ Aql Meta-Controller test completed successfully!")
    
    asyncio.run(test_aql_meta_controller())