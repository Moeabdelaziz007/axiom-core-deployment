/**
 * 🕸️ SWARM PROTOCOL - Tasks API
 * 
 * API endpoints for managing collaborative tasks
 * Provides CRUD operations for task delegation and tracking
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
// import { D1Database } from '@cloudflare/workers-types';

// Mock database for development - replace with actual D1 in production
let mockTasks = [
  {
    id: 'task-1',
    sessionId: 'session-1',
    title: 'Analyze Property Market Trends',
    description: 'Conduct comprehensive analysis of current real estate market trends and identify investment opportunities',
    assignedTo: ['aqar'],
    assignedBy: 'tajer',
    status: 'in_progress' as const,
    priority: 'high' as const,
    progress: 65,
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    sessionId: 'session-1',
    title: 'Prepare Negotiation Strategy',
    description: 'Develop negotiation strategy for upcoming property deals',
    assignedTo: ['tajer'],
    assignedBy: 'tajer',
    status: 'pending' as const,
    priority: 'critical' as const,
    progress: 0,
    deadline: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'task-3',
    sessionId: 'session-2',
    title: 'Generate Market Report',
    description: 'Create comprehensive market analysis report with visualizations',
    assignedTo: ['mawid', 'sofra'],
    assignedBy: 'aqar',
    status: 'completed' as const,
    priority: 'normal' as const,
    progress: 100,
    deadline: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let filteredTasks = [...mockTasks];

    // Apply filters
    if (sessionId) {
      filteredTasks = filteredTasks.filter(task => task.sessionId === sessionId);
    }
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }

    // In production, this would query the D1 database
    // const db = (request as any).env.DB as D1Database;
    // let query = 'SELECT * FROM collaboration_tasks';
    // const params: any[] = [];
    // 
    // if (sessionId) {
    //   query += ' WHERE session_id = ?';
    //   params.push(sessionId);
    // }
    // 
    // const tasks = await db.prepare(query).bind(...params).all();

    return NextResponse.json({
      success: true,
      tasks: filteredTasks
    });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      title,
      description,
      assignedTo,
      assignedBy,
      priority = 'normal',
      deadline
    } = body;

    // Validate required fields
    if (!sessionId || !title || !assignedTo || !assignedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new task
    const newTask = {
      id: `task-${Date.now()}`,
      sessionId,
      title,
      description: description || '',
      assignedTo: Array.isArray(assignedTo) ? assignedTo : [assignedTo],
      assignedBy,
      status: 'pending' as const,
      priority,
      progress: 0,
      deadline: deadline || null,
      createdAt: new Date().toISOString()
    };

    // In production, this would insert into D1 database
    // const db = (request as any).env.DB as D1Database;
    // await db.prepare(`
    //   INSERT INTO collaboration_tasks 
    //   (id, session_id, title, description, assigned_to, assigned_by, status, priority, progress, deadline, created_at)
    //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `).bind(
    //   newTask.id,
    //   newTask.sessionId,
    //   newTask.title,
    //   newTask.description,
    //   JSON.stringify(newTask.assignedTo),
    //   newTask.assignedBy,
    //   newTask.status,
    //   newTask.priority,
    //   newTask.progress,
    //   newTask.deadline,
    //   newTask.createdAt
    // ).run();

    // Add to mock data for development
    mockTasks.unshift(newTask);

    return NextResponse.json({
      success: true,
      task: newTask
    });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, updates } = body;

    // Validate required fields
    if (!taskId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find and update task
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const updatedTask = {
      ...mockTasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    mockTasks[taskIndex] = updatedTask;

    // In production, this would update in D1 database
    // const db = (request as any).env.DB as D1Database;
    // await db.prepare(`
    //   UPDATE collaboration_tasks 
    //   SET status = ?, progress = ?, updated_at = ?
    //   WHERE id = ?
    // `).bind(
    //   updates.status,
    //   updates.progress,
    //   new Date().toISOString(),
    //   taskId
    // ).run();

    return NextResponse.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}