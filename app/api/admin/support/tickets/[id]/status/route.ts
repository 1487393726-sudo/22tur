import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

// PATCH - 更新工单状态(管理员)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    // 验证管理员权限
    // if (!session || session.user?.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const ticketId = params.id;
    const { status } = await request.json();

    if (!status || !['OPEN', 'IN_PROGRESS', 'CLOSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Failed to update ticket status:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket status' },
      { status: 500 }
    );
  }
}
