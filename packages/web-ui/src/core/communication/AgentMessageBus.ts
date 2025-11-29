export interface AgentMessage {
  id: string;
  senderId: string;
  channel: 'GLOBAL' | 'MARKET' | 'OPS' | 'SECURITY';
  content: string;
  timestamp: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class AgentMessageBus {
  private messages: AgentMessage[] = [];
  private listeners: ((message: AgentMessage) => void)[] = [];

  publish(message: Omit<AgentMessage, 'id' | 'timestamp'>) {
    const fullMessage: AgentMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    this.messages.push(fullMessage);
    
    // Keep history limited
    if (this.messages.length > 100) {
      this.messages.shift();
    }

    this.notify(fullMessage);
    console.log(`📨 [${fullMessage.channel}] ${fullMessage.senderId}: ${fullMessage.content}`);
  }

  subscribe(listener: (message: AgentMessage) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(message: AgentMessage) {
    this.listeners.forEach(l => l(message));
  }

  getHistory(channel?: AgentMessage['channel']): AgentMessage[] {
    if (channel) {
      return this.messages.filter(m => m.channel === channel);
    }
    return this.messages;
  }
}

export const messageBus = new AgentMessageBus();
