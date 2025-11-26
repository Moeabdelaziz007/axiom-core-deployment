/**
 * 🕸️ SWARM PROTOCOL - Teams API
 * 
 * API endpoints for managing agent teams
 * Provides CRUD operations for team creation and management
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

// Mock database for development - replace with actual D1 in production
let mockTeams = [
  {
    id: 'team-1',
    name: 'Real Estate Specialists',
    description: 'Elite team focused on property analysis and negotiations',
    type: 'permanent' as const,
    status: 'active' as const,
    leader: 'tajer',
    members: [
      {
        id: 'tajer',
        name: 'Tajer Agent',
        role: 'Team Lead',
        status: 'active' as const,
        reputation: 85,
        contributions: 127,
        joinedAt: new Date().toISOString()
      },
      {
        id: 'aqar',
        name: 'Aqar Agent',
        role: 'Property Analyst',
        status: 'active' as const,
        reputation: 92,
        contributions: 89,
        joinedAt: new Date(Date.now() - 86400000 * 7).toISOString()
      }
    ],
    performance: {
      productivity: 87,
      quality: 91,
      collaboration: 85,
      innovation: 78,
      efficiency: 89,
      satisfaction: 92
    },
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'team-2',
    name: 'Operations Support',
    description: 'Support team for scheduling and service optimization',
    type: 'temporary' as const,
    status: 'active' as const,
    leader: 'mawid',
    members: [
      {
        id: 'mawid',
        name: 'Mawid Agent',
        role: 'Coordinator',
        status: 'busy' as const,
        reputation: 78,
        contributions: 156,
        joinedAt: new Date(Date.now() - 86400000 * 14).toISOString()
      },
      {
        id: 'sofra',
        name: 'Sofra Agent',
        role: 'Quality Specialist',
        status: 'active' as const,
        reputation: 88,
        contributions: 203,
        joinedAt: new Date(Date.now() - 86400000 * 10).toISOString()
      }
    ],
    performance: {
      productivity: 82,
      quality: 88,
      collaboration: 90,
      innovation: 75,
      efficiency: 85,
      satisfaction: 87
    },
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let filteredTeams = [...mockTeams];

    // Apply filters
    if (status) {
      filteredTeams = filteredTeams.filter(team => team.status === status);
    }
    if (type) {
      filteredTeams = filteredTeams.filter(team => team.type === type);
    }

    // In production, this would query the D1 database
    // const db = (request as any).env.DB as D1Database;
    // let query = 'SELECT * FROM collaboration_teams';
    // const params: any[] = [];
    // 
    // if (status) {
    //   query += ' WHERE status = ?';
    //   params.push(status);
    // }
    // 
    // const teams = await db.prepare(query).bind(...params).all();

    return NextResponse.json({
      success: true,
      teams: filteredTeams
    });
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, leader, members } = body;

    // Validate required fields
    if (!name || !type || !leader || !members) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new team
    const newTeam = {
      id: `team-${Date.now()}`,
      name,
      description: description || '',
      type,
      status: 'active' as const,
      leader,
      members: members.map((memberId: string) => ({
        id: memberId,
        name: `${memberId.charAt(0).toUpperCase() + memberId.slice(1)} Agent`,
        role: memberId === leader ? 'Team Lead' : 'Member',
        status: 'active' as const,
        reputation: 80 + Math.floor(Math.random() * 20), // Random reputation for demo
        contributions: Math.floor(Math.random() * 100),
        joinedAt: new Date().toISOString()
      })),
      performance: {
        productivity: 75 + Math.floor(Math.random() * 25),
        quality: 75 + Math.floor(Math.random() * 25),
        collaboration: 75 + Math.floor(Math.random() * 25),
        innovation: 75 + Math.floor(Math.random() * 25),
        efficiency: 75 + Math.floor(Math.random() * 25),
        satisfaction: 75 + Math.floor(Math.random() * 25)
      },
      createdAt: new Date().toISOString()
    };

    // In production, this would insert into D1 database
    // const db = (request as any).env.DB as D1Database;
    // await db.prepare(`
    //   INSERT INTO collaboration_teams 
    //   (id, name, description, type, status, leader, members, performance, created_at)
    //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `).bind(
    //   newTeam.id,
    //   newTeam.name,
    //   newTeam.description,
    //   newTeam.type,
    //   newTeam.leader,
    //   JSON.stringify(newTeam.members),
    //   JSON.stringify(newTeam.performance),
    //   newTeam.createdAt
    // ).run();

    // Add to mock data for development
    mockTeams.unshift(newTeam);

    return NextResponse.json({
      success: true,
      team: newTeam
    });
  } catch (error) {
    console.error('Failed to create team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create team' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, updates } = body;

    // Validate required fields
    if (!teamId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find and update team
    const teamIndex = mockTeams.findIndex(team => team.id === teamId);
    if (teamIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    const updatedTeam = {
      ...mockTeams[teamIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    mockTeams[teamIndex] = updatedTeam;

    // In production, this would update in D1 database
    // const db = (request as any).env.DB as D1Database;
    // await db.prepare(`
    //   UPDATE collaboration_teams 
    //   SET status = ?, updated_at = ?
    //   WHERE id = ?
    // `).bind(
    //   updates.status,
    //   new Date().toISOString(),
    //   teamId
    // ).run();

    return NextResponse.json({
      success: true,
      team: updatedTeam
    });
  } catch (error) {
    console.error('Failed to update team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'Missing team ID' },
        { status: 400 }
      );
    }

    // Find and remove team
    const teamIndex = mockTeams.findIndex(team => team.id === teamId);
    if (teamIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    mockTeams.splice(teamIndex, 1);

    // In production, this would delete from D1 database
    // const db = (request as any).env.DB as D1Database;
    // await db.prepare('DELETE FROM collaboration_teams WHERE id = ?').bind(teamId).run();

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}