"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Send,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Clock,
  Users,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { ContactSection as ContactData } from "@/types/homepage";

export function ContactSection() {
  const { t, locale } = useLanguage();
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error" | null;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/homepage/contact")
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setContactData(result.data);
        }
      })
      .catch(() => {
        // Fallback to static content on error
      });
  }, []);

  // Helper to get localized content
  const getContent = (zh: string | null | undefined, en: string | null | undefined, fallback: string) => {
    if (locale === "en") {
      return en || zh || fallback;
    }
    return zh || en || fallback;
  };

  const address = contactData 
    ? getContent(contactData.address, contactData.addressEn, "123 Creative Street\nSan Francisco, CA 94102")
    : "123 Creative Street\nSan Francisco, CA 94102";
  const email = contactData?.email || "hello@creative.agency";
  const phone = contactData?.phone || "+1 (234) 567-890";
  const workingHours = contactData 
    ? getContent(contactData.workingHours, contactData.workingHoursEn, "")
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setToast(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({ type: "success", message: data.message || "Message sent successfully!" });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setToast({ type: "error", message: data.error || "Failed to send message. Please try again." });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setToast({ type: "error", message: "Network error. Please check your connection and try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="relative py-24 md:py-40 overflow-hidden bg-gradient-to-b from-muted/10 to-background">
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-96 bg-gradient-to-r from-secondary/3 via-transparent to-primary/3 rounded-full blur-3xl" />

      {/* Toast notification UI */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === "success" ? "bg-green-500/90 text-white" : "bg-destructive/90 text-destructive-foreground"
          }`}>
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="relative container px-4 md:px-6 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t.contact.badge}</span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent text-balance">
              {t.contact.title}
            </span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed text-balance max-w-3xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{t.contact.info.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg mb-8">{t.contact.info.subtitle}</p>
            </div>

            <div className="space-y-8">
              <div className="group flex items-start gap-6 p-6 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card/60 hover:border-primary/30 transition-all duration-300">
                <div className="p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors duration-300">
                    {t.contact.info.email.title}
                  </div>
                  <a href={`mailto:${email}`} className="text-muted-foreground hover:text-primary transition-colors text-base group-hover:text-foreground/90">
                    {email}
                  </a>
                  <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/70 transition-colors duration-300">
                    {t.contact.info.email.subtitle}
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-6 p-6 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card/60 hover:border-primary/30 transition-all duration-300">
                <div className="p-4 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Phone className="w-7 h-7 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors duration-300">
                    {t.contact.info.phone.title}
                  </div>
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-muted-foreground hover:text-primary transition-colors text-base group-hover:text-foreground/90">
                    {phone}
                  </a>
                  <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/70 transition-colors duration-300">
                    {t.contact.info.phone.subtitle}
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-6 p-6 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card/60 hover:border-primary/30 transition-all duration-300">
                <div className="p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors duration-300">
                    {t.contact.info.location.title}
                  </div>
                  <p className="text-muted-foreground text-base group-hover:text-foreground/90 transition-colors duration-300 whitespace-pre-line">
                    {address}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/70 transition-colors duration-300">
                    {t.contact.info.location.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="p-8 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground text-lg">{t.contact.officeHours.title}</h4>
              </div>
              <div className="space-y-3 text-sm">
                {workingHours ? (
                  <div className="p-3 bg-card/50 rounded-lg">
                    <span className="text-foreground font-medium whitespace-pre-line">{workingHours}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                      <span className="text-muted-foreground">{t.contact.officeHours.weekdays}</span>
                      <span className="text-foreground font-medium">{t.contact.officeHours.weekdaysTime}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                      <span className="text-muted-foreground">{t.contact.officeHours.saturday}</span>
                      <span className="text-foreground font-medium">{t.contact.officeHours.saturdayTime}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                      <span className="text-muted-foreground">{t.contact.officeHours.sunday}</span>
                      <span className="text-foreground font-medium">{t.contact.officeHours.sundayTime}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{t.contact.formTitle}</h3>
              <p className="text-muted-foreground">{t.contact.formSubtitle}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-3">{t.contact.form.name}</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full px-5 py-4 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground transition-all hover:border-primary/30"
                    placeholder="Enter your full name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-3">{t.contact.form.email}</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                    className="w-full px-5 py-4 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground transition-all hover:border-primary/30"
                    placeholder="your@email.com" />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-3">{t.contact.form.subject}</label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required
                  className="w-full px-5 py-4 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground transition-all hover:border-primary/30"
                  placeholder="e.g., Web Development, Brand Design, Mobile App..." />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-3">{t.contact.form.message}</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={6}
                  className="w-full px-5 py-4 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground transition-all resize-none hover:border-primary/30"
                  placeholder="Tell us about your project vision, goals, timeline, and any specific requirements..." />
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full px-8 py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-3">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.contact.form.sending}
                    </>
                  ) : (
                    <>
                      {t.contact.form.submit}
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </button>

              <p className="text-xs text-muted-foreground text-center">{t.contact.form.disclaimer}</p>
            </form>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer group">
            <span className="text-lg font-semibold text-foreground">{t.contact.cta}</span>
            <Users className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
          <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">{t.contact.ctaSubtitle}</p>
        </div>
      </div>
    </section>
  );
}
