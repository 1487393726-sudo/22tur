/**
 * 预约工具函数
 * 
 * 实现日期分类、可用时间段过滤等函数
 */

import type { Appointment, TimeSlot, AppointmentStatus } from "@/types/dashboard";

/**
 * 预约日期分类结果
 */
export type DateCategory = "upcoming" | "past" | "today";

/**
 * 获取日期的开始时间（00:00:00）
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 获取日期的结束时间（23:59:59）
 */
export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * 分类预约日期
 * 
 * @param appointmentDate 预约日期
 * @param referenceDate 参考日期（默认为当前时间）
 * @returns 日期分类：upcoming（未来）、past（过去）、today（今天）
 */
export function categorizeAppointmentDate(
  appointmentDate: Date | string,
  referenceDate: Date = new Date()
): DateCategory {
  const aptDate = typeof appointmentDate === "string" 
    ? new Date(appointmentDate) 
    : appointmentDate;
  
  const todayStart = getStartOfDay(referenceDate);
  const todayEnd = getEndOfDay(referenceDate);
  
  if (aptDate >= todayStart && aptDate <= todayEnd) {
    return "today";
  }
  
  if (aptDate > todayEnd) {
    return "upcoming";
  }
  
  return "past";
}

/**
 * 检查预约是否为即将到来的
 */
export function isUpcomingAppointment(
  appointmentDate: Date | string,
  referenceDate: Date = new Date()
): boolean {
  const category = categorizeAppointmentDate(appointmentDate, referenceDate);
  return category === "upcoming" || category === "today";
}

/**
 * 检查预约是否为过去的
 */
export function isPastAppointment(
  appointmentDate: Date | string,
  referenceDate: Date = new Date()
): boolean {
  return categorizeAppointmentDate(appointmentDate, referenceDate) === "past";
}

/**
 * 默认工作时间配置
 */
export const DEFAULT_WORK_HOURS = {
  start: 9, // 9:00
  end: 18,  // 18:00
  slotDuration: 60, // 60分钟
  breakStart: 12, // 12:00
  breakEnd: 13,   // 13:00
};

/**
 * 生成指定日期的所有时间段
 * 
 * @param date 日期
 * @param slotDuration 时间段时长（分钟）
 * @param workHours 工作时间配置
 * @returns 时间段数组
 */
export function generateTimeSlots(
  date: Date,
  slotDuration: number = DEFAULT_WORK_HOURS.slotDuration,
  workHours = DEFAULT_WORK_HOURS
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dateStr = date.toISOString().split("T")[0];
  
  for (let hour = workHours.start; hour < workHours.end; hour++) {
    // 跳过午休时间
    if (hour >= workHours.breakStart && hour < workHours.breakEnd) {
      continue;
    }
    
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const startHour = hour;
      const startMinute = minute;
      
      // 计算结束时间
      let endHour = startHour;
      let endMinute = startMinute + slotDuration;
      
      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
      }
      
      // 如果结束时间超过工作时间，跳过
      if (endHour > workHours.end || (endHour === workHours.end && endMinute > 0)) {
        continue;
      }
      
      // 如果时间段跨越午休时间，跳过
      if (startHour < workHours.breakStart && endHour > workHours.breakStart) {
        continue;
      }
      
      const start = `${dateStr}T${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}:00`;
      const end = `${dateStr}T${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:00`;
      
      slots.push({ start, end, available: true });
    }
  }
  
  return slots;
}

/**
 * 过滤可用时间段
 * 
 * @param date 日期
 * @param existingAppointments 已存在的预约
 * @param slotDuration 时间段时长（分钟）
 * @returns 可用时间段数组
 */
export function filterAvailableTimeSlots(
  date: Date,
  existingAppointments: Array<{ scheduledAt: string; duration: number; status?: string }>,
  slotDuration: number = DEFAULT_WORK_HOURS.slotDuration
): TimeSlot[] {
  const allSlots = generateTimeSlots(date, slotDuration);
  const now = new Date();
  
  // 过滤掉已预约的时间段和过去的时间段
  return allSlots.filter(slot => {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);
    
    // 过滤掉过去的时间段
    if (slotStart < now) {
      return false;
    }
    
    // 检查是否与已有预约冲突
    const hasConflict = existingAppointments.some(apt => {
      // 跳过已取消的预约
      if (apt.status === "CANCELLED") {
        return false;
      }
      
      const aptStart = new Date(apt.scheduledAt);
      const aptEnd = new Date(aptStart.getTime() + apt.duration * 60 * 1000);
      
      // 检查时间段是否重叠
      return slotStart < aptEnd && slotEnd > aptStart;
    });
    
    return !hasConflict;
  }).map(slot => ({ ...slot, available: true }));
}

/**
 * 按日期分组预约
 * 
 * @param appointments 预约列表
 * @returns 按日期分组的预约
 */
export function groupAppointmentsByDate(
  appointments: Appointment[]
): Record<string, Appointment[]> {
  return appointments.reduce((groups, apt) => {
    const dateKey = new Date(apt.scheduledAt).toISOString().split("T")[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(apt);
    return groups;
  }, {} as Record<string, Appointment[]>);
}

/**
 * 按状态分组预约
 * 
 * @param appointments 预约列表
 * @returns 按状态分组的预约
 */
export function groupAppointmentsByStatus(
  appointments: Appointment[]
): Record<AppointmentStatus, Appointment[]> {
  const groups: Record<AppointmentStatus, Appointment[]> = {
    SCHEDULED: [],
    CONFIRMED: [],
    COMPLETED: [],
    CANCELLED: [],
  };
  
  appointments.forEach(apt => {
    if (groups[apt.status]) {
      groups[apt.status].push(apt);
    }
  });
  
  return groups;
}

/**
 * 获取即将到来的预约
 * 
 * @param appointments 预约列表
 * @param limit 限制数量
 * @returns 即将到来的预约
 */
export function getUpcomingAppointments(
  appointments: Appointment[],
  limit?: number
): Appointment[] {
  const now = new Date();
  
  const upcoming = appointments
    .filter(apt => {
      const aptDate = new Date(apt.scheduledAt);
      return aptDate >= now && apt.status !== "CANCELLED" && apt.status !== "COMPLETED";
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  
  return limit ? upcoming.slice(0, limit) : upcoming;
}

/**
 * 格式化时间段显示
 * 
 * @param slot 时间段
 * @returns 格式化的时间字符串
 */
export function formatTimeSlot(slot: TimeSlot): string {
  const start = new Date(slot.start);
  const end = new Date(slot.end);
  
  const formatTime = (date: Date) => 
    date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * 计算预约距离现在的时间
 * 
 * @param appointmentDate 预约日期
 * @returns 距离描述
 */
export function getTimeUntilAppointment(appointmentDate: Date | string): string {
  const aptDate = typeof appointmentDate === "string" 
    ? new Date(appointmentDate) 
    : appointmentDate;
  
  const now = new Date();
  const diffMs = aptDate.getTime() - now.getTime();
  
  if (diffMs < 0) {
    return "已过期";
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}天后`;
  }
  
  if (diffHours > 0) {
    return `${diffHours}小时后`;
  }
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `${diffMinutes}分钟后`;
}
