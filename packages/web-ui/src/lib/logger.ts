import { Logger } from 'next-axiom';

export const log = new Logger();

// Auth Logging Structure
export const logAuthEvent = (userId: string, action: string, status: 'SUCCESS' | 'FAILURE', metadata?: any) => {
  log.info(`AUTH_EVENT: ${action}`, {
    userId,
    action,
    status,
    timestamp: new Date().toISOString(),
    ...metadata
  });
  
  // Flush immediately in serverless environments
  log.flush(); 
};

// Dream Factory Logging Structure
export const logDreamEvent = (agentName: string, step: string, contentSnippet: string) => {
  log.debug(`DREAM_Trace: ${agentName}`, {
    agent: agentName,
    step,
    preview: contentSnippet.substring(0, 100) // Truncate for efficiency
  });
  log.flush();
};
