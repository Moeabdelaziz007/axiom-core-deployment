import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export const DeadHandMonitor: React.FC = () => {
  const [msSinceLastHeartbeat, setMs] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMs(prev => {
        if (prev > 400) return 0; // Simulate heartbeat reset
        return prev + 50;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-2 flex items-center gap-4 bg-black/20">
       <div className={`p-2 rounded-full ${msSinceLastHeartbeat < 200 ? 'text-matrix bg-matrix/10' : 'text-alert bg-alert/10'}`}>
          <ShieldAlert size={16} />
       </div>
       <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-display tracking-widest">DEAD HAND PROTOCOL</span>
          <div className="flex items-center gap-2">
            <div className="text-xs font-mono text-white">
                HEARTBEAT: <span className={msSinceLastHeartbeat < 200 ? 'text-matrix' : 'text-alert'}>{msSinceLastHeartbeat}ms</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${msSinceLastHeartbeat < 200 ? 'bg-matrix' : 'bg-alert'}`}></div>
          </div>
       </div>
    </div>
  );
};
