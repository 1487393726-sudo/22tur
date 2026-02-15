import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 下载购买凭证
 * GET /api/purchases/[id]/certificate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 获取购买记录
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // 验证用户权限
    if (purchase.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 生成凭证内容
    const certificateContent = generateCertificate(purchase);

    // 返回HTML格式的凭证
    return new NextResponse(certificateContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="purchase-certificate-${purchase.id}.html"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate certificate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate certificate: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 生成购买凭证HTML内容
 */
function generateCertificate(purchase: any): string {
  const purchaseDate = new Date(purchase.purchaseDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const userName = `${purchase.user.firstName}${purchase.user.lastName}`;

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>购买凭证</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        
        .certificate {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 60px 40px;
            border: 3px solid #1e40af;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        
        .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #1e40af, #3b82f6);
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .title {
            font-size: 36px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 14px;
            color: #666;
            letter-spacing: 2px;
        }
        
        .content {
            margin: 40px 0;
            line-height: 2;
        }
        
        .content-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .content-item {
            flex: 1;
        }
        
        .label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        
        .value {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
        }
        
        .service-info {
            background: #f0f4ff;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .service-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 15px;
        }
        
        .service-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .detail-item {
            font-size: 14px;
        }
        
        .detail-label {
            color: #666;
            margin-bottom: 5px;
        }
        
        .detail-value {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
        }
        
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
        
        .certificate-number {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #ccc;
            margin-top: 20px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .certificate {
                box-shadow: none;
                border: 2px solid #1e40af;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="title">购买凭证</div>
            <div class="subtitle">PURCHASE CERTIFICATE</div>
        </div>
        
        <div class="content">
            <div class="content-row">
                <div class="content-item">
                    <div class="label">购买者</div>
                    <div class="value">${userName}</div>
                </div>
                <div class="content-item">
                    <div class="label">购买编号</div>
                    <div class="value">${purchase.id}</div>
                </div>
            </div>
            
            <div class="content-row">
                <div class="content-item">
                    <div class="label">购买金额</div>
                    <div class="value">¥${purchase.amount.toLocaleString('zh-CN')}</div>
                </div>
                <div class="content-item">
                    <div class="label">购买日期</div>
                    <div class="value">${purchaseDate}</div>
                </div>
            </div>
            
            <div class="content-row">
                <div class="content-item">
                    <div class="label">购买状态</div>
                    <div class="value">
                        ${getStatusLabel(purchase.status)}
                        <div class="status-badge">${getStatusBadge(purchase.status)}</div>
                    </div>
                </div>
                <div class="content-item">
                    <div class="label">支付方式</div>
                    <div class="value">${purchase.paymentMethod || '未指定'}</div>
                </div>
            </div>
        </div>
        
        <div class="service-info">
            <div class="service-title">购买服务信息</div>
            <div class="service-details">
                <div class="detail-item">
                    <div class="detail-label">服务名称</div>
                    <div class="detail-value">${purchase.service.title}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">服务价格</div>
                    <div class="detail-value">¥${purchase.service.price.toLocaleString('zh-CN')}</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>本凭证是购买者与我们之间的购买协议证明。</p>
            <p>This certificate is proof of purchase agreement between the buyer and us.</p>
            <div class="certificate-number">凭证号: ${purchase.id} | 生成时间: ${new Date().toLocaleString('zh-CN')}</div>
        </div>
    </div>
    
    <script>
        // 页面加载完成后自动打印
        window.addEventListener('load', function() {
            window.print();
        });
    </script>
</body>
</html>
  `;
}

/**
 * 获取状态标签
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: '待支付',
    PAID: '已支付',
    PROCESSING: '处理中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };
  return labels[status] || status;
}

/**
 * 获取状态徽章
 */
function getStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    PENDING: '待支付',
    PAID: '已支付',
    PROCESSING: '处理中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };
  return badges[status] || status;
}
