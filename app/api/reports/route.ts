/**
 * Reports Management API
 * 
 * GET /api/reports - Get reports list with filtering and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReportType } from '@/types/investment-management';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const portfolioId = searchParams.get('portfolioId');
    const reportType = searchParams.get('reportType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50 per page
    const sortBy = searchParams.get('sortBy') || 'generatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json(
        { error: 'Page must be a positive integer' },
        { status: 400 }
      );
    }

    if (limit < 1) {
      return NextResponse.json(
        { error: 'Limit must be a positive integer' },
        { status: 400 }
      );
    }

    // Build query filters
    const where: any = {};

    if (portfolioId) {
      where.portfolioId = portfolioId;
    }

    if (reportType) {
      // Validate report type
      const validReportTypes = Object.values(ReportType);
      if (!validReportTypes.includes(reportType as ReportType)) {
        return NextResponse.json(
          { 
            error: 'Invalid report type',
            validTypes: validReportTypes
          },
          { status: 400 }
        );
      }
      where.reportType = reportType;
    }

    // Date range filtering
    if (startDate || endDate) {
      where.generatedAt = {};
      
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return NextResponse.json(
            { error: 'Invalid start date format' },
            { status: 400 }
          );
        }
        where.generatedAt.gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return NextResponse.json(
            { error: 'Invalid end date format' },
            { status: 400 }
          );
        }
        where.generatedAt.lte = end;
      }
    }

    // Build sort order
    const orderBy: any = {};
    const validSortFields = ['generatedAt', 'reportType', 'periodStart', 'periodEnd'];
    
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.generatedAt = 'desc'; // Default sort
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Execute queries
    const [reports, totalCount] = await Promise.all([
      prisma.investmentReport.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          portfolio: {
            select: {
              id: true,
              name: true,
              userId: true,
              totalValue: true
            }
          }
        }
      }),
      prisma.investmentReport.count({ where })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        reports: reports.map(report => ({
          ...report,
          content: report.content ? JSON.parse(report.content as string) : null
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch reports',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}