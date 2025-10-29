"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { useLanguage } from "@/lib/hooks/use-language"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { translations } from "@/lib/i18n/translations"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const t = translations[language].common

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{t.language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("pl")} className={language === "pl" ? "bg-accent" : ""}>
          {t.polish}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-accent" : ""}>
          {t.english}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
