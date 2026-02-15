import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 下载购买服务条款
 * GET /api/purchases/[id]/terms
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

    // 生成服务条款内容
    const termsContent = generateTerms(purchase);

    // 返回HTML格式的服务条款
    return new NextResponse(termsContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="purchase-terms-${purchase.id}.html"`,
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
function generateTerms(purchase: any): string {
  const purchaseDate = new Date(purchase.purchaseDate).toLocaleDateString('zh-CN', {
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
    <title>服务条款</title>
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
            <h1>服务条款</h1>
            <p>Service Terms and Conditions</p>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-title">1. 服务基本信息</div>
                <div class="section-content">
                    <p><strong>服务名称：</strong>${purchase.service.title}</p>
                    <p><strong>服务价格：</strong>¥${purchase.amount.toLocaleString('zh-CN')}</p>
                    <p><strong>购买日期：</strong>${purchaseDate}</p>
                    <p><strong>购买编号：</strong>${purchase.id}</p>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">2. 服务内容</div>
                <div class="section-content">
                    <ol>
                        <li>本服务包括专业的服务支持和技术协助。</li>
                        <li>服务提供者将按照合同约定的方式和时间提供服务。</li>
                        <li>服务包括但不限于：咨询、技术支持、维护等。</li>
                        <li>服务提供者有权根据实际情况调整服务内容。</li>
                    </ol>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">3. 用户权利</div>
                <div class="section-content">
                    <ol>
                        <li>用户有权获得约定的服务。</li>
                        <li>用户有权查询服务的进展情况。</li>
                        <li>用户有权获得定期的服务报告。</li>
                        <li>用户有权对服务质量进行评价。</li>
                        <li>用户有权在符合条件的情况下申请退款。</li>
                    </ol>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">4. 用户义务</div>
                <div class="section-content">
                    <ol>
                        <li>用户应按时支付服务费用。</li>
                        <li>用户应提供真实、准确的个人信息。</li>
                        <li>用户应遵守国家法律法规和公司的相关规定。</li>
                        <li>用户应配合服务提供者进行必要的工作。</li>
                        <li>用户应保护好服务相关的账户和密码。</li>
                    </ol>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">5. 服务期限</div>
                <div class="section-content">
                    <p>5.1 服务期限自购买之日起开始计算。</p>
                    <p>5.2 服务期限届满后，用户可选择续费或终止服务。</p>
                    <p>5.3 服务期间如有中断，服务提供者将及时通知用户。</p>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">6. 费用和支付</div>
                <div class="section-content">
                    <p>6.1 服务费用为 ¥${purchase.amount.toLocaleString('zh-CN')}。</p>
                    <p>6.2 支付方式为 ${purchase.paymentMethod || '在线支付'}。</p>
                    <p>6.3 费用已包含所有税费。</p>
                    <p>6.4 如有额外费用，将提前通知用户。</p>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">7. 退款政策</div>
                <div class="section-content">
                    <div class="highlight">
                        <strong>退款条件：</strong>
                        <ol style="margin-left: 20px;">
                            <li>用户可在购买后 7 天内申请无条件退款。</li>
                            <li>如服务未开始，可全额退款。</li>
                            <li>如服务已开始，按实际使用天数计算退款。</li>
                            <li>退款将在 5-10 个工作日内处理。</li>
                        </ol>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">8. 免责声明</div>
                <div class="section-content">
                    <p>8.1 服务提供者不对因用户操作不当导致的损失负责。</p>
                    <p>8.2 服务提供者不对不可抗力因素导致的服务中断负责。</p>
                    <p>8.3 用户应自行备份重要数据。</p>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">9. 争议解决</div>
                <div class="section-content">
                    <p>9.1 本条款的解释权归服务提供者所有。</p>
                    <p>9.2 因本条款引起的任何争议，双方应首先通过友好协商解决。</p>
                    <p>9.3 协商不成的，任何一方可向有管辖权的人民法院提起诉讼。</p>
                    <p>9.4 本条款受中华人民共和国法律管辖。</p>
                </div>
            </div>
            
            <div class="signature-section">
                <p style="text-align: center; font-weight: bold; margin-bottom: 30px;">用户确认</p>
                <div class="signature-row">
                    <div class="signature-item">
                        <p>用户签名：</p>
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
            <p>购买编号：${purchase.id}</p>
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
