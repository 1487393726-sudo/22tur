/**
 * Firewall Management API
 * POST /api/firewall/rules - Create firewall rule
 * GET /api/firewall/rules - List firewall rules
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { firewallEngine } from '@/lib/firewall';
import { auditLogSystem } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.sourceIp || !data.destinationIp || data.port === undefined || !data.protocol || !data.action) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceIp, destinationIp, port, protocol, action' },
        { status: 400 }
      );
    }

    // Create firewall rule
    const rule = await firewallEngine.createRule({
      sourceIp: data.sourceIp,
      destinationIp: data.destinationIp,
      port: data.port,
      protocol: data.protocol,
      action: data.action,
      priority: data.priority,
    });

    // Log the action
    await auditLogSystem.logSuccess('FIREWALL_RULE_CREATED', 'FIREWALL_RULE', rule.id, {
      userId: session.user.id,
      newState: rule,
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Error creating firewall rule:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rules = await firewallEngine.getAllRules();

    return NextResponse.json({
      rules,
      total: rules.length,
    });
  } catch (error) {
    console.error('Error fetching firewall rules:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
