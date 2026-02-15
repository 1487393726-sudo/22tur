/**
 * Investment Advisor Communications API
 * POST /api/advisor/communications - Record communication with client
 * GET /api/advisor/communications - Get communication history
 * 
 * Requirements: 6.4 - Record all communication history and decision process
 */

import { NextRequest, NextResponse } from 'next/server';
import { advisorClientManager } from '@/lib/investment-management/advisor-client-manager';
import { auditLogSystem } from '@/lib/audit/audit-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      advisorId, 
      clientId, 
      type, 
      subject, 
      content, 
      followUpRequired = false,
      followUpDate
    } = body;

    // Validate required fields
    if (!advisorId || !clientId || !type || !subject || !content) {
      return NextResponse.json(
        { error: 'Advisor ID, Client ID, type, subject, and content are required' },
        { status: 400 }
      );
    }

    // Validate communication type
    const validTypes = ['EMAIL', 'PHONE', 'MEETING', 'NOTE'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid communication type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Get client IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Record communication
    const communication = await advisorClientManager.recordCommunication(
      advisorId,
      clientId,
      {
        type,
        subject,
        content,
        followUpRequired,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined
      }
    );

    // Log successful communication recording
    await auditLogSystem.logSuccess(
      'COMMUNICATION_RECORDED_API',
      'API_ENDPOINT',
      '/api/advisor/communications',
      {
        userId: advisorId,
        ipAddress,
        userAgent,
        details: {
          clientId,
          communicationId: communication.id,
          type,
          subject,
          followUpRequired,
          endpoint: 'POST /api/advisor/communications'
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: communication,
      message: 'Communication recorded successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log API error
    await auditLogSystem.logFailure(
      'COMMUNICATION_RECORD_API_ERROR',
      'API_ENDPOINT',
      '/api/advisor/communications',
      {
        reason: errorMessage,
        details: {
          endpoint: 'POST /api/advisor/communications'
        }
      }
    );

    console.error('Communication record API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to record communication',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const advisorId = searchParams.get('advisorId');
    const clientId = searchParams.get('clientId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!advisorId || !clientId) {
      return NextResponse.json(
        { error: 'Advisor ID and Client ID are required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Get communication history
    const communications = await advisorClientManager.getCommunicationHistory(
      advisorId,
      clientId,
      limit
    );

    // Log successful access
    await auditLogSystem.logSuccess(
      'COMMUNICATION_HISTORY_API_ACCESS',
      'API_ENDPOINT',
      '/api/advisor/communications',
      {
        userId: advisorId,
        ipAddress,
        userAgent,
        details: {
          clientId,
          communicationCount: communications.length,
          limit,
          endpoint: 'GET /api/advisor/communications'
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: communications,
      meta: {
        count: communications.length,
        limit,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log API error
    await auditLogSystem.logFailure(
      'COMMUNICATION_HISTORY_API_ERROR',
      'API_ENDPOINT',
      '/api/advisor/communications',
      {
        reason: errorMessage,
        details: {
          endpoint: 'GET /api/advisor/communications'
        }
      }
    );

    console.error('Communication history API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch communication history',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}