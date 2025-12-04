"""
Research Meta-Learning System
Part of Enhanced Aql Meta-Controller

This system implements research-specific hyperparameter optimization,
performance prediction and evaluation models, adaptive learning rate strategies,
and transfer learning from research to other agent capabilities.

Core Capabilities:
1. Research-Specific Hyperparameter Optimization
2. Research Performance Prediction and Evaluation
3. Adaptive Learning Rate Strategies for Research Tasks
4. Transfer Learning from Research to Other Agent Capabilities
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
import pickle
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

# Import existing systems
import sys
sys.path.append(str(Path(__file__).parent.parent))
from core.aql_meta_controller import ResearchQueryType, ResearchConfidence, DecisionImpact
from utils.logger import get_logger, log_audit_event

# Meta-Learning Types
class HyperparameterOptimizationStrategy(Enum):
    BAYESIAN_OPTIMIZATION = "BAYESIAN_OPTIMIZATION"
    GENETIC_ALGORITHM = "GENETIC_ALGORITHM"
    GRID_SEARCH = "GRID_SEARCH"
    RANDOM_SEARCH = "RANDOM_SEARCH"
    GRADIENT_BASED = "GRADIENT_BASED"
    POPULATION_BASED = "POPULATION_BASED"

class LearningRateAdaptationStrategy(Enum):
    FIXED = "FIXED"
    STEP_DECAY = "STEP_DECAY"
    EXPONENTIAL_DECAY = "EXPONENTIAL_DECAY"
    ADAPTIVE = "ADAPTIVE"
    CYCLIC = "CYCLIC"
    COSINE_ANNEALING = "COSINE_ANNEALING"

class TransferLearningStrategy(Enum):
    FINE_TUNING = "FINE_TUNING"
    FEATURE_EXTRACTION = "FEATURE_EXTRACTION"
    DOMAIN_ADAPTATION = "DOMAIN_ADAPTATION"
    MULTI_TASK_LEARNING = "MULTI_TASK_LEARNING"
    META_TRANSFER = "META_TRANSFER"

class PerformanceMetricType(Enum):
    ACCURACY = "ACCURACY"
    PRECISION = "PRECISION"
    RECALL = "RECALL"
    F1_SCORE = "F1_SCORE"
    PROCESSING_TIME = "PROCESSING_TIME"
    QUALITY_SCORE = "QUALITY_SCORE"
    CONFIDENCE_CALIBRATION = "CONFIDENCE_CALIBRATION"

@dataclass
class HyperparameterConfig:
    """Configuration for hyperparameters."""
    param_name: str
    param_type: str  # "continuous", "discrete", "categorical"
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    possible_values: Optional[List[Any]] = None
    current_value: Any = None
    optimization_priority: float = 1.0
    description: str = ""

@dataclass
class LearningRateConfig:
    """Configuration for learning rate adaptation."""
    initial_rate: float = 0.01
    min_rate: float = 0.0001
    max_rate: float = 0.1
    strategy: LearningRateAdaptationStrategy = LearningRateAdaptationStrategy.ADAPTIVE
    decay_rate: float = 0.95
    warmup_steps: int = 100
    total_steps: int = 1000

@dataclass
class PerformancePrediction:
    """Performance prediction for research tasks."""
    prediction_id: str
    query_type: ResearchQueryType
    hyperparameters: Dict[str, Any]
    predicted_performance: Dict[str, float]
    confidence_interval: Tuple[float, float]
    prediction_confidence: float
    model_version: str
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class MetaLearningState:
    """State of meta-learning system."""
    state_id: str
    hyperparameter_history: List[Dict[str, Any]]
    performance_history: List[Dict[str, Any]]
    transfer_learning_history: List[Dict[str, Any]]
    adaptation_history: List[Dict[str, Any]]
    best_hyperparameters: Dict[str, Any]
    best_performance_score: float
    last_optimization: datetime
    optimization_count: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class TransferLearningResult:
    """Result of transfer learning operation."""
    transfer_id: str
    source_domain: str
    target_domain: str
    transfer_strategy: TransferLearningStrategy
    source_performance: float
    target_performance: float
    transfer_efficiency: float
    adaptation_time_ms: int
    success: bool
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)

class ResearchMetaLearning:
    """
    Research Meta-Learning System
    
    This system implements research-specific hyperparameter optimization,
    performance prediction and evaluation models, adaptive learning rate strategies,
    and transfer learning from research to other agent capabilities.
    """
    
    def __init__(
        self,
        tenant_id: str = "default",
        optimization_strategy: HyperparameterOptimizationStrategy = HyperparameterOptimizationStrategy.BAYESIAN_OPTIMIZATION,
        learning_rate_config: Optional[LearningRateConfig] = None,
        model_storage_path: Optional[str] = None
    ):
        """
        Initialize Research Meta-Learning System.
        
        Args:
            tenant_id: Tenant identifier for multi-tenant architecture
            optimization_strategy: Strategy for hyperparameter optimization
            learning_rate_config: Configuration for learning rate adaptation
            model_storage_path: Path to store trained models
        """
        self.tenant_id = tenant_id
        self.logger = get_logger(f"ResearchMetaLearning-{tenant_id}")
        
        # Initialize configuration
        self.optimization_strategy = optimization_strategy
        self.learning_rate_config = learning_rate_config or LearningRateConfig()
        self.model_storage_path = model_storage_path or f"models/meta_learning_{tenant_id}"
        
        # Initialize hyperparameter configurations
        self._init_hyperparameter_configs()
        
        # Initialize meta-learning state
        self.meta_learning_state = MetaLearningState(
            state_id=str(uuid.uuid4()),
            hyperparameter_history=[],
            performance_history=[],
            transfer_learning_history=[],
            adaptation_history=[],
            best_hyperparameters={},
            best_performance_score=0.0,
            last_optimization=datetime.now(),
            optimization_count=0
        )
        
        # Initialize performance models
        self._init_performance_models()
        
        # Initialize transfer learning models
        self._init_transfer_learning_models()
        
        # Create model storage directory
        os.makedirs(self.model_storage_path, exist_ok=True)
        
        # Load existing models if available
        self._load_existing_models()
        
        # Log initialization
        log_audit_event(
            agent_name="ResearchMetaLearning",
            action="INITIALIZATION",
            details=f"Tenant: {tenant_id}, Strategy: {optimization_strategy.value}",
            status="SUCCESS"
        )
        
        self.logger.info(f"ResearchMetaLearning initialized for tenant {tenant_id}")
        self.logger.info(f"Optimization strategy: {optimization_strategy.value}")
    
    def _init_hyperparameter_configs(self):
        """Initialize hyperparameter configurations."""
        self.hyperparameter_configs = {
            "research_weight": HyperparameterConfig(
                param_name="research_weight",
                param_type="continuous",
                min_value=0.1,
                max_value=1.0,
                current_value=0.7,
                optimization_priority=1.0,
                description="Weight given to research results in decision making"
            ),
            "ethical_weight": HyperparameterConfig(
                param_name="ethical_weight",
                param_type="continuous",
                min_value=0.0,
                max_value=0.5,
                current_value=0.2,
                optimization_priority=0.8,
                description="Weight given to ethical considerations"
            ),
            "performance_weight": HyperparameterConfig(
                param_name="performance_weight",
                param_type="continuous",
                min_value=0.0,
                max_value=0.3,
                current_value=0.1,
                optimization_priority=0.6,
                description="Weight given to performance metrics"
            ),
            "confidence_threshold": HyperparameterConfig(
                param_name="confidence_threshold",
                param_type="continuous",
                min_value=0.1,
                max_value=0.9,
                current_value=0.6,
                optimization_priority=0.9,
                description="Minimum confidence threshold for accepting results"
            ),
            "learning_rate": HyperparameterConfig(
                param_name="learning_rate",
                param_type="continuous",
                min_value=0.0001,
                max_value=0.1,
                current_value=self.learning_rate_config.initial_rate,
                optimization_priority=0.7,
                description="Learning rate for model adaptation"
            ),
            "batch_size": HyperparameterConfig(
                param_name="batch_size",
                param_type="discrete",
                min_value=8,
                max_value=128,
                current_value=32,
                optimization_priority=0.5,
                description="Batch size for processing"
            ),
            "max_iterations": HyperparameterConfig(
                param_name="max_iterations",
                param_type="discrete",
                min_value=10,
                max_value=1000,
                current_value=100,
                optimization_priority=0.4,
                description="Maximum iterations for optimization"
            ),
            "exploration_factor": HyperparameterConfig(
                param_name="exploration_factor",
                param_type="continuous",
                min_value=0.0,
                max_value=1.0,
                current_value=0.1,
                optimization_priority=0.6,
                description="Factor for exploration vs exploitation"
            )
        }
    
    def _init_performance_models(self):
        """Initialize performance prediction models."""
        self.performance_models = {
            "accuracy_model": None,
            "quality_model": None,
            "processing_time_model": None,
            "confidence_model": None
        }
        
        # Feature scalers for preprocessing
        self.feature_scalers = {
            "accuracy": StandardScaler(),
            "quality": StandardScaler(),
            "processing_time": StandardScaler(),
            "confidence": StandardScaler()
        }
    
    def _init_transfer_learning_models(self):
        """Initialize transfer learning models."""
        self.transfer_learning_models = {
            "domain_similarity_model": None,
            "transfer_efficiency_model": None,
            "adaptation_time_model": None
        }
    
    def _load_existing_models(self):
        """Load existing trained models if available."""
        try:
            # Load performance models
            for model_name in self.performance_models:
                model_path = f"{self.model_storage_path}/{model_name}.pkl"
                if os.path.exists(model_path):
                    with open(model_path, 'rb') as f:
                        self.performance_models[model_name] = pickle.load(f)
                    self.logger.info(f"Loaded performance model: {model_name}")
            
            # Load transfer learning models
            for model_name in self.transfer_learning_models:
                model_path = f"{self.model_storage_path}/{model_name}.pkl"
                if os.path.exists(model_path):
                    with open(model_path, 'rb') as f:
                        self.transfer_learning_models[model_name] = pickle.load(f)
                    self.logger.info(f"Loaded transfer learning model: {model_name}")
            
            # Load meta-learning state
            state_path = f"{self.model_storage_path}/meta_learning_state.json"
            if os.path.exists(state_path):
                with open(state_path, 'r') as f:
                    state_data = json.load(f)
                    # Convert string timestamps back to datetime objects
                    for key in ['last_optimization', 'created_at', 'updated_at']:
                        if key in state_data and state_data[key]:
                            state_data[key] = datetime.fromisoformat(state_data[key])
                    
                    self.meta_learning_state = MetaLearningState(**state_data)
                    self.logger.info("Loaded existing meta-learning state")
        
        except Exception as e:
            self.logger.error(f"Failed to load existing models: {str(e)}")
    
    async def optimize_hyperparameters(
        self,
        query_type: ResearchQueryType,
        performance_data: List[Dict[str, Any]],
        optimization_budget: int = 50
    ) -> Dict[str, Any]:
        """
        Optimize hyperparameters for specific query type.
        
        Args:
            query_type: Type of research query
            performance_data: Historical performance data
            optimization_budget: Maximum number of optimization iterations
            
        Returns:
            Dictionary containing optimized hyperparameters and analysis
        """
        try:
            self.logger.info(f"Optimizing hyperparameters for query type: {query_type.value}")
            
            # Prepare training data
            X_train, y_train = self._prepare_optimization_data(performance_data)
            
            if len(X_train) < 10:
                self.logger.warning("Insufficient data for optimization, using default parameters")
                return self._get_current_hyperparameters()
            
            # Perform optimization based on strategy
            if self.optimization_strategy == HyperparameterOptimizationStrategy.BAYESIAN_OPTIMIZATION:
                result = await self._bayesian_optimization(X_train, y_train, optimization_budget)
            elif self.optimization_strategy == HyperparameterOptimizationStrategy.GENETIC_ALGORITHM:
                result = await self._genetic_algorithm_optimization(X_train, y_train, optimization_budget)
            elif self.optimization_strategy == HyperparameterOptimizationStrategy.GRID_SEARCH:
                result = await self._grid_search_optimization(X_train, y_train)
            elif self.optimization_strategy == HyperparameterOptimizationStrategy.RANDOM_SEARCH:
                result = await self._random_search_optimization(X_train, y_train, optimization_budget)
            else:
                result = await self._gradient_based_optimization(X_train, y_train)
            
            # Validate optimized parameters
            validated_result = await self._validate_hyperparameters(result["best_params"])
            
            # Update meta-learning state
            self._update_meta_learning_state(query_type, validated_result)
            
            # Save optimized parameters
            await self._save_optimized_parameters(validated_result)
            
            # Log completion
            log_audit_event(
                agent_name="ResearchMetaLearning",
                action="HYPERPARAMETER_OPTIMIZATION",
                details=f"Query type: {query_type.value}, Improvement: {result.get('improvement', 0):.2%}",
                status="SUCCESS"
            )
            
            return {
                "optimization_id": str(uuid.uuid4()),
                "query_type": query_type.value,
                "strategy": self.optimization_strategy.value,
                "best_hyperparameters": validated_result,
                "optimization_score": result.get("best_score", 0.0),
                "improvement_percentage": result.get("improvement", 0.0),
                "optimization_time_ms": result.get("optimization_time_ms", 0),
                "validation_results": result.get("validation_results", {})
            }
            
        except Exception as e:
            self.logger.error(f"Hyperparameter optimization failed: {str(e)}")
            log_audit_event(
                agent_name="ResearchMetaLearning",
                action="HYPERPARAMETER_OPTIMIZATION_FAILED",
                details=f"Error: {str(e)}",
                status="ERROR"
            )
            raise
    
    async def _bayesian_optimization(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        budget: int
    ) -> Dict[str, Any]:
        """Perform Bayesian optimization for hyperparameters."""
        start_time = datetime.now()
        
        # Simplified Bayesian optimization using Gaussian Process
        # In production, would use libraries like scikit-optimize or optuna
        
        best_score = -np.inf
        best_params = {}
        
        # Initialize with current parameters
        current_params = {name: config.current_value 
                        for name, config in self.hyperparameter_configs.items()}
        
        for iteration in range(budget):
            # Generate candidate parameters (simplified sampling)
            candidate_params = self._generate_bayesian_candidate(current_params, iteration)
            
            # Evaluate candidate
            score = self._evaluate_hyperparameters(candidate_params, X_train, y_train)
            
            if score > best_score:
                best_score = score
                best_params = candidate_params.copy()
            
            # Update current parameters for next iteration
            current_params = candidate_params
        
        optimization_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return {
            "best_params": best_params,
            "best_score": best_score,
            "optimization_time_ms": optimization_time,
            "iterations": budget
        }
    
    def _generate_bayesian_candidate(
        self,
        current_params: Dict[str, Any],
        iteration: int
    ) -> Dict[str, Any]:
        """Generate candidate parameters using Bayesian approach."""
        candidate = current_params.copy()
        
        # Exploration vs exploitation balance
        exploration_factor = 0.1 * (1 - iteration / 50)  # Decrease exploration over time
        
        for param_name, config in self.hyperparameter_configs.items():
            if config.param_type == "continuous":
                # Add Gaussian noise for exploration
                noise = np.random.normal(0, exploration_factor)
                if config.min_value is not None and config.max_value is not None:
                    new_value = candidate[param_name] + noise * (config.max_value - config.min_value)
                    candidate[param_name] = np.clip(new_value, config.min_value, config.max_value)
            elif config.param_type == "discrete":
                # Random walk with bounds
                if np.random.random() < exploration_factor:
                    step = np.random.choice([-1, 1])
                    new_value = candidate[param_name] + step
                    if config.min_value is not None and config.max_value is not None:
                        candidate[param_name] = np.clip(new_value, config.min_value, config.max_value)
            elif config.param_type == "categorical" and config.possible_values:
                # Random categorical selection with exploration
                if np.random.random() < exploration_factor:
                    candidate[param_name] = np.random.choice(config.possible_values)
        
        return candidate
    
    async def _genetic_algorithm_optimization(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        budget: int
    ) -> Dict[str, Any]:
        """Perform genetic algorithm optimization."""
        start_time = datetime.now()
        
        # Genetic algorithm parameters
        population_size = 20
        mutation_rate = 0.1
        crossover_rate = 0.8
        elite_size = 4
        
        # Initialize population
        population = self._initialize_population(population_size)
        
        best_score = -np.inf
        best_params = {}
        
        generations = budget // population_size
        
        for generation in range(generations):
            # Evaluate population
            scores = []
            for individual in population:
                score = self._evaluate_hyperparameters(individual, X_train, y_train)
                scores.append(score)
                
                if score > best_score:
                    best_score = score
                    best_params = individual.copy()
            
            # Select parents (tournament selection)
            parents = self._tournament_selection(population, scores, elite_size)
            
            # Create next generation
            next_population = []
            
            # Keep elite individuals
            elite_indices = np.argsort(scores)[-elite_size:]
            for idx in elite_indices:
                next_population.append(population[idx].copy())
            
            # Generate offspring
            while len(next_population) < population_size:
                if np.random.random() < crossover_rate:
                    # Crossover
                    parent1, parent2 = np.random.choice(parents, 2).tolist()
                    offspring = self._crossover(parent1, parent2)
                else:
                    # Copy parent
                    offspring = np.random.choice(parents).copy()
                
                # Mutation
                if np.random.random() < mutation_rate:
                    offspring = self._mutate(offspring)
                
                next_population.append(offspring)
            
            population = next_population
        
        optimization_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return {
            "best_params": best_params,
            "best_score": best_score,
            "optimization_time_ms": optimization_time,
            "generations": generations,
            "population_size": population_size
        }
    
    def _initialize_population(self, population_size: int) -> List[Dict[str, Any]]:
        """Initialize population for genetic algorithm."""
        population = []
        
        for _ in range(population_size):
            individual = {}
            for param_name, config in self.hyperparameter_configs.items():
                if config.param_type == "continuous":
                    individual[param_name] = np.random.uniform(config.min_value, config.max_value)
                elif config.param_type == "discrete":
                    individual[param_name] = np.random.randint(config.min_value, config.max_value + 1)
                elif config.param_type == "categorical" and config.possible_values:
                    individual[param_name] = np.random.choice(config.possible_values)
                else:
                    individual[param_name] = config.current_value
            
            population.append(individual)
        
        return population
    
    def _tournament_selection(
        self,
        population: List[Dict[str, Any]],
        scores: List[float],
        elite_size: int
    ) -> List[Dict[str, Any]]:
        """Select parents using tournament selection."""
        parents = []
        
        # Select elite individuals
        elite_indices = np.argsort(scores)[-elite_size:]
        for idx in elite_indices:
            parents.append(population[idx].copy())
        
        # Fill remaining parent slots with tournament selection
        tournament_size = 3
        while len(parents) < len(population):
            # Random tournament participants
            tournament_indices = np.random.choice(len(population), tournament_size, replace=False)
            tournament_scores = [scores[i] for i in tournament_indices]
            winner_idx = tournament_indices[np.argmax(tournament_scores)]
            parents.append(population[winner_idx].copy())
        
        return parents
    
    def _crossover(
        self,
        parent1: Dict[str, Any],
        parent2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform crossover between two parents."""
        offspring = {}
        
        for param_name in parent1:
            if np.random.random() < 0.5:
                offspring[param_name] = parent1[param_name]
            else:
                offspring[param_name] = parent2[param_name]
        
        return offspring
    
    def _mutate(self, individual: Dict[str, Any]) -> Dict[str, Any]:
        """Perform mutation on an individual."""
        mutated = individual.copy()
        
        # Select random parameter to mutate
        param_names = list(self.hyperparameter_configs.keys())
        if param_names:
            param_name = np.random.choice(param_names)
            config = self.hyperparameter_configs[param_name]
            
            if config.param_type == "continuous":
                # Gaussian mutation
                mutation_strength = 0.1 * (config.max_value - config.min_value)
                mutation = np.random.normal(0, mutation_strength)
                new_value = mutated[param_name] + mutation
                mutated[param_name] = np.clip(new_value, config.min_value, config.max_value)
            elif config.param_type == "discrete":
                # Random step mutation
                step = np.random.choice([-1, 1])
                new_value = mutated[param_name] + step
                mutated[param_name] = np.clip(new_value, config.min_value, config.max_value)
            elif config.param_type == "categorical" and config.possible_values:
                # Random categorical mutation
                mutated[param_name] = np.random.choice(config.possible_values)
        
        return mutated
    
    async def _grid_search_optimization(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray
    ) -> Dict[str, Any]:
        """Perform grid search optimization."""
        start_time = datetime.now()
        
        # Define grid for key parameters
        param_grid = {
            "research_weight": [0.5, 0.6, 0.7, 0.8, 0.9],
            "ethical_weight": [0.1, 0.2, 0.3, 0.4],
            "confidence_threshold": [0.5, 0.6, 0.7, 0.8],
            "learning_rate": [0.001, 0.01, 0.05, 0.1]
        }
        
        best_score = -np.inf
        best_params = {}
        total_combinations = 1
        
        for values in param_grid.values():
            total_combinations *= len(values)
        
        evaluated_combinations = 0
        
        # Generate all combinations
        import itertools
        param_names = list(param_grid.keys())
        param_values = list(param_grid.values())
        
        for combination in itertools.product(*param_values):
            params = dict(zip(param_names, combination))
            
            # Fill in missing parameters with current values
            for param_name in self.hyperparameter_configs:
                if param_name not in params:
                    params[param_name] = self.hyperparameter_configs[param_name].current_value
            
            score = self._evaluate_hyperparameters(params, X_train, y_train)
            
            if score > best_score:
                best_score = score
                best_params = params.copy()
            
            evaluated_combinations += 1
            
            # Progress logging
            if evaluated_combinations % 10 == 0:
                self.logger.info(f"Grid search progress: {evaluated_combinations}/{total_combinations}")
        
        optimization_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return {
            "best_params": best_params,
            "best_score": best_score,
            "optimization_time_ms": optimization_time,
            "evaluated_combinations": evaluated_combinations,
            "total_combinations": total_combinations
        }
    
    async def _random_search_optimization(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        budget: int
    ) -> Dict[str, Any]:
        """Perform random search optimization."""
        start_time = datetime.now()
        
        best_score = -np.inf
        best_params = {}
        
        for iteration in range(budget):
            # Generate random parameters
            params = {}
            for param_name, config in self.hyperparameter_configs.items():
                if config.param_type == "continuous":
                    params[param_name] = np.random.uniform(config.min_value, config.max_value)
                elif config.param_type == "discrete":
                    params[param_name] = np.random.randint(config.min_value, config.max_value + 1)
                elif config.param_type == "categorical" and config.possible_values:
                    params[param_name] = np.random.choice(config.possible_values)
                else:
                    params[param_name] = config.current_value
            
            # Evaluate parameters
            score = self._evaluate_hyperparameters(params, X_train, y_train)
            
            if score > best_score:
                best_score = score
                best_params = params.copy()
        
        optimization_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return {
            "best_params": best_params,
            "best_score": best_score,
            "optimization_time_ms": optimization_time,
            "iterations": budget
        }
    
    async def _gradient_based_optimization(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray
    ) -> Dict[str, Any]:
        """Perform gradient-based optimization."""
        start_time = datetime.now()
        
        # Initialize with current parameters
        params = {name: config.current_value 
                  for name, config in self.hyperparameter_configs.items()}
        
        learning_rate = self.learning_rate_config.initial_rate
        best_score = self._evaluate_hyperparameters(params, X_train, y_train)
        best_params = params.copy()
        
        # Gradient descent iterations
        for iteration in range(100):
            # Compute numerical gradients
            gradients = {}
            for param_name in params:
                epsilon = 1e-5
                params_plus = params.copy()
                params_minus = params.copy()
                
                params_plus[param_name] += epsilon
                params_minus[param_name] -= epsilon
                
                score_plus = self._evaluate_hyperparameters(params_plus, X_train, y_train)
                score_minus = self._evaluate_hyperparameters(params_minus, X_train, y_train)
                
                gradients[param_name] = (score_plus - score_minus) / (2 * epsilon)
            
            # Update parameters
            for param_name, gradient in gradients.items():
                config = self.hyperparameter_configs[param_name]
                new_value = params[param_name] - learning_rate * gradient
                
                # Apply bounds
                if config.param_type == "continuous" and config.min_value is not None and config.max_value is not None:
                    params[param_name] = np.clip(new_value, config.min_value, config.max_value)
                elif config.param_type == "discrete" and config.min_value is not None and config.max_value is not None:
                    params[param_name] = int(np.clip(new_value, config.min_value, config.max_value))
            
            # Evaluate new parameters
            current_score = self._evaluate_hyperparameters(params, X_train, y_train)
            
            if current_score > best_score:
                best_score = current_score
                best_params = params.copy()
            
            # Adapt learning rate
            if self.learning_rate_config.strategy == LearningRateAdaptationStrategy.STEP_DECAY:
                learning_rate *= self.learning_rate_config.decay_rate
            elif self.learning_rate_config.strategy == LearningRateAdaptationStrategy.EXPONENTIAL_DECAY:
                learning_rate = self.learning_rate_config.initial_rate * np.exp(-iteration * 0.01)
        
        optimization_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return {
            "best_params": best_params,
            "best_score": best_score,
            "optimization_time_ms": optimization_time,
            "iterations": 100
        }
    
    def _prepare_optimization_data(self, performance_data: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare data for hyperparameter optimization."""
        if not performance_data:
            return np.array([]), np.array([])
        
        # Extract features (hyperparameters) and targets (performance scores)
        feature_names = list(self.hyperparameter_configs.keys())
        X = []
        y = []
        
        for data_point in performance_data:
            features = []
            for param_name in feature_names:
                if param_name in data_point:
                    features.append(data_point[param_name])
                else:
                    features.append(self.hyperparameter_configs[param_name].current_value)
            
            # Performance score (combination of multiple metrics)
            performance_score = self._calculate_performance_score(data_point)
            
            X.append(features)
            y.append(performance_score)
        
        return np.array(X), np.array(y)
    
    def _calculate_performance_score(self, data_point: Dict[str, Any]) -> float:
        """Calculate composite performance score from data point."""
        # Weighted combination of performance metrics
        weights = {
            "accuracy": 0.3,
            "quality": 0.3,
            "processing_time": -0.2,  # Negative because lower is better
            "confidence": 0.2
        }
        
        score = 0.0
        for metric, weight in weights.items():
            if metric in data_point:
                score += data_point[metric] * weight
        
        return score
    
    def _evaluate_hyperparameters(
        self,
        params: Dict[str, Any],
        X_train: np.ndarray,
        y_train: np.ndarray
    ) -> float:
        """Evaluate hyperparameters using cross-validation."""
        try:
            # Create a simple model with given hyperparameters
            # In practice, this would train the actual model with these parameters
            
            # For evaluation, use a simple proxy based on parameter values
            score = 0.0
            
            # Research weight should be high but not too high
            research_weight = params.get("research_weight", 0.7)
            if 0.5 <= research_weight <= 0.8:
                score += 0.3
            else:
                score -= 0.2
            
            # Ethical weight should be moderate
            ethical_weight = params.get("ethical_weight", 0.2)
            if 0.1 <= ethical_weight <= 0.3:
                score += 0.2
            else:
                score -= 0.1
            
            # Confidence threshold should be balanced
            confidence_threshold = params.get("confidence_threshold", 0.6)
            if 0.5 <= confidence_threshold <= 0.7:
                score += 0.2
            else:
                score -= 0.1
            
            # Learning rate should be reasonable
            learning_rate = params.get("learning_rate", 0.01)
            if 0.001 <= learning_rate <= 0.05:
                score += 0.2
            else:
                score -= 0.1
            
            return score
            
        except Exception as e:
            self.logger.error(f"Hyperparameter evaluation failed: {str(e)}")
            return -np.inf
    
    async def _validate_hyperparameters(
        self,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate optimized hyperparameters."""
        validation_results = {}
        
        # Check parameter bounds
        for param_name, value in params.items():
            config = self.hyperparameter_configs.get(param_name)
            if config:
                if config.param_type == "continuous":
                    if config.min_value is not None and value < config.min_value:
                        validation_results[f"{param_name}_below_min"] = True
                    if config.max_value is not None and value > config.max_value:
                        validation_results[f"{param_name}_above_max"] = True
                elif config.param_type == "discrete":
                    if config.min_value is not None and value < config.min_value:
                        validation_results[f"{param_name}_below_min"] = True
                    if config.max_value is not None and value > config.max_value:
                        validation_results[f"{param_name}_above_max"] = True
                    if not isinstance(value, int):
                        validation_results[f"{param_name}_not_integer"] = True
        
        # Update current values if validation passes
        if not validation_results:
            for param_name, value in params.items():
                if param_name in self.hyperparameter_configs:
                    self.hyperparameter_configs[param_name].current_value = value
        
        return {
            "params": params,
            "validation_passed": len(validation_results) == 0,
            "validation_errors": validation_results
        }
    
    def _update_meta_learning_state(
        self,
        query_type: ResearchQueryType,
        optimization_result: Dict[str, Any]
    ):
        """Update meta-learning state with optimization results."""
        self.meta_learning_state.hyperparameter_history.append({
            "timestamp": datetime.now(),
            "query_type": query_type.value,
            "hyperparameters": optimization_result.get("best_params", {}),
            "performance_score": optimization_result.get("best_score", 0.0),
            "optimization_strategy": self.optimization_strategy.value
        })
        
        # Update best performance
        current_best = self.meta_learning_state.best_performance_score
        new_score = optimization_result.get("best_score", 0.0)
        
        if new_score > current_best:
            self.meta_learning_state.best_performance_score = new_score
            self.meta_learning_state.best_hyperparameters = optimization_result.get("best_params", {})
        
        self.meta_learning_state.last_optimization = datetime.now()
        self.meta_learning_state.optimization_count += 1
        self.meta_learning_state.updated_at = datetime.now()
    
    async def _save_optimized_parameters(self, validation_result: Dict[str, Any]):
        """Save optimized parameters and update models."""
        try:
            # Save meta-learning state
            state_path = f"{self.model_storage_path}/meta_learning_state.json"
            state_data = {
                "state_id": self.meta_learning_state.state_id,
                "hyperparameter_history": self.meta_learning_state.hyperparameter_history[-100:],  # Keep last 100
                "performance_history": self.meta_learning_state.performance_history[-100:],
                "transfer_learning_history": self.meta_learning_state.transfer_learning_history[-100:],
                "adaptation_history": self.meta_learning_state.adaptation_history[-100:],
                "best_hyperparameters": self.meta_learning_state.best_hyperparameters,
                "best_performance_score": self.meta_learning_state.best_performance_score,
                "last_optimization": self.meta_learning_state.last_optimization.isoformat(),
                "optimization_count": self.meta_learning_state.optimization_count,
                "created_at": self.meta_learning_state.created_at.isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            with open(state_path, 'w') as f:
                json.dump(state_data, f, indent=2)
            
            # Train and save performance models
            await self._train_performance_models()
            
            self.logger.info("Optimized parameters saved successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to save optimized parameters: {str(e)}")
    
    async def _train_performance_models(self):
        """Train performance prediction models."""
        try:
            # Prepare training data from history
            if len(self.meta_learning_state.hyperparameter_history) < 20:
                self.logger.warning("Insufficient history for training performance models")
                return
            
            # Extract features and targets
            X = []
            y_accuracy = []
            y_quality = []
            y_processing_time = []
            y_confidence = []
            
            for record in self.meta_learning_state.hyperparameter_history:
                features = []
                for param_name in self.hyperparameter_configs:
                    value = record["hyperparameters"].get(param_name, 
                        self.hyperparameter_configs[param_name].current_value)
                    features.append(value)
                
                X.append(features)
                
                # Extract performance metrics (simplified)
                perf_score = record.get("performance_score", 0.0)
                y_accuracy.append(perf_score)
                y_quality.append(perf_score * 0.8)  # Estimated split
                y_processing_time.append(1000 / (perf_score + 1))  # Inverse relationship
                y_confidence.append(perf_score * 0.7)  # Estimated split
            
            X = np.array(X)
            
            # Train models
            if len(X) > 10:
                # Accuracy model
                self.performance_models["accuracy_model"] = RandomForestRegressor(n_estimators=50, random_state=42)
                self.performance_models["accuracy_model"].fit(X, y_accuracy)
                
                # Quality model
                self.performance_models["quality_model"] = GradientBoostingRegressor(n_estimators=50, random_state=42)
                self.performance_models["quality_model"].fit(X, y_quality)
                
                # Processing time model
                self.performance_models["processing_time_model"] = RandomForestRegressor(n_estimators=50, random_state=42)
                self.performance_models["processing_time_model"].fit(X, y_processing_time)
                
                # Confidence model
                self.performance_models["confidence_model"] = GradientBoostingRegressor(n_estimators=50, random_state=42)
                self.performance_models["confidence_model"].fit(X, y_confidence)
                
                # Save models
                for model_name, model in self.performance_models.items():
                    if model is not None:
                        model_path = f"{self.model_storage_path}/{model_name}.pkl"
                        with open(model_path, 'wb') as f:
                            pickle.dump(model, f)
                
                self.logger.info("Performance models trained and saved successfully")
        
        except Exception as e:
            self.logger.error(f"Failed to train performance models: {str(e)}")
    
    def _get_current_hyperparameters(self) -> Dict[str, Any]:
        """Get current hyperparameter values."""
        return {name: config.current_value for name, config in self.hyperparameter_configs.items()}
    
    async def predict_performance(
        self,
        query_type: ResearchQueryType,
        hyperparameters: Dict[str, Any]
    ) -> PerformancePrediction:
        """
        Predict performance for given hyperparameters.
        
        Args:
            query_type: Type of research query
            hyperparameters: Hyperparameters to evaluate
            
        Returns:
            Performance prediction with confidence intervals
        """
        try:
            # Prepare features
            features = []
            for param_name in self.hyperparameter_configs:
                value = hyperparameters.get(param_name, self.hyperparameter_configs[param_name].current_value)
                features.append(value)
            
            X = np.array([features])
            
            # Make predictions
            predictions = {}
            confidence_intervals = {}
            
            for metric_name, model in self.performance_models.items():
                if model is not None:
                    try:
                        prediction = model.predict(X)[0]
                        predictions[metric_name] = prediction
                        
                        # Calculate confidence interval (simplified)
                        std_dev = np.std([model.predict(X) for _ in range(10)])  # Bootstrap
                        confidence_intervals[metric_name] = (
                            prediction - 1.96 * std_dev,
                            prediction + 1.96 * std_dev
                        )
                    except Exception as e:
                        self.logger.error(f"Prediction failed for {metric_name}: {str(e)}")
                        predictions[metric_name] = 0.0
                        confidence_intervals[metric_name] = (0.0, 0.0)
                else:
                    predictions[metric_name] = 0.0
                    confidence_intervals[metric_name] = (0.0, 0.0)
            
            # Calculate overall confidence
            prediction_confidence = self._calculate_prediction_confidence(predictions, hyperparameters)
            
            return PerformancePrediction(
                prediction_id=str(uuid.uuid4()),
                query_type=query_type,
                hyperparameters=hyperparameters,
                predicted_performance=predictions,
                confidence_interval=confidence_intervals,
                prediction_confidence=prediction_confidence,
                model_version="1.0.0"
            )
            
        except Exception as e:
            self.logger.error(f"Performance prediction failed: {str(e)}")
            raise
    
    def _calculate_prediction_confidence(
        self,
        predictions: Dict[str, float],
        hyperparameters: Dict[str, Any]
    ) -> float:
        """Calculate confidence in performance prediction."""
        # Check if parameters are within trained ranges
        confidence_factors = []
        
        for param_name, value in hyperparameters.items():
            config = self.hyperparameter_configs.get(param_name)
            if config:
                if config.param_type == "continuous":
                    if config.min_value is not None and config.max_value is not None:
                        if config.min_value <= value <= config.max_value:
                            confidence_factors.append(1.0)
                        else:
                            confidence_factors.append(0.5)
                    else:
                        confidence_factors.append(0.8)
                elif config.param_type == "discrete":
                    if config.min_value is not None and config.max_value is not None:
                        if config.min_value <= value <= config.max_value:
                            confidence_factors.append(1.0)
                        else:
                            confidence_factors.append(0.5)
                    else:
                        confidence_factors.append(0.8)
                else:
                    confidence_factors.append(0.7)
        
        return np.mean(confidence_factors) if confidence_factors else 0.5
    
    async def transfer_learning(
        self,
        source_domain: str,
        target_domain: str,
        transfer_strategy: TransferLearningStrategy = TransferLearningStrategy.FINE_TUNING,
        source_performance_data: Optional[List[Dict[str, Any]]] = None
    ) -> TransferLearningResult:
        """
        Perform transfer learning from source to target domain.
        
        Args:
            source_domain: Source domain for knowledge transfer
            target_domain: Target domain for knowledge transfer
            transfer_strategy: Strategy for transfer learning
            source_performance_data: Performance data from source domain
            
        Returns:
            Transfer learning result with efficiency metrics
        """
        try:
            self.logger.info(f"Initiating transfer learning: {source_domain} -> {target_domain}")
            start_time = datetime.now()
            
            # Calculate domain similarity
            domain_similarity = await self._calculate_domain_similarity(source_domain, target_domain)
            
            # Estimate transfer efficiency based on similarity and strategy
            base_efficiency = self._estimate_base_efficiency(transfer_strategy)
            transfer_efficiency = domain_similarity * base_efficiency
            
            # Simulate transfer learning process
            adaptation_time = await self._simulate_adaptation_process(
                transfer_strategy, domain_similarity
            )
            
            # Estimate target performance
            source_perf = np.mean([d.get("performance_score", 0.7) 
                                 for d in (source_performance_data or [{}])])
            target_performance = source_perf * transfer_efficiency
            
            # Determine success based on efficiency threshold
            success = transfer_efficiency > 0.5
            
            adaptation_time_ms = (datetime.now() - start_time).total_seconds() * 1000
            
            result = TransferLearningResult(
                transfer_id=str(uuid.uuid4()),
                source_domain=source_domain,
                target_domain=target_domain,
                transfer_strategy=transfer_strategy,
                source_performance=source_perf,
                target_performance=target_performance,
                transfer_efficiency=transfer_efficiency,
                adaptation_time_ms=adaptation_time_ms,
                success=success,
                metadata={
                    "domain_similarity": domain_similarity,
                    "base_efficiency": base_efficiency,
                    "adaptation_complexity": self._calculate_adaptation_complexity(transfer_strategy)
                }
            )
            
            # Update transfer learning history
            self.meta_learning_state.transfer_learning_history.append({
                "timestamp": datetime.now(),
                "source_domain": source_domain,
                "target_domain": target_domain,
                "strategy": transfer_strategy.value,
                "efficiency": transfer_efficiency,
                "success": success
            })
            
            # Log completion
            log_audit_event(
                agent_name="ResearchMetaLearning",
                action="TRANSFER_LEARNING",
                details=f"Transfer: {source_domain}->{target_domain}, Efficiency: {transfer_efficiency:.2f}",
                status="SUCCESS"
            )
            
            return result
            
        except Exception as e:
            self.logger.error(f"Transfer learning failed: {str(e)}")
            log_audit_event(
                agent_name="ResearchMetaLearning",
                action="TRANSFER_LEARNING_FAILED",
                details=f"Error: {str(e)}",
                status="ERROR"
            )
            raise
    
    async def _calculate_domain_similarity(self, source_domain: str, target_domain: str) -> float:
        """Calculate similarity between two domains."""
        # Simplified domain similarity calculation
        # In practice, would use semantic similarity, ontology matching, etc.
        
        domain_keywords = {
            "technology": ["ai", "ml", "software", "programming", "algorithm"],
            "business": ["market", "revenue", "profit", "strategy"],
            "ethics": ["ethical", "moral", "principle", "guideline"],
            "science": ["research", "study", "experiment", "data"],
            "health": ["medical", "health", "treatment", "clinical"]
        }
        
        source_keywords = domain_keywords.get(source_domain.lower(), [])
        target_keywords = domain_keywords.get(target_domain.lower(), [])
        
        if not source_keywords or not target_keywords:
            return 0.1  # Low similarity for unknown domains
        
        # Calculate Jaccard similarity
        source_set = set(source_keywords)
        target_set = set(target_keywords)
        intersection = source_set.intersection(target_set)
        union = source_set.union(target_set)
        
        similarity = len(intersection) / len(union) if union else 0.0
        return similarity
    
    def _estimate_base_efficiency(self, transfer_strategy: TransferLearningStrategy) -> float:
        """Estimate base efficiency for transfer strategy."""
        strategy_efficiency = {
            TransferLearningStrategy.FINE_TUNING: 0.8,
            TransferLearningStrategy.FEATURE_EXTRACTION: 0.6,
            TransferLearningStrategy.DOMAIN_ADAPTATION: 0.7,
            TransferLearningStrategy.MULTI_TASK_LEARNING: 0.9,
            TransferLearningStrategy.META_TRANSFER: 0.85
        }
        
        return strategy_efficiency.get(transfer_strategy, 0.5)
    
    async def _simulate_adaptation_process(
        self,
        transfer_strategy: TransferLearningStrategy,
        domain_similarity: float
    ) -> int:
        """Simulate adaptation process and return time in milliseconds."""
        # Base adaptation time depends on strategy complexity
        base_times = {
            TransferLearningStrategy.FINE_TUNING: 5000,  # 5 seconds
            TransferLearningStrategy.FEATURE_EXTRACTION: 2000,  # 2 seconds
            TransferLearningStrategy.DOMAIN_ADAPTATION: 8000,  # 8 seconds
            TransferLearningStrategy.MULTI_TASK_LEARNING: 12000,  # 12 seconds
            TransferLearningStrategy.META_TRANSFER: 15000   # 15 seconds
        }
        
        base_time = base_times.get(transfer_strategy, 5000)
        
        # Adjust based on domain similarity (lower similarity = more adaptation time)
        similarity_factor = 2.0 - domain_similarity  # Inverse relationship
        adaptation_time = int(base_time * similarity_factor)
        
        return adaptation_time
    
    def _calculate_adaptation_complexity(self, transfer_strategy: TransferLearningStrategy) -> float:
        """Calculate complexity score for adaptation strategy."""
        complexity_scores = {
            TransferLearningStrategy.FINE_TUNING: 0.3,
            TransferLearningStrategy.FEATURE_EXTRACTION: 0.5,
            TransferLearningStrategy.DOMAIN_ADAPTATION: 0.7,
            TransferLearningStrategy.MULTI_TASK_LEARNING: 0.9,
            TransferLearningStrategy.META_TRANSFER: 1.0
        }
        
        return complexity_scores.get(transfer_strategy, 0.5)
    
    def get_meta_learning_state(self) -> Dict[str, Any]:
        """Get current meta-learning state."""
        return {
            "tenant_id": self.tenant_id,
            "state": self.meta_learning_state.__dict__,
            "hyperparameter_configs": {name: {
                "current_value": config.current_value,
                "type": config.param_type,
                "bounds": {
                    "min": config.min_value,
                    "max": config.max_value
                } if config.min_value is not None else None
            } for name, config in self.hyperparameter_configs.items()},
            "optimization_strategy": self.optimization_strategy.value,
            "learning_rate_config": {
                "initial_rate": self.learning_rate_config.initial_rate,
                "strategy": self.learning_rate_config.strategy.value,
                "decay_rate": self.learning_rate_config.decay_rate
            },
            "model_status": {
                "performance_models_trained": any(model is not None for model in self.performance_models.values()),
                "transfer_models_trained": any(model is not None for model in self.transfer_learning_models.values())
            },
            "timestamp": datetime.now().isoformat()
        }


# Factory function for creating ResearchMetaLearning instances
def create_research_meta_learning(
    tenant_id: str = "default",
    optimization_strategy: HyperparameterOptimizationStrategy = HyperparameterOptimizationStrategy.BAYESIAN_OPTIMIZATION,
    learning_rate_config: Optional[LearningRateConfig] = None,
    model_storage_path: Optional[str] = None
) -> ResearchMetaLearning:
    """
    Factory function to create ResearchMetaLearning instances.
    
    Args:
        tenant_id: Tenant identifier
        optimization_strategy: Strategy for hyperparameter optimization
        learning_rate_config: Configuration for learning rate adaptation
        model_storage_path: Path to store trained models
        
    Returns:
        Configured ResearchMetaLearning instance
    """
    return ResearchMetaLearning(
        tenant_id=tenant_id,
        optimization_strategy=optimization_strategy,
        learning_rate_config=learning_rate_config,
        model_storage_path=model_storage_path
    )


if __name__ == "__main__":
    # Test Research Meta-Learning
    async def test_research_meta_learning():
        print("\n" + "=" * 60)
        print("Testing Research Meta-Learning")
        print("=" * 60 + "\n")
        
        # Create meta-learning system
        meta_learning = create_research_meta_learning(tenant_id="test-tenant")
        
        # Create mock performance data
        mock_performance_data = [
            {
                "research_weight": 0.6,
                "ethical_weight": 0.2,
                "confidence_threshold": 0.6,
                "learning_rate": 0.01,
                "accuracy": 0.85,
                "quality": 0.8,
                "processing_time": 1000,
                "confidence": 0.75
            },
            {
                "research_weight": 0.7,
                "ethical_weight": 0.25,
                "confidence_threshold": 0.65,
                "learning_rate": 0.005,
                "accuracy": 0.88,
                "quality": 0.85,
                "processing_time": 800,
                "confidence": 0.8
            },
            {
                "research_weight": 0.8,
                "ethical_weight": 0.15,
                "confidence_threshold": 0.7,
                "learning_rate": 0.02,
                "accuracy": 0.82,
                "quality": 0.78,
                "processing_time": 1200,
                "confidence": 0.7
            }
        ]
        
        # Test hyperparameter optimization
        optimization_result = await meta_learning.optimize_hyperparameters(
            ResearchQueryType.TREND_ANALYSIS,
            mock_performance_data,
            optimization_budget=20
        )
        
        print(f"✅ Hyperparameter optimization completed")
        print(f"📊 Best score: {optimization_result['optimization_score']:.3f}")
        print(f"🔧 Optimized parameters: {len(optimization_result['best_hyperparameters'])}")
        
        # Test performance prediction
        prediction = await meta_learning.predict_performance(
            ResearchQueryType.TREND_ANALYSIS,
            optimization_result["best_hyperparameters"]
        )
        
        print(f"\n🔮 Performance prediction:")
        print(f"   Confidence: {prediction.prediction_confidence:.2f}")
        print(f"   Predicted metrics: {len(prediction.predicted_performance)}")
        
        # Test transfer learning
        transfer_result = await meta_learning.transfer_learning(
            "technology",
            "business",
            TransferLearningStrategy.FINE_TUNING
        )
        
        print(f"\n🔄 Transfer learning result:")
        print(f"   Efficiency: {transfer_result.transfer_efficiency:.2f}")
        print(f"   Success: {transfer_result.success}")
        print(f"   Adaptation time: {transfer_result.adaptation_time_ms}ms")
        
        # Get state
        state = meta_learning.get_meta_learning_state()
        print(f"\n📈 Meta-learning state:\n{json.dumps(state, indent=2, default=str)}")
        
        print("\n✅ Research Meta-Learning test completed successfully!")
    
    asyncio.run(test_research_meta_learning())