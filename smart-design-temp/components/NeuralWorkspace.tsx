import React, { useState, useEffect, useRef } from 'react';
import { Agent, KitType, ExpansionKit, KnowledgeSource } from '../types';
import { 
  Cpu, Database, Code, ShoppingBag, Upload, FileText, 
  Play, Mic, MessageSquare, Zap, Shield, Globe, 
  CreditCard, Gift, Sun, Search, X, Check, Copy
} from 'lucide-react';
import { generateSynapseConfig, getVoiceAgentResponse, generateSpeech } from '../services/geminiService';

// Speech Polyfill
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const AVAILABLE_KITS: ExpansionKit[] = [
  { id: KitType.VOX, name: 'Vox', description: 'Holographic Voice Interface', price: 0.99, icon: 'Mic', installed: false },
  { id: KitType.LENS, name: 'Lens', description: 'Contextual Highlight Explainer', price: 0.99, icon: 'Search', installed: false },
  { id: KitType.FORM, name: 'Form', description: 'Voice Autofill Assistant', price: 0.99, icon: 'FileText', installed: false },
  { id: KitType.TAJER, name: 'Tajer', description: 'Smart Product Recommendations', price: 0.99, icon: 'ShoppingBag', installed: false },
  { id: KitType.HAGGLE, name: 'Haggle', description: 'Negotiation Engine', price: 0.99, icon: 'CreditCard', installed: false },
  { id: KitType.GUARD, name: 'Guard', description: 'Toxic Content Filter', price: 0.99, icon: 'Shield', installed: false },
  { id: KitType.LOCAL, name: 'Local', description: 'Dialect Rewriter', price: 0.99, icon: 'Globe', installed: false },
  { id: KitType.BRIEF, name: 'Brief', description: 'TL;DR Generator', price: 0.99, icon: 'Zap', installed: false },
  { id: KitType.GIFT, name: 'Gift', description: 'Social Gifting Logistics', price: 0.99, icon: 'Gift', installed: false },
  { id: KitType.COD, name: 'COD', description: 'Cash on Delivery Verifier', price: 0.99, icon: 'Check', installed: false },
  { id: KitType.SOCIAL, name: 'Social', description: 'TikTok/IG Trend Proof', price: 0.99, icon: 'MessageSquare', installed: false },
  { id: KitType.RAMADAN, name: 'Ramadan', description: 'Seasonal Site Transform', price: 0.99, icon: 'Sun', installed: false },
];

interface NeuralWorkspaceProps {
  agent: Agent;
  onClose: () => void;
}

