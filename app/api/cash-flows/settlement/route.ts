/**
 * Settlement Reports API
 * Handles monthly settlement report generation and reconciliation
 * 
 * Requirements: 7.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { cashFlowManager } from '@/lib/investment-management/cash-flow-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month, year, currency = 'CNY' } = body;

    // Validate required fields
    if (!month || !year) {
      return NextResponse.json(
        { error: 'Missing required fields: month, year' },
        { status: 400 }
      );
    }

    // Validate month and year
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    if (year < 2020 || year > new Date().getFullYear()) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }

    // Generate settlement report
    const report = await cashFlowManager.generateSettlementReport(month, year, currency);

    return NextResponse.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Settlement report generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate settlement report',
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
    const currency = searchParams.get('currency');
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (currency) {
      where.currency = currency;
    }

    // Get settlement reports from database
    const { prisma } = await import('@/lib/prisma');
    
    const [reports, total] = await Promise.all([
      prisma.settlementReport.findMany({
        where,
        orderBy: {
          generatedAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.settlementReport.count({ where })
    ]);

    // Map reports to response format
    const mappedReports = reports.map(report => ({
      id: report.id,
      period: JSON.parse(report.period),
      totalTransactions: report.totalTransactions,
      totalAmount: report.totalAmount,
      currency: report.currency,
      status: report.status,
      discrepancies: report.discrepancies ? JSON.parse(report.discrepancies) : [],
      generatedAt: report.generatedAt,
      reconciledAt: report.reconciledAt,
      reconciledBy: report.reconciledBy
    }));

    return NextResponse.json({
      success: true,
      data: {
        reports: mappedReports,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Settlement reports query error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to query settlement reports',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}