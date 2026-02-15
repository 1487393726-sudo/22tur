/**
 * Firewall Evaluation API
 * POST /api/firewall/evaluate - Evaluate traffic
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { firewallEngine } from '@/lib/firewall';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.sourceIp || !data.destinationIp || data.port === undefined || !data.protocol) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceIp, destinationIp, port, protocol' },
        { status: 400 }
      );
    }

    // Evaluate traffic
    const decision = await firewallEngine.evaluateTraffic({
      sourceIp: data.sourceIp,
      destinationIp: data.destinationIp,
      port: data.port,
      protocol: data.protocol,
    });

    return NextResponse.json(decision);
  } catch (error) {
    console.error('Error evaluating firewall traffic:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
