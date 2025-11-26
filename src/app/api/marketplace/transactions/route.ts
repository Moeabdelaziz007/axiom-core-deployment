/**
 * 💰 MARKETPLACE TRANSACTIONS API
 * 
 * API endpoints for marketplace transactions, payments, and escrow
 * Integrates with smart contracts for secure transactions
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MarketplaceTransaction, TransactionType, TransactionStatus } from '@/types/marketplace';
import AgentMarketplaceEngine from '@/infra/core/AgentMarketplaceEngine';

// Initialize marketplace engine
const marketplaceEngine = new AgentMarketplaceEngine({} as any, {} as any);

// Validation schemas
const CreateTransactionSchema = z.object({
  type: z.enum(['purchase', 'subscription', 'usage', 'deployment', 'collaboration', 'customization', 'upgrade']),
  buyerId: z.string().min(1),
  sellerId: z.string().min(1),
  agentId: z.string().min(1),
  amount: z.number().min(0),
  currency: z.enum(['SOL', 'USDC', 'AXIOM']).default('SOL'),
  metadata: z.record(z.any()).optional()
});

const TransactionIdSchema = z.object({
  id: z.string().min(1)
});

const UpdateTransactionSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'disputed']).optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * GET /api/marketplace/transactions
 * Get user's transaction history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Get user ID from auth context (mock for now)
    const userId = queryParams.userId || 'current-user';
    const status = queryParams.status as TransactionStatus;
    const type = queryParams.type as TransactionType;
    const page = parseInt(queryParams.page || '1');
    const limit = parseInt(queryParams.limit || '20');
    
    // Get user transactions
    const transactions = marketplaceEngine.getUserTransactions(userId, status);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page,
          limit,
          total: transactions.length,
          totalPages: Math.ceil(transactions.length / limit),
          hasNext: endIndex < transactions.length,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/transactions
 * Create new transaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate transaction data
    const validationResult = CreateTransactionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid transaction data', details: validationResult.error },
        { status: 400 }
      );
    }
    
    const { type, buyerId, sellerId, agentId, amount, currency, metadata } = validationResult.data;
    
    // Process transaction
    const transaction = await marketplaceEngine.processTransaction(
      type,
      buyerId,
      sellerId,
      agentId,
      amount,
      currency,
      metadata
    );
    
    return NextResponse.json({
      success: true,
      data: transaction
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketplace/transactions/[id]
 * Get specific transaction details
 */
export async function getTransactionById(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }
    
    // Get transaction details
    const transaction = marketplaceEngine.getTransaction(id);
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: transaction
    });
    
  } catch (error) {
    console.error('Get transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/marketplace/transactions/[id]
 * Update transaction status
 */
export async function updateTransaction(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }
    
    // Validate update data
    const validationResult = UpdateTransactionSchema.safeParse({ id, ...body });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: validationResult.error },
        { status: 400 }
      );
    }
    
    const { status, metadata } = validationResult.data;
    
    // Get existing transaction
    const existingTransaction = marketplaceEngine.getTransaction(id);
    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Update transaction (in real implementation, this would involve smart contract calls)
    const updatedTransaction = {
      ...existingTransaction,
      status: status || existingTransaction.status,
      metadata: metadata || existingTransaction.metadata,
      updatedAt: new Date()
    };
    
    return NextResponse.json({
      success: true,
      data: updatedTransaction
    });
    
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/transactions/[id]/dispute
 * File dispute for transaction
 */
export async function createDispute(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }
    
    const { complainantId, respondentId, type, description, severity } = body;
    
    if (!complainantId || !respondentId || !type || !description) {
      return NextResponse.json(
        { error: 'Missing required dispute fields' },
        { status: 400 }
      );
    }
    
    // Create dispute
    const dispute = await marketplaceEngine.fileDispute(
      id,
      complainantId,
      respondentId,
      type,
      description,
      severity
    );
    
    return NextResponse.json({
      success: true,
      data: dispute
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create dispute error:', error);
    return NextResponse.json(
      { error: 'Failed to create dispute' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/transactions/[id]/refund
 * Process refund for transaction
 */
export async function processRefund(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }
    
    const { reason } = body;
    
    if (!reason) {
      return NextResponse.json(
        { error: 'Refund reason is required' },
        { status: 400 }
      );
    }
    
    // Get transaction
    const transaction = marketplaceEngine.getTransaction(id);
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, this would:
    // 1. Verify refund conditions
    // 2. Process refund via smart contract
    // 3. Update transaction status
    // 4. Handle fee calculations
    
    const refundedTransaction = {
      ...transaction,
      status: 'refunded' as TransactionStatus,
      refundedAt: new Date(),
      refundReason: reason
    };
    
    return NextResponse.json({
      success: true,
      data: refundedTransaction
    });
    
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}