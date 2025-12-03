import { db } from '../db/index';
import { syntheticDreams } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { logDreamEvent } from '../lib/logger';

// Type definitions for strict typing
export interface DreamData {
  content: string;
  title?: string;
  metadata?: Record<string, any>;
  userId: string;
  sessionId?: string;
}

export interface StoredDream {
  id: string;
  content: string;
  title: string | null;
  metadata: string | null;
  sessionId: string | null;
  userId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/**
 * Dream Memory Service
 * Handles persistence and retrieval of synthetic dreams for the Dream Factory
 */
export class DreamMemory {
  /**
   * Retrieve the last 3 dreams for a user to provide memory context
   * @param userId - The user identifier
   * @returns Promise<StoredDream[]> - Array of the user's last 3 dreams
   */
  static async getLastThreeDreams(userId: string): Promise<StoredDream[]> {
    try {
      const dreams = await db
        .select()
        .from(syntheticDreams)
        .where(eq(syntheticDreams.userId, userId))
        .orderBy(desc(syntheticDreams.createdAt))
        .limit(3);

      logDreamEvent('DreamMemory', 'Retrieved Dreams', `Found ${dreams.length} dreams for user ${userId}`);
      return dreams;
    } catch (error) {
      logDreamEvent('DreamMemory', 'Error', `Failed to retrieve dreams: ${error}`);
      console.error('DreamMemory.getLastThreeDreams error:', error);
      return []; // Return empty array for graceful degradation
    }
  }

  /**
   * Save a new dream to the database
   * @param dreamData - The dream data to save
   * @returns Promise<string | null> - The dream ID if successful, null if failed
   */
  static async saveDream(dreamData: DreamData): Promise<string | null> {
    try {
      const dreamId = nanoid();

      await db.insert(syntheticDreams).values({
        id: dreamId,
        content: dreamData.content,
        title: dreamData.title || null,
        metadata: dreamData.metadata ? JSON.stringify(dreamData.metadata) : null,
        userId: dreamData.userId,
        sessionId: dreamData.sessionId || null,
        updatedAt: new Date()
      });

      logDreamEvent('DreamMemory', 'Saved Dream', `Dream ${dreamId} saved for user ${dreamData.userId}`);
      return dreamId;
    } catch (error) {
      logDreamEvent('DreamMemory', 'Error', `Failed to save dream: ${error}`);
      console.error('DreamMemory.saveDream error:', error);
      return null; // Return null for graceful degradation
    }
  }

  /**
   * Format dreams into memory context string for AI prompt
   * @param dreams - Array of stored dreams
   * @returns string - Formatted memory context
   */
  static formatMemoryContext(dreams: StoredDream[]): string {
    if (dreams.length === 0) {
      return "Memory Context: No previous dreams found.";
    }

    const memoryContext = dreams.map((dream, index) => {
      const title = dream.title ? ` (${dream.title})` : '';
      return `[Dream ${index + 1}${title}] ${dream.content}`;
    }).join('\n');

    return `Memory Context:\n${memoryContext}`;
  }
}