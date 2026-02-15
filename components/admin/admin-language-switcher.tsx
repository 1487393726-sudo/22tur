"use client";

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminLocale } from './admin-locale-provider';
import { AdminLocale } from '@/lib/admin-messages';
import { cn } from '@/lib/utils';

export function AdminLanguageSwitcher() {
  const { locale, setLocale, localeNames, isRTL } = useAdminLocale();

  const locales: AdminLocale[] = ['zh', 'zh-TW', 'en', 'ja', 'ko', 'ug'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 gap-2"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeNames[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={isRTL ? "start" : "end"} 
        className="bg-slate-900 border-white/10"
      >
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={cn(
              "cursor-pointer text-gray-300 hover:text-white hover:bg-white/10",
              locale === loc && "bg-white/10 text-white"
            )}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
