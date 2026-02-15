"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Crown,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Wallet,
  FileText,
  CheckCircle,
  Shield,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import "@/styles/user-pages.css";

// 投资经验选项
const investmentExperience = [
  { value: "none", label: "无投资经验" },
  { value: "beginner", label: "1-2年" },
  { value: "intermediate", label: "3-5年" },
  { value: "advanced", label: "5年以上" },
];

// 投资金额范围
const investmentRanges = [
  { value: "10k-50k", label: "¥10,000 - ¥50,000" },
  { value: "50k-100k", label: "¥50,000 - ¥100,000" },
  { value: "100k-500k", label: "¥100,000 - ¥500,000" },
  { value: "500k+", label: "¥500,000 以上" },
];

// 风险偏好
const riskPreferences = [
  { value: "conservative", label: "保守型", desc: "追求稳定收益，风险承受能力较低" },
  { value: "moderate", label: "稳健型", desc: "平衡收益与风险，适度承担风险" },
  { value: "aggressive", label: "进取型", desc: "追求高收益，能承受较大风险" },
];

export default function InvestApplyPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // 基本信息
    fullName: "",
    email: "",
    phone: "",
    idNumber: "",
    // 投资信息
    experience: "",
    investmentRange: "",
    riskPreference: "",
    investmentGoals: "",
    // 确认
    agreeTerms: false,
    agreeRisk: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // 模拟提交
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const canProceedStep1 =
    formData.fullName && formData.email && formData.phone && formData.idNumber;
  const canProceedStep2 =
    formData.experience && formData.investmentRange && formData.riskPreference;
  const canSubmit = formData.agreeTerms && formData.agreeRisk;

  if (isSubmitted) {
    return (
      <div className="user-page-container">
        <div className="user-page-card max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">申请已提交！</h2>
          <p className="text-white/70 mb-8">
            感谢您的申请！我们的团队将在1-3个工作日内审核您的申请。
            <br />
            审核结果将通过邮件和站内消息通知您。
          </p>
          <div className="bg-purple-500/20 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-purple-300 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">审核通过后</span>
            </div>
            <p className="text-white/70 text-sm">
              您将自动升级为高级用户，获得专属客户中心访问权限，
              <br />
              享受完整的投资管理功能和专属投资顾问服务。
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link href="/user" className="user-page-btn-secondary">
              返回用户中心
            </Link>
            <Link href="/user/invest" className="user-page-btn-primary">
              查看投资机会
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-page-container">
      {/* Hero Section */}
      <div className="user-page-hero">
        <div className="user-page-hero-content">
          <div className="user-page-hero-icon">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h1 className="user-page-hero-title">成为投资者</h1>
            <p className="user-page-hero-subtitle">
              填写申请表，开启您的专属投资之旅
            </p>
          </div>
        </div>
        <Link href="/user/invest" className="user-page-btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
      </div>

      {/* Progress Steps */}
      <div className="user-page-card mb-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, title: "基本信息" },
            { num: 2, title: "投资信息" },
            { num: 3, title: "确认提交" },
          ].map((s, index) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num
                      ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                <span
                  className={`font-medium ${
                    step >= s.num ? "text-white" : "text-white/50"
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded-full ${
                    step > s.num ? "bg-purple-500" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="user-page-card">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-6 h-6 text-purple-400" />
              基本信息
            </h3>
            <p className="text-white/60">请填写您的真实信息，用于身份验证和后续联系。</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  姓名 *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="user-page-input"
                  placeholder="请输入您的真实姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  邮箱 *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="user-page-input"
                  placeholder="请输入您的邮箱地址"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  手机号码 *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="user-page-input"
                  placeholder="请输入您的手机号码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  身份证号 *
                </label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange("idNumber", e.target.value)}
                  className="user-page-input"
                  placeholder="请输入您的身份证号码"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="user-page-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Wallet className="w-6 h-6 text-purple-400" />
              投资信息
            </h3>
            <p className="text-white/60">请填写您的投资经验和偏好，帮助我们为您推荐合适的投资项目。</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  投资经验 *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {investmentExperience.map((exp) => (
                    <button
                      key={exp.value}
                      onClick={() => handleInputChange("experience", exp.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.experience === exp.value
                          ? "border-purple-500 bg-purple-500/20 text-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
                      }`}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  计划投资金额 *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {investmentRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleInputChange("investmentRange", range.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.investmentRange === range.value
                          ? "border-purple-500 bg-purple-500/20 text-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  风险偏好 *
                </label>
                <div className="space-y-3">
                  {riskPreferences.map((pref) => (
                    <button
                      key={pref.value}
                      onClick={() => handleInputChange("riskPreference", pref.value)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        formData.riskPreference === pref.value
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <div className="font-medium text-white">{pref.label}</div>
                      <div className="text-sm text-white/60">{pref.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  投资目标（选填）
                </label>
                <textarea
                  value={formData.investmentGoals}
                  onChange={(e) => handleInputChange("investmentGoals", e.target.value)}
                  className="user-page-input min-h-[100px]"
                  placeholder="请描述您的投资目标和期望..."
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="user-page-btn-secondary flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                上一步
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="user-page-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-400" />
              确认提交
            </h3>
            <p className="text-white/60">请确认您的信息并阅读相关协议。</p>

            {/* 信息摘要 */}
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <h4 className="font-semibold text-white">申请信息摘要</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/50">姓名：</span>
                  <span className="text-white">{formData.fullName}</span>
                </div>
                <div>
                  <span className="text-white/50">邮箱：</span>
                  <span className="text-white">{formData.email}</span>
                </div>
                <div>
                  <span className="text-white/50">手机：</span>
                  <span className="text-white">{formData.phone}</span>
                </div>
                <div>
                  <span className="text-white/50">投资经验：</span>
                  <span className="text-white">
                    {investmentExperience.find((e) => e.value === formData.experience)?.label}
                  </span>
                </div>
                <div>
                  <span className="text-white/50">投资金额：</span>
                  <span className="text-white">
                    {investmentRanges.find((r) => r.value === formData.investmentRange)?.label}
                  </span>
                </div>
                <div>
                  <span className="text-white/50">风险偏好：</span>
                  <span className="text-white">
                    {riskPreferences.find((p) => p.value === formData.riskPreference)?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* 协议确认 */}
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => handleInputChange("agreeTerms", e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-white/70 group-hover:text-white transition-colors">
                  我已阅读并同意《投资者服务协议》和《隐私政策》
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.agreeRisk}
                  onChange={(e) => handleInputChange("agreeRisk", e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-white/70 group-hover:text-white transition-colors">
                  我了解投资有风险，愿意承担相应的投资风险
                </span>
              </label>
            </div>

            {/* 提示信息 */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200/80">
                <p className="font-medium text-yellow-300 mb-1">重要提示</p>
                <p>
                  提交申请后，我们的团队将在1-3个工作日内审核您的申请。
                  审核通过后，您将自动升级为高级用户，获得专属客户中心访问权限。
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="user-page-btn-secondary flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                上一步
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="user-page-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    提交申请
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
