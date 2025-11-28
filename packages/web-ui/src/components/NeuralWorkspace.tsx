import React from 'react';
import { motion } from 'framer-motion';

const NeuralWorkspace = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-xl p-8">
      <div className="text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl mb-4"
        >
          🧠
        </motion.div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">Neural Workspace</h2>
        <p className="text-cyan-600/60">
          Advanced cognitive environment initializing...
        </p>
      </div>
    </div>
  );
};

export default NeuralWorkspace;
