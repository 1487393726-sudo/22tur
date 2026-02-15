import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 下载投资发票
 * GET /api/project-investments/[id]/invoice
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

    // 获取投资记录
    const investment = await prisma.projectInvestment.findUnique({
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
        project: {
          select: {
            id: true,
            title: true,
            expectedReturn: true,
            duration: true,
          },
        },
      },
    });

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    // 验证用户权限
    if (investment.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 生成发票内容
    const invoiceContent = generateInvoice(investment);

    // 返回HTML格式的发票
    return new NextResponse(invoiceContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="invoice-${investment.id}.html"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate invoice: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 生成发票HTML内容
 */
function generateInvoice(investment: any): string {
  const invoiceDate = new Date(investment.investedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const invoiceNumber = `INV-${investment.id.substring(0, 8).toUpperCase()}-${new Date(investment.investedAt).getFullYear()}`;
  const userName = `${investment.user.firstName}${investment.user.lastName}`;
  const tax = investment.amount * 0.06; // 6% 税率
  const total = investment.amount + tax;

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>投资发票</title>
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
            max-width: 900px;
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
            border-bottom: 2px solid #1e40af;
            padding-bottom: 20px;
        }
        
        .company-info h1 {
            font-size: 28px;
            color: #1e40af;
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
            color: #1e40af;
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
            color: #1e40af;
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
            background-color: #f0f4ff;
        }
        
        table th {
            padding: 12px;
            text-align: left;
            font-size: 12px;
            font-weight: bold;
            color: #1e40af;
            border-bottom: 2px solid #1e40af;
        }
        
        table td {
            padding: 12px;
            font-size: 13px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        table tr:last-child td {
            border-bottom: 2px solid #1e40af;
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
            width: 300px;
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
            color: #1e40af;
            border-bottom: 2px solid #1e40af;
            padding: 12px 0;
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
        
        .stamp {
            position: absolute;
            top: 50%;
            right: 10%;
            font-size: 48px;
            color: rgba(30, 64, 175, 0.1);
            transform: rotate(-15deg);
            font-weight: bold;
            pointer-events: none;
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
                <h1>投资管理公司</h1>
                <p>地址：北京市朝阳区建国路1号</p>
                <p>电话：010-1234-5678</p>
                <p>邮箱：info@investment.com</p>
                <p>税号：91110105MA00XXXX0X</p>
            </div>
            <div class="invoice-title">
                <h2>发票</h2>
                <div class="invoice-meta">
                    <div><strong>发票号：</strong>${invoiceNumber}</div>
                    <div><strong>发票日期：</strong>${invoiceDate}</div>
                    <div><strong>发票类型：</strong>增值税普通发票</div>
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
                    <span class="info-value">${investment.user.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">电话：</span>
                    <span class="info-value">${investment.user.phone || '未提供'}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">发票详情</div>
                <table>
                    <thead>
                        <tr>
                            <th>项目名称</th>
                            <th>规格型号</th>
                            <th>单位</th>
                            <th class="amount-right">单价</th>
                            <th class="amount-right">数量</th>
                            <th class="amount-right">金额</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${investment.project.title}</td>
                            <td>${investment.project.expectedReturn}% 年化收益</td>
                            <td>项</td>
                            <td class="amount-right">¥${investment.amount.toLocaleString('zh-CN')}</td>
                            <td class="amount-right">1</td>
                            <td class="amount-right">¥${investment.amount.toLocaleString('zh-CN')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="summary">
                <div class="summary-table">
                    <div class="summary-row">
                        <span>小计：</span>
                        <span>¥${investment.amount.toLocaleString('zh-CN')}</span>
                    </div>
                    <div class="summary-row">
                        <span>税率（6%）：</span>
                        <span>¥${tax.toLocaleString('zh-CN')}</span>
                    </div>
                    <div class="summary-row total">
                        <span>合计：</span>
                        <span>¥${total.toLocaleString('zh-CN')}</span>
                    </div>
                </div>
            </div>
            
            <div class="section" style="margin-top: 40px;">
                <div class="section-title">备注</div>
                <p style="font-size: 13px; color: #666; line-height: 1.6;">
                    本发票为投资项目的收款凭证。投资期限：${investment.project.duration}个月。
                    预期年化收益率：${investment.project.expectedReturn}%。
                    ${investment.notes ? `备注：${investment.notes}` : ''}
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p>此发票由系统自动生成，具有法律效力</p>
            <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
            <p>如有疑问，请联系客服：010-1234-5678</p>
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
