import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 下载投资质量证书
 * GET /api/project-investments/[id]/quality-certificate
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

    // 生成质量证书内容
    const certificateContent = generateQualityCertificate(investment);

    // 返回HTML格式的质量证书
    return new NextResponse(certificateContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="quality-certificate-${investment.id}.html"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate quality certificate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate quality certificate: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 生成质量证书HTML内容
 */
function generateQualityCertificate(investment: any): string {
  const certificateDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const certificateNumber = `QC-${investment.id.substring(0, 8).toUpperCase()}-${new Date().getFullYear()}`;
  const userName = `${investment.user.firstName}${investment.user.lastName}`;

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>投资质量证书</title>
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
            padding: 60px 50px;
            border: 4px solid #10b981;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            position: relative;
            background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
        }
        
        .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 10px;
            background: linear-gradient(90deg, #10b981, #34d399);
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .logo-area {
            font-size: 48px;
            margin-bottom: 15px;
        }
        
        .title {
            font-size: 36px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 5px;
            letter-spacing: 2px;
        }
        
        .subtitle {
            font-size: 14px;
            color: #666;
            letter-spacing: 1px;
        }
        
        .certificate-number {
            text-align: center;
            margin: 20px 0;
            font-size: 12px;
            color: #999;
        }
        
        .content {
            margin: 40px 0;
            line-height: 2;
        }
        
        .content-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid #d1fae5;
        }
        
        .content-item {
            flex: 1;
        }
        
        .label {
            font-size: 11px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        
        .value {
            font-size: 16px;
            font-weight: bold;
            color: #10b981;
        }
        
        .quality-metrics {
            background: #f0fdf4;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 4px solid #10b981;
        }
        
        .metrics-title {
            font-size: 14px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 15px;
        }
        
        .metric-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 13px;
        }
        
        .metric-label {
            color: #666;
        }
        
        .metric-value {
            font-weight: bold;
            color: #10b981;
        }
        
        .quality-standards {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 12px;
            color: #666;
            line-height: 1.8;
        }
        
        .standards-title {
            font-weight: bold;
            color: #10b981;
            margin-bottom: 10px;
        }
        
        .standards-list {
            margin-left: 20px;
        }
        
        .standards-list li {
            margin-bottom: 8px;
        }
        
        .verification-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #d1fae5;
        }
        
        .verification-title {
            font-size: 12px;
            font-weight: bold;
            color: #10b981;
            text-transform: uppercase;
            margin-bottom: 15px;
        }
        
        .verification-items {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .verification-item {
            text-align: center;
        }
        
        .verification-icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .verification-text {
            font-size: 12px;
            color: #666;
            font-weight: bold;
        }
        
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            gap: 40px;
        }
        
        .signature-item {
            flex: 1;
            text-align: center;
        }
        
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 30px;
            padding-top: 5px;
            font-size: 11px;
            color: #666;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #d1fae5;
            font-size: 11px;
            color: #999;
            text-align: center;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        .seal {
            position: absolute;
            bottom: 30px;
            right: 30px;
            font-size: 60px;
            opacity: 0.1;
            transform: rotate(-15deg);
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .certificate {
                box-shadow: none;
                border: 3px solid #10b981;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="seal">✓</div>
        
        <div class="header">
            <div class="logo-area">🏆</div>
            <div class="title">质量证书</div>
            <div class="subtitle">QUALITY CERTIFICATE</div>
            <div class="certificate-number">证书号：${certificateNumber}</div>
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
                    <div class="label">投资项目</div>
                    <div class="value">${investment.project.title}</div>
                </div>
                <div class="content-item">
                    <div class="label">投资金额</div>
                    <div class="value">¥${investment.amount.toLocaleString('zh-CN')}</div>
                </div>
            </div>
            
            <div class="content-row">
                <div class="content-item">
                    <div class="label">证书签发日期</div>
                    <div class="value">${certificateDate}</div>
                </div>
                <div class="content-item">
                    <div class="label">证书有效期</div>
                    <div class="value">${investment.project.duration}个月</div>
                </div>
            </div>
        </div>
        
        <div class="quality-metrics">
            <div class="metrics-title">投资质量指标</div>
            <div class="metric-item">
                <span class="metric-label">项目评级：</span>
                <span class="metric-value">AAA（优秀）</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">风险等级：</span>
                <span class="metric-value">低风险</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">收益稳定性：</span>
                <span class="metric-value">95%</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">投资者满意度：</span>
                <span class="metric-value">98%</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">按时支付率：</span>
                <span class="metric-value">100%</span>
            </div>
        </div>
        
        <div class="quality-standards">
            <div class="standards-title">质量保证标准</div>
            <ul class="standards-list">
                <li>✓ 符合国家投资管理规范和法律要求</li>
                <li>✓ 通过独立第三方审计和评估</li>
                <li>✓ 建立完善的风险管理体系</li>
                <li>✓ 定期披露投资项目信息和财务状况</li>
                <li>✓ 投资者资金安全有保障</li>
                <li>✓ 收益支付按时按额进行</li>
            </ul>
        </div>
        
        <div class="verification-section">
            <div class="verification-title">质量认证</div>
            <div class="verification-items">
                <div class="verification-item">
                    <div class="verification-icon">✓</div>
                    <div class="verification-text">合规认证</div>
                </div>
                <div class="verification-item">
                    <div class="verification-icon">✓</div>
                    <div class="verification-text">安全认证</div>
                </div>
            </div>
        </div>
        
        <div class="signature-section">
            <div class="signature-item">
                <p style="font-size: 12px; color: #666; margin-bottom: 20px;">质量管理部门</p>
                <div class="signature-line"></div>
            </div>
            <div class="signature-item">
                <p style="font-size: 12px; color: #666; margin-bottom: 20px;">签发日期</p>
                <div class="signature-line"></div>
            </div>
        </div>
        
        <div class="footer">
            <p>本证书证明该投资项目已通过质量评估和合规审查</p>
            <p>This certificate confirms that the investment project has passed quality assessment and compliance review</p>
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
