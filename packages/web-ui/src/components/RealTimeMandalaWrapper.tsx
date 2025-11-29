'use client';

import React, { useEffect, useState } from 'react';
import { wsClient } from '../services/WebSocketClient';
import AxiomDigitalMandala from './AxiomDigitalMandala';

export default function RealTimeMandalaWrapper() {
  const [state, setState] = useState<{ state: 'IDLE' | 'THINKING' | 'EVOLVING', xp: number }>({
    state: 'IDLE',
    xp: 0
  });

  useEffect(() => {
    const unsubscribe = wsClient.subscribe((event) => {
      if (event.type === 'MANDALA_UPDATE') {
        setState(event.payload);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AxiomDigitalMandala 
      agentState={state.state}
      xp={state.xp}
      level={1} // Simplified for now
    />
  );
}
