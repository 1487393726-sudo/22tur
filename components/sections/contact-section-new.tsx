"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { SectionWrapper, SectionTitle } from "./section-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContactConfig, SocialLink } from "@/types/navigation";

// 默认配置
const defaultContactConfig: ContactConfig = {
  title: "联系我们",
  titleEn: "Contact Us",
  subtitle: "有任何问题或想法？我们很乐意听取您的意见",
  subtitleEn: "Have any questions or ideas? We'd love to hear from you",
  contactInfo: {
    address: "新疆乌鲁木齐市",
    addressEn: "Urumqi, Xinjiang, China",
    phone: "+86 123 4567 8900",
    email: "contact@creative.com",
    workingHours: "周一至周五 9:00 - 18:00",
    workingHoursEn: "Mon - Fri 9:00 AM - 6:00 PM",
  },
  socialLinks: [],
  showMap: false,
};

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface ContactSectionNewProps {
  config?: Partial<ContactConfig>;
  className?: string;
}

export function ContactSectionNew({ config, className }: ContactSectionNewProps) {
  const { language } = useLanguage();
  const [contactData, setContactData] = useState<ContactConfig>(defaultContactConfig);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 从 API 获取数据
  useEffect(() => {
    fetch("/api/homepage/contact")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          const data = result.data;
          setContactData({
            ...defaultContactConfig,
            contactInfo: {
              address: data.address || defaultContactConfig.contactInfo.address,
              addressEn: data.addressEn || defaultContactConfig.contactInfo.addressEn,
              phone: data.phone || defaultContactConfig.contactInfo.phone,
              email: data.email || defaultContactConfig.contactInfo.email,
              workingHours: data.workingHours || defaultContactConfig.contactInfo.workingHours,
              workingHoursEn: data.workingHoursEn || defaultContactConfig.contactInfo.workingHoursEn,
            },
            socialLinks: data.socialLinks || [],
          });
        }
      })
      .catch(() => {
        // 使用默认配置
      });
  }, []);

  // 合并配置
  const finalConfig = { ...contactData, ...config };

  // 获取本地化文本
  const getText = (zh: string, en?: string, ug?: string) => {
    if (language === "en" && en) return en;
    if (language === "ug" && ug) return ug;
    return zh;
  };

  const title = getText(finalConfig.title, finalConfig.titleEn, "بىز بىلەن ئالاقىلىشىڭ");
  const subtitle = getText(finalConfig.subtitle || "", finalConfig.subtitleEn || "", "سوئالىڭىز ياكى ئويىڭىز بارمۇ؟ سىزدىن ئاڭلاشنى خالايمىز");

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        throw new Error("Failed to submit");
      }
    } catch (err) {
      setError(getText("发送失败，请重试。", "Failed to send message. Please try again.", "يوللاش مەغلۇپ بولدى، قايتا سىناڭ."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 联系信息项
  const contactItems = [
    {
      icon: MapPin,
      label: getText("地址", "Address", "ئادرېس"),
      value: getText(finalConfig.contactInfo.address, finalConfig.contactInfo.addressEn, "شىنجاڭ ئۈرۈمچى شەھىرى"),
    },
    {
      icon: Phone,
      label: getText("电话", "Phone", "تېلېفون"),
      value: finalConfig.contactInfo.phone,
      href: `tel:${finalConfig.contactInfo.phone}`,
    },
    {
      icon: Mail,
      label: getText("邮箱", "Email", "ئېلخەت"),
      value: finalConfig.contactInfo.email,
      href: `mailto:${finalConfig.contactInfo.email}`,
    },
    {
      icon: Clock,
      label: getText("工作时间", "Working Hours", "خىزمەت ۋاقتى"),
      value: getText(
        finalConfig.contactInfo.workingHours || "",
        finalConfig.contactInfo.workingHoursEn || "",
        "دۈشەنبە - جۈمە 9:00 - 18:00"
      ),
    },
  ];

  return (
    <SectionWrapper id="contact" background="muted" className={className}>
      <SectionTitle title={title} subtitle={subtitle} />

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* 左侧表单 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-background rounded-2xl p-6 md:p-8 shadow-lg border border-border">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {getText("消息已发送！", "Message Sent!", "ئۇچۇر يوللاندى!")}
                </h3>
                <p className="text-muted-foreground">
                  {getText(
                    "我们会尽快回复您。",
                    "We'll get back to you as soon as possible.",
                    "بىز سىزگە تېزدىن جاۋاب قايتۇرىمىز."
                  )}
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setIsSubmitted(false)}
                >
                  {getText("发送另一条消息", "Send Another Message", "باشقا ئۇچۇر يوللاش")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {getText("姓名", "Name", "ئىسىم")} *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={getText("您的姓名", "Your name", "ئىسمىڭىز")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {getText("邮箱", "Email", "ئېلخەت")} *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={getText("您的邮箱", "your@email.com", "ئېلخىتىڭىز")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {getText("电话", "Phone", "تېلېفون")}
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={getText("您的电话号码", "Your phone number", "تېلېفون نومۇرىڭىز")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {getText("留言", "Message", "ئۇچۇر")} *
                  </label>
                  <Textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={getText("请描述您的需求...", "How can we help you?", "ئېھتىياجىڭىزنى تەسۋىرلەڭ...")}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {getText("发送中...", "Sending...", "يوللىنىۋاتىدۇ...")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {getText("发送消息", "Send Message", "ئۇچۇر يوللاش")}
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>

        {/* 右侧联系信息 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          {/* 联系信息卡片 */}
          <div className="space-y-4">
            {contactItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">{item.label}</div>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-foreground font-medium hover:text-primary transition-colors"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div className="text-foreground font-medium">{item.value}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* 社交媒体链接 */}
          {finalConfig.socialLinks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                {getText("关注我们", "Follow Us", "بىزنى ئىز قوغلاڭ")}
              </h4>
              <div className="flex gap-3">
                {finalConfig.socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-sm">{social.platform.charAt(0)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 快速响应承诺 */}
          <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
            <h4 className="font-semibold mb-2">
              {getText("快速响应承诺", "Quick Response Guarantee", "تېز جاۋاب كاپالىتى")}
            </h4>
            <p className="text-sm text-muted-foreground">
              {getText(
                "我们承诺在工作日24小时内回复所有咨询。",
                "We respond to all inquiries within 24 hours during business days.",
                "بىز خىزمەت كۈنلىرىدە 24 سائەت ئىچىدە بارلىق سوئاللارغا جاۋاب قايتۇرۇشقا ۋەدە قىلىمىز."
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
