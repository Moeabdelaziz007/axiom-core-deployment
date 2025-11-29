import React, { useState, useEffect, useRef } from 'react';
import { Mic, Zap, Save, RefreshCw, Radio, cpu, Activity, Settings, Play, Square } from 'lucide-react';
import { interactWithForge, generateSpeech } from '../services/geminiService';
import { AgentRole } from '../types';

// Speech Recognition Polyfill
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const TheForge: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [forgeResponse, setForgeResponse] = useState('SYSTEM ONLINE. WAITING FOR INPUT...');
  const [blueprint, setBlueprint] = useState<any>(null);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Default, but it detects languages well enough usually

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        // Trigger processing if we have a transcript
      };
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Handle the end of speech manually to trigger API
  const stopListeningAndSend = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    handleForgeInteraction(transcript);
  };

  const handleForgeInteraction = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    setForgeResponse("ANALYZING NEURAL PATTERNS...");

    try {
      // 1. Get Logic & Speech Text
      const data = await interactWithForge(text);
      setForgeResponse(data.speech);
      if (data.blueprint) {
        setBlueprint(data.blueprint);
      }

      // 2. Generate Audio
      const audioBase64 = await generateSpeech(data.speech);
      if (audioBase64) {
        playAudio(audioBase64);
      }

    } catch (error) {
      console.error("Forge Error", error);
      setForgeResponse("ERROR: VOLTAGE SPIKE DETECTED. RE-ATTEMPT.");
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = async (base64Audio: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      // Decode
      const response = await fetch(base64Audio);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => setIsSpeaking(false);
      setIsSpeaking(true);
      source.start(0);
    } catch (e) {
      console.error("Audio Playback Error", e);
      setIsSpeaking(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListeningAndSend();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="h-full bg-[#0a0806] text-[#e0c097] flex flex-col md:flex-row relative overflow-hidden font-mono">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
         backgroundImage: 'radial-gradient(circle at 50% 50%, #cd7f32 1px, transparent 1px)',
         backgroundSize: '30px 30px'
      }}></div>
      
      {/* LEFT PANEL: INTERACTION & VISUALIZATION */}
      <div className="flex-1 p-8 flex flex-col justify-between relative z-10 border-r border-[#cd7f32]/30">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 border-2 border-[#cd7f32] rounded-full flex items-center justify-center animate-pulse">
              <Zap className="fill-[#cd7f32] text-black" size={24} />
           </div>
           <div>
              <h1 className="text-3xl font-display font-bold text-[#cd7f32] tracking-widest">THE FORGE</h1>
              <p className="text-xs text-[#cd7f32]/60 tracking-[0.2em]">TESLA-AXIOM HYBRID CORE v9.2</p>
           </div>
        </div>

        {/* The Arc Reactor (Visualizer) */}
        <div className="flex-1 flex items-center justify-center relative">
           {/* Outer Ring */}
           <div className={`w-64 h-64 rounded-full border border-[#cd7f32]/20 flex items-center justify-center relative ${isProcessing ? 'animate-spin [animation-duration:3s]' : ''}`}>
               {/* Spinning Arcs */}
               <div className="absolute inset-0 rounded-full border-t-2 border-[#cd7f32] rotate-45"></div>
               <div className="absolute inset-4 rounded-full border-b-2 border-amber-500/50 -rotate-45"></div>
               
               {/* Core */}
               <div className={`w-32 h-32 bg-black rounded-full border-4 border-[#cd7f32] flex items-center justify-center shadow-[0_0_50px_#cd7f3240] relative z-20 transition-all duration-300 ${isSpeaking ? 'scale-110 shadow-[0_0_80px_#cd7f3280]' : ''}`}>
                  <div className={`w-full h-full rounded-full opacity-50 bg-[conic-gradient(from_0deg,transparent_0deg,#cd7f32_180deg,transparent_360deg)] animate-spin [animation-duration:4s]`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Radio size={48} className={`text-[#cd7f32] ${isSpeaking ? 'animate-pulse' : 'opacity-50'}`} />
                  </div>
               </div>

               {/* Voltage Particles (Decor) */}
               {isProcessing && (
                 <>
                   <div className="absolute top-0 left-1/2 w-1 h-12 bg-amber-400 blur-[2px] animate-pulse"></div>
                   <div className="absolute bottom-0 right-1/2 w-1 h-12 bg-amber-400 blur-[2px] animate-pulse"></div>
                 </>
               )}
           </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-4">
           {/* Transcript Display */}
           <div className="h-24 bg-black/50 border border-[#cd7f32]/30 p-4 rounded text-sm overflow-y-auto font-sans relative">
              <span className="text-[#cd7f32]/50 text-xs uppercase mb-1 block">Log:</span>
              <p className="text-white/90">
                 {isListening ? transcript : forgeResponse}
                 {isListening && <span className="animate-pulse">_</span>}
              </p>
           </div>

           {/* Mic Button */}
           <div className="flex justify-center items-center gap-6">
              <button 
                onClick={toggleMic}
                className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
                  isListening 
                    ? 'border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                    : 'border-[#cd7f32] hover:bg-[#cd7f32]/10 hover:scale-105'
                }`}
              >
                {isListening ? <Square className="fill-red-500 text-red-500" /> : <Mic className="text-[#cd7f32]" />}
              </button>
              <div className="text-xs text-[#cd7f32]/50 uppercase tracking-widest text-center w-32">
                 {isListening ? 'RECORDING...' : isProcessing ? 'COMPUTING...' : isSpeaking ? 'TRANSMITTING' : 'PUSH TO TALK'}
              </div>
           </div>
        </div>

      </div>

      {/* RIGHT PANEL: BLUEPRINT OUTPUT */}
      <div className="w-full md:w-[450px] bg-black/60 backdrop-blur-md p-6 border-l border-[#cd7f32]/30 flex flex-col overflow-hidden">
         <div className="flex items-center justify-between mb-6 border-b border-[#cd7f32]/30 pb-2">
            <span className="font-display tracking-widest text-sm text-[#cd7f32]">SCHEMATIC OUTPUT</span>
            <div className="flex gap-1">
               <div className="w-2 h-2 bg-[#cd7f32] rounded-full animate-pulse"></div>
               <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
            </div>
         </div>

         {blueprint ? (
           <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar animate-fade-in-up">
              {/* Identity Chip */}
              <div className="bg-[#cd7f32]/10 border border-[#cd7f32]/40 p-4 rounded relative">
                 <div className="absolute -top-2 left-4 px-2 bg-black text-[#cd7f32] text-[10px] border border-[#cd7f32]/30">IDENTITY</div>
                 <h2 className="text-2xl font-display font-bold text-white mb-1">{blueprint.name}</h2>
                 <p className="text-xs text-[#cd7f32] uppercase tracking-wider mb-2">{blueprint.role || "CUSTOM_UNIT"}</p>
                 <p className="text-sm text-gray-400 italic">"{blueprint.description}"</p>
              </div>

              {/* DNA / Directive */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-black/40 border border-[#cd7f32]/20 rounded">
                    <span className="text-[10px] text-gray-500 block mb-1">DNA SEQUENCE</span>
                    <span className="text-xs font-mono text-[#cd7f32] break-all">{blueprint.dnaSequence || "GEN-X-000"}</span>
                 </div>
                 <div className="p-3 bg-black/40 border border-[#cd7f32]/20 rounded">
                    <span className="text-[10px] text-gray-500 block mb-1">DIRECTIVE</span>
                    <span className="text-xs font-mono text-white leading-tight">{blueprint.directive || "N/A"}</span>
                 </div>
              </div>

              {/* Tech Stack */}
              <div>
                 <span className="text-[10px] text-[#cd7f32]/60 uppercase tracking-widest mb-2 block">INTEGRATED MODULES</span>
                 <div className="flex flex-wrap gap-2">
                    {blueprint.tools?.map((tool: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-blue-900/20 border border-blue-500/30 text-blue-400 text-[10px] rounded flex items-center gap-1">
                        <Zap size={10} /> {tool}
                      </span>
                    ))}
                    {blueprint.skills?.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-[#cd7f32]/10 border border-[#cd7f32]/30 text-[#cd7f32] text-[10px] rounded flex items-center gap-1">
                        <Activity size={10} /> {skill}
                      </span>
                    ))}
                 </div>
              </div>

              {/* Action */}
              <button className="w-full py-3 bg-[#cd7f32] hover:bg-[#ff9f4d] text-black font-bold text-sm tracking-widest flex items-center justify-center gap-2 transition-colors mt-8">
                 <Save size={16} /> MINT AGENT TO CHAIN
              </button>

           </div>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-[#cd7f32]/30 border-2 border-dashed border-[#cd7f32]/10 rounded">
              <Settings size={48} className="animate-spin-slow mb-4" />
              <p className="text-sm tracking-widest">AWAITING SPECIFICATION</p>
              <p className="text-xs mt-2 opacity-50">Speak to initialize design...</p>
           </div>
         )}
      </div>
    </div>
  );
};
