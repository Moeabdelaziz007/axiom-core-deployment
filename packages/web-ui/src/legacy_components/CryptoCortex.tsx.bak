import React from 'react';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const CryptoCortex: React.FC = () => {
  return (
    <div className="flex items-center gap-6 px-4 py-2 border-r border-gray-800 bg-black/20">
      
      {/* Wallet Info */}
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-gray-500 font-display tracking-widest">SOL BALANCE</span>
        <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-sans text-white tracking-tighter">420.69</span>
            <span className="text-xs text-matrix font-bold">SOL</span>
        </div>
      </div>

      {/* Mini Visualizer */}
      <div className="h-8 w-24 flex items-end gap-0.5 opacity-50">
         {[40, 60, 30, 80, 50, 90, 20, 45, 70, 60].map((h, i) => (
             <div key={i} className="flex-1 bg-matrix" style={{ height: `${h}%` }}></div>
         ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
         <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-sm text-neon transition-colors" title="Deposit">
            <ArrowDownLeft size={16} />
         </button>
         <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-sm text-alert transition-colors" title="Withdraw">
            <ArrowUpRight size={16} />
         </button>
         <button className="p-2 bg-neon/10 hover:bg-neon/20 border border-neon/30 text-neon rounded-sm transition-colors flex items-center gap-2">
             <Wallet size={16} />
             <span className="text-xs font-bold hidden xl:inline">CONNECT</span>
         </button>
      </div>
    </div>
  );
};
