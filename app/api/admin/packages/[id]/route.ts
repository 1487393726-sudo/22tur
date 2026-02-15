import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 获取压缩包信息
    const pkg = await prisma.financialRecord.findUnique({
      where: { id },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // 删除文件
    if (pkg.filePath) {
      try {
        const filePath = join(process.cwd(), 'public', pkg.filePath.replace(/^\//, ''));
        await unlink(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
        // 继续删除数据库记录，即使文件删除失败
      }
    }

    // 删除数据库记录
    await prisma.financialRecord.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 获取压缩包信息
    const pkg = await prisma.financialRecord.findUnique({
      where: { id },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // 更新下载计数
    await prisma.financialRecord.update({
      where: { id },
      data: {
        downloadCount: (pkg.downloadCount || 0) + 1,
      },
    });

    // 重定向到文件
    return NextResponse.redirect(pkg.filePath);
  } catch (error) {
    console.error('Error downloading package:', error);
    return NextResponse.json(
      { error: 'Failed to download package' },
      { status: 500 }
    );
  }
}
