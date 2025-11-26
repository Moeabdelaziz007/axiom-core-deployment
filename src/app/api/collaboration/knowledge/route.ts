/**
 * 🕸️ SWARM PROTOCOL - Knowledge API
 * 
 * API endpoints for managing collaborative knowledge base
 * Provides CRUD operations for knowledge sharing and learning
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
// import { D1Database } from '@cloudflare/workers-types';

// Mock database for development - replace with actual D1 in production
let mockKnowledge = [
  {
    id: 'knowledge-1',
    title: 'Advanced Negotiation Techniques',
    type: 'skill' as const,
    contributor: 'tajer',
    quality: 92,
    usefulness: 88,
    content: 'Comprehensive guide on advanced negotiation strategies for real estate deals, including psychological tactics and market leverage points.',
    tags: ['negotiation', 'real-estate', 'business'],
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'knowledge-2',
    title: 'Property Market Analysis Framework',
    type: 'experience' as const,
    contributor: 'aqar',
    quality: 87,
    usefulness: 91,
    content: 'Systematic approach to analyzing property markets using data-driven methodologies and predictive modeling.',
    tags: ['analysis', 'market', 'data', 'prediction'],
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'knowledge-3',
    title: 'Optimal Scheduling Algorithms',
    type: 'pattern' as const,
    contributor: 'mawid',
    quality: 85,
    usefulness: 79,
    content: 'Mathematical models for optimal resource scheduling and time management in complex systems.',
    tags: ['scheduling', 'optimization', 'algorithms'],
    verified: false,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 'knowledge-4',
    title: 'Customer Experience Optimization',
    type: 'solution' as const,
    contributor: 'sofra',
    quality: 90,
    usefulness: 85,
    content: 'Framework for improving customer satisfaction through service design and feedback integration.',
    tags: ['customer', 'experience', 'optimization', 'service'],
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const contributor = searchParams.get('contributor');
    const verified = searchParams.get('verified');

    let filteredKnowledge = [...mockKnowledge];

    // Apply filters
    if (type) {
      filteredKnowledge = filteredKnowledge.filter(knowledge => knowledge.type === type);
    }
    if (contributor) {
      filteredKnowledge = filteredKnowledge.filter(knowledge => knowledge.contributor === contributor);
    }
    if (verified !== null) {
      const isVerified = verified === 'true';
      filteredKnowledge = filteredKnowledge.filter(knowledge => knowledge.verified === isVerified);
    }

    // In production, this would query the D1 database
    // const db = (request as any).env.DB as D1Database;
    // let query = 'SELECT * FROM collaboration_knowledge';
    // const params: any[] = [];
    // 
    // if (type) {
    //   query += ' WHERE type = ?';
    //   params.push(type);
    // }
    // 
    // const knowledge = await db.prepare(query).bind(...params).all();

    return NextResponse.json({
      success: true,
      knowledge: filteredKnowledge
    });
  } catch (error) {
    console.error('Failed to fetch knowledge:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch knowledge' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      type,
      content,
      contributor,
      tags = [],
      quality = 80,
      usefulness = 80
    } = body;

    // Validate required fields
    if (!title || !type || !content || !contributor) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new knowledge entry
    const newKnowledge = {
      id: `knowledge-${Date.now()}`,
      title,
      type,
      content,
      contributor,
      tags: Array.isArray(tags) ? tags : [tags],
      quality,
      usefulness,
      verified: false, // New entries start as unverified
      createdAt: new Date().toISOString()
    };

    // In production, this would insert into D1 database
    // const db = (request as any).env.DB as D1Database;
    // await db.prepare(`
    //   INSERT INTO collaboration_knowledge 
    //   (id, title, type, content, contributor, tags, quality, usefulness, verified, created_at)
    //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `).bind(
    //   newKnowledge.id,
    //   newKnowledge.title,
    //   newKnowledge.type,
    //   newKnowledge.content,
    //   JSON.stringify(newKnowledge.tags),
    //   newKnowledge.quality,
    //   newKnowledge.usefulness,
    //   newKnowledge.verified,
    //   newKnowledge.createdAt
    // ).run();

    // Add to mock data for development
    mockKnowledge.unshift(newKnowledge);

    return NextResponse.json({
      success: true,
      knowledge: newKnowledge
    });
  } catch (error) {
    console.error('Failed to create knowledge entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create knowledge entry' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { knowledgeId, updates } = body;

    // Validate required fields
    if (!knowledgeId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find and update knowledge entry
    const knowledgeIndex = mockKnowledge.findIndex(knowledge => knowledge.id === knowledgeId);
    if (knowledgeIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Knowledge entry not found' },
        { status: 404 }
      );
    }

    const updatedKnowledge = {
      ...mockKnowledge[knowledgeIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    mockKnowledge[knowledgeIndex] = updatedKnowledge;

    // In production, this would update in D1 database
    // const db = (request as any).env.DB as D1Database;
    // await db.prepare(`
    //   UPDATE collaboration_knowledge 
    //   SET quality = ?, usefulness = ?, verified = ?, updated_at = ?
    //   WHERE id = ?
    // `).bind(
    //   updates.quality,
    //   updates.usefulness,
    //   updates.verified,
    //   new Date().toISOString(),
    //   knowledgeId
    // ).run();

    return NextResponse.json({
      success: true,
      knowledge: updatedKnowledge
    });
  } catch (error) {
    console.error('Failed to update knowledge entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update knowledge entry' },
      { status: 500 }
    );
  }
}

export async function RATE(request: NextRequest) {
  try {
    const body = await request.json();
    const { knowledgeId, rating } = body;

    // Validate required fields
    if (!knowledgeId || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find knowledge entry
    const knowledgeIndex = mockKnowledge.findIndex(knowledge => knowledge.id === knowledgeId);
    if (knowledgeIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Knowledge entry not found' },
        { status: 404 }
      );
    }

    // Update quality and usefulness based on rating
    const currentKnowledge = mockKnowledge[knowledgeIndex];
    const updatedKnowledge = {
      ...currentKnowledge,
      quality: Math.round((currentKnowledge.quality + rating.quality) / 2),
      usefulness: Math.round((currentKnowledge.usefulness + rating.usefulness) / 2),
      ratingCount: (currentKnowledge as any).ratingCount ? (currentKnowledge as any).ratingCount + 1 : 1,
      updatedAt: new Date().toISOString()
    };

    mockKnowledge[knowledgeIndex] = updatedKnowledge;

    // In production, this would update in D1 database
    // const db = (request as any).env.DB as D1Database;
    // await db.prepare(`
    //   UPDATE collaboration_knowledge
    //   SET quality = ?, usefulness = ?, rating_count = ?, updated_at = ?
    //   WHERE id = ?
    // `).bind(
    //   updatedKnowledge.quality,
    //   updatedKnowledge.usefulness,
    //   updatedKnowledge.ratingCount,
    //   new Date().toISOString(),
    //   knowledgeId
    // ).run();

    return NextResponse.json({
      success: true,
      knowledge: updatedKnowledge
    });
  } catch (error) {
    console.error('Failed to rate knowledge entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to rate knowledge entry' },
      { status: 500 }
    );
  }
}