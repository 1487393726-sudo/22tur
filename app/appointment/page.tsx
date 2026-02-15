"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Palette,
  Code,
  Rocket,
} from "lucide-react";

interface TimeSlot {
  start: string;
  end: string;
}

interface AvailableSlots {
  date: string;
  duration: number;
  workingHours: { start: string; end: string };
  availableSlots: TimeSlot[];
}

const serviceTypes = [
  { id: "design", name: "设计咨询", icon: Palette, color: "text-pink-400" },
  { id: "development", name: "开发咨询", icon: Code, color: "text-blue-400" },
  { id: "startup", name: "创业咨询", icon: Rocket, color: "text-purple-400" },
];

const durations = [
  { value: 30, label: "30分钟" },
  { value: 60, label: "1小时" },
  { value: 90, label: "1.5小时" },
];

export default function AppointmentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form data
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    topic: "",
    notes: "",
  });

  useEffect(() => {
    if (selectedDate && selectedDuration) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedDuration]);

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
      }));
    }
  }, [session]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const res = await fetch(
        `/api/appointments/available?date=${dateStr}&duration=${selectedDuration}`
      );
      if (res.ok) {
        const data: AvailableSlots = await res.json();
        setAvailableSlots(data.availableSlots);
      }
    } catch (error) {
      console.error("获取可用时间段失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType || !selectedSlot || !formData.name || !formData.email) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          scheduledAt: selectedSlot.start,
          duration: selectedDuration,
          topic: formData.topic,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const error = await res.json();
        alert(error.error || "预约失败，请重试");
      }
    } catch (error) {
      console.error("预约失败:", error);
      alert("预约失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedType;
      case 2:
        return !!selectedSlot;
      case 3:
        return !!formData.name && !!formData.email && !!formData.topic;
      default:
        return true;
    }
  };

  // Calendar navigation
  const goToPrevMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
    );
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateSelectable = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center px-4">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">预约成功！</h1>
            <p className="text-gray-400 mb-8 max-w-md">
              我们已收到您的预约请求，将在24小时内通过邮件确认预约详情。
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="border-slate-700"
              >
                返回首页
              </Button>
              <Button
                onClick={() => {
                  setSuccess(false);
                  setStep(1);
                  setSelectedType("");
                  setSelectedSlot(null);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                再次预约
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <main className="pt-20">
        {/* Header */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              预约咨询
            </h1>
            <p className="text-gray-400">
              选择您感兴趣的服务类型，预约与我们专家的一对一咨询
            </p>
          </div>
        </section>

        {/* Progress Steps */}
        <section className="px-4 pb-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              {["选择服务", "选择时间", "填写信息", "确认预约"].map(
                (label, index) => (
                  <div key={label} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                        step > index + 1
                          ? "bg-green-500 text-white"
                          : step === index + 1
                          ? "bg-blue-500 text-white"
                          : "bg-slate-700 text-gray-400"
                      }`}
                    >
                      {step > index + 1 ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`ml-2 text-sm hidden md:block ${
                        step >= index + 1 ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {label}
                    </span>
                    {index < 3 && (
                      <div
                        className={`w-12 md:w-24 h-0.5 mx-2 ${
                          step > index + 1 ? "bg-green-500" : "bg-slate-700"
                        }`}
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Form Content */}
        <section className="px-4 pb-20">
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8">
              {/* Step 1: Select Service Type */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">
                    选择咨询类型
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {serviceTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className={`p-6 rounded-xl border transition-all text-left ${
                            selectedType === type.id
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <Icon className={`w-8 h-8 ${type.color} mb-3`} />
                          <h3 className="text-white font-medium">{type.name}</h3>
                        </button>
                      );
                    })}
                  </div>

                  <h3 className="text-lg font-medium text-white mb-4">
                    选择咨询时长
                  </h3>
                  <div className="flex gap-3">
                    {durations.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setSelectedDuration(d.value)}
                        className={`px-6 py-3 rounded-lg border transition-all ${
                          selectedDuration === d.value
                            ? "border-blue-500 bg-blue-500/10 text-white"
                            : "border-slate-700 text-gray-400 hover:border-slate-600"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Date & Time */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">
                    选择日期和时间
                  </h2>

                  {/* Calendar */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={goToPrevMonth}
                        className="p-2 hover:bg-slate-700 rounded-lg"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                      </button>
                      <span className="text-white font-medium">
                        {selectedDate.toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "long",
                        })}
                      </span>
                      <button
                        onClick={goToNextMonth}
                        className="p-2 hover:bg-slate-700 rounded-lg"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-gray-500 text-sm py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {getDaysInMonth().map((date, index) => (
                        <button
                          key={index}
                          onClick={() => date && isDateSelectable(date) && setSelectedDate(date)}
                          disabled={!isDateSelectable(date)}
                          className={`p-3 rounded-lg text-center transition-all ${
                            !date
                              ? "invisible"
                              : !isDateSelectable(date)
                              ? "text-gray-600 cursor-not-allowed"
                              : date.toDateString() === selectedDate.toDateString()
                              ? "bg-blue-500 text-white"
                              : "text-gray-300 hover:bg-slate-700"
                          }`}
                        >
                          {date?.getDate()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">
                      可用时间段
                    </h3>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        该日期暂无可用时间段
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {availableSlots.map((slot) => {
                          const time = new Date(slot.start).toLocaleTimeString(
                            "zh-CN",
                            { hour: "2-digit", minute: "2-digit" }
                          );
                          return (
                            <button
                              key={slot.start}
                              onClick={() => setSelectedSlot(slot)}
                              className={`px-4 py-3 rounded-lg border transition-all ${
                                selectedSlot?.start === slot.start
                                  ? "border-blue-500 bg-blue-500/10 text-white"
                                  : "border-slate-700 text-gray-400 hover:border-slate-600"
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Contact Info */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">
                    填写联系信息
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        姓名 *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="请输入您的姓名"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        邮箱 *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="请输入您的邮箱"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        电话
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="请输入您的电话（选填）"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        咨询主题 *
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={formData.topic}
                          onChange={(e) =>
                            setFormData({ ...formData, topic: e.target.value })
                          }
                          className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="请简要描述您想咨询的内容"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        备注
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                        placeholder="其他需要说明的内容（选填）"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Confirm */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">
                    确认预约信息
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">咨询类型</p>
                      <p className="text-white">
                        {serviceTypes.find((t) => t.id === selectedType)?.name}
                      </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">预约时间</p>
                      <p className="text-white">
                        {selectedSlot &&
                          new Date(selectedSlot.start).toLocaleString("zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        {" "}({selectedDuration}分钟)
                      </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">联系人</p>
                      <p className="text-white">{formData.name}</p>
                      <p className="text-gray-400 text-sm">{formData.email}</p>
                      {formData.phone && (
                        <p className="text-gray-400 text-sm">{formData.phone}</p>
                      )}
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">咨询主题</p>
                      <p className="text-white">{formData.topic}</p>
                      {formData.notes && (
                        <p className="text-gray-400 text-sm mt-2">
                          备注: {formData.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="border-slate-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  上一步
                </Button>
                {step < 4 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    下一步
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        确认预约
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
