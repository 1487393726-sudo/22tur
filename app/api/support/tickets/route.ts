import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";

const prisma = new PrismaClient();

// GET - Fetch all support tickets for the current user
export async function GET(request: Request) {
  try {
    // TODO: Get userId from session
    // const session = await getServerSession();
    // if (!session || !session.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // const userId = session.user.id;
    
    // Using hardcoded userId for now
    const userId = 'system'; // TODO: Replace with actual session user ID

    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { username: true, avatar: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    
    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

// POST - Create a new support ticket
export async function POST(request: Request) {
  try {
    // TODO: Get userId from session
    // const session = await getServerSession();
    // if (!session || !session.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // const userId = session.user.id;
    
    // Using hardcoded userId for now
    const userId = 'system'; // TODO: Replace with actual session user ID

    const { subject, message, category, priority } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const newTicket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message,
        category: category || 'SERVICE',
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        messages: {
          create: {
            userId,
            message,
            senderType: 'USER'
          }
        }
      },
      include: {
        messages: true,
        user: { select: { username: true, avatar: true } }
      }
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
