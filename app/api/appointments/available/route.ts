import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/appointments/available - 获取可用时间段
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const duration = parseInt(searchParams.get("duration") || "60");

    if (!dateStr) {
      return NextResponse.json(
        { error: "请提供日期参数" },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0); // 工作时间从9点开始

    const endOfDay = new Date(date);
    endOfDay.setHours(18, 0, 0, 0); // 工作时间到18点结束

    // 获取当天已有的预约
    const existingAppointments = await prisma.clientAppointment.findMany({
      where: {
        scheduledAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      select: {
        scheduledAt: true,
        duration: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    // 生成可用时间段
    const availableSlots: { start: string; end: string }[] = [];
    const slotDuration = duration; // 分钟
    const now = new Date();

    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000);

      // 检查是否是未来时间
      if (currentTime > now) {
        // 检查是否与已有预约冲突
        const hasConflict = existingAppointments.some((apt) => {
          const aptStart = new Date(apt.scheduledAt);
          const aptEnd = new Date(aptStart.getTime() + apt.duration * 60 * 1000);

          // 检查时间段是否重叠
          return (
            (currentTime >= aptStart && currentTime < aptEnd) ||
            (slotEnd > aptStart && slotEnd <= aptEnd) ||
            (currentTime <= aptStart && slotEnd >= aptEnd)
          );
        });

        if (!hasConflict && slotEnd <= endOfDay) {
          availableSlots.push({
            start: currentTime.toISOString(),
            end: slotEnd.toISOString(),
          });
        }
      }

      // 移动到下一个时间段（每30分钟一个间隔）
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }

    return NextResponse.json({
      date: dateStr,
      duration,
      workingHours: {
        start: "09:00",
        end: "18:00",
      },
      availableSlots,
    });
  } catch (error) {
    console.error("获取可用时间段失败:", error);
    return NextResponse.json(
      { error: "获取可用时间段失败" },
      { status: 500 }
    );
  }
}
