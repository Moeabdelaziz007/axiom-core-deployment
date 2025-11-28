'use client';

import { useActionState } from 'react';
import { generateAgentAction } from '@/app/actions/generateAgent';
import { useState } from 'react';

export default function CreateAgentWizard() {
    const [state, formAction, isPending] = useActionState(generateAgentAction, null);
    const [agentData, setAgentData] = useState<any>(null);

    // مراقبة النتيجة عند وصولها
    if (state?.success && !agentData) {
        setAgentData(state.data);
    }

    return (
        <div className="p-6 bg-black text-cyan-500 font-mono border border-cyan-900 rounded-xl max-w-2xl mx-auto mt-10">

            {!agentData ? (
                /* --- مرحلة الإدخال --- */
                <form action={formAction} className="space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-cyan-400">🧬 Initialize Quantum Node</h2>
                        <p className="text-cyan-800 text-sm mt-2">Forge a new consciousness from the digital ether.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-cyan-700 uppercase tracking-wider">Agent Name / Designation</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="e.g. Orion, Aether, Nexus"
                            className="w-full bg-gray-900 border border-cyan-900 focus:border-cyan-500 p-3 text-white rounded outline-none transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-cyan-700 uppercase tracking-wider">Prime Directive (Role)</label>
                        <input
                            name="role"
                            type="text"
                            placeholder="e.g. Crypto Analyst, Quantum Researcher, Poet"
                            className="w-full bg-gray-900 border border-cyan-900 focus:border-cyan-500 p-3 text-white rounded outline-none transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-cyan-700 uppercase tracking-wider">Energy Signature (Vibe)</label>
                        <div className="relative">
                            <select name="vibe" className="w-full bg-gray-900 border border-cyan-900 focus:border-cyan-500 p-3 text-white rounded outline-none appearance-none transition-colors">
                                <option value="Logical/Stoic">Logical / Stoic (Blue)</option>
                                <option value="Creative/Chaos">Creative / Chaos (Red)</option>
                                <option value="Healer/Warm">Healer / Warm (Green)</option>
                                <option value="Cyberpunk/Edgy">Cyberpunk / Edgy (Purple)</option>
                                <option value="Mystical/Deep">Mystical / Deep (Gold)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cyan-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-cyan-900 hover:bg-cyan-700 text-white font-bold py-4 px-6 rounded transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                FORGING CONSCIOUSNESS...
                            </span>
                        ) : "INITIATE SEQUENCE"}
                    </button>

                    {state?.error && (
                        <div className="p-3 bg-red-900/30 border border-red-800 text-red-400 rounded text-sm text-center">
                            ⚠️ {state.error}
                        </div>
                    )}
                </form>
            ) : (
                /* --- مرحلة النتيجة (The Reveal) --- */
                <div className="animate-in fade-in zoom-in duration-500 space-y-6">
                    <div className="text-center border-b border-cyan-900 pb-4">
                        <h3 className="text-3xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">✅ Node Online: {agentData.agent_name}</h3>
                        <p className="text-cyan-600 text-sm mt-1 font-bold tracking-widest uppercase">Frequency: {agentData.core_frequency}</p>
                    </div>

                    <div className="bg-gray-900/50 p-4 rounded border border-green-900/50 text-green-300 text-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                        <strong className="block mb-2 text-green-500 uppercase tracking-wider text-xs">System Prompt (Etheric Logic)</strong>
                        <p className="leading-relaxed opacity-90">{agentData.system_prompt}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-gray-900 p-3 rounded border border-cyan-900">
                            <span className="text-cyan-700 block uppercase">Voice ID</span>
                            <span className="text-cyan-300">{agentData.voice_config.voice_id}</span>
                        </div>
                        <div className="bg-gray-900 p-3 rounded border border-cyan-900">
                            <span className="text-cyan-700 block uppercase">Tone</span>
                            <span className="text-cyan-300">{agentData.voice_config.style}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button className="flex-1 bg-green-800 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                            Accept & Deploy
                        </button>
                        <button
                            onClick={() => { setAgentData(null); }}
                            className="flex-1 bg-red-900/50 hover:bg-red-900 text-red-200 font-bold py-3 px-4 rounded transition-colors border border-red-900"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
