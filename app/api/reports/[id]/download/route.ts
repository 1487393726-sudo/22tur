/**
 * Report Download API Endpoint
 * 
 * GET /api/reports/[id]/download - Download report file
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Get report from database
    const report = await prisma.investmentReport.findUnique({
      where: { id: reportId },
      include: {
        portfolio: {
          select: {
            id: true,
            name: true,
            userId: true
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check if report has a file URL
    if (!report.fileUrl) {
      // If no file URL, return JSON content
      return NextResponse.json({
        success: true,
        data: {
          report: {
            ...report,
            content: report.content ? JSON.parse(report.content as string) : null
          }
        }
      });
    }

    try {
      // In a real implementation, this would serve the actual file
      // For now, we'll return a mock response indicating the file would be downloaded
      
      const fileName = report.fileUrl.split('/').pop() || `report_${reportId}`;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      
      let contentType = 'application/octet-stream';
      if (fileExtension === 'pdf') {
        contentType = 'application/pdf';
      } else if (fileExtension === 'xlsx' || fileExtension === 'excel') {
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      // In a real implementation, you would:
      // 1. Read the actual file from storage (local filesystem, S3, etc.)
      // 2. Return the file content with appropriate headers
      
      // For now, return a mock response
      return NextResponse.json({
        success: true,
        message: 'File download would start',
        data: {
          fileName,
          contentType,
          fileUrl: report.fileUrl,
          reportId: report.id,
          generatedAt: report.generatedAt
        }
      });

    } catch (fileError) {
      console.error('File access error:', fileError);
      
      // If file doesn't exist, return JSON content as fallback
      return NextResponse.json({
        success: true,
        data: {
          report: {
            ...report,
            content: report.content ? JSON.parse(report.content as string) : null
          }
        },
        message: 'File not found, returning JSON content'
      });
    }

  } catch (error) {
    console.error('Report download failed:', error);
    return NextResponse.json(
      { 
        error: 'Report download failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}