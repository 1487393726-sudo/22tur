/**
 * Investment Advisor Clients API
 * GET /api/advisor/clients - Get all clients for an advisor
 * 
 * Requirements: 6.1, 6.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { advisorClientManager } from '@/lib/investment-management/advisor-client-manager';
import { auditLogSystem } from '@/lib/audit/audit-system';

export async function GET(request: NextRequest) {
  try {
    // Get advisor ID from query params or session
    const { searchParams } = new URL(request.url);
    const advisorId = searchParams.get('advisorId');

    if (!advisorId) {
      return NextResponse.json(
        { error: 'Advisor ID is required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Get advisor's clients
    const clients = await advisorClientManager.getAdvisorClients(advisorId);

    // Log successful access
    await auditLogSystem.logSuccess(
      'ADVISOR_CLIENTS_API_ACCESS',
      'API_ENDPOINT',
      '/api/advisor/clients',
      {
        userId: advisorId,
        ipAddress,
        userAgent,
        details: {
          clientCount: clients.length,
          endpoint: 'GET /api/advisor/clients'
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: clients,
      meta: {
        count: clients.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log API error
    await auditLogSystem.logFailure(
      'ADVISOR_CLIENTS_API_ERROR',
      'API_ENDPOINT',
      '/api/advisor/clients',
      {
        reason: errorMessage,
        details: {
          endpoint: 'GET /api/advisor/clients'
        }
      }
    );

    console.error('Advisor clients API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch advisor clients',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { advisorId, clientId, assignedBy } = body;

    if (!advisorId || !clientId || !assignedBy) {
      return NextResponse.json(
        { error: 'Advisor ID, Client ID, and Assigned By are required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Assign client to advisor
    const advisorClient = await advisorClientManager.assignClientToAdvisor(
      advisorId,
      clientId,
      assignedBy
    );

    // Log successful assignment
    await auditLogSystem.logSuccess(
      'CLIENT_ASSIGNED_API',
      'API_ENDPOINT',
      '/api/advisor/clients',
      {
        userId: assignedBy,
        ipAddress,
        userAgent,
        details: {
          advisorId,
          clientId,
          endpoint: 'POST /api/advisor/clients'
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: advisorClient,
      message: 'Client successfully assigned to advisor'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log API error
    await auditLogSystem.logFailure(
      'CLIENT_ASSIGNMENT_API_ERROR',
      'API_ENDPOINT',
      '/api/advisor/clients',
      {
        reason: errorMessage,
        details: {
          endpoint: 'POST /api/advisor/clients'
        }
      }
    );

    console.error('Client assignment API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to assign client to advisor',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}