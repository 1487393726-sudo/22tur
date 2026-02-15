"use client";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {locales, Locale} from "../i18n";

function replaceLocale(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${nextLocale}`;
  // if first part is a locale, replace it, otherwise prefix
  if (locales.includes(parts[0] as Locale)) {
    parts[0] = nextLocale;
    return `/${parts.join("/")}`;
  }
  return `/${nextLocale}/${parts.join("/")}`;
}

// 语言标签映射
const localeLabels: Record<Locale, string> = {
  zh: "🇨🇳 中文",
  en: "🇺🇸 English",
  ug: "🇨🇳 ئۇيغۇرچە"
};

export default function LanguageSwitcher({label = "Language"}: {label?: string}) {
  const pathname = usePathname() || "/";
  
  // 获取当前语言
  const currentLocale = pathname.split('/').filter(Boolean)[0] as Locale || 'zh';
  
  return (
    <div className="flex items-center gap-2">
      {locales.map((locale, index) => (
        <div key={locale} className="flex items-center">
          <Link 
            href={replaceLocale(pathname, locale)} 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              currentLocale === locale 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {localeLabels[locale]}
          </Link>
          {index < locales.length - 1 && (
            <span className="mx-1 text-muted-foreground/50">|</span>
          )}
        </div>
      ))}
    </div>
  );
}