export const NeuralWorkspace: React.FC<NeuralWorkspaceProps> = ({ agent, onClose }) => {
  const [activeTab, setActiveTab] = useState<'CORTEX' | 'CORE' | 'SYNAPSE' | 'KITS'>('CORE');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeSource[]>([
    { id: '1', name: 'company_guidelines.pdf', type: 'PDF', size: '2.4MB', status: 'synced' },
    { id: '2', name: 'product_catalog.json', type: 'URL', size: '156KB', status: 'synced' }
  ]);
  const [synapseCode, setSynapseCode] = useState<string | null>(null);
  const [installedKits, setInstalledKits] = useState<KitType[]>([]);
  
  // Simulation State
  const [simInput, setSimInput] = useState('');
  const [simMessages, setSimMessages] = useState<{role: string, text: string}[]>([
      { role: 'model', text: `Agent ${agent.name} initialized. How can I assist?` }
  ]);
  
  // Vox Orb State
  const [isVoxActive, setIsVoxActive] = useState(false);
  const [orbState, setOrbState] = useState<'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'>('IDLE');
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Speech
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => setOrbState('LISTENING');
      recognition.onend = () => {
         // Logic handled in result
      };
      recognition.onresult = async (event: any) => {
         const text = event.results[0][0].transcript;
         setOrbState('THINKING');
         await handleVoiceInteraction(text);
      };
      recognitionRef.current = recognition;
    }
  }, [agent]);

  const handleVoiceInteraction = async (text: string) => {
      // 1. Get Text Response
      const responseText = await getVoiceAgentResponse(text, agent.name, agent.role);
      
      // 2. TTS
      setOrbState('SPEAKING');
      const audioData = await generateSpeech(responseText);
      
      if (audioData) {
          await playAudio(audioData);
      } else {
          setOrbState('IDLE');
      }
  };

  const playAudio = async (base64: string) => {
      if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const response = await fetch(base64);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setOrbState('IDLE');
      source.start(0);
  };

  const toggleVox = () => {
      if (orbState === 'IDLE') {
          recognitionRef.current?.start();
      } else {
          recognitionRef.current?.stop();
          setOrbState('IDLE');
      }
  };

  const handleInstallKit = (kitId: KitType) => {
      if (!installedKits.includes(kitId)) {
          setInstalledKits([...installedKits, kitId]);
      }
  };

  const generateCode = async () => {
      const code = await generateSynapseConfig(agent, installedKits);
      setSynapseCode(code);
  };

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col animate-fade-in font-sans">
        
        {/* Workspace Header */}
        <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-neon/50">
                    <img src={agent.image} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h2 className="text-white font-display font-bold text-lg">{agent.name} <span className="text-gray-500 font-sans font-normal text-sm">/ {agent.role}</span></h2>
                    <div className="flex gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
                        <span>WORKSPACE ACTIVE</span>
                        <span className="text-matrix">ONLINE</span>
                    </div>
                </div>
            </div>
            
            <nav className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-gray-800">
                <button onClick={() => setActiveTab('CORTEX')} className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'CORTEX' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`}>CORTEX</button>
                <button onClick={() => setActiveTab('CORE')} className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'CORE' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`}>CORE</button>
                <button onClick={() => setActiveTab('KITS')} className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'KITS' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`}>KITS</button>
                <button onClick={() => setActiveTab('SYNAPSE')} className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'SYNAPSE' ? 'bg-neon text-black' : 'text-gray-500 hover:text-white'}`}>SYNAPSE</button>
            </nav>

            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white">
                <X size={20} />
            </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative bg-gradient-to-br from-black to-gray-900">
            
            {/* --- CORTEX TAB (Knowledge) --- */}
            {activeTab === 'CORTEX' && (
                <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
                    <h3 className="text-2xl font-display text-white mb-6">Neural Knowledge Base</h3>
                    
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-800 rounded-xl p-12 flex flex-col items-center justify-center text-gray-500 hover:border-neon/50 hover:bg-neon/5 transition-all cursor-pointer mb-8">
                        <Upload size={48} className="mb-4 text-gray-700" />
                        <p className="text-lg text-gray-300">Drag & Drop Knowledge Files</p>
                        <p className="text-sm mt-2">PDF, TXT, CSV, or Website URLs</p>
                    </div>

                    {/* File List */}
                    <div className="space-y-3">
                        {knowledgeBase.map(file => (
                            <div key={file.id} className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between border border-gray-700/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-gray-900 rounded">
                                        {file.type === 'PDF' ? <FileText size={20} className="text-red-400" /> : <Globe size={20} className="text-blue-400" />}
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-medium">{file.name}</div>
                                        <div className="text-xs text-gray-500">{file.size} • {file.type}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-matrix text-xs font-mono uppercase">
                                    <Check size={14} /> Synced
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- CORE TAB (Simulation) --- */}
            {activeTab === 'CORE' && (
                <div className="h-full flex flex-col relative">
                    {/* Vox Toggle */}
                    <div className="absolute top-4 right-4 z-20">
                         <button 
                            onClick={() => setIsVoxActive(!isVoxActive)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isVoxActive ? 'bg-neon/20 border-neon text-neon' : 'bg-black/50 border-gray-700 text-gray-400'}`}
                         >
                            <Mic size={16} />
                            <span className="text-xs font-bold">VOX MODE</span>
                         </button>
                    </div>

                    {isVoxActive ? (
                        /* VOX ORB INTERFACE */
                        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-80"></div>
                             
                             {/* The Orb */}
                             <div className="relative z-10 w-64 h-64 flex items-center justify-center">
                                 <div className={`absolute inset-0 rounded-full plasma-orb ${orbState === 'SPEAKING' ? 'animate-pulse-fast' : 'animate-orb-breathe'}`}></div>
                                 <div className={`absolute w-32 h-32 rounded-full plasma-core ${orbState === 'THINKING' ? 'animate-spin' : ''}`}></div>
                                 
                                 <button 
                                    onClick={toggleVox}
                                    className="relative z-20 w-20 h-20 rounded-full bg-black border border-neon/30 flex items-center justify-center hover:scale-110 transition-transform"
                                 >
                                     <Mic size={32} className={orbState === 'LISTENING' ? 'text-alert' : 'text-neon'} />
                                 </button>
                             </div>

                             <div className="mt-12 text-center z-10">
                                 <h2 className="text-2xl font-display text-white tracking-widest mb-2">{orbState}</h2>
                                 <p className="text-gray-500 text-sm font-mono">Listening on Channel 1...</p>
                             </div>
                        </div>
                    ) : (
                        /* CHAT INTERFACE */
                        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full pt-8">
                             <div className="flex-1 overflow-y-auto space-y-4 px-4 pb-4 scrollbar-hide">
                                 {simMessages.map((msg, idx) => (
                                     <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                         <div className={`max-w-[80%] p-4 rounded-xl ${msg.role === 'user' ? 'bg-neon/10 text-neon border border-neon/20' : 'bg-gray-800 text-gray-200 border border-gray-700'}`}>
                                             {msg.text}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                             <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                                 <div className="flex gap-2">
                                     <input 
                                       className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-neon outline-none" 
                                       placeholder="Test your agent..."
                                       value={simInput}
                                       onChange={(e) => setSimInput(e.target.value)}
                                       onKeyDown={(e) => {
                                           if (e.key === 'Enter') {
                                               setSimMessages([...simMessages, { role: 'user', text: simInput }]);
                                               setSimInput('');
                                               setTimeout(() => {
                                                   setSimMessages(prev => [...prev, { role: 'model', text: `Simulated response from ${agent.name}...` }]);
                                               }, 1000);
                                           }
                                       }}
                                     />
                                     <button className="bg-neon text-black p-3 rounded-lg font-bold">
                                         <Play size={20} />
                                     </button>
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- KITS TAB (Marketplace) --- */}
            {activeTab === 'KITS' && (
                <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h3 className="text-3xl font-display text-white mb-2">Synapse Expansion Packs</h3>
                            <p className="text-gray-400">Upgrade your agent with specialized micro-modules. $0.99/mo each.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {AVAILABLE_KITS.map(kit => (
                                <div key={kit.id} className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:border-neon/50 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                        {installedKits.includes(kit.id) ? <Check className="text-matrix" /> : <div className="text-xs font-bold text-gray-500">$0.99/mo</div>}
                                    </div>
                                    
                                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 text-neon group-hover:scale-110 transition-transform">
                                        {kit.icon === 'Mic' && <Mic />}
                                        {kit.icon === 'Search' && <Search />}
                                        {kit.icon === 'FileText' && <FileText />}
                                        {kit.icon === 'ShoppingBag' && <ShoppingBag />}
                                        {kit.icon === 'CreditCard' && <CreditCard />}
                                        {kit.icon === 'Shield' && <Shield />}
                                        {kit.icon === 'Globe' && <Globe />}
                                        {kit.icon === 'Zap' && <Zap />}
                                        {kit.icon === 'Gift' && <Gift />}
                                        {kit.icon === 'Check' && <Check />}
                                        {kit.icon === 'MessageSquare' && <MessageSquare />}
                                        {kit.icon === 'Sun' && <Sun />}
                                    </div>

                                    <h4 className="text-white font-bold text-lg mb-1">{kit.name}</h4>
                                    <p className="text-gray-400 text-sm h-10 mb-4">{kit.description}</p>

                                    <button 
                                        onClick={() => handleInstallKit(kit.id)}
                                        disabled={installedKits.includes(kit.id)}
                                        className={`w-full py-2 rounded font-bold text-sm border transition-colors ${installedKits.includes(kit.id) ? 'bg-matrix/10 border-matrix text-matrix cursor-default' : 'bg-transparent border-gray-600 text-gray-300 hover:border-neon hover:text-white'}`}
                                    >
                                        {installedKits.includes(kit.id) ? 'INSTALLED' : 'ADD TO AGENT'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- SYNAPSE TAB (Deployment) --- */}
            {activeTab === 'SYNAPSE' && (
                <div className="p-8 max-w-4xl mx-auto h-full flex flex-col items-center justify-center">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-neon/10 rounded-full mb-4">
                            <Code size={32} className="text-neon" />
                        </div>
                        <h3 className="text-3xl font-display text-white mb-2">Deploy {agent.name}</h3>
                        <p className="text-gray-400">Copy this code snippet and paste it before the <code className="bg-gray-800 px-1 rounded">&lt;/body&gt;</code> tag of your website.</p>
                    </div>

                    {!synapseCode ? (
                        <button 
                            onClick={generateCode}
                            className="bg-neon text-black px-8 py-4 rounded font-bold font-display text-lg hover:bg-white transition-colors flex items-center gap-3"
                        >
                            <Zap size={20} /> GENERATE SDK SNIPPET
                        </button>
                    ) : (
                        <div className="w-full max-w-2xl bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                            <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                                <span className="text-xs text-gray-500 font-mono">synapse_config.js</span>
                                <button className="flex items-center gap-1 text-xs text-neon hover:text-white">
                                    <Copy size={12} /> COPY
                                </button>
                            </div>
                            <pre className="p-6 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                {synapseCode}
                            </pre>
                        </div>
                    )}
                </div>
            )}

        </main>
    </div>
  );
};