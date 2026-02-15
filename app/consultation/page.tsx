"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { 
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  Target,
  TrendingUp,
  Briefcase,
  Users,
  Video,
  MapPin,
  DollarSign
} from "lucide-react";

interface ConsultationType {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  duration: string;
  durationEn: string;
  price: string;
  priceEn: string;
  features: string[];
  featuresEn: string[];
  icon: any;
  color: string;
  popular: boolean;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface Expert {
  id: string;
  name: string;
  nameEn: string;
  title: string;
  titleEn: string;
  expertise: string[];
  expertiseEn: string[];
  experience: string;
  experienceEn: string;
  rating: number;
  reviews: number;
  avatar: string;
  languages: string[];
}

const consultationTypes: ConsultationType[] = [
  {
    id: "investment-strategy",
    name: "",
    nameEn: "Investment Strategy Consultation",
    description: "",
    descriptionEn: "Personalized investment portfolio planning and risk assessment",
    duration: "60",
    durationEn: "60 minutes",
    price: "",
    priceEn: "Free",
    features: [
      "",
      "", 
      "",
      ""
    ],
    featuresEn: [
      "Investment Goal Analysis",
      "Risk Tolerance Assessment",
      "Industry Investment Advice", 
      "Portfolio Optimization"
    ],
    icon: TrendingUp,
    color: "blue",
    popular: true
  },
  {
    id: "brand-consultation",
    name: "",
    nameEn: "Brand Consultation Service",
    description: "",
    descriptionEn: "Brand strategy planning and visual identity system design",
    duration: "90",
    durationEn: "90 minutes",
    price: "500",
    priceEn: "$75",
    features: [
      "",
      "",
      "",
      ""
    ],
    featuresEn: [
      "Brand Positioning Analysis",
      "Competitor Research",
      "Visual Design Recommendations",
      "Brand Implementation Roadmap"
    ],
    icon: Award,
    color: "purple",
    popular: false
  },
  {
    id: "business-development",
    name: "",
    nameEn: "Business Development Consultation",
    description: "",
    descriptionEn: "Business development strategy and market expansion planning",
    duration: "120",
    durationEn: "120 minutes",
    price: "800",
    priceEn: "$120",
    features: [
      "",
      "",
      "",
      ""
    ],
    featuresEn: [
      "Market Opportunity Analysis",
      "Business Model Optimization",
      "Growth Strategy Development",
      "Resource Allocation Advice"
    ],
    icon: Briefcase,
    color: "green",
    popular: false
  },
  {
    id: "comprehensive-review",
    name: "",
    nameEn: "Comprehensive Business Review",
    description: "",
    descriptionEn: "Comprehensive business diagnosis and development recommendations",
    duration: "180",
    durationEn: "180 minutes",
    price: "1200",
    priceEn: "$180",
    features: [
      "",
      "",
      "",
      ""
    ],
    featuresEn: [
      "Comprehensive Business Audit",
      "Investment Opportunity Assessment",
      "Brand Value Analysis",
      "Detailed Action Plan"
    ],
    icon: Target,
    color: "orange",
    popular: false
  }
];

const experts: Expert[] = [
  {
    id: "zhang-wei",
    name: "",
    nameEn: "Zhang Wei",
    title: "首席投资顾问",
    titleEn: "Chief Investment Advisor",
    expertise: ["投资策略", "风险管理", "资产配置"],
    expertiseEn: ["Investment Strategy", "Risk Management", "Asset Allocation"],
    experience: "15年投资经验",
    experienceEn: "15 years investment experience",
    rating: 4.9,
    reviews: 127,
    avatar: "/experts/zhang-wei.jpg",
    languages: ["", "English"]
  },
  {
    id: "lisa-chen",
    name: "",
    nameEn: "Lisa Chen",
    title: "",
    titleEn: "Brand Strategy Director",
    expertise: ["", "", ""],
    expertiseEn: ["Brand Strategy", "Visual Design", "Marketing"],
    experience: "12 years",
    experienceEn: "12 years brand experience",
    rating: 4.8,
    reviews: 89,
    avatar: "/experts/lisa-chen.jpg",
    languages: ["", "English"]
  },
  {
    id: "david-wang",
    name: "",
    nameEn: "David Wang",
    title: "企业发展专家",
    titleEn: "Business Development Expert",
    expertise: ["商业策略", "市场拓展", "企业管理"],
    expertiseEn: ["Business Strategy", "Market Expansion", "Corporate Management"],
    experience: "18年企业经验",
    experienceEn: "18 years corporate experience",
    rating: 4.9,
    reviews: 156,
    avatar: "/experts/david-wang.jpg",
    languages: ["中文", "English"]
  }
];

const timeSlots: TimeSlot[] = [
  { id: "09:00", time: "09:00", available: true },
  { id: "10:00", time: "10:00", available: true },
  { id: "11:00", time: "11:00", available: false },
  { id: "14:00", time: "14:00", available: true },
  { id: "15:00", time: "15:00", available: true },
  { id: "16:00", time: "16:00", available: false },
  { id: "17:00", time: "17:00", available: true }
];

export default function ConsultationPage() {
  const { locale } = useLanguage();
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    meetingType: "video"
  });
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const consultationData = {
      type: selectedType,
      expert: selectedExpert,
      date: selectedDate,
      time: selectedTime,
      ...formData
    };

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(consultationData)
      });

      if (response.ok) {
        setStep(5); // Success step
      } else {
        alert(locale === "en" ? "Booking failed. Please try again." : "预约失败，请重试");
      }
    } catch (error) {
      console.error("Consultation booking error:", error);
      alert(locale === "en" ? "Booking failed. Please try again." : "预约失败，请重试");
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen purple-gradient-page purple-gradient-content">
      <Navbar />
      
      <div className="pt-16 md:pt-20 purple-gradient-page">
        <div className="purple-gradient-content">
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {locale === "en" ? "Expert Consultation" : "专家咨询"}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {locale === "en" 
                ? "Schedule a consultation with our experts to discuss your investment goals and brand strategy"
                : "与我们的专家预约咨询，讨论您的投资目标和品牌策略"
              }
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNumber 
                      ? "bg-gradient-to-r from-primary to-secondary text-white" 
                      : "bg-white/10 text-gray-400"
                  }`}>
                    {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step > stepNumber ? "purple-gradient-button bg-primary" : "bg-white/20"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  {locale === "en" ? "Choose Consultation Type" : ""}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {consultationTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setSelectedType(type)}
                        className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedType?.id === type.id
                             "border-primary purple-gradient-button bg-primary/10"
                            : "border-white/20 bg-white/5 hover:border-white/40"
                        }`}
                      >
                        {type.popular && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                            {locale === "en"  "Popular" : ""}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`p-3 rounded-lg bg-${type.color}-500/20`}>
                            <IconComponent className={`w-6 h-6 text-${type.color}-400`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {locale === "en"  type.nameEn : type.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {locale === "en"  type.durationEn : type.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {locale === "en"  type.priceEn : type.price}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm mb-4">
                          {locale === "en"  type.descriptionEn : type.description}
                        </p>

                        <div className="space-y-2">
                          {(locale === "en"  type.featuresEn : type.features).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-center mt-8">
                  <button
                    onClick={nextStep}
                    disabled={!selectedType}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {locale === "en"  "Continue" : ""}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  {locale === "en"  "Select Expert" : ""}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {experts.map((expert) => (
                    <div
                      key={expert.id}
                      onClick={() => setSelectedExpert(expert)}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedExpert?.id === expert.id
                           "border-primary purple-gradient-button bg-primary/10"
                          : "border-white/20 bg-white/5 hover:border-white/40"
                      }`}
                    >
                      <div className="text-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white text-2xl font-bold">
                            {expert.name.charAt(0)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          {locale === "en"  expert.nameEn : expert.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {locale === "en"  expert.titleEn : expert.title}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white font-semibold">{expert.rating}</span>
                          <span className="text-gray-400 text-sm">({expert.reviews})</span>
                        </div>

                        <div className="text-center">
                          <p className="text-gray-300 text-sm">
                            {locale === "en"  expert.experienceEn : expert.experience}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1 justify-center">
                          {(locale === "en"  expert.expertiseEn : expert.expertise).map((skill, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-white/10 text-white text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex justify-center gap-1">
                          {expert.languages.map((lang, index) => (
                            <span key={index} className="text-xs text-gray-400">
                              {lang}{index < expert.languages.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={prevStep}
                    className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                  >
                    {locale === "en"  "Back" : ""}
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!selectedExpert}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {locale === "en"  "Continue" : ""}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  {locale === "en"  "Select Date & Time" : ""}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Date Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {locale === "en"  "Choose Date" : ""}
                    </h3>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {locale === "en"  "Choose Time" : ""}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-3 rounded-lg font-medium transition-all ${
                            selectedTime === slot.time
                               "bg-gradient-to-r from-primary to-secondary text-white"
                              : slot.available
                               "bg-white/10 text-white hover:bg-white/20"
                              : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={prevStep}
                    className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                  >
                    {locale === "en"  "Back" : ""}
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!selectedDate || !selectedTime}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {locale === "en"  "Continue" : ""}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  {locale === "en"  "Contact Information" : ""}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        {locale === "en"  "Full Name *" : " *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                        placeholder={locale === "en"  "Enter your name" : ""}
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        {locale === "en"  "Email *" : " *"}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                        placeholder={locale === "en"  "Enter your email" : ""}
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        {locale === "en"  "Phone" : ""}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                        placeholder={locale === "en"  "Enter your phone" : ""}
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        {locale === "en"  "Company" : ""}
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                        placeholder={locale === "en"  "Enter your company" : ""}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      {locale === "en"  "Meeting Type" : ""}
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="meetingType"
                          value="video"
                          checked={formData.meetingType === "video"}
                          onChange={(e) => setFormData({...formData, meetingType: e.target.value})}
                          className="text-primary"
                        />
                        <Video className="w-4 h-4 text-gray-400" />
                        <span className="text-white">
                          {locale === "en"  "Video Call" : ""}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="meetingType"
                          value="phone"
                          checked={formData.meetingType === "phone"}
                          onChange={(e) => setFormData({...formData, meetingType: e.target.value})}
                          className="text-primary"
                        />
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-white">
                          {locale === "en"  "Phone Call" : ""}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="meetingType"
                          value="in-person"
                          checked={formData.meetingType === "in-person"}
                          onChange={(e) => setFormData({...formData, meetingType: e.target.value})}
                          className="text-primary"
                        />
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-white">
                          {locale === "en"  "In Person" : ""}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      {locale === "en"  "Message" : ""}
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                      placeholder={locale === "en"  "Tell us about your goals and what you'd like to discuss..." : "..."}
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                    >
                      {locale === "en"  "Back" : ""}
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      {locale === "en"  "Book Consultation" : ""}
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 5 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  {locale === "en"  "Consultation Booked!" : ""}
                </h2>
                <p className="text-gray-300 mb-6">
                  {locale === "en" 
                     "Your consultation has been successfully scheduled. You will receive a confirmation email shortly."
                    : ""
                  }
                </p>
                
                {/* Booking Summary */}
                <div className="bg-white/5 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {locale === "en"  "Booking Details" : ""}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{locale === "en"  "Type:" : ""}</span>
                      <span className="text-white">{locale === "en"  selectedType?.nameEn : selectedType?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{locale === "en"  "Expert:" : ""}</span>
                      <span className="text-white">{locale === "en"  selectedExpert?.nameEn : selectedExpert?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{locale === "en"  "Date:" : ""}</span>
                      <span className="text-white">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{locale === "en"  "Time:" : ""}</span>
                      <span className="text-white">{selectedTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.href = "/"}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    {locale === "en"  "Back to Home" : ""}
                  </button>
                  <button
                    onClick={() => window.location.href = "/investor-portal"}
                    className="bg-white/10 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                  >
                    {locale === "en"  "Go to Portal" : ""}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>
      
    <Footer />
  </div>
  );
}