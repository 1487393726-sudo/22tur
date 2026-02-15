import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { scanType } = await request.json();

    // 模拟扫描过程
    const scanResults = {
      malware: {
        name: "恶意软件检测",
        status: "completed",
        issues: 0,
        details: "未检测到恶意软件",
      },
      vulnerabilities: {
        name: "漏洞扫描",
        status: "completed",
        issues: 2,
        details: [
          { id: 1, severity: "HIGH", description: "SQL 注入漏洞" },
          { id: 2, severity: "MEDIUM", description: "跨站脚本漏洞" },
        ],
      },
      configuration: {
        name: "配置审计",
        status: "completed",
        issues: 1,
        details: [
          { id: 1, severity: "MEDIUM", description: "弱密码策略" },
        ],
      },
      permissions: {
        name: "权限检查",
        status: "completed",
        issues: 0,
        details: "权限配置正确",
      },
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: scanResults,
      securityScore: 92,
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Scan failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 获取最近的扫描结果
    const recentScans = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: "full",
        status: "completed",
        issues: 3,
        securityScore: 92,
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        type: "quick",
        status: "completed",
        issues: 1,
        securityScore: 95,
      },
    ];

    return NextResponse.json({
      success: true,
      scans: recentScans,
    });
  } catch (error) {
    console.error("Error fetching scans:", error);
    return NextResponse.json(
      { error: "Failed to fetch scans" },
      { status: 500 }
    );
  }
}
