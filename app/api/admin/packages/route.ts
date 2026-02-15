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

    // 从 FinancialRecord 中获取压缩包记录
    const packages = await prisma.financialRecord.findMany({
      where: {
        type: 'PACKAGE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      packages: packages.map((pkg) => ({
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        fileName: pkg.fileName,
        fileSize: pkg.fileSize || 0,
        mimeType: 'application/zip',
        downloadUrl: pkg.filePath,
        downloadCount: 0,
        createdAt: pkg.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}
