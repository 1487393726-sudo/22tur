import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 下载设备购买发票
 * GET /api/equipment-purchases/[id]/invoice
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

    // 获取购买记录（这里使用 Purchase 模型，但需要扩展以支持多个配件）
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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

    // 生成发票内容
    const invoiceContent = generateEquipmentInvoice(purchase);

    // 返回HTML格式的发票
    return new NextResponse(invoiceContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="equipment-invoice-${purchase.id}.html"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate equipment invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate equipment invoice: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 生成设备购买发票HTML内容
 */
function generateEquipmentInvoice(purchase: any): string {
  const invoiceDate = new Date(purchase.purchaseDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const invoiceNumber = `EQ-${purchase.id.substring(0, 8).toUpperCase()}-${new Date(purchase.purchaseDate).getFullYear()}`;
  const userName = `${purchase.user.firstName}${purchase.user.lastName}`;
  const tax = purchase.amount * 0.13; // 13% 税率（设备类）
  const total = purchase.amount + tax;

  // 模拟配件数据（实际应该从数据库查询）
  const accessories = [
    { name: '4K 摄像机', model: 'Sony A7R V', quantity: 1, unitPrice: 25000, totalPrice: 25000 },
    { name: '专业麦克风', model: 'Shure SM7B', quantity: 2, unitPrice: 3500, totalPrice: 7000 },
    { name: '补光灯', model: 'Neewer RGB', quantity: 2, unitPrice: 1200, totalPrice: 2400 },
    { name: '三脚架', model: 'Manfrotto 055', quantity: 1, unitPrice: 800, totalPrice: 800 },
    { name: '音频接口', model: 'Focusrite Scarlett', quantity: 1, unitPrice: 1500, totalPrice: 1500 },
  ];

  const subtotal = accessories.reduce((sum, item) => sum + item.totalPrice, 0);

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>直播设备购买发票</title>
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
        
        .invoice {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 3px solid #ff6b35;
            padding-bottom: 20px;
        }
        
        .company-info h1 {
            font-size: 28px;
            color: #ff6b35;
            margin-bottom: 5px;
        }
        
        .company-info p {
            font-size: 12px;
            color: #666;
            margin: 3px 0;
        }
        
        .invoice-title {
            text-align: right;
        }
        
        .invoice-title h2 {
            font-size: 24px;
            color: #ff6b35;
            margin-bottom: 10px;
        }
        
        .invoice-meta {
            font-size: 12px;
            color: #666;
            line-height: 1.8;
        }
        
        .invoice-meta strong {
            color: #333;
        }
        
        .content {
            margin: 30px 0;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #ff6b35;
            text-transform: uppercase;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
        }
        
        .info-label {
            color: #666;
            font-weight: 500;
        }
        
        .info-value {
            color: #333;
            font-weight: 600;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        table thead {
            background-color: #fff3e0;
        }
        
        table th {
            padding: 12px;
            text-align: left;
            font-size: 12px;
            font-weight: bold;
            color: #ff6b35;
            border-bottom: 2px solid #ff6b35;
        }
        
        table td {
            padding: 12px;
            font-size: 13px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        table tr:last-child td {
            border-bottom: 2px solid #ff6b35;
        }
        
        .amount-right {
            text-align: right;
        }
        
        .summary {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
        }
        
        .summary-table {
            width: 350px;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-row.total {
            font-size: 16px;
            font-weight: bold;
            color: #ff6b35;
            border-bottom: 2px solid #ff6b35;
            padding: 12px 0;
        }
        
        .equipment-info {
            background: #fff3e0;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ff6b35;
        }
        
        .equipment-info h3 {
            color: #ff6b35;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .equipment-info p {
            font-size: 13px;
            color: #666;
            margin: 5px 0;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 11px;
            color: #999;
            text-align: center;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        .badge {
            display: inline-block;
            background: #ff6b35;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .invoice {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <div class="company-info">
                <h1>🎬 直播设备商城</h1>
                <p>地址：北京市朝阳区建国路1号</p>
                <p>电话：010-1234-5678</p>
                <p>邮箱：equipment@livestream.com</p>
                <p>税号：91110105MA00XXXX0X</p>
            </div>
            <div class="invoice-title">
                <h2>设备购买发票</h2>
                <div class="invoice-meta">
                    <div><strong>发票号：</strong>${invoiceNumber}</div>
                    <div><strong>发票日期：</strong>${invoiceDate}</div>
                    <div><strong>发票类型：</strong>增值税普通发票</div>
                    <div><span class="badge">设备类</span></div>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-title">购买方信息</div>
                <div class="info-row">
                    <span class="info-label">名称：</span>
                    <span class="info-value">${userName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">邮箱：</span>
                    <span class="info-value">${purchase.user.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">电话：</span>
                    <span class="info-value">${purchase.user.phone || '未提供'}</span>
                </div>
            </div>
            
            <div class="equipment-info">
                <h3>📦 购买设备套装</h3>
                <p><strong>套装名称：</strong>${purchase.service.title}</p>
                <p><strong>套装类别：</strong>${purchase.service.category}</p>
                <p><strong>购买编号：</strong>${purchase.id}</p>
            </div>
            
            <div class="section">
                <div class="section-title">设备和配件清单</div>
                <table>
                    <thead>
                        <tr>
                            <th>设备/配件名称</th>
                            <th>型号</th>
                            <th class="amount-right">数量</th>
                            <th class="amount-right">单价（元）</th>
                            <th class="amount-right">小计（元）</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${accessories.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.model}</td>
                            <td class="amount-right">${item.quantity}</td>
                            <td class="amount-right">¥${item.unitPrice.toLocaleString('zh-CN')}</td>
                            <td class="amount-right">¥${item.totalPrice.toLocaleString('zh-CN')}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="summary">
                <div class="summary-table">
                    <div class="summary-row">
                        <span>设备小计：</span>
                        <span>¥${subtotal.toLocaleString('zh-CN')}</span>
                    </div>
                    <div class="summary-row">
                        <span>税率（13%）：</span>
                        <span>¥${tax.toLocaleString('zh-CN')}</span>
                    </div>
                    <div class="summary-row total">
                        <span>合计金额：</span>
                        <span>¥${total.toLocaleString('zh-CN')}</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">备注</div>
                <p style="font-size: 13px; color: #666; line-height: 1.6;">
                    • 所有设备均为全新正品，享受一年保修服务<br>
                    • 配件清单详见上表，请妥善保管<br>
                    • 如有质量问题，请在收货后7天内联系我们<br>
                    • 技术支持电话：010-1234-5678
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p>此发票由系统自动生成，具有法律效力</p>
            <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
            <p>如有疑问，请联系客服：010-1234-5678 或 equipment@livestream.com</p>
        </div>
    </div>
    
    <script>
        window.addEventListener('load', function() {
            window.print();
        });
    </script>
</body>
</html>
  `;
}
