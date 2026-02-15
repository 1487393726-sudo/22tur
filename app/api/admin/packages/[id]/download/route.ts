import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

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

    // 读取文件
    const filePath = join(process.cwd(), 'public', pkg.filePath.replace(/^\//, ''));
    const fileBuffer = await readFile(filePath);

    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${pkg.fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading package:', error);
    return NextResponse.json(
      { error: 'Failed to download package' },
      { status: 500 }
    );
  }
}
