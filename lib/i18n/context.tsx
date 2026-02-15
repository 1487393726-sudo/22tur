"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { translations, type Language, type Translations } from "./translations";

interface LanguageContextType {
  language: Language;
  locale: Language; // Alias for language
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (mounted) {
      localStorage.setItem("language", lang);
    }
  };

  const t = translations[language];

  if (!mounted) {
    return (
      <LanguageContext.Provider
        value={{ language: "en", locale: "en", setLanguage, t: translations.en }}
        data-oid="9.xjg2h"
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider
      value={{ language, locale: language, setLanguage, t }}
      data-oid="sg4pek-"
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
