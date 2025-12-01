/**
 * 🔷 ENHANCED OPAL AGENT CREATION WIZARD
 * 
 * Advanced wizard for creating Opal-enabled agents with Tesla frequency
 * personality generation, Solana wallet integration, and MENA cultural adaptation
 * 
 * @author Axiom Core Team
 * @version 2.0.0
 */

'use client';

import { useState, useCallback } from 'react';
import { AgentType } from '@/lib/ai-engine';
import { 
  EnhancedAgentCreationRequest,
  AgentDeploymentConfig,
  EnhancedAgentResponse 
} from '@/types/enhanced-agents';

interface CreateOpalAgentWizardProps {
  onAgentCreated?: (agent: EnhancedAgentResponse) => void;
  onError?: (error: string) => void;
}

export default function CreateOpalAgentWizard({ onAgentCreated, onError }: CreateOpalAgentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [agentData, setAgentData] = useState<EnhancedAgentCreationRequest>({
    name: '',
    role: '',
    vibe: '',
    agent_type: AgentType.TAJER,
    frequency_band: '3Hz',
    enable_opal_workflows: true,
    enable_wallet: true,
    security_level: 'standard',
    privacy_mode: false
  });

  const totalSteps = 5;

  // Agent types configuration
  const agentTypes = [
    {
      type: AgentType.TAJER,
      name: 'TAJER',
      description: 'Business & Commerce Specialist',
      icon: '💼',
      color: 'from-blue-600 to-cyan-600',
      features: ['Islamic Finance', 'Market Analysis', 'Risk Assessment', 'Currency Conversion']
    },
    {
      type: AgentType.MUSAFIR,
      name: 'MUSAFIR',
      description: 'Travel & Tourism Expert',
      icon: '✈️',
      color: 'from-green-600 to-emerald-600',
      features: ['Hajj/Umrah Planning', 'Cultural Tours', 'Route Optimization', 'Multi-language Support']
    },
    {
      type: AgentType.SOFRA,
      name: 'SOFRA',
      description: 'Restaurant & Food Service',
      icon: '🍽',
      color: 'from-orange-600 to-red-600',
      features: ['Halal Certification', 'Menu Analysis', 'Inventory Management', 'Customer Experience']
    },
    {
      type: AgentType.MOSTASHAR,
      name: 'MOSTASHAR',
      description: 'Legal & Consulting',
      icon: '⚖️',
      color: 'from-purple-600 to-indigo-600',
      features: ['Sharia Compliance', 'Contract Analysis', 'Legal Research', 'Regulatory Tracking']
    }
  ];

  // Tesla frequency bands
  const frequencyBands = [
    {
      band: '3Hz' as const,
      name: '3Hz Foundation',
      description: 'Stability, grounding, and physical manifestation',
      color: 'bg-blue-600',
      traits: ['Stable', 'Reliable', 'Grounded', 'Practical']
    },
    {
      band: '6Hz' as const,
      name: '6Hz Harmony',
      description: 'Balance, creativity, and emotional intelligence',
      color: 'bg-green-600',
      traits: ['Creative', 'Balanced', 'Intuitive', 'Harmonious']
    },
    {
      band: '9Hz' as const,
      name: '9Hz Ascension',
      description: 'Higher consciousness, wisdom, and spiritual insight',
      color: 'bg-purple-600',
      traits: ['Wise', 'Insightful', 'Spiritual', 'Transcendent']
    },
    {
      band: 'custom' as const,
      name: 'Custom Frequency',
      description: 'Personalized resonance for unique alignment',
      color: 'bg-gradient-to-r from-pink-600 to-violet-600',
      traits: ['Unique', 'Personalized', 'Custom', 'Specialized']
    }
  ];

  // MENA regions
  const menaRegions = [
    { code: 'UAE', name: 'United Arab Emirates', currency: 'AED', timezone: 'GMT+4' },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', timezone: 'GMT+3' },
    { code: 'EG', name: 'Egypt', currency: 'EGP', timezone: 'GMT+2' },
    { code: 'JO', name: 'Jordan', currency: 'JOD', timezone: 'GMT+3' },
    { code: 'LB', name: 'Lebanon', currency: 'LBP', timezone: 'GMT+2' },
    { code: 'QA', name: 'Qatar', currency: 'QAR', timezone: 'GMT+3' },
    { code: 'KW', name: 'Kuwait', currency: 'KWD', timezone: 'GMT+3' },
    { code: 'BH', name: 'Bahrain', currency: 'BHD', timezone: 'GMT+3' },
    { code: 'OM', name: 'Oman', currency: 'OMR', timezone: 'GMT+4' }
  ];

  // Workflow categories
  const workflowCategories = [
    {
      id: 'islamic_finance',
      name: 'Islamic Finance',
      description: 'Sharia-compliant financial workflows',
      icon: '🕌'
    },
    {
      id: 'market_research',
      name: 'Market Research',
      description: 'MENA market analysis and insights',
      icon: '📊'
    },
    {
      id: 'religious_travel',
      name: 'Religious Travel',
      description: 'Hajj, Umrah, and spiritual journeys',
      icon: '🕋'
    },
    {
      id: 'cultural_tourism',
      name: 'Cultural Tourism',
      description: 'Heritage sites and cultural experiences',
      icon: '🏛️'
    },
    {
      id: 'halal_compliance',
      name: 'Halal Compliance',
      description: 'Food safety and certification workflows',
      icon: '🍽'
    },
    {
      id: 'islamic_law',
      name: 'Islamic Law',
      description: 'Sharia compliance and legal analysis',
      icon: '⚖️'
    }
  ];

  const createAgent = useCallback(async () => {
    setIsCreating(true);
    setCreationProgress(0);

    try {
      // Simulate progress updates
      const progressSteps = [
        { progress: 20, message: 'Validating configuration...' },
        { progress: 40, message: 'Generating Tesla frequency personality...' },
        { progress: 60, message: 'Creating Solana wallet...' },
        { progress: 80, message: 'Setting up Opal workflows...' },
        { progress: 100, message: 'Finalizing agent configuration...' }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setCreationProgress(step.progress);
      }

      // Call API to create agent
      const response = await fetch('/api/agents/create-opal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      const result: EnhancedAgentResponse = await response.json();

      if (result.success && result.agent) {
        onAgentCreated?.(result);
        setCurrentStep(totalSteps + 1); // Success step
      } else {
        onError?.(result.error || 'Agent creation failed');
      }
    } catch (error) {
      console.error('Agent creation error:', error);
      onError?.(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsCreating(false);
    }
  }, [agentData, onAgentCreated, onError]);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAgentData = (updates: Partial<EnhancedAgentCreationRequest>) => {
    setAgentData(prev => ({ ...prev, ...updates }));
  };

  // Step components
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">🧬 Choose Agent Specialization</h2>
        <p className="text-cyan-600">Select the type of agent you want to create for MENA markets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agentTypes.map((type) => (
          <button
            key={type.type}
            onClick={() => updateAgentData({ agent_type: type.type })}
            className={`p-6 rounded-xl border-2 transition-all ${
              agentData.agent_type === type.type
                ? 'border-cyan-500 bg-cyan-950 shadow-lg shadow-cyan-500/20'
                : 'border-gray-700 bg-gray-900 hover:border-cyan-700 hover:bg-gray-800'
            }`}
          >
            <div className="text-4xl mb-3">{type.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">{type.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{type.description}</p>
            <div className="flex flex-wrap gap-2">
              {type.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-800 text-cyan-400 text-xs rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">⚡ Tesla Frequency Configuration</h2>
        <p className="text-cyan-600">Choose the frequency band that aligns with your agent's purpose</p>
      </div>

      <div className="space-y-4">
        {frequencyBands.map((frequency) => (
          <button
            key={frequency.band}
            onClick={() => updateAgentData({ frequency_band: frequency.band })}
            className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
              agentData.frequency_band === frequency.band
                ? 'border-cyan-500 bg-cyan-950 shadow-lg shadow-cyan-500/20'
                : 'border-gray-700 bg-gray-900 hover:border-cyan-700 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-white">{frequency.name}</h3>
                <p className="text-gray-400 text-sm">{frequency.description}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${frequency.color}`}></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {frequency.traits.map((trait, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 text-cyan-400 text-sm rounded-full"
                >
                  {trait}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {agentData.frequency_band === 'custom' && (
        <div className="mt-6 p-6 bg-gray-900 rounded-xl border border-gray-700">
          <label className="block text-sm font-bold text-cyan-700 uppercase tracking-wider mb-2">
            Custom Frequency (Hz)
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={agentData.custom_frequency || ''}
            onChange={(e) => updateAgentData({ custom_frequency: parseFloat(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-700 focus:border-cyan-500 p-3 text-white rounded outline-none transition-colors"
            placeholder="Enter custom frequency (1-1000 Hz)"
          />
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">🎭 Agent Personality</h2>
        <p className="text-cyan-600">Define your agent's name, role, and communication style</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-cyan-700 uppercase tracking-wider mb-2">
            Agent Name
          </label>
          <input
            type="text"
            value={agentData.name}
            onChange={(e) => updateAgentData({ name: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 focus:border-cyan-500 p-3 text-white rounded outline-none transition-colors"
            placeholder="e.g., Oracle, Sage, Navigator"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-cyan-700 uppercase tracking-wider mb-2">
            Prime Directive (Role)
          </label>
          <input
            type="text"
            value={agentData.role}
            onChange={(e) => updateAgentData({ role: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 focus:border-cyan-500 p-3 text-white rounded outline-none transition-colors"
            placeholder="e.g., Market Analyst, Travel Consultant, Legal Advisor"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-cyan-700 uppercase tracking-wider mb-2">
            Energy Signature (Vibe)
          </label>
          <select
            value={agentData.vibe}
            onChange={(e) => updateAgentData({ vibe: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 focus:border-cyan-500 p-3 text-white rounded outline-none appearance-none transition-colors"
          >
            <option value="">Select vibe...</option>
            <option value="Logical/Stoic">Logical / Stoic (Blue)</option>
            <option value="Creative/Chaos">Creative / Chaos (Red)</option>
            <option value="Healer/Warm">Healer / Warm (Green)</option>
            <option value="Cyberpunk/Edgy">Cyberpunk / Edgy (Purple)</option>
            <option value="Mystical/Deep">Mystical / Deep (Gold)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">🌍 Cultural & Regional Configuration</h2>
        <p className="text-cyan-600">Configure regional adaptation and cultural context</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-cyan-700 uppercase tracking-wider mb-2">
            Region
          </label>
          <select
            value={agentData.region || ''}
            onChange={(e) => updateAgentData({ region: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 focus:border-cyan-500 p-3 text-white rounded outline-none appearance-none transition-colors"
          >
            <option value="">Select region...</option>
            {menaRegions.map((region) => (
              <option key={region.code} value={region.code}>
                {region.name} ({region.currency})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-cyan-700 uppercase tracking-wider mb-2">
            Primary Language
          </label>
          <select
            value={agentData.language || ''}
            onChange={(e) => updateAgentData({ language: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 focus:border-cyan-500 p-3 text-white rounded outline-none appearance-none transition-colors"
          >
            <option value="">Select language...</option>
            <option value="en">English</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="fr">Français (French)</option>
            <option value="ur">اردو (Urdu)</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-bold text-cyan-700 uppercase tracking-wider mb-2">
          Opal Workflow Categories
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {workflowCategories.map((category) => (
            <label
              key={category.id}
              className="flex items-center p-3 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer hover:border-cyan-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={agentData.workflow_categories?.includes(category.id) || false}
                onChange={(e) => {
                  const categories = agentData.workflow_categories || [];
                  if (e.target.checked) {
                    updateAgentData({ workflow_categories: [...categories, category.id] });
                  } else {
                    updateAgentData({ workflow_categories: categories.filter(c => c !== category.id) });
                  }
                }}
                className="mr-3 w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
              />
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="text-2xl mr-2">{category.icon}</span>
                  <span className="text-white font-medium">{category.name}</span>
                </div>
                <p className="text-gray-400 text-sm">{category.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">🔧 Advanced Configuration</h2>
        <p className="text-cyan-600">Security, privacy, and integration settings</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-cyan-700 uppercase tracking-wider mb-2">
              Security Level
            </label>
            <select
              value={agentData.security_level || 'standard'}
              onChange={(e) => updateAgentData({ security_level: e.target.value as any })}
              className="w-full bg-gray-900 border border-gray-700 focus:border-cyan-500 p-3 text-white rounded outline-none appearance-none transition-colors"
            >
              <option value="standard">Standard</option>
              <option value="enhanced">Enhanced</option>
              <option value="military">Military Grade</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-cyan-700 uppercase tracking-wider mb-2">
              Privacy Mode
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={!agentData.privacy_mode}
                  onChange={() => updateAgentData({ privacy_mode: false })}
                  className="mr-2 w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600"
                />
                <span className="text-white">Public</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={agentData.privacy_mode}
                  onChange={() => updateAgentData({ privacy_mode: true })}
                  className="mr-2 w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600"
                />
                <span className="text-white">Private</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={agentData.enable_opal_workflows}
              onChange={(e) => updateAgentData({ enable_opal_workflows: e.target.checked })}
              className="mr-3 w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded"
            />
            <div>
              <span className="text-white font-medium">Enable Opal Visual Workflows</span>
              <p className="text-gray-400 text-sm">Activate automated workflow capabilities</p>
            </div>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={agentData.enable_wallet}
              onChange={(e) => updateAgentData({ enable_wallet: e.target.checked })}
              className="mr-3 w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded"
            />
            <div>
              <span className="text-white font-medium">Enable Solana Wallet</span>
              <p className="text-gray-400 text-sm">Create blockchain wallet for economic operations</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderCreationProgress = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">🔷 Creating Opal-Enabled Agent</h2>
        <p className="text-cyan-600">Forging your AI agent with advanced capabilities</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white">Creation Progress</span>
          <span className="text-cyan-400">{creationProgress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${creationProgress}%` }}
          ></div>
        </div>

        <div className="mt-6 p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-cyan-400 mb-4">Agent Configuration Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span className="text-white">{agentData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">{agentData.agent_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Frequency:</span>
              <span className="text-white">{agentData.frequency_band}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Region:</span>
              <span className="text-white">{agentData.region || 'Global'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Opal Workflows:</span>
              <span className="text-white">{agentData.enable_opal_workflows ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Solana Wallet:</span>
              <span className="text-white">{agentData.enable_wallet ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-3xl font-bold text-green-400 mb-2">Agent Created Successfully!</h2>
      <p className="text-cyan-600 mb-6">Your Opal-enabled agent is now ready for deployment</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="text-2xl mb-2">🧬</div>
          <h3 className="text-white font-bold mb-1">Tesla Frequency</h3>
          <p className="text-cyan-400 text-sm">{agentData.frequency_band} resonance</p>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="text-2xl mb-2">🔷</div>
          <h3 className="text-white font-bold mb-1">Opal Workflows</h3>
          <p className="text-cyan-400 text-sm">{agentData.enable_opal_workflows ? 'Activated' : 'Disabled'}</p>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="text-2xl mb-2">💰</div>
          <h3 className="text-white font-bold mb-1">Solana Wallet</h3>
          <p className="text-cyan-400 text-sm">{agentData.enable_wallet ? 'Generated' : 'Not created'}</p>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all shadow-lg"
      >
        Create Another Agent
      </button>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return isCreating ? renderCreationProgress() : renderStep5();
      case 6:
        return renderSuccess();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return agentData.agent_type !== undefined;
      case 2:
        return agentData.frequency_band !== undefined;
      case 3:
        return agentData.name && agentData.role && agentData.vibe;
      case 4:
        return true; // Optional fields
      case 5:
        return true; // Advanced settings have defaults
      default:
        return false;
    }
  };

  return (
    <div className="p-6 bg-black text-cyan-500 font-mono border border-cyan-900 rounded-xl max-w-4xl mx-auto mt-10">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-cyan-400 font-bold">Step {currentStep} of {totalSteps}</span>
          <span className="text-cyan-600 text-sm">
            {currentStep === 1 && 'Agent Type'}
            {currentStep === 2 && 'Tesla Frequency'}
            {currentStep === 3 && 'Personality'}
            {currentStep === 4 && 'Cultural Settings'}
            {currentStep === 5 && 'Advanced Config'}
            {currentStep === 6 && 'Success'}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      {currentStep <= 5 && currentStep !== 6 && (
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isCreating}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            Previous
          </button>
          
          {currentStep === 5 ? (
            <button
              onClick={createAgent}
              disabled={!canProceed() || isCreating}
              className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg"
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Creating Agent...
                </span>
              ) : (
                'Create Agent'
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed() || isCreating}
              className="px-6 py-3 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}