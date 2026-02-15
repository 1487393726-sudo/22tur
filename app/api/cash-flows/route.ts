/**
 * Cash Flow Records API
 * Handles recording and querying of cash flow transactions
 * 
 * Requirements: 7.1, 7.2, 7.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { cashFlowManager } from '@/lib/investment-management/cash-flow-manager';
import { auditLogSystem } from '@/lib/audit/audit-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      amount,
      description,
      currency,
      fromAccount,
      toAccount,
      portfolioId,
      investmentId,
      reference,
      scheduledDate,
      metadata
    } = body;

    // Validate required fields
    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount, description' },
        { status: 400 }
      );
    }

    // Validate transaction type
    if (!['INFLOW', 'OUTFLOW', 'TRANSFER'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type. Must be INFLOW, OUTFLOW, or TRANSFER' },
        { status: 400 }
      );
    }

    // For transfers, validate account fields
    if (type === 'TRANSFER' && (!fromAccount || !toAccount)) {
      return NextResponse.json(
        { error: 'Transfer transactions require fromAccount and toAccount' },
        { status: 400 }
      );
    }

    // Get user ID from session (simplified - in real app would use proper auth)
    const userId = request.headers.get('x-user-id') || 'system';

    // Record cash flow
    const cashFlow = await cashFlowManager.recordCashFlow(
      type,
      amount,
      description,
      userId,
      {
        currency,
        fromAccount,
        toAccount,
        portfolioId,
        investmentId,
        reference,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        metadata
      }
    );

    return NextResponse.json({
      success: true,
      data: cashFlow
    });

  } catch (error) {
    console.error('Cash flow recording error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to record cash flow',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    const where: any = {};
    
    if (accountId) {
      where.OR = [
        { fromAccount: accountId },
        { toAccount: accountId }
      ];
    }
    
    if (type) {
      where.type = type;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (startDate && endDate) {
      where.transactionDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get cash flow records from database
    const { prisma } = await import('@/lib/prisma');
    
    const [records, total] = await Promise.all([
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

    // Map records to response format
    const mappedRecords = records.map(record => ({
      id: record.id,
      type: record.type,
      amount: record.amount,
      currency: record.currency,
      description: record.description,
      fromAccount: record.fromAccount,
      toAccount: record.toAccount,
      portfolioId: record.portfolioId,
      investmentId: record.investmentId,
      status: record.status,
      transactionDate: record.transactionDate,
      settlementDate: record.settlementDate,
      reference: record.reference,
      metadata: record.metadata ? JSON.parse(record.metadata) : null,
      createdBy: record.createdBy,
      approvedBy: record.approvedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        records: mappedRecords,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Cash flow query error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to query cash flows',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}