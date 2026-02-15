import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 下载设备购买凭证
 * GET /api/equipment-purchases/[id]/certificate
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
            category: true,
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
    const certificateContent = generateEquipmentCertificate(purchase);

    // 返回HTML格式的凭证
    return new NextResponse(certificateContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="equipment-certificate-${purchase.id}.html"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate equipment certificate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate equipment certificate: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 生成设备购买凭证HTML内容
 */
function generateEquipmentCertificate(purchase: any): string {
  const purchaseDate = new Date(purchase.purchaseDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const warrantyExpiry = new Date(purchase.purchaseDate.getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN', {
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
    <title>直播设备购买凭证</title>
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
            border: 3px solid #ff6b35;
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
            background: linear-gradient(90deg, #ff6b35, #ff8c42);
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .title {
            font-size: 36px;
            font-weight: bold;
            color: #ff6b35;
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
            color: #ff6b35;
        }
        
        .equipment-info {
            background: #fff3e0;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 4px solid #ff6b35;
        }
        
        .equipment-title {
            font-size: 18px;
            font-weight: bold;
            color: #ff6b35;
            margin-bottom: 15px;
        }
        
        .equipment-details {
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
            color: #ff6b35;
        }
        
        .warranty-info {
            background: #e8f5e9;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #4caf50;
        }
        
        .warranty-info h3 {
            color: #4caf50;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .warranty-info p {
            font-size: 13px;
            color: #666;
            margin: 5px 0;
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
            background: #4caf50;
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
                border: 2px solid #ff6b35;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="title">🎬 直播设备购买凭证</div>
            <div class="subtitle">EQUIPMENT PURCHASE CERTIFICATE</div>
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
                        已支付
                        <div class="status-badge">✓ 已确认</div>
                    </div>
                </div>
                <div class="content-item">
                    <div class="label">支付方式</div>
                    <div class="value">${purchase.paymentMethod || '在线支付'}</div>
                </div>
            </div>
        </div>
        
        <div class="equipment-info">
            <div class="equipment-title">📦 购买设备套装</div>
            <div class="equipment-details">
                <div class="detail-item">
                    <div class="detail-label">套装名称</div>
                    <div class="detail-value">${purchase.service.title}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">套装类别</div>
                    <div class="detail-value">${purchase.service.category}</div>
                </div>
            </div>
        </div>
        
        <div class="warranty-info">
            <h3>🛡️ 保修信息</h3>
            <p><strong>保修期限：</strong>自购买之日起 12 个月</p>
            <p><strong>保修到期日期：</strong>${warrantyExpiry}</p>
            <p><strong>保修范围：</strong>所有设备和配件的正常使用故障</p>
            <p><strong>技术支持：</strong>24/7 在线客服支持</p>
        </div>
        
        <div class="footer">
            <p>本凭证是购买者与我们之间的购买协议证明。</p>
            <p>This certificate is proof of equipment purchase agreement between the buyer and us.</p>
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
