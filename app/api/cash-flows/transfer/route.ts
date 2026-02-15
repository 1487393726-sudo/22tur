/**
 * Fund Transfer API
 * Handles fund transfers between accounts with approval workflow
 * 
 * Requirements: 7.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { cashFlowManager } from '@/lib/investment-management/cash-flow-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fromAccount,
      toAccount,
      amount,
      currency = 'CNY',
      description,
      reference,
      scheduledDate,
      requiresApproval = true,
      metadata,
      approvedBy
    } = body;

    // Validate required fields
    if (!fromAccount || !toAccount || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: fromAccount, toAccount, amount, description' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than zero' },
        { status: 400 }
      );
    }

    // Validate accounts are different
    if (fromAccount === toAccount) {
      return NextResponse.json(
        { error: 'Cannot transfer to the same account' },
        { status: 400 }
      );
    }

    // Get user ID from session (simplified - in real app would use proper auth)
    const userId = request.headers.get('x-user-id') || 'system';

    // Create transfer request
    const transferRequest = {
      fromAccount,
      toAccount,
      amount,
      currency,
      description,
      reference,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      requiresApproval,
      metadata
    };

    // Process transfer
    const transfer = await cashFlowManager.processTransfer(
      transferRequest,
      userId,
      approvedBy
    );

    return NextResponse.json({
      success: true,
      data: transfer
    });

  } catch (error) {
    console.error('Fund transfer error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process fund transfer',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const fromAccount = searchParams.get('fromAccount');
    const toAccount = searchParams.get('toAccount');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions for transfers
    const where: any = {
      type: 'TRANSFER'
    };
    
    if (status) {
      where.status = status;
    }
    
    if (fromAccount) {
      where.fromAccount = fromAccount;
    }
    
    if (toAccount) {
      where.toAccount = toAccount;
    }

    // Get transfer records from database
    const { prisma } = await import('@/lib/prisma');
    
    const [transfers, total] = await Promise.all([
      prisma.cashFlowRecord.findMany({
        where,
        orderBy: {
          transactionDate: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.cashFlowRecord.count({ where })
    ]);

    // Map transfers to response format
    const mappedTransfers = transfers.map(transfer => ({
      id: transfer.id,
      fromAccount: transfer.fromAccount,
      toAccount: transfer.toAccount,
      amount: transfer.amount,
      currency: transfer.currency,
      description: transfer.description,
      status: transfer.status,
      transactionDate: transfer.transactionDate,
      settlementDate: transfer.settlementDate,
      reference: transfer.reference,
      metadata: transfer.metadata ? JSON.parse(transfer.metadata) : null,
      createdBy: transfer.createdBy,
      approvedBy: transfer.approvedBy,
      createdAt: transfer.createdAt,
      updatedAt: transfer.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        transfers: mappedTransfers,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Transfer query error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to query transfers',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { transferId, action, approvedBy } = body;

    // Validate required fields
    if (!transferId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: transferId, action' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['approve', 'reject', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, or cancel' },
        { status: 400 }
      );
    }

    // Get user ID from session
    const userId = request.headers.get('x-user-id') || 'system';

    // Update transfer status
    const { prisma } = await import('@/lib/prisma');
    
    let newStatus: string;
    let updateData: any = {
      updatedAt: new Date()
    };

    switch (action) {
      case 'approve':
        newStatus = 'COMPLETED';
        updateData.status = newStatus;
        updateData.approvedBy = approvedBy || userId;
        updateData.settlementDate = new Date();
        break;
      case 'reject':
        newStatus = 'FAILED';
        updateData.status = newStatus;
        break;
      case 'cancel':
        newStatus = 'CANCELLED';
        updateData.status = newStatus;
        break;
      default:
        throw new Error('Invalid action');
    }

    const updatedTransfer = await prisma.cashFlowRecord.update({
      where: { id: transferId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedTransfer.id,
        status: updatedTransfer.status,
        approvedBy: updatedTransfer.approvedBy,
        settlementDate: updatedTransfer.settlementDate,
        updatedAt: updatedTransfer.updatedAt
      }
    });

  } catch (error) {
    console.error('Transfer update error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update transfer',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}