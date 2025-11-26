'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SystemReport } from '@/infra/agents/sentinel/SentinelDebugAgent';

export default function DiagnosticsPage() {
  const [report, setReport] = useState<SystemReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRawData, setShowRawData] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const runDiagnostic = async () => {
    setLoading(true);
    setScanProgress(0);
    setReport(null);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      const response = await fetch('/api/diagnostics');
      const data = await response.json();

      clearInterval(interval);
      setScanProgress(100);

      if (data.success) {
        // Add a small delay to show 100%
        setTimeout(() => {
          setReport(data.data);
          setLoading(false);
        }, 500);
      } else {
        console.error('Diagnostic failed:', data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to run diagnostic:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'CRITICAL': return 'text-red-500 border-red-500 shadow-red-500/50';
      case 'WARNING': return 'text-yellow-400 border-yellow-400 shadow-yellow-400/50';
      case 'GREEN': return 'text-green-500 border-green-500 shadow-green-500/50';
      default: return 'text-cyan-500 border-cyan-500 shadow-cyan-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-black text-cyan-500 font-mono p-8 overflow-hidden relative">
      {/* Background Grid & Scanlines */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-30">
        {/* Header */}
        <header className="flex justify-between items-end mb-12 border-b border-cyan-900/50 pb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
              SENTINEL DIAGNOSTICS
            </h1>
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-700">
              System Integrity Monitor v1.2.0
            </div>
          </div>
          <button
            onClick={runDiagnostic}
            disabled={loading}
            className={`px-6 py-2 border border-cyan-500/50 hover:bg-cyan-500/10 transition-all uppercase text-xs tracking-widest ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Scanning...' : 'Rerun Scan'}
          </button>
        </header>

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[60vh] space-y-8"
            >
              <div className="w-64 h-64 relative flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 border-4 border-cyan-900 rounded-full"
                />
                <motion.div
                  className="absolute inset-0 border-t-4 border-cyan-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="text-4xl font-bold">{Math.round(scanProgress)}%</div>
              </div>
              <div className="text-cyan-700 animate-pulse uppercase tracking-widest">
                Analyzing System Vectors...
              </div>
            </motion.div>
          ) : report ? (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Main Status Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Health Status Card */}
                <div className={`p-8 border-2 bg-black/50 backdrop-blur-sm relative overflow-hidden group ${getHealthColor(report.overallHealth)}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-20 text-9xl font-black select-none pointer-events-none">
                    {report.overallHealth}
                  </div>
                  <h2 className="text-sm uppercase tracking-widest mb-2 opacity-70">Overall System Health</h2>
                  <div className="text-6xl font-black tracking-tighter mb-6 relative z-10">
                    {report.overallHealth}
                  </div>
                  <p className="text-lg leading-relaxed text-white/90 border-l-4 border-current pl-4">
                    {report.summary}
                  </p>
                </div>

                {/* Root Cause Analysis */}
                <div className="p-8 border border-cyan-900/50 bg-black/30 backdrop-blur-sm">
                  <h3 className="text-cyan-400 text-sm uppercase tracking-widest mb-4 flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse" />
                    Root Cause Analysis
                  </h3>
                  <p className="text-white/80 leading-relaxed font-light">
                    {report.rootCauseAnalysis}
                  </p>
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-cyan-400 text-sm uppercase tracking-widest">
                    Strategic Recommendations
                  </h3>
                  {report.recommendations.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 border border-cyan-900/30 bg-cyan-900/5 hover:bg-cyan-900/10 transition-colors flex items-start space-x-4"
                    >
                      <span className="text-cyan-500 font-bold">0{i + 1}</span>
                      <span className="text-white/90">{rec}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sidebar: Metrics & Raw Data */}
              <div className="space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <MetricCard
                    label="Active Alerts"
                    value={report.rawDataSnapshot.alerts}
                    unit="Count"
                    status={report.rawDataSnapshot.alerts > 0 ? 'warning' : 'good'}
                  />
                  <MetricCard
                    label="Avg Latency"
                    value={report.rawDataSnapshot.avgLatency}
                    unit="ms"
                    status={report.rawDataSnapshot.avgLatency > 200 ? 'warning' : 'good'}
                  />
                  <MetricCard
                    label="Security Score"
                    value={report.rawDataSnapshot.securityScore}
                    unit="/ 10"
                    status={report.rawDataSnapshot.securityScore < 8 ? 'critical' : 'good'}
                  />
                  <MetricCard
                    label="Validation"
                    value={report.rawDataSnapshot.validationStatus}
                    unit="Status"
                    status={report.rawDataSnapshot.validationStatus === 'FAIL' ? 'critical' : 'good'}
                  />
                </div>

                {/* Raw Data Toggle */}
                <div className="border-t border-cyan-900/50 pt-8">
                  <button
                    onClick={() => setShowRawData(!showRawData)}
                    className="text-xs uppercase tracking-widest text-cyan-600 hover:text-cyan-400 transition-colors flex items-center space-x-2"
                  >
                    <span>{showRawData ? 'Hide' : 'Show'} Raw Data Stream</span>
                    <span className={`transform transition-transform ${showRawData ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  <AnimatePresence>
                    {showRawData && (
                      <motion.pre
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 p-4 bg-black border border-cyan-900/30 text-[10px] text-cyan-700 overflow-x-auto"
                      >
                        {JSON.stringify(report, null, 2)}
                      </motion.pre>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

const MetricCard = ({ label, value, unit, status }: { label: string, value: string | number, unit: string, status: 'good' | 'warning' | 'critical' }) => {
  const getColor = () => {
    switch (status) {
      case 'critical': return 'text-red-500 border-red-900/30 bg-red-900/10';
      case 'warning': return 'text-yellow-400 border-yellow-900/30 bg-yellow-900/10';
      default: return 'text-cyan-400 border-cyan-900/30 bg-cyan-900/10';
    }
  };

  return (
    <div className={`p-4 border rounded ${getColor()} flex justify-between items-center`}>
      <span className="text-xs uppercase tracking-widest opacity-70">{label}</span>
      <div className="text-right">
        <span className="text-xl font-bold font-mono">{value}</span>
        <span className="text-[10px] ml-1 opacity-50">{unit}</span>
      </div>
    </div>
  );
};