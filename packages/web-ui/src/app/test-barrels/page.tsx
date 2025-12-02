'use client';

import React from 'react';
import {
  NeuralWorkspace,
  TheForge,
  DeadHandMonitor,
  AgentChatInterface,
  HoloAgentCard
} from '@components';

import {
  aiEngine,
  GhostCursor,
  log
} from '@lib';

import {
  AgentMessageBus,
  MapperAlgo,
  SwarmConsensusEngine,
  TOHADetector,
  ToricLattice
} from '@core';

import {
  identityService,
  DreamMemory,
  transactionExecutor,
  wsClient
} from '@services';

export default function TestBarrelsPage() {
  const testResults = {
    components: {
      NeuralWorkspace: typeof NeuralWorkspace,
      TheForge: typeof TheForge,
      DeadHandMonitor: typeof DeadHandMonitor,
      AgentChatInterface: typeof AgentChatInterface,
      HoloAgentCard: typeof HoloAgentCard
    },
    lib: {
      aiEngine: typeof aiEngine,
      GhostCursor: typeof GhostCursor,
      log: typeof log
    },
    core: {
      AgentMessageBus: typeof AgentMessageBus,
      MapperAlgo: typeof MapperAlgo,
      SwarmConsensusEngine: typeof SwarmConsensusEngine,
      TOHADetector: typeof TOHADetector,
      ToricLattice: typeof ToricLattice
    },
    services: {
      identityService: typeof identityService,
      DreamMemory: typeof DreamMemory,
      transactionExecutor: typeof transactionExecutor,
      wsClient: typeof wsClient
    }
  };

  const allTestsPassed = Object.values(testResults).every(category =>
    Object.values(category).every(type => type !== 'undefined')
  );

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">🧪 Barrel Import Test Results</h1>
        
        <div className="mb-8 text-center">
          <div className={`text-2xl font-bold ${allTestsPassed ? 'text-green-400' : 'text-red-400'}`}>
            {allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
          </div>
          <p className="text-gray-400 mt-2">Index Strategy Implementation Status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(testResults).map(([category, tests]) => (
            <div key={category} className="border border-green-800 rounded-lg p-6 bg-black/50">
              <h2 className="text-xl font-bold mb-4 text-green-300">@{category}</h2>
              <div className="space-y-2">
                {Object.entries(tests).map(([name, type]) => (
                  <div key={name} className="flex justify-between items-center">
                    <span className="text-sm">{name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      type !== 'undefined' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {type !== 'undefined' ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border border-green-800 rounded-lg p-6 bg-black/50">
          <h2 className="text-xl font-bold mb-4 text-green-300">Test Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-400">UI Components</h3>
              <div className="space-y-2">
                <div className="p-4 border border-green-800 rounded">
                  <HoloAgentCard
                    agent={{
                      name: "Test Agent",
                      role: "Test Role",
                      mission: "Test mission for barrel imports",
                      capabilities: ["Testing", "Barrel", "Imports"],
                      color: "#cd7f32",
                      icon: "Bot"
                    }}
                    onDeploy={() => console.log("Deploy test agent")}
                    onDiscard={() => console.log("Discard test agent")}
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-400">Service Status</h3>
              <div className="space-y-2 text-sm">
                <div>AI Engine: {typeof aiEngine}</div>
                <div>Logger: {typeof log}</div>
                <div>Identity Service: {typeof identityService}</div>
                <div>Dream Memory: {typeof DreamMemory}</div>
                <div>Message Bus: {typeof AgentMessageBus}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border border-green-800 rounded-lg p-6 bg-black/50">
          <h2 className="text-xl font-bold mb-4 text-green-300">Security Note</h2>
          <p className="text-gray-400">
            Arcjet, Pinecone, and Redis modules are excluded from client-side barrel exports as they require Node.js runtime environment.
            They are properly configured for server-side use and can be imported directly when needed.
          </p>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Barrel exports and path aliases are working correctly!</p>
          <p>All modules can be imported using the @components, @lib, @core, and @services aliases.</p>
        </div>
      </div>
    </div>
  );
}