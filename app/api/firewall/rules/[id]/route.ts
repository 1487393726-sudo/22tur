/**
 * Firewall Management API
 * GET /api/firewall/rules/:id - Get firewall rule
 * PUT /api/firewall/rules/:id - Update firewall rule
 * DELETE /api/firewall/rules/:id - Delete firewall rule
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { firewallEngine } from '@/lib/firewall';
import { auditLogSystem } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rule = await firewallEngine.getRule(params.id);

    if (!rule) {
      return NextResponse.json({ error: 'Firewall rule not found' }, { status: 404 });
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error fetching firewall rule:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Get original rule
    const originalRule = await firewallEngine.getRule(params.id);

    if (!originalRule) {
      return NextResponse.json({ error: 'Firewall rule not found' }, { status: 404 });
    }

    // Update rule
    const updatedRule = await firewallEngine.updateRule(params.id, data);

    // Log the action
    await auditLogSystem.logSuccess('FIREWALL_RULE_UPDATED', 'FIREWALL_RULE', params.id, {
      userId: session.user.id,
      originalState: originalRule,
      newState: updatedRule,
    });

    return NextResponse.json(updatedRule);
  } catch (error) {
    console.error('Error updating firewall rule:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get rule before deletion
    const rule = await firewallEngine.getRule(params.id);

    if (!rule) {
      return NextResponse.json({ error: 'Firewall rule not found' }, { status: 404 });
    }

    // Delete rule
    await firewallEngine.deleteRule(params.id);

    // Log the action
    await auditLogSystem.logSuccess('FIREWALL_RULE_DELETED', 'FIREWALL_RULE', params.id, {
      userId: session.user.id,
      originalState: rule,
    });

    return NextResponse.json({ message: 'Firewall rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting firewall rule:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
