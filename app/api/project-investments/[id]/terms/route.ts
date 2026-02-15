import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 下载投资服务条款
 * GET /api/project-investments/[id]/terms
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

    // 生成服务条款内容
    const termsContent = generateTerms(investment);

    // 返回HTML格式的服务条款
    return new NextResponse(termsContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="terms-${investment.id}.html"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate terms:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate terms: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 生成服务条款HTML内容
 */
function generateTerms(investment: any): string {
  const investmentDate = new Date(investment.investedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const maturityDate = new Date(
    new Date(investment.investedAt).getTime() + investment.project.duration * 30 * 24 * 60 * 60 * 1000
  ).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>投资服务条款</title>
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
            line-height: 1.8;
        }
        
        .document {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 50px 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 20px;
        }
        
        .header h1 {
            font-size: 28px;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 12px;
            color: #666;
        }
        
        .content {
            font-size: 13px;
            color: #333;
            line-height: 2;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 12px;
            padding-left: 10px;
            border-left: 3px solid #1e40af;
        }
        
        .section-content {
            margin-left: 20px;
            line-height: 1.8;
        }
        
        .section-content p {
            margin-bottom: 10px;
            text-align: justify;
        }
        
        .section-content ol {
            margin-left: 20px;
            margin-bottom: 10px;
        }
        
        .section-content li {
            margin-bottom: 8px;
            text-align: justify;
        }
        
        .highlight {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 3px solid #ffc107;
            margin: 15px 0;
            border-radius: 4px;
        }
        
        .highlight strong {
            color: #856404;
        }
        
        .signature-section {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
        }
        
        .signature-row {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
        
        .signature-item {
            text-align: center;
            width: 40%;
        }
        
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 30px;
            padding-top: 5px;
            font-size: 12px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 11px;
            color: #999;
            text-align: center;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .document {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="document">
        <div class="header">
            <h1>投资服务条款</h1>
            <p>Investment Service Terms and Conditions</p>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-title">1. 投资项目基本信息</div>
                <div class="section-content">
                    <p><strong>项目名称：</strong>${investment.project.title}</p>
                    <p><strong>投资金额：</strong>¥${investment.amount.toLocaleString('zh-CN')}</p>
                    <p><strong>投资期限：</strong>${investment.project.duration}个月</p>
                    <p><strong>预期年化收益率：</strong>${investment.project.expectedReturn}%</p>
                    <p><strong>投资日期：</strong>${investmentDate}</p>
                    <p><strong>到期日期：</strong>${maturityDate}</p>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">2. 投资者权利</div>
                <div class="section-content">
                    <ol>
                        <li>投资者有权获得约定的投资收益，收益按照合同约定的方式和时间支付。</li>
                        <li>投资者有权查询投资项目的进展情况和财务状况。</li>
                        <li>投资者有权获得定期的投资报告和收益报表。</li>
                        <li>投资者有权在符合条件的情况下提前退出投资。</li>
                        <li>投资者有权对公司的投资管理进行监督。</li>
                    </ol>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">3. 投资者义务</div>
                <div class="section-content">
                    <ol>
                        <li>投资者应按时足额支付投资款项。</li>
                        <li>投资者应提供真实、准确的个人信息和联系方式。</li>
                        <li>投资者应遵守国家法律法规和公司的相关规定。</li>
                        <li>投资者应保管好投资凭证和相关文件。</li>
                        <li>投资者应配合公司进行必要的信息核实和风险评估。</li>
                    </ol>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">4. 收益分配</div>
                <div class="section-content">
                    <p>4.1 收益计算方式：按照投资金额和年化收益率计算，公式为：预期收益 = 投资金额 × 年化收益率 × 投资期限（年）</p>
                    <p>4.2 收益支付方式：收益将按照合同约定的方式（月付、季付或到期一次性支付）支付至投资者指定的账户。</p>
                    <p>4.3 收益支付时间：收益支付将在每个支付周期的规定日期进行，如遇法定假日，顺延至下一个工作日。</p>
                    <p>4.4 税费处理：投资收益需按照国家税法规定缴纳相关税费，具体税费由投资者承担。</p>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">5. 风险提示</div>
                <div class="section-content">
                    <div class="highlight">
                        <strong>重要风险提示：</strong>
                        <p>投资有风险，过往收益不代表未来表现。投资者应充分了解投资风险，包括但不限于：</p>
                        <ol style="margin-left: 20px;">
                            <li>市场风险：投资项目的收益可能因市场变化而波动。</li>
                            <li>流动性风险：投资期间可能无法随时提取资金。</li>
                            <li>信用风险：项目方可能无法按时支付收益或本金。</li>
                            <li>政策风险：国家政策变化可能影响投资收益。</li>
                            <li>其他风险：包括但不限于自然灾害、技术故障等不可抗力因素。</li>
                        </ol>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">6. 提前退出</div>
                <div class="section-content">
                    <p>6.1 投资者可在投资期限届满前申请提前退出，但需满足以下条件：</p>
                    <ol style="margin-left: 20px;">
                        <li>投资已满6个月以上。</li>
                        <li>提前退出需支付0.5%的手续费。</li>
                        <li>提前退出的收益按实际投资天数计算。</li>
                    </ol>
                    <p>6.2 公司将在收到提前退出申请后的5个工作日内处理，并将本金和收益支付至投资者指定账户。</p>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">7. 信息披露</div>
                <div class="section-content">
                    <p>公司承诺定期向投资者披露以下信息：</p>
                    <ol style="margin-left: 20px;">
                        <li>月度投资项目进展报告。</li>
                        <li>季度财务报表和收益报告。</li>
                        <li>年度审计报告和投资总结。</li>
                        <li>重大事项公告和风险预警。</li>
                    </ol>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">8. 争议解决</div>
                <div class="section-content">
                    <p>8.1 本条款的解释权归公司所有。</p>
                    <p>8.2 因本条款引起的任何争议，双方应首先通过友好协商解决。</p>
                    <p>8.3 协商不成的，任何一方可向有管辖权的人民法院提起诉讼。</p>
                    <p>8.4 本条款受中华人民共和国法律管辖。</p>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">9. 条款生效</div>
                <div class="section-content">
                    <p>本条款自投资者确认投资之日起生效，至投资期限届满或投资提前退出之日止。</p>
                </div>
            </div>
            
            <div class="signature-section">
                <p style="text-align: center; font-weight: bold; margin-bottom: 30px;">投资者确认</p>
                <div class="signature-row">
                    <div class="signature-item">
                        <p>投资者签名：</p>
                        <div class="signature-line"></div>
                    </div>
                    <div class="signature-item">
                        <p>签署日期：</p>
                        <div class="signature-line"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>本文件由系统自动生成，具有法律效力</p>
            <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
            <p>投资编号：${investment.id}</p>
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
