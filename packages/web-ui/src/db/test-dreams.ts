import { db } from './index';
import { syntheticDreams, users } from './schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Test function to verify syntheticDreams table setup
export async function testSyntheticDreamsSetup() {
  console.log('🧪 Testing syntheticDreams table setup...');
  
  try {
    // Test 1: Create a test user
    const testUserId = nanoid();
    await db.insert(users).values({
      id: testUserId,
      email: `test-${testUserId}@example.com`,
      tier: 'FREE'
    });
    console.log('✅ Test user created successfully');

    // Test 2: Insert multiple test dreams
    const dreamIds = [];
    for (let i = 0; i < 5; i++) {
      const dreamId = nanoid();
      dreamIds.push(dreamId);
      
      await db.insert(syntheticDreams).values({
        id: dreamId,
        content: `Test dream ${i + 1} content`,
        title: `Dream ${i + 1}`,
        metadata: JSON.stringify({ test: true, index: i + 1 }),
        userId: testUserId,
        sessionId: `session-${nanoid()}`
      });
    }
    console.log('✅ 5 test dreams created successfully');

    // Test 3: Query the last 3 dreams (this should use our index)
    const lastThreeDreams = await db
      .select()
      .from(syntheticDreams)
      .where(eq(syntheticDreams.userId, testUserId))
      .orderBy(desc(syntheticDreams.createdAt))
      .limit(3);
    
    console.log(`✅ Successfully queried last ${lastThreeDreams.length} dreams`);
    console.log('📊 Query results:', lastThreeDreams.map(d => ({ id: d.id, title: d.title })));

    // Test 4: Query all dreams for the user
    const allUserDreams = await db
      .select()
      .from(syntheticDreams)
      .where(eq(syntheticDreams.userId, testUserId));
    
    console.log(`✅ Successfully queried all ${allUserDreams.length} dreams for user`);

    // Cleanup test data
    await db.delete(syntheticDreams).where(eq(syntheticDreams.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
    console.log('🧹 Test data cleaned up');

    console.log('🎉 All tests passed! Database setup is working correctly.');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Function to get the last 3 dreams for a user (for Dream Factory)
export async function getLastThreeDreams(userId: string) {
  return await db
    .select()
    .from(syntheticDreams)
    .where(eq(syntheticDreams.userId, userId))
    .orderBy(desc(syntheticDreams.createdAt))
    .limit(3);
}

// Function to save a new dream
export async function saveDream(dreamData: {
  content: string;
  title?: string;
  metadata?: any;
  userId: string;
  sessionId?: string;
}) {
  const dreamId = nanoid();
  
  await db.insert(syntheticDreams).values({
    id: dreamId,
    content: dreamData.content,
    title: dreamData.title,
    metadata: dreamData.metadata ? JSON.stringify(dreamData.metadata) : null,
    userId: dreamData.userId,
    sessionId: dreamData.sessionId || null,
    updatedAt: new Date()
  });
  
  return dreamId;
}