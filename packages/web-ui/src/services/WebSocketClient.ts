type WebSocketEvent = {
  type: 'DIAGNOSTIC' | 'MANDALA_UPDATE' | 'LLM_TOKEN';
  payload: any;
};

type Listener = (event: WebSocketEvent) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Listener[] = [];
  private url: string;

  constructor(url: string = 'ws://localhost:8080') {
    this.url = url;
  }

  connect() {
    console.log('🔌 Connecting to WebSocket:', this.url);
    // In a real scenario: this.socket = new WebSocket(this.url);
    
    // Mock Simulation
    setInterval(() => {
      this.mockIncomingData();
    }, 3000);
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(event: WebSocketEvent) {
    this.listeners.forEach(l => l(event));
  }

  private mockIncomingData() {
    const types: WebSocketEvent['type'][] = ['DIAGNOSTIC', 'MANDALA_UPDATE', 'LLM_TOKEN'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    let payload;
    if (randomType === 'DIAGNOSTIC') {
      payload = { cpu: Math.random() * 100, memory: Math.random() * 16000 };
    } else if (randomType === 'MANDALA_UPDATE') {
      payload = { state: Math.random() > 0.5 ? 'EVOLVING' : 'IDLE', xp: Math.floor(Math.random() * 100) };
    } else {
      payload = { token: ' ' + ['AI', 'is', 'evolving', 'rapidly', 'now'][Math.floor(Math.random() * 5)] };
    }

    this.notify({ type: randomType, payload });
  }
}

export const wsClient = new WebSocketClient();
