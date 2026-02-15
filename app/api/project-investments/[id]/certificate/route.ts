import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 下载投资凭证
 * GET /api/project-investments/[id]/certificate
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

    // 生成凭证内容
    const certificateContent = generateCertificate(investment);

    // 返回PDF或HTML格式的凭证
    return new NextResponse(certificateContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="investment-certificate-${investment.id}.html"`,
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
 * 生成投资凭证HTML内容
 */
function generateCertificate(investment: any): string {
  const investmentDate = new Date(investment.investedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const maturityDate = investment.endDate
    ? new Date(investment.endDate).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '待定';

  const userName = `${investment.user.firstName}${investment.user.lastName}`;

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>投资凭证</title>
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
        
        .project-info {
            background: #f0f4ff;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .project-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 15px;
        }
        
        .project-details {
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
            <div class="title">投资凭证</div>
            <div class="subtitle">INVESTMENT CERTIFICATE</div>
        </div>
        
        <div class="content">
            <div class="content-row">
                <div class="content-item">
                    <div class="label">投资者</div>
                    <div class="value">${userName}</div>
                </div>
                <div class="content-item">
                    <div class="label">投资编号</div>
                    <div class="value">${investment.id}</div>
                </div>
            </div>
            
            <div class="content-row">
                <div class="content-item">
                    <div class="label">投资金额</div>
                    <div class="value">¥${investment.amount.toLocaleString('zh-CN')}</div>
                </div>
                <div class="content-item">
                    <div class="label">投资日期</div>
                    <div class="value">${investmentDate}</div>
                </div>
            </div>
            
            <div class="content-row">
                <div class="content-item">
                    <div class="label">投资状态</div>
                    <div class="value">
                        ${getStatusLabel(investment.status)}
                        <div class="status-badge">${getStatusBadge(investment.status)}</div>
                    </div>
                </div>
                <div class="content-item">
                    <div class="label">到期日期</div>
                    <div class="value">${maturityDate}</div>
                </div>
            </div>
        </div>
        
        <div class="project-info">
            <div class="project-title">投资项目信息</div>
            <div class="project-details">
                <div class="detail-item">
                    <div class="detail-label">项目名称</div>
                    <div class="detail-value">${investment.project.title}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">预期回报率</div>
                    <div class="detail-value">${investment.project.expectedReturn}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">投资期限</div>
                    <div class="detail-value">${investment.project.duration}个月</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">预期收益</div>
                    <div class="detail-value">¥${(investment.amount * investment.project.expectedReturn / 100).toLocaleString('zh-CN')}</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>本凭证是投资者与我们之间的投资协议证明。</p>
            <p>This certificate is proof of investment agreement between the investor and us.</p>
            <div class="certificate-number">凭证号: ${investment.id} | 生成时间: ${new Date().toLocaleString('zh-CN')}</div>
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
    COMPLETED: '已完成',
    REFUNDED: '已退款',
    FAILED: '失败',
  };
  return labels[status] || status;
}

/**
 * 获取状态徽章
 */
function getStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    PENDING: '处理中',
    COMPLETED: '已确认',
    REFUNDED: '已退款',
    FAILED: '失败',
  };
  return badges[status] || status;
}
