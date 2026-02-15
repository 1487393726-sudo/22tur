import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        client: true,
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    const {
      invoiceNumber,
      customerId,
      customerName,
      customerEmail,
      customerCustomId,
      issueDate,
      dueDate,
      notes,
      items,
      adjustments,
      subtotal,
      tax,
      total,
    } = data;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        clientId: customerId || '', // Use customerId as clientId
        amount: total,
        status: 'DRAFT',
        dueDate: new Date(dueDate),
        description: notes,
      },
    });

    // Store invoice details as metadata
    const invoiceData = {
      customerName,
      customerEmail,
      customerCustomId,
      issueDate,
      items,
      adjustments,
      subtotal,
      tax,
      total,
    };

    // If customer exists, send invoice info to their account via notification
    if (customerId) {
      try {
        // Create notification for customer
        await prisma.notification.create({
          data: {
            userId: customerId,
            title: '新发票已生成',
            message: `您有一张新发票: ${invoiceNumber}，金额: ¥${total.toFixed(2)}`,
            type: 'INFO',
            priority: 'MEDIUM',
            isEmail: true,
            metadata: JSON.stringify({
              invoiceNumber,
              customerCustomId,
              customerEmail,
              amount: total,
              issueDate,
              dueDate,
            }),
          },
        });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue even if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        ...invoiceData,
      },
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
