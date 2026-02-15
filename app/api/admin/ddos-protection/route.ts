import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const ddosStatus = {
      enabled: true,
      currentRequestRate: 1234,
      blockedRequests: 45,
      lastAttackTime: new Date(Date.now() - 3600000).toISOString(),
      rules: {
        rateLimit: {
          enabled: true,
          requestsPerSecond: 1000,
          description: "限制每个 IP 的请求速率",
        },
        geoBlocking: {
          enabled: true,
          blockedCountries: ["KP", "IR"],
          description: "阻止来自特定地区的请求",
        },
        ipBlacklist: {
          enabled: true,
          blockedIPs: 156,
          description: "阻止已知恶意 IP",
        },
        captchaChallenge: {
          enabled: false,
          threshold: 100,
          description: "可疑请求需要验证",
        },
      },
      recentAttacks: [
        {
          id: "1",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          type: "SYN Flood",
          sourceIP: "192.168.1.100",
          blocked: true,
          requestCount: 50000,
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: "HTTP Flood",
          sourceIP: "10.0.0.50",
          blocked: true,
          requestCount: 30000,
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: "DNS Amplification",
          sourceIP: "172.16.0.1",
          blocked: true,
          requestCount: 100000,
        },
      ],
      statistics: {
        totalAttacksDetected: 156,
        totalAttacksBlocked: 156,
        blockRate: 100,
        averageResponseTime: 45,
      },
    };

    return NextResponse.json(ddosStatus);
  } catch (error) {
    console.error("Error fetching DDoS status:", error);
    return NextResponse.json(
      { error: "Failed to fetch DDoS status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, config } = await request.json();

    if (action === "updateRule") {
      // 更新防护规则
      return NextResponse.json({
        success: true,
        message: "Rule updated successfully",
        rule: config,
      });
    }

    if (action === "blockIP") {
      // 添加 IP 到黑名单
      return NextResponse.json({
        success: true,
        message: "IP blocked successfully",
        ip: config.ip,
      });
    }

    if (action === "unblockIP") {
      // 从黑名单移除 IP
      return NextResponse.json({
        success: true,
        message: "IP unblocked successfully",
        ip: config.ip,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating DDoS protection:", error);
    return NextResponse.json(
      { error: "Failed to update DDoS protection" },
      { status: 500 }
    );
  }
}
