import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";

const prisma = new PrismaClient();

// GET - Fetch all messages for a specific ticket
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;

    const messages = await prisma.chatMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { username: true, avatar: true } }
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST - Send a new message in a ticket
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get userId from session
    // const session = await getServerSession();
    // if (!session || !session.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // const userId = session.user.id;
    
    // Using hardcoded userId for now
    const userId = 'system'; // TODO: Replace with actual session user ID
    const ticketId = params.id;

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create the message
    const newMessage = await prisma.chatMessage.create({
      data: {
        userId,
        ticketId,
        message,
        senderType: 'USER'
      },
      include: {
        user: { select: { username: true, avatar: true } }
      }
    });

    // Update ticket's updatedAt timestamp
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
